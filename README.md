# Designoirs MVP

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/solanack/Designoirs)

Click the button above to clone and deploy Designoirs into your Cloudflare account. Cloudflare automatically provisions the requested D1 database and R2 bucket from `wrangler.jsonc`. After deployment, add `OPENAI_API_KEY` and `AUTH_SECRET` as encrypted Worker secrets and set `ALLOW_DEMO_MODE=false`.

Designoirs is a multi-tenant merch operating system for Solana projects. Studio generations are written to R2 and the project-scoped `assets` table. Locking a design creates a `products` record plus Standard and Premium rows in `product_variants`; Products reads those records back through the API.

## Embed a storefront

Open **Storefront** in the project dashboard and paste its generated line into the project website:

```html
<script src="https://embed.designoirs.com/v1.js" data-store="your-project-slug"></script>
```

The production widget is iframe-isolated, so host-site CSS cannot alter checkout behavior. A project slug resolves to a project-scoped public catalog; private keys never belong in this snippet.

## Architecture

- Next.js/Vinext dashboard and embedded-store surface
- D1 relational schema with `project_id` on every tenant-owned record
- R2 for uploaded and generated art
- OpenAI GPT Image 2 when `OPENAI_API_KEY` is present; a varied mock generator otherwise
- Signed Phantom/Solflare message authentication with an HttpOnly session
- `FulfillmentProvider` interface with Printful sandbox adapter
- Placeholder 5% platform fee (`PLATFORM_FEE_BPS=500`)

Server handlers must derive `project_id` from the authenticated wallet-to-admin mapping; a client-supplied project ID is never authorization. An order becomes paid only after verifying transaction signature, mint, recipient, amount, and confirmation status.

See `DEPLOYMENT.md` for the founder-friendly Cloudflare launch checklist.
