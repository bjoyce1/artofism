
Status check result:

- `notify.theartofism.com` is still `Pending`.
- Verification has not completed yet, and the backend still sees the DNS setup as incomplete.

Next checks:
1. Confirm there is exactly one `_lovable-email` TXT record, using the full verification value.
2. Confirm the `notify` subdomain has both NS records:
   - `ns3.lovable.cloud`
   - `ns4.lovable.cloud`
3. In Cloud → Emails, click `Verify Domain` again after the DNS changes have had time to propagate.

Once the status flips to active, branded auth emails should start working automatically.
