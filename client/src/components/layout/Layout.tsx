import { NavLink } from 'react-router-dom'
import { type ReactNode } from 'react'
import clsx from 'clsx'

const navItems = [
  { to: '/watcher',     label: 'Watcher'     },
  { to: '/library',     label: 'Library'     },
  { to: '/simulator',   label: 'Simulator'   },
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-slate-200">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight text-white">Finsight</span>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'px-3 py-1.5 rounded text-sm transition-colors',
                  isActive
                    ? 'bg-surface-2 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-2'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
