import { useEffect, useState } from 'react'
import { TbLogin2, TbUserPlus } from 'react-icons/tb'
import { Navbar } from './components/Navbar'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { clearStoredJwt, logout, readStoredJwt, type UserProfile } from './services/authService'

type ViewMode = 'login' | 'signup'
type ThemeMode = 'light' | 'dark'

function getPreferredTheme(): ThemeMode {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('login')
  const [themeMode, setThemeMode] = useState<ThemeMode>(getPreferredTheme)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [infoMessage, setInfoMessage] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark')
  }, [themeMode])

  useEffect(() => {
    const jwt = readStoredJwt()
    if (!jwt) {
      clearStoredJwt()
    }
  }, [])

  return (
    <main className="min-h-screen bg-indic-light px-4 py-5 dark:bg-indic-dark md:px-8">
      <div className="mx-auto max-w-5xl">
        <Navbar
          profile={profile}
          theme={themeMode}
          onThemeToggle={() => setThemeMode((current) => (current === 'light' ? 'dark' : 'light'))}
          onLogout={async () => {
            try {
              await logout()
              setProfile(null)
              setInfoMessage('Logged out and session cleared.')
            } catch (error) {
              setInfoMessage((error as Error).message)
            }
          }}
        />

        <section className="mb-4 flex items-center justify-center gap-3">
          <button
            type="button"
            className={`premium-button ${viewMode === 'login' ? '!bg-brand-gold !text-brand-brown' : ''}`}
            onClick={() => setViewMode('login')}
            aria-label="Open login page"
          >
            <TbLogin2 aria-hidden="true" /> Login
          </button>
          <button
            type="button"
            className={`premium-button ${viewMode === 'signup' ? '!bg-brand-gold !text-brand-brown' : ''}`}
            onClick={() => setViewMode('signup')}
            aria-label="Open signup page"
          >
            <TbUserPlus aria-hidden="true" /> Signup
          </button>
        </section>

        {viewMode === 'login' ? (
          <LoginPage
            onLoginSuccess={(nextProfile) => {
              setProfile(nextProfile)
              setInfoMessage('Authenticated successfully.')
            }}
          />
        ) : (
          <SignupPage onSuccess={setInfoMessage} />
        )}

        <p className="mt-4 text-center text-sm uppercase tracking-wide">{infoMessage}</p>
      </div>
    </main>
  )
}

export default App
