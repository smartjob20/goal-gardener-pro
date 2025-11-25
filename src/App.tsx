import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import Index from "./pages/Index";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Hardware back button handler component
const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const setupBackButton = async () => {
      await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (location.pathname === '/' || location.pathname === '/auth') {
          // On home screen, minimize app instead of exiting
          CapacitorApp.minimizeApp();
        } else if (canGoBack) {
          // Navigate back if possible
          navigate(-1);
        } else {
          // Otherwise minimize
          CapacitorApp.minimizeApp();
        }
      });
    };

    setupBackButton();

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [navigate, location]);

  return null;
};

const App = () => {
  // Detect Android platform and apply optimized styles
  useEffect(() => {
    const platform = Capacitor.getPlatform();
    if (platform === 'android') {
      document.body.classList.add('is-android');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <BackButtonHandler />
        <TooltipProvider delayDuration={0}>
          {/* Safe Area Container with top padding for header */}
          <div className="safe-area-container pt-16">
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/install" element={<Install />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
