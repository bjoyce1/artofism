import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import ChapterReader from "./pages/ChapterReader.tsx";
import CodesHub from "./pages/CodesHub.tsx";
import Auth from "./pages/Auth.tsx";
import Unlock from "./pages/Unlock.tsx";
import UnlockSuccess from "./pages/UnlockSuccess.tsx";
import Library from "./pages/Library.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/unlock" element={<Unlock />} />
            <Route path="/unlock/success" element={<UnlockSuccess />} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/chapter/1" element={<ChapterReader />} />
            <Route path="/chapter/:id" element={<ProtectedRoute><ChapterReader /></ProtectedRoute>} />
            <Route path="/codes" element={<ProtectedRoute><CodesHub /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
