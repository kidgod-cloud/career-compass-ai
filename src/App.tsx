import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CareerRoadmap from "./pages/CareerRoadmap";
import SkillAnalysis from "./pages/SkillAnalysis";
import SwotAnalysis from "./pages/SwotAnalysis";
import ResumeOptimization from "./pages/ResumeOptimization";
import RoleTransitionGuide from "./pages/RoleTransitionGuide";
import Profile from "./pages/Profile";
import InterviewCoach from "./pages/InterviewCoach";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/roadmap" element={<CareerRoadmap />} />
          <Route path="/skill-analysis" element={<SkillAnalysis />} />
          <Route path="/swot-analysis" element={<SwotAnalysis />} />
          <Route path="/resume-optimization" element={<ResumeOptimization />} />
          <Route path="/role-transition" element={<RoleTransitionGuide />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/interview-coach" element={<InterviewCoach />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
