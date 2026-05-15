import {
  TbChevronDown,
  TbLogout2,
  TbMoonStars,
  TbShield,
  TbSun,
  TbUserCircle,
} from 'react-icons/tb'
import type { UserProfile } from '../services/authService'

type NavbarProps = {
  profile: UserProfile | null
  onLogout: () => Promise<void>
  theme: 'light' | 'dark'
  onThemeToggle: () => void
}

export function Navbar({ profile, onLogout, theme, onThemeToggle }: NavbarProps) {
  return (
    <header className="mb-6 flex w-full items-center justify-between border-2 border-brand-gold bg-brand-brown px-4 py-3 text-brand-ivory dark:bg-brand-ivory dark:text-brand-brown">
      <div className="flex items-center gap-2 text-lg font-semibold tracking-wide">
        <TbShield aria-hidden="true" />
        <span className="font-title">1442SPACE ID</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Toggle light and dark mode"
          onClick={onThemeToggle}
          className="premium-button !px-3 !py-2"
        >
          {theme === 'light' ? <TbMoonStars aria-hidden="true" /> : <TbSun aria-hidden="true" />}
        </button>

        <details className="relative">
          <summary className="premium-button list-none !px-3 !py-2" aria-label="Open profile details">
            <TbUserCircle aria-hidden="true" />
            <span className="hidden md:inline">Profile</span>
            <TbChevronDown aria-hidden="true" />
          </summary>
          <div className="absolute right-0 z-20 mt-2 min-w-56 border-2 border-brand-gold bg-brand-ivory p-3 text-sm text-brand-brown dark:bg-brand-brown dark:text-brand-ivory">
            <p className="flex items-center gap-2"><TbUserCircle aria-hidden="true" />{profile?.name ?? 'Guest'}</p>
            <p className="mt-1 uppercase tracking-wide">Region: {profile?.region ?? 'N/A'}</p>
            <p className="uppercase tracking-wide">Gender: {profile?.gender ?? 'N/A'}</p>
          </div>
        </details>

        <button type="button" onClick={onLogout} className="premium-button !px-3 !py-2" aria-label="Logout user">
          <TbLogout2 aria-hidden="true" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
