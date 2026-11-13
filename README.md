# StockNest: Smart Inventory and Sales Management (Client)

StockNest is a glass-style inventory and sales web app for **NestMart**, a multi-category retail chain. It lets a team manage products, purchase from suppliers, sell at the counter, and watch business numbers on a live dashboard.

**Live site:** https://stock-nestmart.vercel.app
**Live API:** https://stocknest-server.vercel.app
**API repository:** https://github.com/arafsarkar13/stocknest-server

> Course project for CSE 3391 Web Engineering (Fall 2026, Section D), BCSE program.
> Built by Md Araf Islam Sarkar.

## Demo accounts

| Role    | Email                | Password    |
| ------- | -------------------- | ----------- |
| Admin   | admin@nestmart.com   | Admin@123   |
| Manager | manager@nestmart.com | Manager@123 |
| Staff   | staff@nestmart.com   | Staff@123   |

## Key features

- **Secure login with roles:** JWT authentication with Admin, Manager and Staff access. Logged-in users stay logged in when they reload a private page.
- **Product catalog:** add, edit and delete products with search, category filter, low-stock filter and pagination, plus image upload.
- **Live DummyJSON import:** browse the real `dummyjson.com/products` API and import products into your own inventory in one click, with duplicate protection.
- **Purchase orders (master-detail):** create an order with many product lines, then receive it to add stock automatically.
- **Sales counter (master-detail):** build a cart, apply a discount and complete the sale. Stock is deducted instantly, and overselling is blocked.
- **PDF invoices:** download a printable invoice for every sale.
- **Analytics dashboard:** revenue, profit, best sellers, revenue by category, a 14-day revenue chart and a restocking list.
- **Excel export:** download the product list and the sales list as `.xlsx` files.
- **Stock history:** every stock-in and stock-out is recorded with its reference number.
- **Glassmorphism design:** animated starry background, frosted glass cards, smooth animations, fully responsive on phones, tablets and desktops.

## Tech stack

- Next.js (App Router) with JavaScript
- Hero UI, Tailwind CSS, Framer Motion, Lucide icons
- Recharts for charts, Axios for API calls, React Toastify for notifications
- Backend: Node.js, Express, MongoDB Atlas (see the API repository)

## Pages and access

| Page                           | Admin     | Manager   | Staff               |
| ------------------------------ | --------- | --------- | ------------------- |
| Dashboard (full analytics)     | Yes       | Yes       | Simple welcome view |
| Products                       | Full      | Full      | View only           |
| Categories, Suppliers          | Yes       | Yes       | No                  |
| Purchase Orders, Stock History | Yes       | Yes       | No                  |
| Import Products (DummyJSON)    | Yes       | Yes       | No                  |
| Sales                          | All sales | All sales | Own sales only      |

## How login persistence works

The JWT is saved in the browser. On every page load, the app asks `GET /api/auth/me` to restore the session. Private pages show a loading spinner until that check finishes, so a refresh never logs the user out or flashes the login page.

## Run it locally

```bash
git clone https://github.com/arafsarkar13/stocknest-client.git
cd stocknest-client
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the API from the server repository first, then:

```bash
npm run dev
```

Open http://localhost:3000.

## Project structure

```
src/
├── app/
│   ├── (auth)/         login and register
│   ├── (app)/          private pages: dashboard, products, sales, purchase orders...
│   ├── page.js         landing page
│   └── not-found.js    404 page
├── components/         shared UI (app shell, protected route, forms)
├── context/            auth context (session restore)
└── lib/                API helper, formatting, download helper
```

## Deployment

Deployed on Vercel. Set the environment variable `NEXT_PUBLIC_API_URL` to the live API URL and redeploy after any change.
