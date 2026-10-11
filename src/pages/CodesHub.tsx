import { useState } from 'react';
import { allCodes } from '@/data/bookContent';
import { codePreviewTitles } from '@/lib/codePreview';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useReadingProgress';
import FloatingNav from '@/components/FloatingNav';
import SEO from '@/components/SEO';
import AnimatedSection from '@/components/AnimatedSection';
import { Heart, Copy, Check, ChevronDown, ChevronUp, Lock } from 'lucide-react';

const CodesHub = () => {
  const { hasAccess } = useAuth();
  const [expandedCode, setExpandedCode] = useState<number | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="min-h-screen bg-deep-black">
      <SEO title="The Codes" description="The complete Codes hub from The Art of ISM by Mr. CAP." path="/codes" noindex />
      <FloatingNav />

      <div className="pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <p className="font-ui text-xs uppercase tracking-[0.2em] text-primary mb-4 text-center">The System</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground text-center mb-4">
              The <span className="text-gold-gradient">Codes</span>
            </h1>
            <p className="text-center text-muted-foreground text-lg mb-16 max-w-xl mx-auto">
              Every chapter distills into a code. These are the principles of ISM — collected and ready to live by.
            </p>
          </AnimatedSection>

          {!hasAccess ? (
            <>
              <ul className="divide-y divide-border">
                {codePreviewTitles.map(code => (
                  <li key={code.chapterNumber} className="flex items-center justify-between gap-4 py-5">
                    <h2 className="font-display text-xl text-foreground">{code.title}</h2>
                    <Lock size={16} className="text-muted-foreground shrink-0" aria-label="Full access required" />
                  </li>
                ))}
              </ul>
              <div className="mt-12 border-t border-primary/20 pt-8 text-center">
                <p className="font-display text-xl text-foreground mb-6">Unlock all 10 Codes with the full book — $9.99</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button asChild size="lg"><Link to="/unlock">Unlock Full Book — $9.99</Link></Button>
                  <Button asChild variant="link" size="lg"><Link to="/chapter/1">Read Chapter 1 Free</Link></Button>
                </div>
              </div>
            </>
          ) : (
          <div className="space-y-4">
            {allCodes.map((code, i) => {
              const isExpanded = expandedCode === i;

              return (
                <AnimatedSection key={i} delay={i * 60}>
                  <div className={`bg-card border rounded-sm transition-all duration-500 ${
                    isExpanded ? 'border-primary/40' : 'border-border hover:border-primary/20'
                  }`}>
                    {/* Header */}
                    <button
                      onClick={() => setExpandedCode(isExpanded ? null : i)}
                      className="w-full flex items-center justify-between p-6 text-left"
                    >
                      <div>
                        <p className="font-ui text-xs uppercase tracking-[0.2em] text-primary mb-1">
                          Chapter {code.chapterNumber}
                        </p>
                        <h3 className="font-display text-xl font-semibold text-foreground">
                          {code.title}
                        </h3>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-primary shrink-0" />
                      ) : (
                        <ChevronDown size={20} className="text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-3">
                        {code.principles.map((principle, j) => (
                          <div
                            key={j}
                            className="group flex items-start justify-between gap-4 p-4 bg-muted/50 rounded-sm"
                          >
                            <p className="text-base text-foreground/90 leading-relaxed">{principle}</p>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => toggleFavorite(principle, code.chapterNumber.toString())} className="p-1" aria-label="Save quote">
                                <Heart
                                  size={14}
                                  className={isFavorite(principle) ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary transition-colors'}
                                />
                              </button>
                              <button onClick={() => copyText(principle)} className="p-1">
                                {copiedText === principle ? (
                                  <Check size={14} className="text-green-500" />
                                ) : (
                                  <Copy size={14} className="text-muted-foreground hover:text-primary transition-colors" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}

                        <p className="font-display text-lg text-primary italic pt-4 text-center">
                          {code.closing}
                        </p>
                      </div>
                    )}
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodesHub;
