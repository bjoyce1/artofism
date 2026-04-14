import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, List, Code2, User, Library, LogIn, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Introduction', path: '/#introduction', icon: BookOpen },
  { label: 'Chapters', path: '/#chapters', icon: List },
  { label: 'Codes', path: '/codes', icon: Code2 },
  { label: 'About', path: '/#about', icon: User },
  { label: 'The Vault', path: '/vault', icon: Gem },
];

const FloatingNav = () => {
  const { user, hasAccess } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (path: string) => {
    if (path.startsWith('/#')) {
      const id = path.slice(2);
      if (location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = path;
      }
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' && !location.hash;
    if (path === '/codes') return location.pathname === '/codes';
    if (path === '/vault') return location.pathname === '/vault';
    return false;
  };

  return (
    <>
      {/* Top bar — logo only on mobile, full nav on desktop */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-ui ${
          scrolled
            ? 'bg-deep-black/90 backdrop-blur-xl border-b border-primary/10'
            : 'bg-transparent'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center active:scale-95 transition-transform">
            <img src={logo} alt="The Art of ISM" className="h-7 sm:h-8 w-auto" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              item.path.startsWith('/#') ? (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.path)}
                  className="text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  className="text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors duration-300"
                >
                  {item.label}
                </Link>
              )
            ))}
            {user && hasAccess ? (
              <Link to="/library" className="text-sm uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors duration-300">
                Library
              </Link>
            ) : (
              <Link to={user ? "/unlock" : "/auth"} className="text-sm uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors duration-300">
                {user ? "Get Access" : "Sign In"}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-deep-black/95 backdrop-blur-xl border-t border-primary/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);

            const baseClass = `flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg min-w-[3.5rem] ${
              active ? 'text-primary' : 'text-muted-foreground'
            }`;

            const content = (
              <>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[9px] uppercase tracking-[0.1em] font-ui leading-none">
                  {item.label === 'Introduction' ? 'Intro' : item.label}
                </span>
              </>
            );

            if (item.path.startsWith('/#')) {
              return (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavClick(item.path)}
                  className={baseClass}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  {content}
                </motion.button>
              );
            }

            return (
              <motion.div
                key={item.label}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <Link to={item.path} className={baseClass}>
                  {content}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FloatingNav;
