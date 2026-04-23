import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ResourceDetailPage from './pages/ResourceDetailPage';
import ResourceFormPage from './pages/ResourceFormPage';
import ResourcesPage from './pages/ResourcesPage';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/resources" replace />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="resources/new" element={<ResourceFormPage />} />
        <Route path="resources/:id" element={<ResourceDetailPage />} />
        <Route path="resources/:id/edit" element={<ResourceFormPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/resources" replace />} />
    </Routes>
  );
}

export default App;
