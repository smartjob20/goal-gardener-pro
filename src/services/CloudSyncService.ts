import { toast } from 'sonner';

export interface SyncStatus {
  isEnabled: boolean;
  lastSyncTime: string | null;
  isSyncing: boolean;
  error: string | null;
}

export interface SyncData {
  tasks: any[];
  habits: any[];
  goals: any[];
  plans: any[];
  rewards: any[];
  achievements: any[];
  focusSessions: any[];
  user: any;
  settings: any;
  lastModified: string;
}

class CloudSyncService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private syncInterval: number | null = null;
  private readonly SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly BACKUP_FILE_NAME = 'deep_breath_backup.json';
  private readonly FOLDER_NAME = 'Deep Breath Backups';

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    const tokens = localStorage.getItem('google_drive_tokens');
    if (tokens) {
      const parsed = JSON.parse(tokens);
      this.accessToken = parsed.accessToken;
      this.refreshToken = parsed.refreshToken;
    }
  }

  private saveTokensToStorage() {
    if (this.accessToken && this.refreshToken) {
      localStorage.setItem('google_drive_tokens', JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken
      }));
    }
  }

  /**
   * Initialize Google Drive authentication
   */
  async authenticate(): Promise<boolean> {
    try {
      // Note: This requires VITE_GOOGLE_DRIVE_CLIENT_ID to be set in environment
      const clientId = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
      
      if (!clientId) {
        toast.error('Google Drive Client ID تنظیم نشده است');
        return false;
      }

      // Use Google OAuth2 with implicit flow for web apps
      const redirectUri = window.location.origin;
      const scope = 'https://www.googleapis.com/auth/drive.file';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(scope)}&` +
        `prompt=consent`;

      // Open authentication window
      const authWindow = window.open(authUrl, 'Google Drive Authentication', 'width=600,height=700');

      // Wait for authentication callback
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          try {
            if (authWindow?.closed) {
              clearInterval(checkInterval);
              // Check if we received the token
              const token = this.extractTokenFromUrl();
              if (token) {
                this.accessToken = token;
                this.saveTokensToStorage();
                toast.success('اتصال به Google Drive برقرار شد! ✨');
                resolve(true);
              } else {
                resolve(false);
              }
            }
          } catch (e) {
            // Cross-origin error, ignore
          }
        }, 500);

        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          if (authWindow && !authWindow.closed) {
            authWindow.close();
          }
          resolve(false);
        }, 120000);
      });
    } catch (error) {
      console.error('Google Drive authentication error:', error);
      toast.error('خطا در اتصال به Google Drive');
      return false;
    }
  }

  private extractTokenFromUrl(): string | null {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Disconnect from Google Drive
   */
  disconnect() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('google_drive_tokens');
    this.stopAutoSync();
    toast.success('اتصال Google Drive قطع شد');
  }

  /**
   * Get or create the backup folder
   */
  private async getOrCreateFolder(): Promise<string | null> {
    try {
      // Search for existing folder
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const searchData = await searchResponse.json();

      if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id;
      }

      // Create folder if it doesn't exist
      const createResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: this.FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder'
          })
        }
      );

      const createData = await createResponse.json();
      return createData.id;
    } catch (error) {
      console.error('Error getting/creating folder:', error);
      return null;
    }
  }

  /**
   * Upload data to Google Drive
   */
  async uploadBackup(data: SyncData): Promise<boolean> {
    if (!this.isAuthenticated()) {
      toast.error('ابتدا باید به Google Drive متصل شوید');
      return false;
    }

    try {
      const folderId = await this.getOrCreateFolder();
      if (!folderId) {
        throw new Error('Failed to create/find backup folder');
      }

      // Search for existing backup file
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${this.BACKUP_FILE_NAME}' and '${folderId}' in parents and trashed=false`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const searchData = await searchResponse.json();
      const fileId = searchData.files?.[0]?.id;

      const metadata = {
        name: this.BACKUP_FILE_NAME,
        mimeType: 'application/json',
        ...(fileId ? {} : { parents: [folderId] })
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));

      const url = fileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

      const method = fileId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload backup');
      }

      // Update last sync time
      localStorage.setItem('last_sync_time', new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('Upload backup error:', error);
      toast.error('خطا در آپلود داده‌ها به Google Drive');
      return false;
    }
  }

  /**
   * Download data from Google Drive
   */
  async downloadBackup(): Promise<SyncData | null> {
    if (!this.isAuthenticated()) {
      toast.error('ابتدا باید به Google Drive متصل شوید');
      return null;
    }

    try {
      const folderId = await this.getOrCreateFolder();
      if (!folderId) {
        return null;
      }

      // Search for backup file
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${this.BACKUP_FILE_NAME}' and '${folderId}' in parents and trashed=false`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const searchData = await searchResponse.json();
      
      if (!searchData.files || searchData.files.length === 0) {
        return null; // No backup found
      }

      const fileId = searchData.files[0].id;

      // Download file content
      const downloadResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      if (!downloadResponse.ok) {
        throw new Error('Failed to download backup');
      }

      const data = await downloadResponse.json();
      return data;
    } catch (error) {
      console.error('Download backup error:', error);
      toast.error('خطا در دانلود داده‌ها از Google Drive');
      return null;
    }
  }

  /**
   * Sync data (upload current state)
   */
  async sync(data: SyncData): Promise<boolean> {
    const success = await this.uploadBackup(data);
    if (success) {
      toast.success('داده‌ها با موفقیت همگام‌سازی شدند ☁️');
    }
    return success;
  }

  /**
   * Restore data from cloud
   */
  async restore(): Promise<SyncData | null> {
    const data = await this.downloadBackup();
    if (data) {
      toast.success('داده‌ها از فضای ابری بازیابی شدند! ✨');
    } else {
      toast.info('هیچ نسخه پشتیبان در فضای ابری یافت نشد');
    }
    return data;
  }

  /**
   * Start automatic sync
   */
  startAutoSync(getSyncData: () => SyncData) {
    if (this.syncInterval) {
      return; // Already running
    }

    // Initial sync
    this.sync(getSyncData());

    // Set up interval
    this.syncInterval = window.setInterval(() => {
      if (this.isAuthenticated()) {
        this.sync(getSyncData());
      }
    }, this.SYNC_INTERVAL_MS);

    toast.success('همگام‌سازی خودکار فعال شد 🔄');
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    const lastSyncTime = localStorage.getItem('last_sync_time');
    
    return {
      isEnabled: this.isAuthenticated(),
      lastSyncTime: lastSyncTime,
      isSyncing: false, // TODO: Implement actual syncing state
      error: null
    };
  }

  /**
   * Manual sync trigger
   */
  async manualSync(data: SyncData): Promise<boolean> {
    toast.info('در حال همگام‌سازی... ⏳');
    return await this.sync(data);
  }
}

// Export singleton instance
export const cloudSyncService = new CloudSyncService();
