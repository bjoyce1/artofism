import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Lock, Gem, BookOpen, Music, Code2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FloatingNav from '@/components/FloatingNav';
import Footer from '@/components/Footer';
import foundersKeyImg from '@/assets/founders-key.png';
import ChapterRelicsGallery from '@/components/vault/ChapterRelicsGallery';
import vaultHeroBg from '@/assets/vault-hero-bg.png';

const OPENSEA_URL = 'https://opensea.io/collection/artofism';

interface CollectionItem {
  id: string;
  title: string;
  icon: typeof Gem;
  description: string;
  utility: string[];
  supply: string;
  status: 'live' | 'coming-soon';
}

const collection: CollectionItem[] = [
  {
    id: 'founders-key',
    title: "Founder's Key",
    icon: Gem,
    description:
      'The first layer of ISM ownership. A limited digital artifact designed for those who understand that mindset is the foundation of everything.',
    utility: [
      'Full access to locked chapters',
      'Access to The Codes section',
      'Unlock Quote Vault',
      'Future content drops',
      'Priority access to releases',
    ],
    supply: '111',
    status: 'live',
  },
  {
    id: 'chapter-relics',
    title: 'Chapter Relics',
    icon: BookOpen,
    description:
      'Each chapter distilled into a single collectible artifact. Own the philosophy, one principle at a time.',
    utility: ['Unlock individual chapters', 'Exclusive chapter art', 'Collectible series'],
    supply: 'TBA',
    status: 'coming-soon',
  },
  {
    id: 'ism-codes',
    title: 'ISM Codes',
    icon: Code2,
    description:
      'The coded principles of ISM, minted as digital relics. Each code is a key to understanding the system.',
    utility: ['Access code breakdowns', 'Holder-only content', 'Community access'],
    supply: 'TBA',
    status: 'coming-soon',
  },
  {
    id: 'sound-artifacts',
    title: 'Sound Artifacts',
    icon: Music,
    description:
      'Audio experiences from the ISM universe. Ambient soundscapes and narrated wisdom, owned forever.',
    utility: ['Exclusive audio content', 'Ambient soundscapes', 'Narrated chapters'],
    supply: 'TBA',
    status: 'coming-soon',
  },
];

