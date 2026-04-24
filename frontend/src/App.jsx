import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import DashboardPage from './pages/DashboardPage';
import ResourceListPage from './pages/resources/ResourceListPage';
import ResourceDetailPage from './pages/resources/ResourceDetailPage';
import ResourceFormPage from './pages/resources/ResourceFormPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function AdminRoute({ children }) {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return <Navigate to="/resources" replace />;
  }

  return children;
}

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
          <Route path="/" element={<Navigate to="/resources" replace />} />
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <DashboardPage />
              </AdminRoute>
            }
          />
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
