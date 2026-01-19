import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  PlayCircle, 
  History, 
  Users, 
  BarChart3, 
  Settings,
  Swords
} from 'lucide-react';

function Layout() {
  const location = useLocation();
  
  // Hide nav when in active recording
  const isRecording = location.pathname.includes('/record/individual') || 
                      location.pathname.includes('/record/team');

  const navItems = [
    { to: '/record', icon: PlayCircle, label: 'Record' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/players', icon: Users, label: 'Players' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-kendo-navy flex flex-col">
      {/* Header */}
      {!isRecording && (
        <header className="bg-kendo-navy-light border-b border-kendo-gray/20 px-4 py-3 pt-safe">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <Swords className="w-8 h-8 text-kendo-red" />
            <div>
              <h1 className="font-display text-2xl text-kendo-cream tracking-wide">
                TCWStats
              </h1>
              <p className="text-xs text-kendo-cream/50">Team Canada Women's Kendo</p>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      {!isRecording && (
        <nav className="bg-kendo-navy-light border-t border-kendo-gray/20 pb-safe">
          <div className="max-w-6xl mx-auto flex justify-around">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

export default Layout;
