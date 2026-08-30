import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isStudent, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    if (isAdmin) navigate('/admin');
    else navigate('/chat');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1">
                College<span className="text-indigo-600">AI</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">RAG</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#categories" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              Knowledge Base
            </a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              About
            </a>
          </nav>

          {/* Desktop Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="primary"
                onClick={handleDashboardRedirect}
                icon={Sparkles}
              >
                {isAdmin ? 'Admin Dashboard' : 'Open Assistant'}
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            How It Works
          </a>
          <a
            href="#categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Knowledge Base
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            About
          </a>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button fullWidth variant="primary" onClick={handleDashboardRedirect}>
                {isAdmin ? 'Admin Dashboard' : 'Open Assistant'}
              </Button>
            ) : (
              <>
                <Link to="/login" className="w-full">
                  <Button fullWidth variant="outline">
                    Login
                  </Button>
                </Link>
                <Link to="/register" className="w-full">
                  <Button fullWidth variant="primary">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
