import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages (Khusus Admin)
import Login from './pages/auth/Login';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import VehicleManagement from './pages/admin/VehicleManagement';
import InspectionList from './pages/admin/InspectionList';
import InspectionDetail from './pages/admin/InspectionDetail';
import FormTypeManagement from './pages/admin/FormTypeManagement';
import FormManagement from './pages/admin/FormManagement';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import RepairTracking from './pages/admin/RepairTracking';

// Admin Master Data Pages
import VehicleModels from './pages/admin/master-data/VehicleModels';
import Departments from './pages/admin/master-data/Departments';
import WorkLocations from './pages/admin/master-data/WorkLocations';
import AssetStatuses from './pages/admin/master-data/AssetStatuses';

// Operator Pages (PUBLIC — Tanpa Login, Akses via Link)
import OperatorLayout from './pages/operator/OperatorLayout';
import SelectForm from './pages/operator/SelectForm';
import FillForm from './pages/operator/FillForm';
import SubmissionSuccess from './pages/operator/SubmissionSuccess';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ============================================================= */}
          {/* OPERATOR Routes — PUBLIC (Tanpa Login, Akses via Link/QR)     */}
          {/* URL Utama: /operator atau /                                  */}
          {/* Operator langsung isi form tanpa perlu register/login        */}
          {/* ============================================================= */}
          <Route path="/" element={<OperatorLayout />}>
            <Route index element={<SelectForm />} />
            <Route path="fill-form/:formType" element={<FillForm />} />
            <Route path="success" element={<SubmissionSuccess />} />
          </Route>

          {/* Alias route untuk /operator (redirect ke /) */}
          <Route path="/operator" element={<Navigate to="/" replace />} />
          <Route path="/operator/*" element={<Navigate to="/" replace />} />

          {/* ============================================================= */}
          {/* ADMIN & AUTH Routes                                          */}
          {/* ============================================================= */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Login />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="inspections" element={<InspectionList />} />
            <Route path="inspections/:id" element={<InspectionDetail />} />
            <Route path="repair-tracking" element={<RepairTracking />} />
            <Route path="vehicles" element={<VehicleManagement />} />
            <Route path="form-types" element={<FormTypeManagement />} />
            <Route path="forms" element={<FormManagement />} />
            <Route path="forms/:typeKey" element={<FormManagement />} />
            
            {/* Master Data Routes */}
            <Route path="master-data/vehicle-models" element={<VehicleModels />} />
            <Route path="master-data/departments" element={<Departments />} />
            <Route path="master-data/work-locations" element={<WorkLocations />} />
            <Route path="master-data/asset-statuses" element={<AssetStatuses />} />
            
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback untuk route tidak dikenal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
