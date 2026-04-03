import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Shop from "./pages/Shop";
import UploadPrescription from "./pages/UploadPrescription";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import AccountLayout from "./pages/account/AccountLayout";
import AccountDashboard from "./pages/account/AccountDashboard";
import AccountOrders from "./pages/account/AccountOrders";
import AccountPrescriptions from "./pages/account/AccountPrescriptions";
import AccountAddresses from "./pages/account/AccountAddresses";
import AccountProfile from "./pages/account/AccountProfile";

import PharmacistLayout from "./pages/pharmacist/PharmacistLayout";
import { PharmacistQueue, PharmacistReviewed, PharmacistProfile } from "./pages/pharmacist/PharmacistPages";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import {
  AdminProducts, AdminCategories, AdminOrders, AdminPrescriptions,
  AdminCustomers, AdminInventory, AdminContent, AdminFAQ,
  AdminHomepage, AdminSettings, AdminUsers, AdminReports,
} from "./pages/admin/AdminPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/upload-prescription" element={<UploadPrescription />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer portal */}
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<AccountDashboard />} />
            <Route path="orders" element={<AccountOrders />} />
            <Route path="prescriptions" element={<AccountPrescriptions />} />
            <Route path="addresses" element={<AccountAddresses />} />
            <Route path="profile" element={<AccountProfile />} />
          </Route>

          {/* Pharmacist console */}
          <Route path="/pharmacist" element={<PharmacistLayout />}>
            <Route index element={<PharmacistQueue />} />
            <Route path="reviewed" element={<PharmacistReviewed />} />
            <Route path="profile" element={<PharmacistProfile />} />
          </Route>

          {/* Admin dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="prescriptions" element={<AdminPrescriptions />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="faq" element={<AdminFAQ />} />
            <Route path="homepage" element={<AdminHomepage />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
