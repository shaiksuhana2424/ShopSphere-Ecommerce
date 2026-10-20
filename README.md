# ShopSphere — Full-Stack E-commerce Demo

A responsive e-commerce portfolio project with a custom storefront, product search and category filters, sorting, wishlist interactions, persistent browser cart, checkout form validation, order creation, and a JSON-backed REST API.

## Requirements
- Node.js 20 or newer (Node 22 is suitable)
- No third-party npm dependencies are required.

## Run on Windows
1. Extract the `ShopSphere-Ecommerce.zip` folder to a location you can find easily.
2. Open Command Prompt inside the extracted `ShopSphere-Ecommerce` folder.
3. Run `npm start` (or `node server.js`).
4. Open `http://localhost:3000` in your browser.
5. Optional tests: open a second terminal in the same folder and run `npm test`.

No `.env` file, database installation, Docker, or manual source edits are required for local execution.

## Features
- Responsive editorial-style storefront
- 12 seeded products across five categories
- Live search, category filtering, price/rating sorting
- Wishlist UI, shopping bag, quantity controls, shipping calculation
- Checkout with client and server-side validation
- Orders stored in `data/orders.json`; catalogue in `data/products.json`
- REST API: `GET /api/health`, `GET /api/products`, `GET /api/products/:id`, `POST /api/orders`, `GET /api/orders`
- Render deployment manifest (`render.yaml`)

## Demo boundaries
This is a portfolio demonstration, not a production commerce system. It does not process payments, send emails, authenticate users, track real inventory, or provide production-grade database durability. Orders are written to local JSON files; many free hosting environments use ephemeral filesystems, so production deployment should replace JSON storage with a managed database. The newsletter form is a UI-only demo. Product art uses emoji illustrations and Google Fonts are an optional external visual enhancement.

## Deploy to Render
1. Create a new Git repository and upload the contents of this folder.
2. In Render, create a new Blueprint and select that repository so it can read `render.yaml`, or create a Web Service with build command `npm install` and start command `npm start`.
3. After deployment, open `/api/health` on the assigned service URL to confirm the server responds.

A successful live deployment depends on the hosting account, network, and provider settings and cannot be guaranteed from this folder alone. For persistent order storage, connect a managed database before treating it as anything beyond a demo.

## Suggested interview explanation
"ShopSphere is a full-stack e-commerce demo. The browser UI calls a Node.js REST API. The API reads the product catalogue from JSON, validates checkout input on the server, recalculates order totals from trusted catalogue prices rather than trusting the browser, and stores demo orders. I added search, category filtering, sorting, cart quantity management, shipping calculation, and API tests. Payment processing and production authentication are intentionally outside the demo scope."

Be clear that this project is a new demo you can explain from its code; do not claim it was the original e-commerce project from an older resume if it was not.
