import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Loader2, LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (!error) {
          // Wait a bit for auth state to update
          setTimeout(() => navigate('/'), 100);
        }
      } else {
        const { error } = await signUp(email, password, displayName);
        if (!error) {
          // Wait for auth state to update
          setTimeout(() => navigate('/'), 100);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="soft-shadow p-8 rounded-3xl border-0 bg-card/95">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full gradient-soft-coral flex items-center justify-center text-4xl soft-shadow-sm"
            >
              🎯
            </motion.div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? 'خوش آمدید' : 'ثبت نام'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? 'وارد حساب کاربری خود شوید' : 'حساب کاربری جدید بسازید'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="displayName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  نام نمایشی
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="نام خود را وارد کنید"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={!isLogin}
                  className="rounded-2xl border-border/50 bg-muted/30 h-12 text-base"
                  dir="rtl"
                />
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                ایمیل
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-2xl border-border/50 bg-muted/30 h-12 text-base"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                رمز عبور
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="rounded-2xl border-border/50 bg-muted/30 h-12 text-base"
                dir="ltr"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-soft-coral hover:opacity-90 transition-all h-12 rounded-full text-white soft-shadow-sm text-base font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال انجام...
                </>
              ) : (
                <>
                  {isLogin ? (
                    <>
                      <LogIn className="ml-2 h-4 w-4" />
                      ورود
                    </>
                  ) : (
                    <>
                      <UserPlus className="ml-2 h-4 w-4" />
                      ثبت نام
                    </>
                  )}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setDisplayName('');
                setEmail('');
                setPassword('');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? (
                <>
                  حساب کاربری ندارید؟{' '}
                  <span className="text-primary font-medium">ثبت نام کنید</span>
                </>
              ) : (
                <>
                  قبلاً ثبت نام کرده‌اید؟{' '}
                  <span className="text-primary font-medium">وارد شوید</span>
                </>
              )}
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
