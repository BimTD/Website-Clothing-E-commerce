import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { CartProvider } from '@/context/CartContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { AuthPage, Home, Shop, News, About, Contact, ProductDetail, ShoppingCart, Checkout, OrderSuccess, Orders, OrderDetail, AdminLayout, AdminDashboard, CategoryManagement, BrandManagement, SupplierManagement, ProductManagement, SizeManagement, ColorManagement, ProductVariantManagement, ImportManagement, InvoiceManagement } from '@/pages';
import Unauthorized from './components/Unauthorized';
import { ROUTES, ROLES } from '@/utils/constants';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <CartProvider>
          <AuthProvider>
            <Router>
          <Routes>
            {/* Public routes with header and footer */}
            <Route path={ROUTES.LOGIN} element={<AuthPage />} />
            <Route path={ROUTES.REGISTER} element={<AuthPage />} />
            <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
            
            {/* User routes with header and footer */}
            <Route 
              path={ROUTES.HOME} 
              element={
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </div>
              } 
            />
            <Route 
              path={ROUTES.SHOP} 
              element={
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <ProtectedRoute>
                      <Shop />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </div>
              } 
            />
            <Route 
              path={ROUTES.NEWS} 
              element={
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <ProtectedRoute>
                      <News />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </div>
              } 
            />
            <Route 
              path={ROUTES.ABOUT} 
              element={
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <ProtectedRoute>
                      <About />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </div>
              } 
            />
            <Route 
              path={ROUTES.CONTACT} 
              element={
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <ProtectedRoute>
                      <Contact />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </div>
              } 
            />
            <Route 
              path={`${ROUTES.PRODUCT_DETAIL}/:id`} 
              element={
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <ProtectedRoute>
                      <ProductDetail />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </div>
              } 
            />
            <Route 
              path={ROUTES.CART} 
              element={
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <ProtectedRoute>
                      <ShoppingCart />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </div>
              } 
            />
            <Route 
              path={ROUTES.CHECKOUT} 
              element={
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </div>
              } 
            />
            <Route 
              path={ROUTES.ORDER_SUCCESS} 
              element={
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <ProtectedRoute>
                      <OrderSuccess />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </div>
              } 
            />
            <Route 
              path={ROUTES.ORDERS} 
              element={
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </div>
              } 
            />
            <Route 
              path={`${ROUTES.ORDER_DETAIL}/:id`} 
              element={
                <div className="App">
                  <Header />
                  <main className="main-content">
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  </main>
                  <Footer />
                </div>
              } 
            />
            
            {/* Admin routes without header and footer */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole={ROLES.ADMIN}>
                  <AdminLayout />
                </ProtectedRoute>
              } 
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="brands" element={<BrandManagement />} />
              <Route path="suppliers" element={<SupplierManagement />} />
              <Route path="sizes" element={<SizeManagement />} />
              <Route path="colors" element={<ColorManagement />} />
              <Route path="variants" element={<ProductVariantManagement />} />
              <Route path="imports" element={<ImportManagement />} />
              <Route path="invoices" element={<InvoiceManagement />} />
            </Route>
            
            <Route path="/" element={<Navigate to={ROUTES.HOME} />} />
          </Routes>
        </Router>
          </AuthProvider>
        </CartProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;