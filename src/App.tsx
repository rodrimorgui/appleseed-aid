import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PersonasProvider } from "@/context/PersonasContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import RegistroDonacion from "@/pages/RegistroDonacion";
import PersonasManager from "@/pages/PersonasManager";
import PersonaProfile from "@/pages/PersonaProfile";
import OrganizacionProfile from "@/pages/OrganizacionProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PersonasProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/donaciones" element={<RegistroDonacion />} />
              <Route path="/personas" element={<PersonasManager />} />
              <Route path="/personas/:id" element={<PersonaProfile />} />
              <Route path="/organizacion" element={<OrganizacionProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </PersonasProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
