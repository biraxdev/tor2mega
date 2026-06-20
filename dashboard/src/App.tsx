import { Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from "./api";
import Layout from "./components/Layout";
import { NotificationProvider } from "./components/NotificationProvider";
import Landing from "./pages/Landing";
import DownloadCenter from "./pages/DownloadCenter";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Downloads from "./pages/Downloads";
import Destinations from "./pages/Destinations";
import Queue from "./pages/Queue";
import Logs from "./pages/Logs";
import Settings from "./pages/Settings";
import AddUrl from "./pages/AddUrl";
import Videos from "./pages/Videos";
import Browser from "./pages/Browser";
import Team from "./pages/Team";
import Billing from "./pages/Billing";
import ApiKeys from "./pages/ApiKeys";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <NotificationProvider>
      <Routes>
      <Route path="/" element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/downloads" element={<DownloadCenter />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="add-url" element={<AddUrl />} />
        <Route path="videos" element={<Videos />} />
        <Route path="browser" element={<Browser />} />
        <Route path="downloads" element={<Downloads />} />
        <Route path="destinations" element={<Destinations />} />
        <Route path="queue" element={<Queue />} />
        <Route path="logs" element={<Logs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="team" element={<Team />} />
        <Route path="billing" element={<Billing />} />
        <Route path="api-keys" element={<ApiKeys />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NotificationProvider>
  );
}
