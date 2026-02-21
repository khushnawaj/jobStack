import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AITools from './pages/AITools';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Tracker from './components/Tracker';
import JobSearch from './components/JobSearch';
import Checklist from './components/Checklist';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/search" element={<JobSearch />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/ai" element={<AITools />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
