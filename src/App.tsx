import React, { useState, useEffect } from 'react';
import { UserRole, Village, Complaint } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Admin
import { AdminDashboard } from './components/admin/AdminDashboard';

// Panchayat
import { PanchayatDashboard } from './components/panchayat/PanchayatDashboard';
import { ComplaintsManager } from './components/panchayat/ComplaintsManager';
import { HouseholdRegistry } from './components/panchayat/HouseholdRegistry';
import { DevelopmentPlanner } from './components/panchayat/DevelopmentPlanner';

// Citizen
import { CitizenHome } from './components/citizen/CitizenHome';
import { SubmitComplaint } from './components/citizen/SubmitComplaint';
import { SchemeExplorer } from './components/citizen/SchemeExplorer';
import { TrackComplaints } from './components/citizen/TrackComplaints';
import { GramBotChat } from './components/ai/GramBotChat';

// Survey
import { SurveyPwa } from './components/survey/SurveyPwa';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(storageService.getCurrentRole());
  const [selectedVillage, setSelectedVillage] = useState<Village>(
    storageService.getVillages()[0]
  );
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedComplaintForMap, setSelectedComplaintForMap] = useState<Complaint | null>(null);

  // Keep state synced
  useEffect(() => {
    const handleStorageChange = () => {
      // Re-trigger if needed
    };
    window.addEventListener('gramverse-storage-change', handleStorageChange);
    return () => window.removeEventListener('gramverse-storage-change', handleStorageChange);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    storageService.setCurrentRole(newRole);
    if (newRole === 'citizen') setActiveTab('home');
    else if (newRole === 'survey') setActiveTab('home');
    else setActiveTab('dashboard');
  };

  const handleVillageChange = (village: Village) => {
    setSelectedVillage(village);
    storageService.setSelectedVillageId(village.id);
  };

  // Render main screen
  const renderContent = () => {
    if (currentRole === 'admin') {
      return (
        <AdminDashboard
          villages={storageService.getVillages()}
          onSelectVillage={vil => {
            setSelectedVillage(vil);
            setCurrentRole('panchayat');
            setActiveTab('dashboard');
          }}
        />
      );
    }

    if (currentRole === 'panchayat') {
      switch (activeTab) {
        case 'dashboard':
          return (
            <PanchayatDashboard
              village={selectedVillage}
              onNavigateTab={tab => setActiveTab(tab)}
              onSelectComplaintForInspection={_cmp => setActiveTab('complaints')}
              initialComplaint={selectedComplaintForMap}
            />
          );
        case 'complaints':
          return (
            <ComplaintsManager
              village={selectedVillage}
              onLocateOnMap={cmp => {
                setSelectedComplaintForMap(cmp);
                setActiveTab('dashboard');
              }}
            />
          );
        case 'households':
          return <HouseholdRegistry village={selectedVillage} />;
        case 'planner':
          return <DevelopmentPlanner village={selectedVillage} />;
        default:
          return (
            <PanchayatDashboard
              village={selectedVillage}
              onNavigateTab={tab => setActiveTab(tab)}
            />
          );
      }
    }

    if (currentRole === 'citizen') {
      switch (activeTab) {
        case 'home':
          return (
            <CitizenHome
              village={selectedVillage}
              onNavigateTab={tab => setActiveTab(tab)}
            />
          );
        case 'submit':
          return (
            <SubmitComplaint
              village={selectedVillage}
              onSubmitted={_cmp => setActiveTab('tracking')}
            />
          );
        case 'schemes':
          return <SchemeExplorer village={selectedVillage} />;
        case 'tracking':
          return <TrackComplaints village={selectedVillage} />;
        case 'chatbot':
          return <GramBotChat />;
        default:
          return (
            <CitizenHome
              village={selectedVillage}
              onNavigateTab={tab => setActiveTab(tab)}
            />
          );
      }
    }

    if (currentRole === 'survey') {
      return <SurveyPwa village={selectedVillage} />;
    }

    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation & Role Switcher Bar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        selectedVillage={selectedVillage}
        onVillageChange={handleVillageChange}
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentRole={currentRole}
          activeTab={activeTab}
          onTabChange={tab => setActiveTab(tab)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
