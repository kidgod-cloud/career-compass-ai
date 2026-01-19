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
import CareerVision from "./pages/CareerVision";
import LinkedInOptimization from "./pages/LinkedInOptimization";
import PortfolioBuilder from "./pages/PortfolioBuilder";
import LearningPath from "./pages/LearningPath";
import SalaryBenchmark from "./pages/SalaryBenchmark";
import TimeManagement from "./pages/TimeManagement";
import MentorMatch from "./pages/MentorMatch";
import ContentStrategy from "./pages/ContentStrategy";
import NetworkingStrategy from "./pages/NetworkingStrategy";
import PersonalBranding from "./pages/PersonalBranding";
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
          <Route path="/career-vision" element={<CareerVision />} />
          <Route path="/linkedin-optimization" element={<LinkedInOptimization />} />
          <Route path="/portfolio-builder" element={<PortfolioBuilder />} />
          <Route path="/learning-path" element={<LearningPath />} />
          <Route path="/salary-benchmark" element={<SalaryBenchmark />} />
          <Route path="/time-management" element={<TimeManagement />} />
          <Route path="/mentor-match" element={<MentorMatch />} />
          <Route path="/content-strategy" element={<ContentStrategy />} />
          <Route path="/networking-strategy" element={<NetworkingStrategy />} />
          <Route path="/personal-branding" element={<PersonalBranding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
