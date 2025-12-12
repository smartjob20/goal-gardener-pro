import { motion } from 'motion/react';
import { Home, CheckSquare, Flame, Target, Sparkles, Gift, Heart, MoreHorizontal } from 'lucide-react';
interface BottomDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onMoreClick: () => void;
}
const dockItems = [{
  id: 'dashboard',
  icon: Home,
  label: 'داشبورد'
}, {
  id: 'tasks',
  icon: CheckSquare,
  label: 'وظایف'
}, {
  id: 'habits',
  icon: Flame,
  label: 'عادت‌ها'
}, {
  id: 'goals',
  icon: Target,
  label: 'اهداف'
}, {
  id: 'growth',
  icon: Heart,
  label: 'توسعه'
}, {
  id: 'rewards',
  icon: Gift,
  label: 'پاداش'
}];
export default function BottomDock({
  activeTab,
  onTabChange,
  onMoreClick
}: BottomDockProps) {
  return <motion.div initial={{
    y: 100,
    opacity: 0
  }} animate={{
    y: 0,
    opacity: 1
  }} className="fixed bottom-6 inset-x-0 z-50 flex flex-ltr justify-center px-4 safe-area-bottom">
      <div className="inline-flex items-center gap-1 px-2.5 py-2 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 pl-[3px] pr-[3px]">
        {/* Main Navigation Items - Reversed order for RTL */}
        {[...dockItems].reverse().map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return <motion.button key={item.id} onClick={() => onTabChange(item.id)} whileHover={{
          scale: 1.1,
          y: -4
        }} whileTap={{
          scale: 0.95
        }} className={`relative p-2.5 rounded-xl transition-all min-w-[44px] min-h-[44px] flex flex-ltr items-center justify-center ${isActive ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
              <Icon className="w-5 h-5" />
              
              {/* Active Indicator Dot */}
              {isActive && <motion.div layoutId="activeDot" className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" transition={{
            type: 'spring',
            bounce: 0.2,
            duration: 0.6
          }} />}
            </motion.button>;
      })}

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-0.5" />

        {/* More Button */}
        <motion.button onClick={onMoreClick} whileHover={{
        scale: 1.1,
        y: -4
      }} whileTap={{
        scale: 0.95
      }} className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all min-w-[44px] min-h-[44px] flex flex-ltr items-center justify-center pl-0 pr-0">
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>;
}