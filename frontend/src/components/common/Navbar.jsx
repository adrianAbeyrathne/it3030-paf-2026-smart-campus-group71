import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';

const navLinkClass = ({ isActive }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-white/20 text-white' : 'text-slate-100 hover:bg-white/10 hover:text-white'
  ].join(' ');

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6.7 8.2a5.3 5.3 0 0 1 10.6 0v3.1c0 .7.2 1.4.6 2l1 1.6H5.1l1-1.6a3.9 3.9 0 0 0 .6-2V8.2Z" />
      <path d="M9.4 16.8a2.6 2.6 0 0 0 5.2 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 4.5H5.8A1.8 1.8 0 0 0 4 6.3v11.4a1.8 1.8 0 0 0 1.8 1.8H9" />
      <path d="M14.5 16.5 20 12l-5.5-4.5" />
      <path d="M20 12H9" />
    </svg>
  );
}

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch {
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
  }, [location.pathname, user]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/20 bg-[#1E3A5F] shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-bold tracking-tight text-white">
            Smart Campus <span className="font-normal opacity-70 ml-1">SLIIT</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {isAdmin() && (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/users" className={navLinkClass}>
                  User Management
                </NavLink>
              </>
            )}
            <NavLink to="/resources" className={navLinkClass}>
              Resources
            </NavLink>
            <NavLink to="/bookings" className={navLinkClass}>
              Bookings
            </NavLink>
            <NavLink to="/notifications" className={navLinkClass}>
              Notifications
            </NavLink>
            <NavLink to="/tickets" className={navLinkClass}>
              Tickets
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-slate-100">
          <Link to="/notifications" className="relative rounded-full p-2 hover:bg-white/10" aria-label="Notifications">
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[#EF4444] px-1 text-center text-xs font-semibold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-white leading-none">{user?.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-blue-200 mt-1 font-bold">{user?.role}</p>
            </div>
            <img 
              src={user?.picture || `https://ui-avatars.com/api/?name=${user?.name}&background=1E3A5F&color=fff`} 
              className="h-8 w-8 rounded-full border border-white/20 shadow-sm"
              alt="Profile"
            />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full p-2 text-slate-100 transition hover:bg-white/10"
            aria-label="Logout"
          >
            <LogoutIcon />
          </button>
        </div>

        {/* Mobile Nav */}
        <nav className="flex w-full items-center gap-1 md:hidden overflow-x-auto pb-1 no-scrollbar">
          {isAdmin() && (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dash
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                Users
              </NavLink>
            </>
          )}
          <NavLink to="/resources" className={navLinkClass}>
            Resources
          </NavLink>
          <NavLink to="/bookings" className={navLinkClass}>
            Bookings
          </NavLink>
          <NavLink to="/notifications" className={navLinkClass}>
            Alerts
          </NavLink>
          <NavLink to="/tickets" className={navLinkClass}>
            Tickets
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
