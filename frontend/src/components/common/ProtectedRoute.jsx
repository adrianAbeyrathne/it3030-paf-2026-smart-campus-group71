import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * A wrapper component to protect routes based on authentication and roles.
 * Usage: <ProtectedRoute roles={['ADMIN', 'TECHNICIAN']}> <MyPage /> </ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  // If we are still "loading" (e.g. checking token), we could show a spinner
  // But since we read from localStorage synchronously in AuthContext, we usually have the user immediately.

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if the user has at least one of them
  if (roles && roles.length > 0) {
    const userHasRequiredRole = roles.some(role => hasRole(role));

    if (!userHasRequiredRole) {
      // User is logged in but doesn't have the right role
      // Redirect them to the resources page (home)
      return <Navigate to="/resources" replace />;
    }
  }

  return children;
}
