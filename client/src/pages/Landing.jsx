import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import {
  Sparkles,
  Bot,
  FileText,
  Search,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  DollarSign,
  Calendar,
  Home,
  Award,
  Briefcase,
  Users,
  ShieldAlert,
  Compass,
  Cpu,
  Layers,
  Database
} from 'lucide-react';

const FEATURES = [
  {
    icon: Bot,
    title: 'AI-Powered Answers',
    description: 'Get instant, accurate answers generated directly from official college documentation.'
  },
  {
    icon: FileText,
    title: 'Document-Based Knowledge',
    description: 'College PDFs, regulations, and guidelines are converted into structured, searchable data.'
  },
  {
    icon: ShieldCheck,
    title: 'Source References',
    description: 'Every AI response highlights the exact document name, page number, and relevance score.'
  },
  {
    icon: Search,
    title: 'Fast Semantic Search',
    description: 'Vector embeddings enable conceptual understanding rather than simple keyword matching.'
  },
  {
    icon: ShieldCheck,
    title: 'Secure Authentication',
    description: 'Separate student access and administrative control for college knowledge management.'
  },
  {
    icon: Zap,
    title: 'Always Updatable',
    description: 'Administrators can upload new PDFs to update AI knowledge without retraining models.'
  }
];

const STEPS = [
  { step: '01', title: 'Upload Documents', desc: 'Admin uploads college PDFs, handbooks, and schedules.', icon: UploadIcon },
  { step: '02', title: 'Extract & Process Text', desc: 'Text is parsed and cleaned for vector ingestion.', icon: Layers },
  { step: '03', title: 'Generate Embeddings', desc: 'Neural embeddings transform text into dense vectors.', icon: Cpu },
  { step: '04', title: 'Semantic Search', desc: 'Student query finds top relevant document chunks.', icon: Database },
  { step: '05', title: 'AI Answer + Sources', desc: 'RAG model generates answer with exact PDF citations.', icon: Sparkles }
];

function UploadIcon(props) {
  return <FileText {...props} />;
}

const CATEGORIES = [
  { name: 'Admissions', icon: GraduationCap, color: 'bg-blue-50 text-blue-600' },
  { name: 'Academics', icon: BookOpen, color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Fees', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Exams', icon: Calendar, color: 'bg-amber-50 text-amber-600' },
  { name: 'Hostel', icon: Home, color: 'bg-rose-50 text-rose-600' },
  { name: 'Library', icon: BookOpen, color: 'bg-purple-50 text-purple-600' },
  { name: 'Scholarships', icon: Award, color: 'bg-violet-50 text-violet-600' },
  { name: 'Placements', icon: Briefcase, color: 'bg-cyan-50 text-cyan-600' },
  { name: 'Departments', icon: Users, color: 'bg-teal-50 text-teal-600' },
  { name: 'Clubs & Events', icon: Compass, color: 'bg-fuchsia-50 text-fuchsia-600' },
  { name: 'Policies', icon: ShieldAlert, color: 'bg-orange-50 text-orange-600' },
  { name: 'Academic Calendar', icon: Calendar, color: 'bg-sky-50 text-sky-600' }
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Subtle background glow shapes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-300/30 via-violet-300/20 to-purple-300/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-2xs">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Next-Gen RAG Architecture</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Your College Information, <br />
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Powered by AI.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Ask questions about admissions, fees, exams, hostels, departments, scholarships, placements, library rules and more. Grounded in verified college PDFs.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  size="lg"
                  variant="primary"
                  icon={ArrowRight}
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto shadow-indigo-600/30"
                >
                  Start Asking Questions
                </Button>
                <a href="#features" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    Explore Features
                  </Button>
                </a>
              </div>

              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Instant Document Retrieval
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Zero LLM Hallucinations
                </span>
              </div>
            </div>

            {/* Right Side Visual Mock Chatbot Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-2xl p-5 sm:p-6 space-y-4 glow-accent">
                {/* Mock Card Top Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">CollegeAI Assistant</h4>
                      <p className="text-[10px] text-slate-400">RAG Semantic Search</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Answers grounded in college documents
                  </span>
                </div>

                {/* Mock Chat Conversation */}
                <div className="space-y-3 text-xs">
                  {/* User Bubble */}
                  <div className="flex gap-2.5 justify-end">
                    <div className="bg-indigo-600 text-white p-3 rounded-2xl max-w-[85%] font-medium">
                      What is the minimum attendance requirement?
                    </div>
                  </div>

                  {/* Bot Bubble */}
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl max-w-[90%] space-y-2 text-slate-800">
                      <p className="leading-relaxed">
                        Students must maintain the minimum attendance requirement of 75% specified in the academic regulations. Condonation up to 10% requires medical approval.
                      </p>

                      {/* Mock Source Box */}
                      <div className="mt-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Verified Source
                        </span>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-indigo-600 text-[11px]">
                            <FileText className="w-3.5 h-3.5" />
                            Academic_Regulations.pdf
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600">Page 18 • 91% Match</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Input Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs">
                    <span>Ask anything about college...</span>
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Engineered for Accuracy & Speed
            </h2>
            <p className="text-sm text-slate-600">
              Built on advanced Retrieval-Augmented Generation to eliminate guesswork and deliver precise citations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              RAG Pipeline Visualized
            </span>
            <h2 className="text-3xl font-black text-slate-900">How CollegeAI Works</h2>
            <p className="text-sm text-slate-600">
              5 seamless steps from document ingestion to grounded answer generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative z-10 hover:border-indigo-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-indigo-600/40">{s.step}</span>
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900">{s.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Knowledge Categories Section */}
      <section id="categories" className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Knowledge Base
            </span>
            <h2 className="text-3xl font-black text-slate-900">Comprehensive Knowledge Index</h2>
            <p className="text-sm text-slate-600">
              Covering every aspect of campus life, academic rules, and administrative queries.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-3 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center shrink-0 font-bold shadow-2xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">PDF Knowledge</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              College<span className="text-indigo-400">AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 CollegeAI RAG Assistant. Built for modern academic institutions.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
            <Link to="/login" className="hover:text-white transition-colors">
              Student Login
            </Link>
            <span>•</span>
            <Link to="/login" className="hover:text-white transition-colors">
              Admin Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
