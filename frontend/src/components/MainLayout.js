import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { getUnreadCount } from '../api/notificationApi';

function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <Navbar
        unreadCount={unreadCount}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        <Outlet context={{ refreshUnreadCount, setMobileMenuOpen }} />
      </main>
    </div>
  );
}

export default MainLayout;
