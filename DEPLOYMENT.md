# Designoirs deployment checklist

## Already configured in this build

- Cloudflare-compatible Next.js/Vinext application
- D1 database binding named `DB` and generated migrations
- R2 object-storage binding named `BUCKET`
- OpenAI key stored as a hosted secret, not in source
- Server-generated tenant context; API requests never accept `project_id`
- Phantom/Solflare signed-message login and signed HttpOnly session
- GPT Image 2 generation with a database-backed mock fallback

## Founder steps

1. Create a Cloudflare account and add a payment method if Cloudflare requests one.
2. Keep the deployed Sites project connected to the repository/source package. Its manifest requests `DB` and `BUCKET`; the hosting platform provisions and binds them.
3. In the hosted project settings, confirm these runtime variables exist:
   - `OPENAI_API_KEY` — secret
   - `AUTH_SECRET` — secret, at least 32 random bytes
   - `ALLOW_DEMO_MODE=false` — ordinary variable
4. Rotate any OpenAI key ever shared in chat. Create the replacement in the OpenAI developer console, replace only the hosted `OPENAI_API_KEY` secret, and revoke the old key.
5. Open the deployed app with Phantom or Solflare installed. Press **Connect wallet**, approve the connection, then sign the login message. This signature is free and does not create a Solana transaction.
6. Enter a creative brief and press **Generate collection**. Confirm four different images appear.
7. Lock one image. Open **Products** and confirm the product plus Standard/Premium variants appear.
8. In Cloudflare, add the final custom domain only after the generated deployment works. Follow the DNS records Cloudflare supplies and wait for SSL to become active.
9. Before accepting customers, add the remaining production secrets: Printful, Helius, and Resend. Keep them in hosted secrets only; never add them to `.env.example` or source control.

## OpenAI account requirement

Use the OpenAI API developer console, enable billing, create a project API key, and complete organization verification if the console requires it for GPT Image access. The endpoint uses `gpt-image-2` through `POST /v1/images/generations` and saves returned WebP bytes to R2.

## Security boundary

Every Studio, asset, lock, and Products query derives the wallet from a verified signed session and resolves its `project_admins` row server-side. Asset reads include the resolved `project_id`. The client cannot choose another tenant by changing a request body or URL.
