import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { Home, User, Bell, Menu, Key, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/auth');
  };

  const navItems = [
    { name: 'Feed', path: '/feed', icon: Home },
    { name: 'Profile', path: '/profile', icon: User },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <NavLink to="/feed" className="flex items-center gap-2.5 shrink-0 group">
          <img
            src="./route-logo.png"
            alt="Route Logo"
            className="w-8 h-8 rounded-lg object-contain shadow-xs border border-blue-900/10 group-hover:scale-105 transition-transform"
          />
          <span className="font-bold text-lg text-slate-900 tracking-tight hidden sm:inline">
            Route Posts
          </span>
        </NavLink>

        <nav className="flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl p-1 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={`relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className="hidden md:inline">{item.name}</span>
                {item.badge ? (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 transition shadow-2xs text-slate-800"
          >
            <Avatar src={user?.photo} alt={user?.name || 'User'} size="sm" />
            <span className="text-sm font-semibold text-slate-700 hidden sm:inline max-w-[120px] truncate">
              {user?.name || 'User'}
            </span>
            <Menu className="w-4 h-4 text-slate-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">@{user?.username || 'user'}</p>
              </div>

              <NavLink
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition font-medium"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile
              </NavLink>

              <NavLink
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition font-medium"
              >
                <Key className="w-4 h-4 text-slate-400" />
                Change Password
              </NavLink>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition font-medium"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
