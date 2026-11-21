import React from 'react';
import { UserRole } from '../../types';
import {
  Building2,
  BarChart3,
  FileSpreadsheet,
  LayoutDashboard,
  AlertCircle,
  Users,
  Calculator,
  Home,
  FilePlus,
  Compass,
  Clock,
  Bot,
  Smartphone,
  CloudUpload,
  MapPin
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onTabChange
}) => {
  const getNavItems = () => {
    switch (currentRole) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Admin Overview', icon: <Building2 className="w-4 h-4" /> },
          { id: 'analytics', label: 'Village Comparison', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'reports', label: 'Reports & Exports', icon: <FileSpreadsheet className="w-4 h-4" /> },
        ];
      case 'panchayat':
        return [
          { id: 'dashboard', label: 'Dashboard & GIS Map', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'complaints', label: 'Grievance AI Review', icon: <AlertCircle className="w-4 h-4" /> },
          { id: 'households', label: 'Household Registry', icon: <Users className="w-4 h-4" /> },
          { id: 'planner', label: 'Development Planner', icon: <Calculator className="w-4 h-4" /> },
        ];
      case 'citizen':
        return [
          { id: 'home', label: 'Citizen Home', icon: <Home className="w-4 h-4" /> },
          { id: 'submit', label: 'Lodge Grievance', icon: <FilePlus className="w-4 h-4" /> },
          { id: 'schemes', label: 'Scheme Explorer', icon: <Compass className="w-4 h-4" /> },
          { id: 'tracking', label: 'Track Complaints', icon: <Clock className="w-4 h-4" /> },
          { id: 'chatbot', label: 'GramBot AI (RAG)', icon: <Bot className="w-4 h-4" /> },
        ];
      case 'survey':
        return [
          { id: 'home', label: 'Survey PWA Forms', icon: <Smartphone className="w-4 h-4" /> },
          { id: 'queue', label: 'Offline Sync Queue', icon: <CloudUpload className="w-4 h-4" /> },
        ];
    }
  };

  const items = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 hidden md:flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation ({currentRole.toUpperCase()})
          </div>
          <nav className="space-y-1">
            {items.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI Engine Status badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
          <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
            <span>AI Models Status</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="space-y-1.5 text-[10px] text-slate-500">
            <div className="flex justify-between">
              <span>NLP Classifier:</span>
              <span className="font-semibold text-emerald-700">Active (v1.4)</span>
            </div>
            <div className="flex justify-between">
              <span>CV Vision Model:</span>
              <span className="font-semibold text-emerald-700">Ready</span>
            </div>
            <div className="flex justify-between">
              <span>RAG Vector Store:</span>
              <span className="font-semibold text-emerald-700">FAISS Index</span>
            </div>
            <div className="flex justify-between">
              <span>Prioritization:</span>
              <span className="font-semibold text-emerald-700">Rule Logic</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-900">
        <div className="font-bold">Group Project Prototype</div>
        <div className="text-emerald-700 mt-0.5">GramVerse AI v1.0.0</div>
      </div>
    </aside>
  );
};
