import './style.css'
import { supabase, supabaseConfigured } from './supabaseClient'

document.querySelector('#app').innerHTML = `
  <main class="container">
    <h1>Supabase Login UI</h1>
    <p class="muted">Client reads <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> from env vars.</p>

    <button id="check-connection" type="button" ${supabaseConfigured ? '' : 'disabled'}>
      Check Supabase connection
    </button>

    <pre id="status">${supabaseConfigured ? 'Ready to test connection.' : 'Missing env vars. Add values to .env.local and restart the dev server.'}</pre>
  </main>
`

const statusEl = document.querySelector('#status')
const buttonEl = document.querySelector('#check-connection')

if (supabaseConfigured) {
  buttonEl.addEventListener('click', async () => {
    statusEl.textContent = 'Checking...'

    const { error } = await supabase.auth.getSession()

    statusEl.textContent = error
      ? `Connection failed: ${error.message}`
      : 'Connected to Supabase successfully.'
  })
}
