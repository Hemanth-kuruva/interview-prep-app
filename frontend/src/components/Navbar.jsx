import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Code2, 
  LayoutDashboard, 
  BookOpen, 
  BarChart3, 
  ShieldCheck, 
  LogOut, 
  User, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Practice & Quizzes', path: '/select-subject', icon: BookOpen },
    { name: 'Progress & Analytics', path: '/progress', icon: BarChart3 },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin Portal', path: '/admin', icon: ShieldCheck });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Code2 className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent">
                TechPrep
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-950/80 text-brand-400 border border-brand-800/50 font-semibold">
                Pro
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Section: User Profile & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <User className="w-4 h-4 text-brand-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white leading-tight">{user?.name || 'User'}</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-brand-400'}`}></span>
                  <p className="text-xs text-slate-400 capitalize">{user?.role || 'Student'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
              title="Log out of your account"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 px-4 pt-3 pb-5 space-y-3">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-brand-400 font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email} ({user?.role})</p>
            </div>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-brand-500/15 text-brand-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </nav>
  );
}
