// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserRoute from "@/components/UserRoute";
import AdminRoute from "@/components/AdminRoute";
import HomeRedirect from "@/components/HomeRedirect"; // New component to handle root redirection

// Pages
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import BookingPage from "./pages/BookingPage";
import AdminDashboard from "./pages/AdminDashboard";
import ManageWorkspaces from "./pages/ManageWorkspaces";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Shared route accessible by both roles */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Default route: use an index route for the root */}
            <Route index element={<HomeRedirect />} />

            {/* User-only routes */}
            <Route path="/dashboard" element={
              <UserRoute>
                <Dashboard />
              </UserRoute>
            } />
            <Route path="/booking/:workspaceId?" element={
              <UserRoute>
                <BookingPage />
              </UserRoute>
            } />

            {/* Admin-only routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/workspaces" element={
              <AdminRoute>
                <ManageWorkspaces />
              </AdminRoute>
            } />

            {/* Catch-all route for unmatched paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
