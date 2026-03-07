import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ProtectedRoute, AdminRoute } from './components/common/ProtectedRoute';
import { PageLoader } from './components/common/Loader';
import ClientLayout from './components/layout/ClientLayout';
import AdminLayout from './components/layout/AdminLayout';

// Client pages - lazy loaded
const Home = lazy(() => import('./pages/client/Home'));
const Categories = lazy(() => import('./pages/client/Categories'));
const Products = lazy(() => import('./pages/client/Products'));
const ProductDetail = lazy(() => import('./pages/client/ProductDetail'));
const Cart = lazy(() => import('./pages/client/Cart'));
const Login = lazy(() => import('./pages/client/Login'));
const Signup = lazy(() => import('./pages/client/Signup'));
const MyOrders = lazy(() => import('./pages/client/MyOrders'));
const AboutUs = lazy(() => import('./pages/client/AboutUs'));

// Admin pages - lazy loaded
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const HeroManager = lazy(() => import('./pages/admin/HeroManager'));
const CategoryManager = lazy(() => import('./pages/admin/CategoryManager'));
const ProductManager = lazy(() => import('./pages/admin/ProductManager'));
const OrderManager = lazy(() => import('./pages/admin/OrderManager'));
const QuotationManager = lazy(() => import('./pages/admin/QuotationManager'));
const CreateQuotation = lazy(() => import('./pages/admin/CreateQuotation'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#1f2937',
                color: '#fff',
                fontSize: '14px',
              },
            }}
          />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Client Routes */}
              <Route element={<ClientLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/about" element={<AboutUs />} />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="hero" element={<HeroManager />} />
                <Route path="categories" element={<CategoryManager />} />
                <Route path="products" element={<ProductManager />} />
                <Route path="orders" element={<OrderManager />} />
                <Route path="quotations" element={<QuotationManager />} />
                <Route path="quotations/create/:orderId" element={<CreateQuotation />} />
              </Route>
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
