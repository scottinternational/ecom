import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/hooks/useTheme";
import { NotificationProvider } from "@/hooks/useNotifications";
import Dashboard from "./pages/Dashboard";
import RnD from "./pages/RnD";
import Production from "./pages/Production";
import Procurement from "./pages/Procurement";
import ProductSampleRequests from "./pages/ProductSampleRequests";
import PurchaseOrders from "./pages/PurchaseOrders";
import GraphicContent from "./pages/GraphicContent";
import ListingCatalogue from "./pages/ListingCatalogue";
import Inventory from "./pages/Inventory";
import AdsMarketing from "./pages/AdsMarketing";
import ProductReview from "./pages/ProductReview";
import Operations from "./pages/Operations";
import Users from "./pages/Users";
import People from "./pages/People";
import Products from "./pages/Products";
import ProductMaster from "./pages/ProductMaster";
import ProductDetails from "./pages/ProductDetails";
import Listing from "./pages/Listing";
import Mapping from "./pages/Mapping";
import Brands from "./pages/Brands";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/rnd" element={
              <ProtectedRoute>
                <Layout><RnD /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/production" element={
              <ProtectedRoute>
                <Layout><Production /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/procurement" element={
              <ProtectedRoute>
                <Layout><Procurement /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/procurement/sample-requests" element={
              <ProtectedRoute>
                <Layout><ProductSampleRequests /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/procurement/purchase-orders" element={
              <ProtectedRoute>
                <Layout><PurchaseOrders /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/graphic-content" element={
              <ProtectedRoute>
                <Layout><GraphicContent /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/listing-catalogue" element={
              <ProtectedRoute>
                <Layout><ListingCatalogue /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <Layout><Inventory /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/ads-marketing" element={
              <ProtectedRoute>
                <Layout><AdsMarketing /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/product-review" element={
              <ProtectedRoute>
                <Layout><ProductReview /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/operations" element={
              <ProtectedRoute>
                <Layout><Operations /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout><Users /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/people" element={
              <ProtectedRoute>
                <Layout><People /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <Layout><Products /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/products/master" element={
              <ProtectedRoute>
                <Layout><ProductMaster /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/products/master/:id" element={
              <ProtectedRoute>
                <Layout><ProductDetails /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/products/listing" element={
              <ProtectedRoute>
                <Layout><Listing /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/products/mapping" element={
              <ProtectedRoute>
                <Layout><Mapping /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/products/brands" element={
              <ProtectedRoute>
                <Layout><Brands /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout><Settings /></Layout>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </NotificationProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
