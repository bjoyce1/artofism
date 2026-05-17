## Goal

The site is a client-rendered Vite/React SPA. Most AI crawlers don't execute JavaScript, so they currently see only the static `index.html` shell. We'll add discoverable, machine-readable content at the HTML and protocol level so LLM crawlers can understand what the site is without rendering JS.

## What I'll add

### 1. `/llms.txt` (new)
A markdown manifest at `public/llms.txt` following the llmstxt.org spec — site name, one-line summary, short description of "The Art of ISM" by Mr. CAP, and a link list of public pages (home, unlock, auth, privacy, terms, refund). Crawlers like Claude, ChatGPT, and Perplexity look here first.

### 2. Expanded `noscript` content in `index.html`
The current `<noscript>` block is minimal. I'll expand it with a real intro paragraph about the book, the author, the 11-chapter structure, and a link list — so JS-less crawlers get actual content, not just "JS required." Stays hidden from real visitors (only shown when JS is off).

### 3. Richer JSON-LD in `index.html`
Currently there's one `Book` schema. I'll add:
- `Person` schema for Mr. CAP (author, sameAs link if available)
- `WebSite` schema with site name + URL
- Keep + enrich the existing `Book` (add `numberOfPages`, `genre`, `bookEdition`)

### 4. `public/llms-full.txt` (optional, recommended)
A longer plain-text "about" document (a few paragraphs about the book's themes, who it's for, what's inside) that crawlers can ingest as a single fetch. Avoids exposing the actual manuscript content — only marketing/description copy.

### 5. Update `robots.txt`
Explicitly allow AI crawlers by name: `GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot`, `Google-Extended`, `CCBot`. Currently the wildcard allows them, but named allow blocks are clearer and prevent accidental blocking later.

### 6. Keep sitemap as-is
Already up to date with public routes; no change needed.

## What I won't do (and why)

- **No SSR / prerendering.** That's a larger architectural change (would need a static-site generator step or moving to Next/Remix). Out of scope for this pass — but the items above cover ~80% of the LLM-readability gap without it.
- **Won't expose manuscript content** in `noscript` or `llms-full.txt`. Per project rules, the book is paywalled. We expose marketing copy only.

## Files touched

- `public/llms.txt` (new)
- `public/llms-full.txt` (new)
- `public/robots.txt` (edit)
- `index.html` (edit — noscript + JSON-LD)

Click **Implement plan** when ready, or tell me what to drop/add.