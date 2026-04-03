import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import CartDrawer from "@/components/cart/CartDrawer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useLiveSync } from "@/hooks/use-live-sync";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import UploadPrescription from "./pages/UploadPrescription";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

import AccountLayout from "./pages/account/AccountLayout";
import AccountDashboard from "./pages/account/AccountDashboard";
import AccountOrders from "./pages/account/AccountOrders";
import AccountPrescriptions from "./pages/account/AccountPrescriptions";
import AccountAddresses from "./pages/account/AccountAddresses";
import AccountProfile from "./pages/account/AccountProfile";

import PharmacistLayout from "./pages/pharmacist/PharmacistLayout";
import { PharmacistQueue, PharmacistReviewed, PharmacistNotes, PharmacistProfile } from "./pages/pharmacist/PharmacistPages";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { AdminProducts } from "./pages/admin/AdminProductsPage";
import {
  AdminCategories, AdminOrders, AdminPrescriptions,
  AdminCustomers, AdminInventory, AdminContent, AdminFAQ,
  AdminHomepage, AdminSettings, AdminUsers, AdminReports,
} from "./pages/admin/AdminPages";

const queryClient = new QueryClient();

function LiveSyncBridge() {
  useLiveSync();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <CartProvider>
          <LiveSyncBridge />
          <Toaster />
          <Sonner />
          <CartDrawer />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/upload-prescription" element={<UploadPrescription />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/checkout" element={<Checkout />} />

              <Route element={<ProtectedRoute roles={["customer", "admin", "pharmacist"]} />}>
                <Route path="/account" element={<AccountLayout />}>
                  <Route index element={<AccountDashboard />} />
                  <Route path="orders" element={<AccountOrders />} />
                  <Route path="prescriptions" element={<AccountPrescriptions />} />
                  <Route path="addresses" element={<AccountAddresses />} />
                  <Route path="profile" element={<AccountProfile />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={["pharmacist", "admin", "super_admin"]} />}>
                <Route path="/pharmacist" element={<PharmacistLayout />}>
                  <Route index element={<PharmacistQueue />} />
                  <Route path="reviewed" element={<PharmacistReviewed />} />
                  <Route path="notes" element={<PharmacistNotes />} />
                  <Route path="profile" element={<PharmacistProfile />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute roles={["super_admin", "admin", "manager", "editor", "support_staff", "finance_manager", "content_manager"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<ProtectedRoute permissions={["dashboard.view"]} redirectTo="/"><AdminDashboard /></ProtectedRoute>} />
                  <Route path="products" element={<ProtectedRoute permissions={["products.view"]} redirectTo="/admin"><AdminProducts /></ProtectedRoute>} />
                  <Route path="categories" element={<ProtectedRoute permissions={["categories.view"]} redirectTo="/admin"><AdminCategories /></ProtectedRoute>} />
                  <Route path="orders" element={<ProtectedRoute permissions={["orders.view"]} redirectTo="/admin"><AdminOrders /></ProtectedRoute>} />
                  <Route path="prescriptions" element={<ProtectedRoute permissions={["prescriptions.view"]} redirectTo="/admin"><AdminPrescriptions /></ProtectedRoute>} />
                  <Route path="customers" element={<ProtectedRoute permissions={["customers.view"]} redirectTo="/admin"><AdminCustomers /></ProtectedRoute>} />
                  <Route path="inventory" element={<ProtectedRoute permissions={["inventory.view"]} redirectTo="/admin"><AdminInventory /></ProtectedRoute>} />
                  <Route path="content" element={<ProtectedRoute permissions={["content.view"]} redirectTo="/admin"><AdminContent /></ProtectedRoute>} />
                  <Route path="faq" element={<ProtectedRoute permissions={["content.view"]} redirectTo="/admin"><AdminFAQ /></ProtectedRoute>} />
                  <Route path="homepage" element={<ProtectedRoute permissions={["content.view"]} redirectTo="/admin"><AdminHomepage /></ProtectedRoute>} />
                  <Route path="settings" element={<ProtectedRoute permissions={["content.view"]} redirectTo="/admin"><AdminSettings /></ProtectedRoute>} />
                  <Route path="users" element={<ProtectedRoute permissions={["users.view"]} redirectTo="/admin"><AdminUsers /></ProtectedRoute>} />
                  <Route path="reports" element={<ProtectedRoute permissions={["reports.view"]} redirectTo="/admin"><AdminReports /></ProtectedRoute>} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
