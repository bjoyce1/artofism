import { lazy, Suspense } from "react";
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

// Lazy-load heavy / non-landing routes to slim the initial bundle
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Unlock = lazy(() => import("./pages/Unlock.tsx"));
const UnlockSuccess = lazy(() => import("./pages/UnlockSuccess.tsx"));
const Library = lazy(() => import("./pages/Library.tsx"));
const CodesHub = lazy(() => import("./pages/CodesHub.tsx"));
const QuoteVaultPage = lazy(() => import("./pages/QuoteVaultPage.tsx"));
const Privacy = lazy(() => import("./pages/Privacy.tsx"));
const Terms = lazy(() => import("./pages/Terms.tsx"));
const Refund = lazy(() => import("./pages/Refund.tsx"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe.tsx"));
const Vault = lazy(() => import("./pages/Vault.tsx"));
const Mint = lazy(() => import("./pages/Mint.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen bg-deep-black flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SectionAudioProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
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
            </Suspense>
          </BrowserRouter>
        </SectionAudioProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
