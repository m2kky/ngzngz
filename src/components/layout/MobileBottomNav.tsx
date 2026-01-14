import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Plus, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// Haptic feedback utility
const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
    navigator.vibrate(duration);
  }
};

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Search, label: 'Search', path: '/intel' },
  { icon: Bell, label: 'Inbox', path: '/inbox', badge: 0 },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = useCallback(() => {
    triggerHaptic('light');
  }, []);

  const handleFabClick = useCallback(() => {
    triggerHaptic('medium');
    setFabOpen((prev) => !prev);
  }, []);

  const handleFabAction = (type: 'task' | 'project' | 'event') => {
    triggerHaptic('light');
    setFabOpen(false);
    console.log('Action triggered:', type);
    // TODO: Implement action modals
  };

  return (
    <>
      {/* Bottom Navigation Bar - Pill Shape */}
      <nav className="fixed bottom-4 inset-x-0 z-50 lg:hidden px-4">
        <div className="relative flex items-center justify-around h-16 bg-card/95 backdrop-blur-xl rounded-full border border-border/50 shadow-xl mx-auto max-w-md">
          {/* Home */}
          <NavLink
            to="/"
            onClick={handleNavClick}
            className="relative flex flex-col items-center justify-center w-14 h-14"
          >
            <motion.div
              animate={{
                y: isActive('/') ? -20 : 0,
                scale: isActive('/') ? 1.1 : 1,
              }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="relative flex items-center justify-center"
            >
              {isActive('/') && (
                <motion.div
                  layoutId="navBubble"
                  className="absolute w-12 h-12 rounded-full bg-primary nav-bubble-glow"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Home
                className={cn(
                  'w-6 h-6 relative z-10 transition-colors',
                  isActive('/') ? 'text-primary-foreground' : 'text-foreground-muted'
                )}
              />
            </motion.div>
            {!isActive('/') && (
              <span className="text-[10px] font-medium mt-1 text-foreground-muted">
                Dashboard
              </span>
            )}
          </NavLink>

          {/* Search */}
          <NavLink
            to="/intel"
            onClick={handleNavClick}
            className="relative flex flex-col items-center justify-center w-14 h-14"
          >
            <motion.div
              animate={{
                y: isActive('/intel') ? -20 : 0,
                scale: isActive('/intel') ? 1.1 : 1,
              }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="relative flex items-center justify-center"
            >
              {isActive('/intel') && (
                <motion.div
                  layoutId="navBubble"
                  className="absolute w-12 h-12 rounded-full bg-primary nav-bubble-glow"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <Search
                className={cn(
                  'w-6 h-6 relative z-10 transition-colors',
                  isActive('/intel') ? 'text-primary-foreground' : 'text-foreground-muted'
                )}
              />
            </motion.div>
            {!isActive('/intel') && (
              <span className="text-[10px] font-medium mt-1 text-foreground-muted">
                Search
              </span>
            )}
          </NavLink>

          {/* Center FAB Button with expanded menu */}
          <div className="relative -mt-6">
            {/* Expanded FAB Options */}
            <AnimatePresence>
              {fabOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 20 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col gap-3"
                >
                  {[
                    { icon: '📝', label: 'Task', type: 'task' as const },
                    { icon: '📁', label: 'Project', type: 'project' as const },
                    { icon: '📅', label: 'Event', type: 'event' as const },
                  ].map((item, index) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleFabAction(item.type)}
                      className="w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-lg"
                    >
                      <span className="text-lg">{item.icon}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main FAB */}
            <motion.button
              onClick={handleFabClick}
              animate={{ rotate: fabOpen ? 45 : 0 }}
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors',
                fabOpen ? 'bg-destructive' : 'bg-primary nav-bubble-glow'
              )}
            >
              <Plus
                className={cn(
                  'w-7 h-7 transition-colors',
                  fabOpen ? 'text-destructive-foreground' : 'text-primary-foreground'
                )}
              />
            </motion.button>
          </div>

          {/* Inbox/Notifications */}
          <NavLink
            to="/inbox"
            onClick={handleNavClick}
            className="relative flex flex-col items-center justify-center w-14 h-14"
          >
            <motion.div
              animate={{
                y: isActive('/inbox') ? -20 : 0,
                scale: isActive('/inbox') ? 1.1 : 1,
              }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="relative flex items-center justify-center"
            >
              {isActive('/inbox') && (
                <motion.div
                  layoutId="navBubble"
                  className="absolute w-12 h-12 rounded-full bg-primary nav-bubble-glow"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <div className="relative">
                <Bell
                  className={cn(
                    'w-6 h-6 relative z-10 transition-colors',
                    isActive('/inbox') ? 'text-primary-foreground' : 'text-foreground-muted'
                  )}
                />
                {navItems[2].badge && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center z-20">
                    {navItems[2].badge}
                  </span>
                )}
              </div>
            </motion.div>
            {!isActive('/inbox') && (
              <span className="text-[10px] font-medium mt-1 text-foreground-muted">
                Inbox
              </span>
            )}
          </NavLink>

          {/* More Menu */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                onClick={() => triggerHaptic('light')}
                className="relative flex flex-col items-center justify-center w-14 h-14"
              >
                <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center">
                  <Menu className="w-6 h-6 text-foreground-muted" />
                  <span className="text-[10px] font-medium mt-1 text-foreground-muted">
                    More
                  </span>
                </motion.div>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-background border-border/50">
               {/* Placeholder for MobileMenu */}
               <div className="p-4 text-center text-muted-foreground">Mobile Menu Coming Soon</div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Overlay when FAB is open */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFabOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Bottom spacing for content */}
      <div className="h-24 lg:hidden" />
    </>
  );
}
