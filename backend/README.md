# Backend

This is the Laravel API that powers CoverRest LB. It provides endpoints for the admin dashboard and the customer storefront, and includes business logic for products, orders, pre-orders, promotions, and user accounts.

## What This Backend Does
- Acts as the single source of truth for catalog, pricing, and inventory
- Enforces order, pre-order, and return workflows
- Manages customer accounts, addresses, and authentication
- Powers content sections and home page data for the storefront
- Exposes API endpoints for both admin and client apps

## Core Domains
- Catalog: products, variants, categories, brands, tags, images
- Commerce: cart, orders, pre-orders, payments, returns
- Marketing: coupons, promotions, banners, home sections
- Accounts: users, profiles, addresses, sessions

## Run Locally
1. `cd backend`
2. `composer install`
3. Copy `.env.example` to `.env` and set your database credentials
4. `php artisan key:generate`
5. `php artisan migrate`
6. `php artisan serve`

## Notes
- Search indexing uses Meilisearch when enabled in `.env`.
- Queue, cache, and session drivers are configured via `.env`.
