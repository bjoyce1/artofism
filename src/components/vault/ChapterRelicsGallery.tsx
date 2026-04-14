import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';

import ch01 from '@/assets/nft/chapter-01-evolution.jpg';
import ch02 from '@/assets/nft/chapter-02-focus.jpg';
import ch03 from '@/assets/nft/chapter-03-international.jpg';
import ch04 from '@/assets/nft/chapter-04-perception.jpg';
import ch05 from '@/assets/nft/chapter-05-words.jpg';
import ch06 from '@/assets/nft/chapter-06-temptation.jpg';
import ch07 from '@/assets/nft/chapter-07-space-age.jpg';
import ch08 from '@/assets/nft/chapter-08-realest.jpg';
import ch09 from '@/assets/nft/chapter-09-money.jpg';
import ch10 from '@/assets/nft/chapter-10-nothing-without.jpg';
import ch11 from '@/assets/nft/chapter-11-capism.jpg';

interface ChapterRelic {
  chapter: number;
  title: string;
  subtitle: string;
  image: string;
}

const relics: ChapterRelic[] = [
  { chapter: 1, title: 'Evolution of the 16th Letter', subtitle: 'Ascension', image: ch01 },
  { chapter: 2, title: 'Focus', subtitle: 'Strategy', image: ch02 },
  { chapter: 3, title: 'International Club Hopper', subtitle: 'Movement', image: ch03 },
  { chapter: 4, title: 'Perception', subtitle: 'Awareness', image: ch04 },
  { chapter: 5, title: 'Words of ISM', subtitle: 'Language', image: ch05 },
  { chapter: 6, title: 'Temptation', subtitle: 'Control', image: ch06 },
  { chapter: 7, title: 'Space Age ISM', subtitle: 'Evolution', image: ch07 },
  { chapter: 8, title: 'The Realest', subtitle: 'Authenticity', image: ch08 },
  { chapter: 9, title: 'For Money', subtitle: 'Power', image: ch09 },
  { chapter: 10, title: 'Nothing Without It', subtitle: 'Inner Light', image: ch10 },
  { chapter: 11, title: 'CAPISM', subtitle: 'Legacy', image: ch11 },
];

const ChapterRelicsGallery = () => {
  const [selected, setSelected] = useState<ChapterRelic | null>(null);

  return (
    <section className="py-24 sm:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-ui text-xs uppercase tracking-[0.3em] text-primary mb-4">
            Coming Soon
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Chapter Relics
          </h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            Each chapter distilled into a single collectible artifact. Own the philosophy, one principle at a time.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {relics.map((relic, idx) => (
            <motion.button
              key={relic.chapter}
              className="group relative aspect-square rounded-xl overflow-hidden border border-primary/10 hover:border-primary/40 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              onClick={() => setSelected(relic)}
            >
              <img
                src={relic.image}
                alt={`Chapter ${relic.chapter} — ${relic.title}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                width={1024}
                height={1024}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-deep-black/90 via-deep-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              {/* Lock badge */}
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/60 backdrop-blur-sm flex items-center justify-center">
                <Lock size={12} className="text-muted-foreground" />
              </div>
              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-ui text-[10px] uppercase tracking-widest text-primary mb-1">
                  Chapter {relic.chapter}
                </p>
                <h3 className="font-display text-sm sm:text-base font-bold text-foreground leading-tight">
                  {relic.title}
                </h3>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-deep-black/90 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="relative w-full max-w-lg"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute -top-12 right-0 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X size={24} />
              </button>
              <div className="rounded-2xl overflow-hidden border border-primary/20 shadow-[0_0_60px_hsl(43,76%,52%,0.15)]">
                <img
                  src={selected.image}
                  alt={`Chapter ${selected.chapter} — ${selected.title}`}
                  className="w-full aspect-square object-cover"
                  width={1024}
                  height={1024}
                />
                <div className="bg-card p-6">
                  <p className="font-ui text-xs uppercase tracking-widest text-primary mb-2">
                    Chapter {selected.chapter} · {selected.subtitle}
                  </p>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    {selected.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-4">
                    <Lock size={14} className="text-muted-foreground" />
                    <span className="font-ui text-xs uppercase tracking-widest text-muted-foreground">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ChapterRelicsGallery;
