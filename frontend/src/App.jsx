import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { ToastProvider } from './components/common/Toast';

// Pages
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Alerts from './pages/Alerts';
import AlertDetail from './pages/AlertDetail';
import FaceDatabase from './pages/FaceDatabase';
import FootageDatabase from './pages/FootageDatabase';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import NotFound from './pages/NotFound';

// Styles
import './styles/variables.css';
import './styles/globals.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Primary pages */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/alerts/:alertId" element={<AlertDetail />} />
            <Route path="/faces" element={<FaceDatabase />} />
            <Route path="/footage" element={<FootageDatabase />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logs" element={<Logs />} />

            {/* Sub-pages (stubs that display within layout) */}
            <Route path="/faces/:faceId" element={<FaceDatabase />} />
            <Route path="/footage/:footageId" element={<FootageDatabase />} />
            <Route path="/reports/new" element={<Reports />} />
            <Route path="/reports/:reportId" element={<Reports />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </ToastProvider>
  );
}

export default App;
