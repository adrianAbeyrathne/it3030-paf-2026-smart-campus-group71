import { NavLink } from 'react-router-dom';
import { BellIcon, GridIcon, MenuIcon } from './icons';

function Navbar({ unreadCount, mobileMenuOpen, setMobileMenuOpen }) {
  const navItemClass = ({ isActive }) =>
    `px-1 py-1 text-[14px] font-medium text-white transition ${isActive ? 'border-b-2 border-white' : 'border-b-2 border-transparent hover:border-white/70'}`;

  return (
    <nav className="bg-[#1E3A5F] text-white">
      <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <GridIcon className="h-6 w-6" />
          <span className="text-[20px] font-semibold">Smart Campus</span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/resources" className={navItemClass}>
            Resources
          </NavLink>
          <NavLink to="/notifications" className={navItemClass}>
            Notifications
          </NavLink>
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <NavLink to="/notifications" className="relative text-white/90 hover:text-white">
            <BellIcon className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
            )}
          </NavLink>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-[13px] font-semibold">
              DS
            </div>
            <div>
              <p className="text-[14px] font-semibold leading-4">Dr. Smith</p>
              <p className="text-[12px] text-white/75">Administrator</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 md:hidden"
        >
          <MenuIcon />
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/15 px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-4">
            <NavLink to="/resources" className={navItemClass} onClick={() => setMobileMenuOpen(false)}>
              Resources
            </NavLink>
            <NavLink to="/notifications" className={navItemClass} onClick={() => setMobileMenuOpen(false)}>
              Notifications
            </NavLink>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-white/10 p-3">
              <div>
                <p className="text-[14px] font-semibold">Dr. Smith</p>
                <p className="text-[12px] text-white/75">Administrator</p>
              </div>
              <div className="relative">
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
