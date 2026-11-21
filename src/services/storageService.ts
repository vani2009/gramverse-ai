import { Complaint, Household, InfrastructureAsset, OfflineSurveyRecord, UserRole, Village } from '../types';
import { MOCK_COMPLAINTS, MOCK_HOUSEHOLDS, MOCK_INFRASTRUCTURE, MOCK_VILLAGES } from '../data/mockData';

const STORAGE_KEYS = {
  ROLE: 'gramverse_current_role',
  VILLAGE_ID: 'gramverse_selected_village',
  COMPLAINTS: 'gramverse_complaints_data',
  HOUSEHOLDS: 'gramverse_households_data',
  INFRASTRUCTURE: 'gramverse_infrastructure_data',
  OFFLINE_QUEUE: 'gramverse_offline_queue',
  ONLINE_STATUS: 'gramverse_online_status'
};

class StorageService {
  private notifyChange() {
    window.dispatchEvent(new Event('gramverse-storage-change'));
  }

  // Role Management
  getCurrentRole(): UserRole {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'panchayat'; // default to panchayat for rich preview
  }

  setCurrentRole(role: UserRole) {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    this.notifyChange();
  }

  // Selected Village
  getSelectedVillageId(): string {
    return localStorage.getItem(STORAGE_KEYS.VILLAGE_ID) || 'vil_shivpura';
  }

  setSelectedVillageId(id: string) {
    localStorage.setItem(STORAGE_KEYS.VILLAGE_ID, id);
    this.notifyChange();
  }

  getVillages(): Village[] {
    return MOCK_VILLAGES;
  }

  // Online / Offline Simulation for PWA
  isOnline(): boolean {
    const saved = localStorage.getItem(STORAGE_KEYS.ONLINE_STATUS);
    return saved !== null ? JSON.parse(saved) : true;
  }

  setOnline(online: boolean) {
    localStorage.setItem(STORAGE_KEYS.ONLINE_STATUS, JSON.stringify(online));
    this.notifyChange();
  }

  // Complaints
  getComplaints(): Complaint[] {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(MOCK_COMPLAINTS));
      return MOCK_COMPLAINTS;
    }
    return JSON.parse(saved);
  }

  addComplaint(complaint: Complaint) {
    const list = this.getComplaints();
    const updated = [complaint, ...list];
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    this.notifyChange();
  }

  updateComplaintStatus(id: string, status: Complaint['status'], remarks?: string) {
    const list = this.getComplaints();
    const updated = list.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          updatedAt: new Date().toISOString(),
          panchayatRemarks: remarks !== undefined ? remarks : c.panchayatRemarks
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    this.notifyChange();
  }

  overrideComplaintCategory(id: string, newCategory: Complaint['category'], reason: string, userDesignation: string) {
    const list = this.getComplaints();
    const updated = list.map(c => {
      if (c.id === id) {
        return {
          ...c,
          category: newCategory,
          updatedAt: new Date().toISOString(),
          aiOutput: {
            ...c.aiOutput,
            isOverridden: true,
            overriddenCategory: newCategory,
            overrideReason: reason
          },
          panchayatRemarks: `Category reclassified to ${newCategory} by ${userDesignation}. Reason: ${reason}`
        };
      }
      return c;
    });
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    this.notifyChange();
  }

  // Households
  getHouseholds(): Household[] {
    const saved = localStorage.getItem(STORAGE_KEYS.HOUSEHOLDS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(MOCK_HOUSEHOLDS));
      return MOCK_HOUSEHOLDS;
    }
    return JSON.parse(saved);
  }

  addHousehold(household: Household) {
    const list = this.getHouseholds();
    const updated = [household, ...list];
    localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(updated));
    this.notifyChange();
  }

  // Infrastructure
  getInfrastructure(): InfrastructureAsset[] {
    const saved = localStorage.getItem(STORAGE_KEYS.INFRASTRUCTURE);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.INFRASTRUCTURE, JSON.stringify(MOCK_INFRASTRUCTURE));
      return MOCK_INFRASTRUCTURE;
    }
    return JSON.parse(saved);
  }

  addInfrastructure(asset: InfrastructureAsset) {
    const list = this.getInfrastructure();
    const updated = [asset, ...list];
    localStorage.setItem(STORAGE_KEYS.INFRASTRUCTURE, JSON.stringify(updated));
    this.notifyChange();
  }

  // Offline Survey Queue
  getOfflineQueue(): OfflineSurveyRecord[] {
    const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!saved) return [];
    return JSON.parse(saved);
  }

  addToOfflineQueue(item: Omit<OfflineSurveyRecord, 'id' | 'capturedAt' | 'synced' | 'syncAttempts' | 'status'>) {
    const queue = this.getOfflineQueue();
    const record: OfflineSurveyRecord = {
      ...item,
      id: 'off_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      capturedAt: new Date().toISOString(),
      synced: false,
      syncAttempts: 0,
      status: 'pending'
    };
    queue.push(record);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    this.notifyChange();
    return record;
  }

  syncOfflineQueue(): { syncedCount: number; errors: number } {
    const queue = this.getOfflineQueue();
    let syncedCount = 0;
    
    queue.forEach(item => {
      if (item.status === 'pending' || item.status === 'failed') {
        if (item.type === 'household') {
          this.addHousehold(item.payload);
          item.status = 'synced';
          item.synced = true;
          syncedCount++;
        } else if (item.type === 'infrastructure') {
          this.addInfrastructure(item.payload);
          item.status = 'synced';
          item.synced = true;
          syncedCount++;
        }
      }
    });

    // Keep synced items for audit trail or clear
    const remainingPending = queue.filter(q => !q.synced);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remainingPending));
    this.notifyChange();
    return { syncedCount, errors: 0 };
  }

  resetAllToDefault() {
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(STORAGE_KEYS.HOUSEHOLDS);
    localStorage.removeItem(STORAGE_KEYS.INFRASTRUCTURE);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    this.notifyChange();
  }
}

export const storageService = new StorageService();
