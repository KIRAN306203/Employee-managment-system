import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import Departments from "./pages/Departments";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";

// Initialize React Query client for server state management
const queryClient = new QueryClient();

// Layout component wrapping sidebar and main content area
const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  </SidebarProvider>
);

// Main application component with routing and context providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Toast notifications */}
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            
            {/* Protected routes with role-based access */}
            <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute requiredRole="manager"><AppLayout><Employees /></AppLayout></ProtectedRoute>} />
            <Route path="/employees/:id" element={<ProtectedRoute requiredRole="manager"><AppLayout><EmployeeDetail /></AppLayout></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute requiredRole="manager"><AppLayout><Departments /></AppLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute requiredRole="admin"><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute requiredRole="admin"><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
            
            {/* Fallback route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
