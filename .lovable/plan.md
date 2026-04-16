
The user pasted a detailed pre-launch audit. They want me to implement fixes. Let me explore key files to confirm the issues, then present a focused plan in their priority order.

Need to check:
- index.html viewport (confirmed in current-code: has maximum-scale=1.0, user-scalable=no)
- verify-paypal (confirmed: no amount check, no upsert, CORS *)
- migrations for purchases unique constraint
- analytics_events RLS (confirmed: anyone can insert)
- src/assets contents
- App.tsx code-splitting (confirmed: all eager)
- HeroSection for image loading
- PayPal Buttons config for card funding
- public/robots.txt + sitemap
- package.json name

Let me verify a few quickly.
