# Homefy CRM

A web-based CRM for **Homefy** furniture business — built with Next.js and Supabase.

## Features

- **Role-based auth** — Admin and Sales Agent login
- **Leads Kanban** — Drag-and-drop board (New → Qualified → Pending → Converted) with agent assignment
- **Order management** — Product line items, discount, advance payment, auto-calculated balance
- **Logistics** — Transport cost split (Company vs Customer share), vehicle number tracking
- **WhatsApp reminders** — Auto-scheduled 10-day and 5-day delivery reminders
- **Dashboard** — Total sales, leads per agent, pending payments, sales trend

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) (Auth, Postgres, Edge Functions, pg_cron)
- [Tailwind CSS 4](https://tailwindcss.com)
- [@dnd-kit](https://dndkit.com) for Kanban drag-and-drop
- [Recharts](https://recharts.org) for dashboard charts

## Getting Started

### 1. Clone & install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

3. Run the database migration in the Supabase SQL Editor:

```
supabase/migrations/001_initial_schema.sql
```

4. (Optional) Enable pg_cron and run `002_cron_reminders.sql` for automated reminders

### 3. Create users

Create users in Supabase Auth dashboard. Set role in user metadata when signing up:

```json
{ "full_name": "Admin User", "role": "admin" }
```

Or update role directly in the `profiles` table after signup.

**Roles:** `admin` | `sales_agent`

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy Edge Function (WhatsApp reminders)

```bash
supabase functions deploy send-delivery-reminders
```

Configure Twilio env vars in Supabase for live WhatsApp delivery:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`

Without Twilio, reminders are logged to the function console in dev mode.

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/     # Protected CRM pages
│   │   ├── page.tsx     # Dashboard
│   │   ├── leads/       # Kanban board
│   │   └── orders/      # Order list & detail
│   └── login/           # Auth page
├── components/
│   ├── dashboard/
│   ├── leads/
│   ├── orders/
│   └── ui/
└── lib/
    ├── supabase/        # Client, server, middleware
    └── types/           # TypeScript types
supabase/
├── migrations/          # Database schema
└── functions/           # Edge functions
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User roles (admin / sales_agent) |
| `leads` | Customer leads with Kanban status |
| `orders` | Orders with products, discount, payments |
| `logistics` | Transport cost split & vehicle tracking |
| `delivery_reminders` | Scheduled WhatsApp reminders |

## License

Private — Homefy internal use.
