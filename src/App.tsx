import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { SectionAudioProvider } from "@/hooks/useSectionAudio";
import ProtectedRoute from "@/components/ProtectedRoute";
import GatedChapter from "@/components/GatedChapter";
import Index from "./pages/Index.tsx";
import CodesHub from "./pages/CodesHub.tsx";
import QuoteVaultPage from "./pages/QuoteVaultPage.tsx";
import Auth from "./pages/Auth.tsx";
import Unlock from "./pages/Unlock.tsx";
import UnlockSuccess from "./pages/UnlockSuccess.tsx";
import Library from "./pages/Library.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import Refund from "./pages/Refund.tsx";
import Unsubscribe from "./pages/Unsubscribe.tsx";
import Vault from "./pages/Vault.tsx";
import Mint from "./pages/Mint.tsx";

import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
      <SectionAudioProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/unlock" element={<Unlock />} />
            <Route path="/unlock/success" element={<UnlockSuccess />} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/chapter/:id" element={<GatedChapter />} />
            <Route path="/codes" element={<ProtectedRoute><CodesHub /></ProtectedRoute>} />
            <Route path="/quote-vault" element={<ProtectedRoute><QuoteVaultPage /></ProtectedRoute>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/mint" element={<Mint />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SectionAudioProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
