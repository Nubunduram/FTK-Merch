import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CategoryPage from './pages/catalog/CategoryPage'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Cart from './pages/cart/Cart'
import Header from './components/Header'
import Footer from './components/Footer'
import Success from './pages/cart/Success'
import Cancel from './pages/cart/Cancel'
import ProductPage from './pages/catalog/ProductPage'
import Order from './pages/orders/Order'
import OrdersHistory from './pages/orders/OrdersHistory'
import Profile from './pages/profile/Profile'
import MentionsLegales from './pages/legal/MentionsLegales'
import Confidentialite from './pages/legal/Confidentialite'
import CGV from './pages/legal/CGV'
import ProductsAdmin from './pages/Admin/ProductsAdmin'
import OrdersAdmin from './pages/Admin/OrdersAdmin'
import AdminLayout from './pages/Admin/AdminLayout'
import AdminRoute from './components/AdminRoute'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ConfirmProvider } from './context/ConfirmContext'
import { CategoriesProvider } from './context/CategoriesContext'
import { getMe } from './api/auth'
import { useState, useEffect } from 'react'
import AdminDashboard from './pages/Admin/AdminDashboard'
import CategoriesAdmin from './pages/Admin/CategoriesAdmin'


function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const me = await getMe();
        setUser(me);
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, []);

  return (
    <AuthProvider>
      <CategoriesProvider>
      <ToastProvider>
      <ConfirmProvider>
      <BrowserRouter>
        <Header />
        <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/success" element={<Success />} />
          <Route path="/cancel" element={<Cancel />} />
          <Route path="/category/:categoryName/product/:productId" element={<ProductPage />} />
          <Route path="/order/:id" element={<Order />} />
          <Route path="/orders" element={<OrdersHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
          </Route>

        </Routes>
        </main>
        <Footer />
      </BrowserRouter>
      </ConfirmProvider>
      </ToastProvider>
      </CategoriesProvider>
    </AuthProvider>
  )
}

export default App
