// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserRoute from "@/components/UserRoute";
import AdminRoute from "@/components/AdminRoute";

// New Home page created from your landing components
import Home from "./pages/Home";

// Other Pages
import Login from "./pages/user/Login";
import ReceptionistLogin from "./pages/receptionist/ReceptionistLogin";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import BookingPage from "./pages/BookingPage";
import PublicBookingPage from "./pages/PublicBookingPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageWorkspaces from "./pages/ManageWorkspaces";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import BookingSuccess from "./pages/BookingSuccess";
import SinglePodSlots from "./pages/user/SinglePodSlots";
import DoublePodSlots from "./pages/user/DoublePodSlots";
import Meeting6Slots from "./pages/user/Meeting6Slots";
import Meeting10Slots from "./pages/user/Meeting10Slots";
import WorkspacePage from "./pages/WorkspacePage";

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
            <Route path="/receptionist-login" element={<ReceptionistLogin />} />
            <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/public-booking/:workspaceId?" element={<PublicBookingPage />} />
            <Route path="/booking-success" element={<BookingSuccess />} />

            {/* Use the Home component for the landing page (new tab) */}
            <Route path="/" element={<Home />} />

            <Route path="/single-pod-slots" element={<SinglePodSlots />} />
            <Route path="/double-pod-slots" element={<DoublePodSlots />} />
            <Route path="/meeting-6-slots" element={<Meeting6Slots />} />
            <Route path="/meeting-10-slots" element={<Meeting10Slots />} />

            <Route path="/workspace/:id" element={<WorkspacePage />} />


            {/* Protected Routes */}

            {/* Shared route accessible by both roles */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* User-only routes */}
            <Route
              path="/dashboard"
              element={
                <UserRoute>
                  <Home />
                </UserRoute>
              }
            />
            <Route
              path="/booking/:workspaceId?"
              element={
                <UserRoute>
                  <BookingPage />
                </UserRoute>
              }
            />

            {/* Admin-only routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/workspaces"
              element={
                <AdminRoute>
                  <ManageWorkspaces />
                </AdminRoute>
              }
            />

            {/* Catch-all route for unmatched paths */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
