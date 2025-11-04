import { motion } from 'motion/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

const textSizeMap = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

export default function Logo({ 
  size = 'md', 
  showText = true, 
  animated = true,
  className = '' 
}: LogoProps) {
  const iconSize = sizeMap[size];
  const textSize = textSizeMap[size];

  const MotionWrapper = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5 }
  } : {};

  return (
    <MotionWrapper 
      className={`flex items-center gap-3 ${className}`}
      {...animationProps}
    >
      {/* Logo Icon - Breath Symbol */}
      <div className={`relative ${iconSize}`}>
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary via-info to-accent rounded-2xl opacity-20 blur-lg"
          animate={animated ? {
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <svg 
          viewBox="0 0 100 100" 
          className="relative z-10 w-full h-full drop-shadow-lg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle - calm breathing */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#gradient1)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset="0"
            animate={animated ? {
              strokeDashoffset: [0, 283, 0],
              opacity: [0.3, 0.7, 0.3]
            } : {}}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Inner waves - breath flow */}
          <motion.path
            d="M 20 50 Q 35 30, 50 50 T 80 50"
            stroke="url(#gradient2)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            animate={animated ? {
              d: [
                "M 20 50 Q 35 30, 50 50 T 80 50",
                "M 20 50 Q 35 70, 50 50 T 80 50",
                "M 20 50 Q 35 30, 50 50 T 80 50"
              ],
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.path
            d="M 20 50 Q 35 70, 50 50 T 80 50"
            stroke="url(#gradient3)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
            animate={animated ? {
              d: [
                "M 20 50 Q 35 70, 50 50 T 80 50",
                "M 20 50 Q 35 30, 50 50 T 80 50",
                "M 20 50 Q 35 70, 50 50 T 80 50"
              ],
            } : {}}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />

          {/* Center dot - mindfulness point */}
          <motion.circle
            cx="50"
            cy="50"
            r="6"
            fill="url(#gradient4)"
            animate={animated ? {
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(205, 85%, 58%)" />
              <stop offset="50%" stopColor="hsl(200, 80%, 65%)" />
              <stop offset="100%" stopColor="hsl(180, 75%, 70%)" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(205, 85%, 58%)" />
              <stop offset="100%" stopColor="hsl(265, 75%, 68%)" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(180, 75%, 62%)" />
              <stop offset="100%" stopColor="hsl(200, 85%, 60%)" />
            </linearGradient>
            <radialGradient id="gradient4">
              <stop offset="0%" stopColor="hsl(205, 85%, 68%)" />
              <stop offset="100%" stopColor="hsl(205, 85%, 58%)" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <motion.h1 
            className={`font-bold gradient-text leading-tight ${textSize}`}
            initial={animated ? { opacity: 0, x: -10 } : {}}
            animate={animated ? { opacity: 1, x: 0 } : {}}
            transition={animated ? { delay: 0.2, duration: 0.5 } : {}}
          >
            Deep Breath
          </motion.h1>
          <motion.p 
            className="text-[0.65em] text-muted-foreground font-medium -mt-1"
            initial={animated ? { opacity: 0 } : {}}
            animate={animated ? { opacity: 1 } : {}}
            transition={animated ? { delay: 0.4, duration: 0.5 } : {}}
          >
            نفس عمیق | آرامش در کنترل
          </motion.p>
        </div>
      )}
    </MotionWrapper>
  );
}
