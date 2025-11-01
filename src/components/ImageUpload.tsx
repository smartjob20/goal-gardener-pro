import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  imageUrl?: string;
  onImageChange: (url: string) => void;
  label?: string;
}

export const ImageUpload = ({ imageUrl, onImageChange, label = 'تصویر' }: ImageUploadProps) => {
  const [preview, setPreview] = useState(imageUrl || '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // بررسی سایز فایل (حداکثر 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم تصویر نباید بیشتر از 2 مگابایت باشد');
      return;
    }

    // بررسی نوع فایل
    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageChange(result);
      toast.success('تصویر آپلود شد! 📸');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url: string) => {
    setPreview(url);
    onImageChange(url);
  };

  const handleRemove = () => {
    setPreview('');
    onImageChange('');
    toast.info('تصویر حذف شد');
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {preview && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-full object-cover"
            onError={() => {
              toast.error('خطا در بارگذاری تصویر');
              setPreview('');
            }}
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 left-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="image-file" className="cursor-pointer">
          <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-accent/10 transition-colors">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {preview ? 'تغییر تصویر از فایل' : 'آپلود از فایل'}
            </span>
          </div>
        </Label>
        <Input
          id="image-file"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">یا</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="لینک تصویر را وارد کنید"
            value={preview}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
          {preview && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground">
          حداکثر حجم: 2 مگابایت | فرمت‌های مجاز: JPG, PNG, GIF, WEBP
        </p>
      </div>
    </div>
  );
};