const Vault = () => {
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);

  return (
    <div className="min-h-screen bg-deep-black text-foreground">
      <FloatingNav />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${vaultHeroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-black/60 via-deep-black/70 to-deep-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-black/80 via-transparent to-deep-black/80" />

        {/* Red smoke overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-transparent to-deep-black" />
          <motion.div
            className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[120px]"
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-crimson/8 blur-[100px]"
            animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Gold particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.8, 0],
                y: [0, -60],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-6">
              The Vault
            </p>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-foreground mb-6 leading-[1.1]">
              Own a Piece of{' '}
              <span className="text-primary">ISM</span>
            </h1>
            <p className="font-body text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
              Collect the system. Unlock the experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="font-ui uppercase tracking-widest text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() =>
                  document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                View Collection
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-ui uppercase tracking-widest text-sm border-primary/30 text-primary hover:bg-primary/10"
                onClick={() =>
                  document.getElementById('unlock-section')?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Unlock Access
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOUNDER'S KEY FEATURE ── */}
      <section className="relative py-24 sm:py-32 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <div className="absolute -inset-8 bg-primary/10 rounded-full blur-[60px]" />
              <img
                src={foundersKeyImg}
                alt="ISM Founder's Key — Limited Edition Digital Artifact"
                className="relative w-64 sm:w-80 h-auto drop-shadow-[0_0_40px_hsl(43,76%,52%,0.3)]"
                width={1024}
                height={1024}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="font-ui text-xs uppercase tracking-[0.3em] text-primary mb-4">
              Primary Artifact
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
              ISM Founder's Key
            </h2>
            <div className="font-body text-muted-foreground space-y-4 mb-8 leading-relaxed">
              <p>This is not just a collectible.</p>
              <p className="text-primary font-semibold">This is access.</p>
              <p>
                The Founder's Key is a limited digital artifact designed for those who understand
                that mindset is the foundation of everything.
              </p>
              <p>
                Owning a Founder's Key means you operate inside ISM.
              </p>
            </div>
            <ul className="space-y-3 mb-8">
              {collection[0].utility.map((u) => (
                <li key={u} className="flex items-center gap-3 font-ui text-sm text-foreground">
                  <Check size={16} className="text-primary flex-shrink-0" />
                  {u}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-6 mb-8">
              <div>
                <p className="font-ui text-xs uppercase tracking-widest text-muted-foreground">
                  Supply
                </p>
                <p className="font-display text-2xl font-bold text-primary">111</p>
              </div>
            </div>
            <Button
              size="lg"
              className="font-ui uppercase tracking-widest text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              asChild
            >
              <a href={OPENSEA_URL} target="_blank" rel="noopener noreferrer">
                View on OpenSea <ExternalLink size={16} className="ml-2" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── COLLECTION GRID ── */}
      <section id="collection" className="py-24 sm:py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-ui text-xs uppercase tracking-[0.3em] text-primary mb-4">
              The Collection
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Digital Artifacts
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collection.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  className="group relative text-left bg-card/40 backdrop-blur-sm border border-primary/10 rounded-xl p-6 transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(43,76%,52%,0.1)] hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground line-clamp-2 mb-4">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-ui text-xs uppercase tracking-widest text-primary">
                      {item.supply}
                    </span>
                    {item.status === 'coming-soon' && (
                      <span className="font-ui text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded">
                        Soon
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              className="font-ui uppercase tracking-widest text-sm border-primary/30 text-primary hover:bg-primary/10"
              asChild
            >
              <a href={OPENSEA_URL} target="_blank" rel="noopener noreferrer">
                View Full Collection <ExternalLink size={16} className="ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── CHAPTER RELICS GALLERY ── */}
      <ChapterRelicsGallery />

      {/* ── LOCKED ACCESS SECTION ── */}
      <section
        id="unlock-section"
        className="relative py-24 sm:py-32 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
              <Lock size={28} className="text-primary" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Unlock the System
            </h2>
            <p className="font-body text-lg text-muted-foreground mb-4 leading-relaxed">
              Certain parts of The Art of ISM are reserved for holders.
            </p>
            <p className="font-body text-lg text-muted-foreground mb-10 leading-relaxed">
              To access everything, you need the Founder's Key.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="font-ui uppercase tracking-widest text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <a href={OPENSEA_URL} target="_blank" rel="noopener noreferrer">
                  View Collection
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-ui uppercase tracking-widest text-sm border-primary/30 text-primary hover:bg-primary/10"
                asChild
              >
                <a href="/unlock">Get Access</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CLOSING LINE ── */}
      <section className="py-20 text-center">
        <motion.p
          className="font-display text-2xl sm:text-3xl italic text-primary/80"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          It's all ISM.
        </motion.p>
      </section>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-deep-black/80 backdrop-blur-sm"
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              className="relative w-full max-w-md bg-card border border-primary/20 rounded-2xl p-8 shadow-[0_0_60px_hsl(43,76%,52%,0.1)]"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                <selectedItem.icon size={28} className="text-primary" />
              </div>

              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                {selectedItem.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground mb-6 leading-relaxed">
                {selectedItem.description}
              </p>

              <div className="mb-6">
                <p className="font-ui text-xs uppercase tracking-widest text-muted-foreground mb-3">
                  Utility
                </p>
                <ul className="space-y-2">
                  {selectedItem.utility.map((u) => (
                    <li
                      key={u}
                      className="flex items-center gap-2 font-ui text-sm text-foreground"
                    >
                      <Check size={14} className="text-primary flex-shrink-0" />
                      {u}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-ui text-xs uppercase tracking-widest text-muted-foreground">
                    Supply
                  </p>
                  <p className="font-display text-xl font-bold text-primary">
                    {selectedItem.supply}
                  </p>
                </div>
                {selectedItem.status === 'coming-soon' && (
                  <span className="font-ui text-xs uppercase tracking-widest text-muted-foreground bg-muted px-3 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </div>

              {selectedItem.status === 'live' ? (
                <Button
                  className="w-full font-ui uppercase tracking-widest text-sm bg-primary text-primary-foreground hover:bg-primary/90"
                  asChild
                >
                  <a href={OPENSEA_URL} target="_blank" rel="noopener noreferrer">
                    View on OpenSea <ExternalLink size={16} className="ml-2" />
                  </a>
                </Button>
              ) : (
                <Button
                  className="w-full font-ui uppercase tracking-widest text-sm"
                  disabled
                >
                  Coming Soon
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Vault;
