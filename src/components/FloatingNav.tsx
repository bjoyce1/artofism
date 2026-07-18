import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, List, Code2, User, Gem, Search, MoreHorizontal, Library as LibraryIcon, Lock } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import BookSearch from '@/components/BookSearch';
import logo from '@/assets/logo.webp';

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
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Ctrl+K / Cmd+K opens book-wide search from any page.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(open => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleNavClick = (path: string) => {
    if (path.startsWith('/#')) {
      const id = path.slice(2);
      if (location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Client-side navigation — ScrollToHash handles the scroll on arrival.
        navigate({ pathname: '/', hash: `#${id}` });
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

          {/* Mobile search button (desktop has its own in the nav row) */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search the book"
            className="md:hidden p-2 -m-1 text-muted-foreground hover:text-primary active:scale-95 transition-all"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>

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
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search the book (Ctrl+K)"
              title="Search the book (Ctrl+K)"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              <Search size={16} strokeWidth={1.5} />
              <kbd className="hidden lg:inline font-ui text-[10px] tracking-widest border border-border rounded px-1.5 py-0.5">
                ⌘K
              </kbd>
            </button>
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

      {/* Mobile bottom tab bar — 4 items + More sheet. 44x44 targets, no overflow at 320px. */}
      <nav
        aria-label="Primary"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-deep-black/95 backdrop-blur-xl border-t border-primary/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-4 items-stretch px-1 py-1">
          {/* 1. Home */}
          <Link
            to="/"
            aria-label="Home"
            aria-current={isActive('/') ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 min-h-11 min-w-11 px-1 py-1 rounded-lg ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Home size={20} strokeWidth={isActive('/') ? 2.5 : 1.5} aria-hidden="true" />
            <span className="text-[9px] uppercase tracking-[0.1em] font-ui leading-none">Home</span>
          </Link>

          {/* 2. Vault */}
          <Link
            to="/vault"
            aria-label="The Vault"
            aria-current={isActive('/vault') ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 min-h-11 min-w-11 px-1 py-1 rounded-lg ${
              isActive('/vault') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Gem size={20} strokeWidth={isActive('/vault') ? 2.5 : 1.5} aria-hidden="true" />
            <span className="text-[9px] uppercase tracking-[0.1em] font-ui leading-none">Vault</span>
          </Link>

          {/* 3. Context-aware Library / Get Access / Sign In */}
          {user && hasAccess ? (
            <Link
              to="/library"
              aria-label="Library"
              className="flex flex-col items-center justify-center gap-0.5 min-h-11 min-w-11 px-1 py-1 rounded-lg text-primary"
            >
              <LibraryIcon size={20} strokeWidth={2} aria-hidden="true" />
              <span className="text-[9px] uppercase tracking-[0.1em] font-ui leading-none">Library</span>
            </Link>
          ) : (
            <Link
              to={user ? '/unlock' : '/auth'}
              aria-label={user ? 'Get Access' : 'Sign In'}
              className="flex flex-col items-center justify-center gap-0.5 min-h-11 min-w-11 px-1 py-1 rounded-lg text-primary"
            >
              <Lock size={20} strokeWidth={2} aria-hidden="true" />
              <span className="text-[9px] uppercase tracking-[0.1em] font-ui leading-none">
                {user ? 'Unlock' : 'Sign In'}
              </span>
            </Link>
          )}

          {/* 4. More — opens accessible bottom sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="More navigation"
                className="flex flex-col items-center justify-center gap-0.5 min-h-11 min-w-11 px-1 py-1 rounded-lg text-muted-foreground"
              >
                <MoreHorizontal size={20} strokeWidth={1.5} aria-hidden="true" />
                <span className="text-[9px] uppercase tracking-[0.1em] font-ui leading-none">More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-deep-black border-primary/20">
              <SheetHeader>
                <SheetTitle className="font-display text-foreground">Menu</SheetTitle>
                <SheetDescription className="text-muted-foreground">Additional sections</SheetDescription>
              </SheetHeader>
              <div className="mt-4 grid gap-1">
                {[
                  { label: 'Introduction', path: '/#introduction', icon: BookOpen },
                  { label: 'Chapters', path: '/#chapters', icon: List },
                  { label: 'Codes', path: '/codes', icon: Code2 },
                  { label: 'About', path: '/#about', icon: User },
                ].map(item => {
                  const Icon = item.icon;
                  const inner = (
                    <>
                      <Icon size={18} aria-hidden="true" className="text-primary" />
                      <span className="font-ui text-sm uppercase tracking-[0.15em] text-foreground">{item.label}</span>
                    </>
                  );
                  return item.path.startsWith('/#') ? (
                    <SheetClose asChild key={item.label}>
                      <button
                        onClick={() => handleNavClick(item.path)}
                        className="flex items-center gap-3 min-h-11 px-3 py-2 rounded-lg hover:bg-primary/10 text-left"
                      >
                        {inner}
                      </button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild key={item.label}>
                      <Link to={item.path} className="flex items-center gap-3 min-h-11 px-3 py-2 rounded-lg hover:bg-primary/10">
                        {inner}
                      </Link>
                    </SheetClose>
                  );
                })}
                <SheetClose asChild>
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="flex items-center gap-3 min-h-11 px-3 py-2 rounded-lg hover:bg-primary/10 text-left"
                  >
                    <Search size={18} aria-hidden="true" className="text-primary" />
                    <span className="font-ui text-sm uppercase tracking-[0.15em] text-foreground">Search</span>
                  </button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <BookSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};

export default FloatingNav;
