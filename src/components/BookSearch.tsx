import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Quote, ScrollText } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { searchIndex, type SearchEntry } from '@/lib/searchIndex';

const MAX_RESULTS = 24;

const kindMeta = {
  chapter: { label: 'Chapters', icon: BookOpen },
  passage: { label: 'Passages', icon: ScrollText },
  principle: { label: 'Code Principles', icon: Quote },
} as const;

interface BookSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookSearch = ({ open, onOpenChange }: BookSearchProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      // No query yet — offer the chapter list as a starting point.
      return searchIndex.filter(e => e.kind === 'chapter');
    }
    const matches: SearchEntry[] = [];
    // Chapters first so title hits always surface above passage hits.
    for (const kind of ['chapter', 'principle', 'passage'] as const) {
      for (const entry of searchIndex) {
        if (entry.kind !== kind) continue;
        if (entry.text.toLowerCase().includes(q) || entry.chapterTitle.toLowerCase().includes(q)) {
          matches.push(entry);
          if (matches.length >= MAX_RESULTS) return matches;
        }
      }
    }
    return matches;
  }, [query]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchEntry[]> = {};
    results.forEach(e => {
      (groups[e.kind] ??= []).push(e);
    });
    return groups;
  }, [results]);

  const select = useCallback(
    (entry: SearchEntry) => {
      onOpenChange(false);
      navigate(entry.path);
    },
    [navigate, onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <CommandInput
        placeholder="Search the book — chapters, passages, principles…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>No matches found in the book.</CommandEmpty>
        {(Object.keys(kindMeta) as Array<keyof typeof kindMeta>).map(kind => {
          const entries = grouped[kind];
          if (!entries?.length) return null;
          const { label, icon: Icon } = kindMeta[kind];
          return (
            <CommandGroup key={kind} heading={label}>
              {entries.map(entry => (
                <CommandItem
                  key={entry.id}
                  value={entry.id}
                  onSelect={() => select(entry)}
                  className="cursor-pointer"
                >
                  <Icon className="text-primary shrink-0" />
                  <div className="min-w-0 ml-2">
                    <p className="truncate text-foreground/90">{entry.text}</p>
                    {entry.kind !== 'chapter' && (
                      <p className="font-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                        {entry.chapter === 0 ? 'Introduction' : `Chapter ${entry.chapter} · ${entry.chapterTitle}`}
                      </p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
};

export default BookSearch;
