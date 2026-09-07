# Kisan Direct

Government-style farm-to-consumer marketplace for India (Smart India Hackathon 2026, **PS SIH26033**).

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Auth: Firebase Phone Auth (SMS OTP)
- Database: Supabase (PostgreSQL)
- Payments: Razorpay UPI (test mode)
- Prices: Agmarknet via data.gov.in, with `mandi_prices` fallback

## Setup

1. Fill credentials:

   - `frontend/.env` — Firebase is already filled. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_RAZORPAY_KEY_ID`.
   - `backend/.env` — Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, Razorpay keys, and optional `DATA_GOV_API_KEY`.

2. Firebase console: enable **Phone** authentication and add `localhost` (and your host) under Authorized domains.

3. Install and run:

```bash
cd frontend && npm install
cd ../backend && npm install
cd .. && npm install
npm run dev
```

Frontend: http://localhost:5173  
API: http://localhost:5000/api/health

## First login

Enter a 10-digit Indian mobile number, complete reCAPTCHA, then enter the 6-digit SMS OTP. New users are sent to registration (Farmer / Buyer / FPO Agent).

To open Admin MIS, set that user's `role` to `admin` in the Supabase `users` table.
