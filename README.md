# Copper & Crown — Electrical Services Website

A premium, responsive website for Copper & Crown, an electrical supplies and services business.

## Features

- **Home page** with a premium hero, glowing electrical visual, and call-to-action buttons
- **About section** presenting the business professionally
- **Services section** with 8 service cards, each with a working "Request Service" button
- **Service request form** with full validation, unique request IDs, and WhatsApp pre-fill
- **Get a Quote** form with confirmation and reference ID
- **Customer account** (demo) using browser storage — view requests, statuses, and profile
- **Request tracking** by entering a request ID to see status and details
- **Contact section** with phone, WhatsApp, email buttons and a working contact form
- **WhatsApp integration** throughout — pre-filled messages for inquiries, service requests, and quotes
- **Admin dashboard** at `/admin.html` — view, search, filter, update status, delete, copy phone, and open WhatsApp for service requests, quote requests, and messages
- **Responsive design** — works on desktop, tablet, and mobile
- **Social media placeholders** — configured in `src/App.tsx` (SOCIAL_LINKS object) for Instagram, Facebook, and other links

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling
- **lucide-react** for icons
- Browser **localStorage** for demo data (service requests, quotes, messages, customer profile)

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` for the website and `http://localhost:5173/admin.html` for the admin dashboard.

## Building for GitHub Pages

```bash
npm run build
```

The build outputs to `dist/` with relative paths (`base: './'`) so it works directly on GitHub Pages. Upload the contents of `dist/` to your repository.

## Admin Dashboard

Open `admin.html` to access the demo admin dashboard. It shows:
- Service requests (search, filter by status, view details, change status, delete, open WhatsApp)
- Quote requests (search, view details, delete, open WhatsApp)
- Customer messages (search, delete)

## Configuration

### WhatsApp Number
Update `WHATSAPP_NUMBER` in both `src/App.tsx` and `src/AdminApp.tsx` to change the WhatsApp number.

### Social Media Links
Update `SOCIAL_LINKS` in `src/App.tsx`:
```typescript
const SOCIAL_LINKS = {
  instagram: '',  // e.g. 'https://instagram.com/coppercrown'
  facebook: '',   // e.g. 'https://facebook.com/coppercrown'
  other: ''       // any other social link
};
```

### Contact Details
Update in `src/App.tsx`:
- Phone: `0329-4942684`
- WhatsApp: `+92 329 4942684`
- Email: `coppercrown.pk@gmail.com`

## Production Backend

This is a **demo frontend** using browser localStorage. For production, the following require a secure backend:
- Real customer accounts with authentication
- Shared customer data across devices
- Secure admin authentication
- Real database for requests, quotes, and messages
- Real payment processing
- WhatsApp Business API integration

The code is structured so a backend (Supabase, Firebase, or custom Node.js) can be connected without redesigning the frontend.

## License

All rights reserved. © Copper & Crown.
