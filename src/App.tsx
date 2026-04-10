import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import RoleSelect from "./pages/RoleSelect.tsx";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Hospitals from "./pages/Hospitals.tsx";
import Routing from "./pages/Routing.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminUsers from "./pages/AdminUsers.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";
import EmergencyChatbot from "./components/EmergencyChatbot.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoleSelect />} />
            <Route path="/home" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/routing" element={<Routing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <EmergencyChatbot />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
