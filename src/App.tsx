import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { AnimatePresence } from 'motion/react';
import { AppProvider } from "./context/AppContext";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import Tutorial from "./pages/Tutorial";
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

    // Hide splash screen only after app is ready
    const hideSplash = async () => {
      // Wait a bit for initial render
      setTimeout(async () => {
        if (Capacitor.isNativePlatform()) {
          await SplashScreen.hide({
            fadeOutDuration: 300
          });
        }
      }, 500);
    };

    hideSplash();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProvider>
          <BackButtonHandler />
          <TooltipProvider delayDuration={0}>
            {/* Safe Area Container with safe area insets support */}
            <div className="safe-area-container safe-area-top pt-16">
              <Toaster />
              <Sonner />
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<PageTransition><Index /></PageTransition>} />
                  <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
                  <Route path="/install" element={<PageTransition><Install /></PageTransition>} />
                  <Route path="/subscription" element={<Subscription />} />
                  <Route path="/tutorial" element={<PageTransition><Tutorial /></PageTransition>} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                </Routes>
              </AnimatePresence>
            </div>
          </TooltipProvider>
        </AppProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
