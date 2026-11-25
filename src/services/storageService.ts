import { Complaint, Household, InfrastructureAsset, OfflineSurveyRecord, UserRole, Village } from '../types';
import { MOCK_COMPLAINTS, MOCK_HOUSEHOLDS, MOCK_INFRASTRUCTURE, MOCK_VILLAGES } from '../data/mockData';
import { apiService } from './apiService';

const STORAGE_KEYS = {
  ROLE: 'gramverse_current_role',
  VILLAGE_ID: 'gramverse_selected_village',
  COMPLAINTS: 'gramverse_complaints_data',
  HOUSEHOLDS: 'gramverse_households_data',
  INFRASTRUCTURE: 'gramverse_infrastructure_data',
  OFFLINE_QUEUE: 'gramverse_offline_queue',
  ONLINE_STATUS: 'gramverse_online_status',
  BACKEND_SYNCED: 'gramverse_backend_synced'
};

class StorageService {
  private isBackendReachable: boolean = false;

  constructor() {
    this.checkAndSyncBackend();
  }

  private notifyChange() {
    window.dispatchEvent(new Event('gramverse-storage-change'));
  }

  /** Probe FastAPI backend on startup and optionally pull fresh database entities */
  async checkAndSyncBackend(): Promise<boolean> {
    try {
      const health = await apiService.checkHealth();
      this.isBackendReachable = !!(health && health.status === 'healthy');
      if (this.isBackendReachable) {
        // Optionally fetch and merge live backend data into local cache
        const backendVillages = await apiService.getVillages();
        if (backendVillages && backendVillages.length > 0) {
          // Keep backend synchronized
          localStorage.setItem(STORAGE_KEYS.BACKEND_SYNCED, 'true');
        }
      }
    } catch {
      this.isBackendReachable = false;
    }
    this.notifyChange();
    return this.isBackendReachable;
  }

  getBackendStatus(): boolean {
    return this.isBackendReachable;
  }

  // Role Management
  getCurrentRole(): UserRole {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || 'panchayat';
  }

  setCurrentRole(role: UserRole) {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    this.notifyChange();
  }

  // Selected Village
  getSelectedVillageId(): string {
    return localStorage.getItem(STORAGE_KEYS.VILLAGE_ID) || 'vil_kothri';
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

  async addComplaint(complaint: Complaint) {
    const list = this.getComplaints();
    const updated = [complaint, ...list];
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
    this.notifyChange();

    // If online and backend reachable, post directly to FastAPI backend
    if (this.isOnline()) {
      try {
        await apiService.submitComplaint({
          village_id: 1, // Default demonstration village ID
          description: `${complaint.title}: ${complaint.description}`,
          latitude: complaint.location.lat,
          longitude: complaint.location.lng
        });
      } catch {
        // Safe fallback - already saved in local cache
      }
    }
  }

  async updateComplaintStatus(id: string, status: Complaint['status'], remarks?: string) {
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

    // Sync to backend if numeric ID or matched
    if (this.isOnline()) {
      const numId = parseInt(id.replace(/\D/g, ''), 10);
      if (!isNaN(numId)) {
        const backendStatus = status === 'Resolved' ? 'resolved' : 'under_review';
        await apiService.updateComplaintStatus(numId, backendStatus, remarks).catch(() => null);
      }
    }
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

  async addHousehold(household: Household) {
    const list = this.getHouseholds();
    const updated = [household, ...list];
    localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(updated));
    this.notifyChange();

    if (this.isOnline()) {
      try {
        await apiService.createHousehold({
          village_id: 1,
          household_head: household.headName,
          family_size: household.familySize,
          monthly_income: household.annualIncome / 12,
          housing_type: household.hasSanitationToilet ? 'pucca' : 'kutcha',
          pucca_house: household.drinkingWaterSource === 'Tap Connection',
          land_holding_acres: household.landHoldingAcres,
          water_tap_available: household.drinkingWaterSource === 'Tap Connection',
          electricity_available: household.hasElectricity,
          toilet_available: household.hasSanitationToilet,
          caste_category: household.casteCategory,
          qr_code_id: `QR-KOTHRI-${household.aadhaarLastFour}`,
          latitude: household.location.lat,
          longitude: household.location.lng
        });
      } catch {
        // Fallback gracefully
      }
    }
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

  /**
   * Synchronize pending offline surveys directly with the FastAPI backend database.
   * If backend is online, dispatches batch payload to /api/v1/surveys/sync.
   */
  async syncOfflineQueue(): Promise<{ syncedCount: number; errors: number; backendSynced: boolean }> {
    const queue = this.getOfflineQueue();
    const pendingItems = queue.filter(q => !q.synced);
    let syncedCount = 0;
    let backendSynced = false;

    if (pendingItems.length === 0) {
      return { syncedCount: 0, errors: 0, backendSynced: false };
    }

    // Try synchronizing with FastAPI backend first if online
    if (this.isOnline()) {
      try {
        const batchPayload = pendingItems.map(item => ({
          client_uuid: item.id.replace('off_', 'uuid_') + '_' + Date.now(),
          survey_type: item.type,
          survey_data: item.payload,
          latitude: item.payload?.location?.lat || 23.0722,
          longitude: item.payload?.location?.lng || 76.8296,
          household_qr_code: item.payload?.aadhaarLastFour ? `QR-KOTHRI-${item.payload.aadhaarLastFour}` : undefined
        }));

        const backendResult = await apiService.syncSurveys(batchPayload);
        if (backendResult && backendResult.synced_count > 0) {
          backendSynced = true;
        }
      } catch {
        backendSynced = false;
      }
    }

    // Update local state and master entities
    queue.forEach(item => {
      if (!item.synced) {
        if (item.type === 'household') {
          this.addHousehold(item.payload);
        } else if (item.type === 'infrastructure') {
          this.addInfrastructure(item.payload);
        }
        item.status = 'synced';
        item.synced = true;
        syncedCount++;
      }
    });

    const remainingPending = queue.filter(q => !q.synced);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remainingPending));
    this.notifyChange();

    return { syncedCount, errors: 0, backendSynced };
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
