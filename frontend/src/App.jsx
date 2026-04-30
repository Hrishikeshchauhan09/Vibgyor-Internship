import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import AdminProducts from './pages/AdminProducts';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import Checkout from './pages/Checkout';
import LeaveRequests from './pages/LeaveRequests';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManageEmployees from './pages/ManageEmployees';
import ManageCustomers from './pages/ManageCustomers';
import ManagePayments from './pages/ManagePayments';
import ManageCarts from './pages/ManageCarts';
import ManageShipping from './pages/ManageShipping';

// Protected Route wrapper
const ProtectedRoute = ({ children, adminOnly = false, employeeOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/products" replace />;
  if (employeeOnly && user.role !== 'employee') return <Navigate to="/products" replace />;
  return children;
};

const IndexRoute = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/dashboard" replace />;
  if (user?.role === 'employee') return <Navigate to="/employee-dashboard" replace />;
  return <Navigate to="/products" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<IndexRoute />} />
        <Route path="dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="employee-dashboard" element={<ProtectedRoute employeeOnly><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="admin/staff" element={<ProtectedRoute adminOnly><ManageEmployees /></ProtectedRoute>} />
        <Route path="admin/customers" element={<ProtectedRoute adminOnly><ManageCustomers /></ProtectedRoute>} />
        <Route path="admin/payments" element={<ProtectedRoute adminOnly><ManagePayments /></ProtectedRoute>} />
        <Route path="admin/carts" element={<ProtectedRoute adminOnly><ManageCarts /></ProtectedRoute>} />
        <Route path="admin/shipping" element={<ProtectedRoute adminOnly><ManageShipping /></ProtectedRoute>} />
        <Route path="categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
        <Route path="admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="orders" element={<Orders />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="leaves" element={<LeaveRequests />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
