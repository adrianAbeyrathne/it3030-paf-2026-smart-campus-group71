import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ResourceListPage from './pages/resources/ResourceListPage';
import ResourceDetailPage from './pages/resources/ResourceDetailPage';
import ResourceFormPage from './pages/resources/ResourceFormPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import { AuthProvider } from './context/AuthContext';

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/resources" element={<ResourceListPage />} />
          <Route path="/resources/new" element={<ResourceFormPage />} />
          <Route path="/resources/:id" element={<ResourceDetailPage />} />
          <Route path="/resources/:id/edit" element={<ResourceFormPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
