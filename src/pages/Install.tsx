import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { Download, Smartphone, CheckCircle2, Share2, Menu, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-primary-light/30 to-accent-light/30 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/5"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() + 0.5, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full space-y-8">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <Logo size="xl" animated={true} />
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 glass-strong space-y-6">
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="w-20 h-20 mx-auto rounded-2xl gradient-bg-primary flex items-center justify-center"
                >
                  <Smartphone className="w-10 h-10 text-white" />
                </motion.div>
                
                <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                  نصب Deep Breath
                </h1>
                <p className="text-lg text-muted-foreground">
                  از Deep Breath در گوشی خود مثل یک اپلیکیشن واقعی استفاده کنید
                </p>
              </div>

              {isInstalled ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-lg font-medium text-success">
                    اپلیکیشن با موفقیت نصب شد! ✨
                  </p>
                  <Button
                    onClick={() => navigate('/')}
                    className="gradient-bg-primary"
                    size="lg"
                  >
                    شروع استفاده
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {isInstallable && (
                    <Button
                      onClick={handleInstallClick}
                      className="w-full gradient-bg-primary text-lg py-6"
                      size="lg"
                    >
                      <Download className="w-5 h-5 ml-2" />
                      نصب اپلیکیشن
                    </Button>
                  )}

                  {/* iOS Instructions */}
                  {isIOS && (
                    <div className="space-y-4 p-6 rounded-xl bg-info/10 border-2 border-info/20">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        راهنمای نصب برای iOS
                      </h3>
                      <ol className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex gap-3">
                          <span className="font-bold text-info">۱.</span>
                          روی دکمه Share (اشتراک‌گذاری) در پایین صفحه کلیک کنید
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-info">۲.</span>
                          گزینه "Add to Home Screen" را انتخاب کنید
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-info">۳.</span>
                          روی "Add" کلیک کنید
                        </li>
                      </ol>
                    </div>
                  )}

                  {/* Android Instructions */}
                  {isAndroid && !isInstallable && (
                    <div className="space-y-4 p-6 rounded-xl bg-success/10 border-2 border-success/20">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Menu className="w-5 h-5" />
                        راهنمای نصب برای اندروید
                      </h3>
                      <ol className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex gap-3">
                          <span className="font-bold text-success">۱.</span>
                          روی منوی مرورگر (سه نقطه) در گوشه بالا کلیک کنید
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-success">۲.</span>
                          گزینه "Add to Home screen" یا "نصب اپلیکیشن" را انتخاب کنید
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-success">۳.</span>
                          روی "نصب" یا "Install" کلیک کنید
                        </li>
                      </ol>
                    </div>
                  )}

                  {/* Chrome Desktop */}
                  {!isIOS && !isAndroid && (
                    <div className="space-y-4 p-6 rounded-xl bg-primary/10 border-2 border-primary/20">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Chrome className="w-5 h-5" />
                        راهنمای نصب برای مرورگر
                      </h3>
                      <ol className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex gap-3">
                          <span className="font-bold text-primary">۱.</span>
                          آیکون نصب در نوار آدرس مرورگر را پیدا کنید
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-primary">۲.</span>
                          روی آن کلیک کنید و "نصب" را انتخاب کنید
                        </li>
                      </ol>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full"
                    size="lg"
                  >
                    استفاده از نسخه وب
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {[
              { icon: Download, title: 'نصب آسان', desc: 'بدون نیاز به استور' },
              { icon: Smartphone, title: 'دسترسی آفلاین', desc: 'همیشه در دسترس' },
              { icon: CheckCircle2, title: 'بروزرسانی خودکار', desc: 'همیشه به‌روز' }
            ].map((feature, index) => (
              <Card key={index} className="p-4 glass hover-lift text-center">
                <feature.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <h4 className="font-bold mb-1">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
