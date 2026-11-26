import React, { useState, useEffect } from 'react';
import { UserRole, Village, Complaint, AuthSession } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LanguageProvider } from './context/LanguageContext';
import { LoginScreen } from './components/auth/LoginScreen';

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
import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export function AppContent() {
  const [authSession, setAuthSession] = useState<AuthSession | null>(
    storageService.getAuthSession()
  );
  const [currentRole, setCurrentRole] = useState<UserRole>(
    authSession?.role || storageService.getCurrentRole()
  );
  const [selectedVillage, setSelectedVillage] = useState<Village>(() => {
    const villages = storageService.getVillages();
    const targetId = authSession?.user?.villageId || storageService.getSelectedVillageId();
    return villages.find(v => v.id === targetId) || villages[0];
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    const role = authSession?.role || storageService.getCurrentRole();
    if (role === 'citizen' || role === 'survey') return 'home';
    return 'dashboard';
  });
  const [selectedComplaintForMap, setSelectedComplaintForMap] = useState<Complaint | null>(null);

  // Keep state synced across windows / storage events
  useEffect(() => {
    const handleStorageChange = () => {
      const session = storageService.getAuthSession();
      if (session) {
        setAuthSession(session);
        setCurrentRole(session.role);
      }
    };
    window.addEventListener('gramverse-storage-change', handleStorageChange);
    return () => window.removeEventListener('gramverse-storage-change', handleStorageChange);
  }, []);

  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    setCurrentRole(session.role);
    storageService.setCurrentRole(session.role);
    if (session.user?.villageId) {
      const v = storageService.getVillages().find(vil => vil.id === session.user.villageId);
      if (v) setSelectedVillage(v);
    }
    if (session.role === 'citizen' || session.role === 'survey') {
      setActiveTab('home');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    storageService.clearAuthSession();
    setAuthSession(null);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    storageService.setCurrentRole(newRole);
    // Switch session role smoothly
    let session: AuthSession;
    if (newRole === 'admin') session = storageService.loginAdmin('admin.district@gramverse.gov.in');
    else if (newRole === 'panchayat') session = storageService.loginPanchayat('PANCH-MP-001', selectedVillage.id);
    else if (newRole === 'citizen') session = storageService.loginCitizen(selectedVillage.name, 'Rameshwar Lal Gurjar', '9823-4512-7890');
    else session = storageService.loginSurvey('SURV-MP-8821', selectedVillage.id);

    setAuthSession(session);
    if (newRole === 'citizen' || newRole === 'survey') setActiveTab('home');
    else setActiveTab('dashboard');
  };

  const handleVillageChange = (village: Village) => {
    setSelectedVillage(village);
    storageService.setSelectedVillageId(village.id);
    if (authSession) {
      const updated = {
        ...authSession,
        user: {
          ...authSession.user,
          villageId: village.id,
          villageName: village.name
        }
      };
      setAuthSession(updated);
      storageService.setAuthSession(updated);
    }
  };

  // If not authenticated, render Login Screen
  if (!authSession || !authSession.isAuthenticated) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        defaultRole={currentRole}
      />
    );
  }

  // Render main screen
  const renderContent = () => {
    if (currentRole === 'admin') {
      return (
        <AdminDashboard
          villages={storageService.getVillages()}
          activeTab={activeTab}
          onTabChange={tab => setActiveTab(tab)}
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
      return (
        <SurveyPwa
          village={selectedVillage}
          onVillageChange={handleVillageChange}
        />
      );
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
        authSession={authSession}
        onLogout={handleLogout}
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
