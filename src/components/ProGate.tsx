import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import Paywall from './Paywall';
import { Button } from './ui/button';

interface ProGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProGate({ children, fallback }: ProGateProps) {
  const { isPro, isLoading } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  // User is Pro - show content
  if (isPro) {
    return <>{children}</>;
  }

  // User is not Pro - show locked state or custom fallback
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        {/* Blurred content preview */}
        <div className="pointer-events-none select-none blur-sm opacity-30">
          {children}
        </div>

        {/* Lock overlay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="glass-strong p-8 rounded-2xl max-w-md text-center space-y-6">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-metallic-silver"
            >
              <Lock className="w-10 h-10 text-foreground" />
            </motion.div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold gradient-text">
                ویژگی پریمیوم
              </h3>
              <p className="text-muted-foreground">
                برای دسترسی به این امکانات، به نسخه Deep Breath Pro ارتقا دهید
              </p>
            </div>

            <Button
              onClick={() => setShowPaywall(true)}
              className="w-full bg-gradient-metallic-silver text-foreground hover:scale-105 transition-transform"
              size="lg"
            >
              <Sparkles className="w-5 h-5 ms-2" />
              ارتقا به نسخه پریمیوم
            </Button>

            {fallback && (
              <div className="pt-4 border-t border-border">
                {fallback}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setShowPaywall(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Paywall
                onStartTrial={() => {
                  // Will be wired up in next step
                  setShowPaywall(false);
                }}
                onContinueLimited={() => setShowPaywall(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
