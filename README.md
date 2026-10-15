# Charpai Social Ordering App

A new, standalone restaurant ordering app built for Netlify. It does not replace or modify the existing Charpai Social menu website.

## Features
- Customer menu, category filters and search
- Cart and quantity changes
- Dine-in (table number required) and takeaway
- Pay at counter / after meal (no online payment)
- Admin login, order status management, order list and menu management
- Server-side order total calculation using the current menu stored in Netlify Blobs
- Persistent storage for menu and orders using Netlify Blobs

## Deploy to Netlify
1. Create a new folder/repository from this project and push it to GitHub, or use Netlify's manual deploy workflow with a build/deploy setup that includes Functions. Git-connected deploy is recommended.
2. In Netlify, create a **new site** for this project. Do not select your existing Charpai Social menu site.
3. Add environment variables under Site configuration → Environment variables:
   - `ADMIN_PASSWORD`: a strong password for the restaurant dashboard.
   - `ADMIN_SESSION_SECRET`: a different, long random secret (at least 32 random bytes, hex encoded is a good choice).
4. Deploy the site. Netlify should install `@netlify/blobs` from `package.json` and discover functions in `netlify/functions`.
5. Open `/admin.html`, sign in, then use Menu management to replace the sample menu and prices with your real menu.
6. Test a dine-in order and a takeaway order. Confirm each appears in the admin dashboard and can be moved through statuses.

## URLs
- Customer ordering: `/`
- Admin dashboard: `/admin.html`
- Menu API: `/api/menu`
- Orders API: `/api/orders`

## Important notes
- The first menu load initializes sample menu items. Replace them with your actual menu in the admin dashboard before sharing the ordering URL or printing QR codes.
- Customer-facing menu shows only items marked available. Admin can toggle availability.
- Prices are recalculated on the server using the stored menu, not browser-submitted prices.
- Orders are stored in Netlify Blobs. Enable/verify Blobs access by deploying to a Netlify site; local development may require `netlify dev` and a linked site.
- Admin login uses a signed, expiring bearer token. Keep environment variables private, use HTTPS, and rotate the secrets if exposed.
- This starter has no online payment, tax/service-charge configuration, stock deduction, kitchen printer, WhatsApp notifications, or multi-branch support.
