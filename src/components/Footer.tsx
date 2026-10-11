import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ismLogo from '@/assets/ism-logo.webp';

const links = [
  ['Chapters', '/#chapters'], ['The Codes', '/codes'], ['The Vault', '/vault'],
  ['About', '/#about'], ['Acknowledgments', '/acknowledgments'], ['Unlock Full Access', '/unlock'],
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-deep-black py-8 md:py-12 px-6 text-center md:text-left">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[1.2fr_1fr_1fr] gap-6 md:gap-12 mb-6">
          <div className="space-y-3">
            <Link to="/" className="inline-flex min-h-11" aria-label="The Art of ISM home"><img src={ismLogo} alt="The Art of ISM" className="w-28 h-auto" /></Link>
            <p className="text-foreground/85 text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              A Code of Thought, Movement, and Mastery.
            </p>
          </div>
          <nav aria-label="Footer links">
            <h2 className="font-ui text-xs uppercase tracking-[0.2em] text-primary mb-2">Explore</h2>
            <div className="grid grid-cols-2 md:grid-cols-1">
              {links.map(([label, to]) => <Button key={to} asChild variant="link" className="min-h-11 h-auto py-2 px-1 text-muted-foreground text-sm md:justify-start whitespace-normal"><Link to={to}>{label}</Link></Button>)}
            </div>
          </nav>
          <div>
            <h2 className="font-ui text-xs uppercase tracking-[0.2em] text-primary mb-2">Support</h2>
            <div className="flex flex-col items-center md:items-start">
              <Button asChild variant="link" className="min-h-11 px-0 text-muted-foreground"><a href="mailto:support@theartofism.com">support@theartofism.com</a></Button>
              <Button asChild variant="link" className="min-h-11 px-0 text-muted-foreground"><a href="https://mrcap1.com" target="_blank" rel="noopener noreferrer">mrcap1.com</a></Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-border pt-4">
          <nav aria-label="Legal" className="flex gap-5">
            {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Refund', '/refund']].map(([label, to]) => <Button asChild key={to} variant="link" className="min-h-11 px-0 text-muted-foreground"><Link to={to}>{label}</Link></Button>)}
          </nav>
          <p className="text-muted-foreground text-xs">© {new Date().getFullYear()} The Art of ISM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
