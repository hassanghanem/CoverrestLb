# Frontend

This folder contains the two React frontends built with Vite. Both apps are powered by the same Laravel API and share the same product and order data.

## Apps
- `admin/` Internal dashboard for staff and admins
- `client/` Public storefront for customers

## What These Apps Do
- Admin app provides tools to manage catalog, inventory, pricing, and orders
- Client app provides shopping, checkout, and account management for customers

## Key Screens And Features
- Admin: dashboard, orders, products, variants, categories, brands, coupons, reports, settings
- Client: home, shop, product details, cart, checkout, profile, wishlist, orders, pre-orders

## How Frontend Talks To Backend
- Both apps use Axios services under `src/lib/services` to call the API
- Auth sessions, cart state, and user settings are stored in the client app store

## Run Locally
1. `cd frontend/admin`
2. `npm install`
3. `npm run dev`

Then, in another terminal:
1. `cd frontend/client`
2. `npm install`
3. `npm run dev`

## Environment
- Each app can use its own `.env` file for API base URLs and runtime settings.
