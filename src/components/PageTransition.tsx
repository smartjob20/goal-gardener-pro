import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{
        type: 'tween',
        ease: 'easeInOut',
        duration: 0.3
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </motion.div>
  );
}
