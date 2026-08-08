import { NavLink } from 'react-router-dom';
import { Shield, FileText, Clock, Info, Zap } from 'lucide-react';

const NAV = [
  { to: '/', icon: Zap, label: 'Generate' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/about', icon: Info, label: 'About' },
];

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-bg-card border-r border-bg-border flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-bg-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center shrink-0">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">VulnAI</p>
              <p className="text-xs text-gray-500 mt-0.5">Reporter</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-accent-red text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-bg-elevated'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-bg-border">
          <p className="text-xs text-gray-600">Powered by Claude claude-sonnet-4-6</p>
          <p className="text-xs text-gray-700 mt-0.5">AWS Lambda + API Gateway</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
