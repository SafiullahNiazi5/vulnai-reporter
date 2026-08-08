import { NavLink } from 'react-router-dom';
import { Shield, Zap, Clock, Info } from 'lucide-react';

const NAV = [
  { to: '/', icon: Zap, label: 'Generate' },
  { to: '/history', icon: Clock, label: 'History' },
  { to: '/about', icon: Info, label: 'About' },
];

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">VulnAI</p>
              <p className="text-xs text-gray-500">Reporter</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-red-600 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}>
              <Icon size={16} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">Powered by Claude</p>
          <p className="text-xs text-gray-700 mt-0.5">AWS Lambda + Vercel</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
