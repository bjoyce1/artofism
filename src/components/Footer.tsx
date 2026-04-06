import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-deep-black py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-8 mb-10">
          <div className="space-y-3">
            <p className="font-display text-lg text-foreground font-semibold">The Art of ISM</p>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              A Code of Thought, Movement, and Mastery.
            </p>
          </div>
          <div className="space-y-3">
            <p className="font-ui text-xs uppercase tracking-[0.3em] text-primary mb-2">Support</p>
            <a
              href="mailto:support@theartofism.com"
              className="block text-muted-foreground text-sm hover:text-primary transition-colors"
            >
              support@theartofism.com
            </a>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 border-t border-border pt-8 mb-8">
          <Link to="/privacy" className="text-muted-foreground text-sm hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-muted-foreground text-sm hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link to="/refund" className="text-muted-foreground text-sm hover:text-primary transition-colors">
            Refund Policy
          </Link>
        </div>

        <p className="text-muted-foreground/50 text-xs">
          © {new Date().getFullYear()} The Art of ISM. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
