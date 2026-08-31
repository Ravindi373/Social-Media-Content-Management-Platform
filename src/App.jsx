import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import Calendar from './pages/Calendar';
import Approvals from './pages/Approvals';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import Strategy from './pages/Strategy';
import Privacy from './pages/Privacy';
import Users from './pages/Users';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Everything below requires a logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<RoleRoute allow={['Administrator', 'Content Creator']} />}>
                <Route index element={<Calendar />} />
              </Route>
              <Route path="/posts/new" element={<RoleRoute allow={['Administrator', 'Content Creator']} />}>
                <Route index element={<CreatePost />} />
              </Route>
              <Route path="/approvals" element={<RoleRoute allow={['Administrator', 'Content Approver']} />}>
                <Route index element={<Approvals />} />
              </Route>
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/strategy" element={<Strategy />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/users" element={<RoleRoute allow={['Administrator']} />}>
                <Route index element={<Users />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
