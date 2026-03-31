import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '@/assets/logo.png';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Introduction', path: '/#introduction' },
  { label: 'Chapters', path: '/#chapters' },
  { label: 'Codes', path: '/codes' },
  { label: 'About', path: '/#about' },
];

const FloatingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleNavClick = (path: string) => {
    setMobileOpen(false);
    if (path.startsWith('/#')) {
      const id = path.slice(2);
      if (location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = path;
      }
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 font-ui ${
          scrolled
            ? 'bg-deep-black/90 backdrop-blur-xl border-b border-primary/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-gold-gradient font-display text-xl font-bold tracking-wider">
            ISM
          </Link>

          {/* Desktop */}
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
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground hover:text-primary transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-deep-black/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8 font-ui">
          {navItems.map(item => (
            item.path.startsWith('/#') ? (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.path)}
                className="text-lg uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.path}
                className="text-lg uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors duration-300"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          ))}
        </div>
      )}
    </>
  );
};

export default FloatingNav;
