# loginUI

Login Auth UI for 1442space.

## Setup

1. Install dependencies:
   - `npm install`
2. Create a local env file:
   - `cp .env.example .env.local`
3. Start the app:
   - `npm run dev`

The app uses these environment variables to initialize Supabase:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Click **Check Supabase connection** in the UI to verify the client can reach Supabase.
