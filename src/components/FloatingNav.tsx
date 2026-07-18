import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, List, Code2, User, Gem, Search, Menu, Library as LibraryIcon, Lock } from 'lucide-react';

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
  const [menuOpen, setMenuOpen] = useState(false);
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
        navigate({ pathname: '/', hash: `#${id}` });
      }
    }
  };

  return (
    <>
      {/* Top bar — logo + hamburger under lg, full nav at lg+ */}
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

          {/* Mobile + tablet: search + hamburger */}
          <div className="lg:hidden flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search the book"
              className="min-h-11 min-w-11 flex items-center justify-center text-muted-foreground hover:text-primary active:scale-95 transition-all"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="min-h-11 min-w-11 flex items-center justify-center text-foreground hover:text-primary active:scale-95 transition-all"
                >
                  <Menu size={24} strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-deep-black border-primary/20 w-[85vw] sm:w-[380px]">
                <SheetHeader>
                  <SheetTitle className="font-display text-foreground text-left">Menu</SheetTitle>
                  <SheetDescription className="text-muted-foreground text-left">Navigate The Art of ISM</SheetDescription>
                </SheetHeader>
                <div className="mt-6 grid gap-1">
                  {navItems.map(item => {
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

                  <div className="my-3 h-px bg-primary/10" />

                  {user && hasAccess ? (
                    <SheetClose asChild>
                      <Link to="/library" className="flex items-center gap-3 min-h-11 px-3 py-2 rounded-lg hover:bg-primary/10">
                        <LibraryIcon size={18} aria-hidden="true" className="text-primary" />
                        <span className="font-ui text-sm uppercase tracking-[0.15em] text-primary">Library</span>
                      </Link>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Link
                        to={user ? '/unlock' : '/auth'}
                        className="flex items-center gap-3 min-h-11 px-3 py-2 rounded-lg hover:bg-primary/10"
                      >
                        <Lock size={18} aria-hidden="true" className="text-primary" />
                        <span className="font-ui text-sm uppercase tracking-[0.15em] text-primary">
                          {user ? 'Get Access' : 'Sign In'}
                        </span>
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop nav (lg+) */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.slice(1).map(item => (
              item.path.startsWith('/#') ? (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.path)}
                  className="text-[15px] uppercase tracking-[0.2em] text-foreground/80 hover:text-primary transition-colors duration-300"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  className="text-[15px] uppercase tracking-[0.2em] text-foreground/80 hover:text-primary transition-colors duration-300"
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
              <kbd className="hidden xl:inline font-ui text-[10px] tracking-widest border border-border rounded px-1.5 py-0.5">
                ⌘K
              </kbd>
            </button>
            {user && hasAccess ? (
              <Link to="/library" className="text-[15px] uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors duration-300">
                Library
              </Link>
            ) : (
              <Link to={user ? "/unlock" : "/auth"} className="text-[15px] uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors duration-300">
                {user ? "Get Access" : "Sign In"}
              </Link>
            )}
          </div>
        </div>
      </nav>

      <BookSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};

export default FloatingNav;
