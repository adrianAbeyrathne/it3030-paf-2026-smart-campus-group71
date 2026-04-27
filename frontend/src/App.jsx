import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import DashboardPage from './pages/DashboardPage';
import ResourceListPage from './pages/resources/ResourceListPage';
import ResourceDetailPage from './pages/resources/ResourceDetailPage';
import ResourceFormPage from './pages/resources/ResourceFormPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import BookingManagementPage from './pages/bookings/BookingManagementPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import RaiseTicketPage from './pages/tickets/RaiseTicketPage';
import TicketListPage from './pages/tickets/TicketListPage';
import TicketDetailPage from './pages/tickets/TicketDetailPage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <Navbar />
      <main className="flex-grow mx-auto w-full max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/resources" replace />} />
          
          {/* Admin Only */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Shared / User Routes */}
          <Route path="/resources" element={<ResourceListPage />} />
          <Route path="/resources/:id" element={<ResourceDetailPage />} />
          
          {/* Admin/Technician can manage resources */}
          <Route 
            path="/resources/new" 
            element={
              <ProtectedRoute roles={['ADMIN', 'TECHNICIAN']}>
                <ResourceFormPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/resources/:id/edit" 
            element={
              <ProtectedRoute roles={['ADMIN', 'TECHNICIAN']}>
                <ResourceFormPage />
              </ProtectedRoute>
            } 
          />

          <Route path="/bookings" element={<BookingManagementPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Module C - Tickets */}
          <Route path="/tickets" element={<TicketListPage />} />
          <Route path="/tickets/raise" element={<RaiseTicketPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
