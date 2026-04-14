import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, Quote, Sparkles, Layers, Wallet, Key, Unlock, ExternalLink } from 'lucide-react';
import FloatingNav from '@/components/FloatingNav';
import Footer from '@/components/Footer';
import foundersKeyImg from '@/assets/nft/founders-key.jpg';

const TOTAL_SUPPLY = 111;

const utilityItems = [
  { icon: BookOpen, label: 'Full access to The Art of ISM' },
  { icon: Shield, label: 'Locked chapters and Codes' },
  { icon: Quote, label: 'Quote Vault' },
  { icon: Sparkles, label: 'Future drops & exclusives' },
  { icon: Layers, label: 'Exclusive hidden content' },
];

const processSteps = [
  { icon: Wallet, step: 1, title: 'Connect Wallet', desc: 'Link your MetaMask, WalletConnect, or Coinbase Wallet' },
  { icon: Key, step: 2, title: 'Mint Key', desc: 'Secure your Founder\'s Key from the collection' },
  { icon: Unlock, step: 3, title: 'Unlock System', desc: 'Access the full ISM experience' },
];

const Mint = () => {
  const [remaining, setRemaining] = useState(TOTAL_SUPPLY);

  useEffect(() => {
    // Placeholder: simulate scarcity counter
    const timer = setTimeout(() => setRemaining(89), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <FloatingNav />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Smoke overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-background to-background pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--crimson)/0.15),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-16">
          {/* Left — Key visual */}
          <motion.div
            className="flex justify-center lg:justify-end order-1 lg:order-1"
            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative">
              <div className="absolute -inset-8 bg-[radial-gradient(circle,hsl(var(--gold)/0.2),transparent_70%)] blur-2xl animate-pulse" />
              <motion.img
                src={foundersKeyImg}
                alt="The ISM Founder's Key"
                className="w-72 sm:w-96 rounded-2xl shadow-[0_0_80px_hsl(var(--gold)/0.2)] border border-primary/20"
                width={1024}
                height={1024}
                animate={{
                  rotateY: [0, 3, 0, -3, 0],
                  rotateX: [0, -2, 0, 2, 0],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>

          {/* Right — Copy */}
          <motion.div
            className="order-2 lg:order-2 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="font-ui text-xs uppercase tracking-[0.3em] text-primary mb-4">
              Limited Edition · Ethereum
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
              The ISM<br />Founder's Key
            </h1>
            <p className="font-display text-xl sm:text-2xl text-primary/80 mb-6">
              111 Keys. One System.
            </p>
            <div className="space-y-2 mb-8">
              <p className="font-body text-muted-foreground text-lg">This is not a collectible.</p>
              <p className="font-body text-foreground text-lg font-medium">This is access.</p>
            </div>

            {/* Price + Supply */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start mb-8">
              <div className="bg-card/60 border border-primary/20 rounded-xl px-6 py-4 text-center backdrop-blur-sm">
                <p className="font-ui text-xs uppercase tracking-widest text-muted-foreground mb-1">Price</p>
                <p className="font-display text-2xl font-bold text-primary">$149</p>
              </div>
              <div className="bg-card/60 border border-primary/20 rounded-xl px-6 py-4 text-center backdrop-blur-sm">
                <p className="font-ui text-xs uppercase tracking-widest text-muted-foreground mb-1">Supply</p>
                <p className="font-display text-2xl font-bold text-foreground">{TOTAL_SUPPLY}</p>
              </div>
              <div className="bg-card/60 border border-secondary/30 rounded-xl px-6 py-4 text-center backdrop-blur-sm">
                <p className="font-ui text-xs uppercase tracking-widest text-muted-foreground mb-1">Remaining</p>
                <motion.p
                  key={remaining}
                  className="font-display text-2xl font-bold text-secondary"
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {remaining}
                </motion.p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <motion.button
                className="relative px-8 py-4 bg-primary text-primary-foreground font-ui text-sm uppercase tracking-[0.2em] rounded-lg overflow-hidden group"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center gap-2">
                  <Key size={16} />
                  Mint Your Key
                </span>
              </motion.button>

              <a
                href="https://opensea.io/collection/artofism"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-primary/30 text-primary font-ui text-sm uppercase tracking-[0.2em] rounded-lg hover:bg-primary/5 transition-colors flex items-center gap-2"
              >
                View on OpenSea
                <ExternalLink size={14} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── UTILITY ── */}
      <section className="py-24 sm:py-32 px-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--gold)/0.05),transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-ui text-xs uppercase tracking-[0.3em] text-primary mb-4">Utility</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">What This Unlocks</h2>
          </motion.div>

          <div className="grid gap-4">
            {utilityItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  className="flex items-center gap-5 p-5 bg-card/40 border border-primary/10 rounded-xl backdrop-blur-sm hover:border-primary/30 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <p className="font-body text-foreground text-lg">{item.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="py-24 sm:py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-ui text-xs uppercase tracking-[0.3em] text-primary mb-4">How It Works</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Three Steps to Access</h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  className="relative text-center p-8 bg-card/40 border border-primary/10 rounded-2xl backdrop-blur-sm"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <p className="font-ui text-xs uppercase tracking-widest text-primary mb-2">Step {step.step}</p>
                  <h3 className="font-display text-xl font-bold mb-2">{step.title}</h3>
                  <p className="font-body text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BOTTOM ── */}
      <section className="py-24 sm:py-32 px-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--crimson)/0.1),transparent_60%)] pointer-events-none" />
        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-display text-3xl sm:text-5xl font-bold text-foreground italic mb-8">
            "It's all ISM."
          </p>
          <Link
            to="/vault"
            className="inline-flex items-center gap-2 px-8 py-4 border border-primary/30 text-primary font-ui text-sm uppercase tracking-[0.2em] rounded-lg hover:bg-primary/5 transition-colors"
          >
            Enter The Vault
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Mint;
