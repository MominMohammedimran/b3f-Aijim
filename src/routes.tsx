import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import useSEO from "@/hooks/useSEO";

import NewSEOHelmet from "@/components/seo/NewSEOHelmet";

// ---------------------------
// 🔥 Main App Routes
// ---------------------------
import Home from "./pages/Home";
import Search from "./pages/Search";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import PaymentRetry from "./pages/PaymentRetry";
import OrderDetailsPreview from "./components/orders/OrderDetailsPreview";
import Products from "./pages/Products";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProductsPage from "./pages/ProductsPage";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/legal/AboutUs";
import PaymentRelatedIssue from "./components/payment/PaymentRelatedIssue";
import ContactUs from "./pages/legal/ContactUs";
import OrderComplete from "./pages/OrderComplete";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import Account from "./pages/Account";
import TrackOrder from "./pages/TrackOrder";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Wishlist from "./pages/Wishlist";
import ThankYou from "./pages/ThankYou";
import TrackPackage from "./pages/TrackPackage";
import OrderRelatedIssue from "./components/orders/OrderRelatedIssue";
import Feedback from "./pages/legal/Feedback";
import Customization from "./pages/Designtool";

// Legal Pages
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsConditions from "./pages/legal/TermsConditions";
import ShippingDelivery from "./pages/legal/ShippingDelivery";
import CancellationRefund from "./pages/legal/CancellationRefund";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminArticles from "./pages/admin/AdminArticles";
import AdminArticleEdit from "./pages/admin/AdminArticleEdit";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminOrderView from "./pages/admin/AdminOrderView";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserOrderHistory from "./pages/admin/AdminUserOrderHistory";
import AdminProfiles from "./pages/admin/AdminProfiles";
import AdminNotFound from "./pages/admin/AdminNotFound";
import AdminWebsiteUsers from "./pages/admin/AdminWebsiteUsers";
import AdminOrderManager from "./components/admin/AdminOrderManager";
import AdminAuthGuard from "./components/admin/AdminAuthGuard";
// Articles
import Articles from "./pages/Articles";
import ArticlePage from "./pages/ArticlePage";
const AppRoutes = () => {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {/* Auto SEO updates on every route change */}
       

      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<Search />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-retry/:productId" element={<PaymentRetry />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/product/:productId" element={<ProductDetailsPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/order-complete" element={<OrderComplete />} />
        <Route path="/order-complete/:orderId" element={<OrderComplete />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/account" element={<Account />} />
        <Route path="/track-package" element={<TrackPackage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/customization" element={<Customization />} />
        <Route path="/customization/:productCode" element={<Customization />} />
        <Route path="/feedback"  element={<Feedback mode='page'  />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/payment-issue" element={<PaymentRelatedIssue />} />
        <Route path="/order-related-issue" element={<OrderRelatedIssue />} />
        <Route
          path="/order-preview/:orderid"
          element={<OrderDetailsPreview orders={[]} orderNumber="" />}
        />

        {/* Legal */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/shipping-delivery" element={<ShippingDelivery />} />
        <Route path="/cancellation-refund" element={<CancellationRefund />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminAuthGuard><AdminDashboard /></AdminAuthGuard>} />
        <Route path="/admin/dashboard" element={<AdminAuthGuard><AdminDashboard /></AdminAuthGuard>} />
        <Route path="/admin/products" element={<AdminAuthGuard><AdminProducts /></AdminAuthGuard>} />
        <Route path="/admin/banners" element={<AdminAuthGuard><AdminBanners /></AdminAuthGuard>} />
        <Route path="/admin/articles" element={<AdminAuthGuard><AdminArticles /></AdminAuthGuard>} />
        <Route path="/admin/articles/new" element={<AdminAuthGuard><AdminArticleEdit /></AdminAuthGuard>} />
        <Route path="/admin/articles/edit/:slug" element={<AdminAuthGuard><AdminArticleEdit /></AdminAuthGuard>} />
        <Route path="/admin/orders" element={<AdminAuthGuard><AdminOrders /></AdminAuthGuard>} />
        <Route path="/admin/orders/:orderId" element={<AdminAuthGuard><AdminOrderView /></AdminAuthGuard>} />
        <Route path="/admin/customers" element={<AdminAuthGuard><AdminCustomers /></AdminAuthGuard>} />
        <Route path="/admin/settings" element={<AdminAuthGuard><AdminSettings /></AdminAuthGuard>} />
        <Route path="/admin/users" element={<AdminAuthGuard><AdminUsers /></AdminAuthGuard>} />
        <Route path="/admin/users/:userId/orders" element={<AdminAuthGuard><AdminUserOrderHistory /></AdminAuthGuard>} />
        <Route path="/admin/profiles" element={<AdminAuthGuard><AdminProfiles /></AdminAuthGuard>} />
        <Route path="/admin/website-users" element={<AdminAuthGuard><AdminWebsiteUsers /></AdminAuthGuard>} />
        <Route path="/admin/order-manager" element={<AdminAuthGuard><AdminOrderManager /></AdminAuthGuard>} />
        <Route path="/admin/*" element={<AdminAuthGuard><AdminNotFound /></AdminAuthGuard>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      {/*   <NewSEOHelmet />*/}
    </BrowserRouter>
  );
};

export default AppRoutes;
