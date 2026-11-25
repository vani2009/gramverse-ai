/**
 * GramVerse AI — Full-Stack API Service
 * Connects React Frontend with FastAPI Backend, PostgreSQL/PostGIS, and SQLite.
 */

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocalhost ? 'http://localhost:8000/api/v1' : '');
const HEALTH_URL = import.meta.env.VITE_BACKEND_URL || (isLocalhost ? 'http://localhost:8000/health' : '');

/** Safe fetch with strict timeout and remote HTTPS localhost guard */
async function safeFetch(url: string, options: RequestInit = {}, timeoutMs: number = 1500): Promise<Response | null> {
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return res;
  } catch {
    return null;
  }
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[] | number[][];
  };
  properties: Record<string, any>;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface BackendHealth {
  status: 'healthy' | 'degraded' | 'offline';
  database: string;
  timestamp: string;
}

class ApiService {
  private getAuthHeader(role?: string): Record<string, string> {
    const activeRole = role || localStorage.getItem('gramverse_current_role') || 'panchayat';
    const devToken = `dev-${activeRole}-token`;
    return {
      'Authorization': `Bearer ${devToken}`,
      'Content-Type': 'application/json'
    };
  }

  /** Check if FastAPI backend is online and database is connected */
  async checkHealth(): Promise<BackendHealth | null> {
    try {
      const res = await safeFetch(HEALTH_URL, {}, 1200);
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // GIS & Spatial Endpoints (PostGIS / SafeGeometry)
  // --------------------------------------------------------------------------

  /** Fetch RFC 7946 GeoJSON infrastructure assets */
  async getGisAssets(villageId?: number, type?: string): Promise<GeoJSONFeatureCollection | null> {
    try {
      if (!API_BASE_URL) return null;
      const params = new URLSearchParams();
      if (villageId) params.append('village_id', villageId.toString());
      if (type) params.append('type', type);

      const url = `${API_BASE_URL}/gis/assets?${params.toString()}`;
      const res = await safeFetch(url, { headers: this.getAuthHeader() });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Fetch RFC 7946 GeoJSON complaints for heatmap & marker rendering */
  async getGisComplaints(villageId?: number, status?: string): Promise<GeoJSONFeatureCollection | null> {
    try {
      if (!API_BASE_URL) return null;
      const params = new URLSearchParams();
      if (villageId) params.append('village_id', villageId.toString());
      if (status) params.append('status', status);

      const url = `${API_BASE_URL}/gis/complaints?${params.toString()}`;
      const res = await safeFetch(url, { headers: this.getAuthHeader() });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Radius search: finds assets within R meters from given GPS coordinates */
  async getNearbyAssets(lat: number, lon: number, radiusMeters: number = 1000): Promise<GeoJSONFeatureCollection | null> {
    try {
      if (!API_BASE_URL) return null;
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        radius_meters: radiusMeters.toString()
      });
      const res = await safeFetch(`${API_BASE_URL}/gis/nearby?${params.toString()}`, { headers: this.getAuthHeader() });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // Village & Demographics Endpoints
  // --------------------------------------------------------------------------

  async getVillages(): Promise<any[] | null> {
    try {
      if (!API_BASE_URL) return null;
      const res = await safeFetch(`${API_BASE_URL}/villages`, { headers: this.getAuthHeader() });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async getVillageDetail(villageId: number): Promise<any | null> {
    try {
      if (!API_BASE_URL) return null;
      const res = await safeFetch(`${API_BASE_URL}/villages/${villageId}`, { headers: this.getAuthHeader() });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async getVillageDashboard(villageId: number): Promise<any | null> {
    try {
      if (!API_BASE_URL) return null;
      const res = await safeFetch(`${API_BASE_URL}/dashboard/village/${villageId}`, { headers: this.getAuthHeader() });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // Complaints Endpoints
  // --------------------------------------------------------------------------

  async getComplaints(villageId?: number): Promise<any[] | null> {
    try {
      if (!API_BASE_URL) return null;
      const params = new URLSearchParams();
      if (villageId) params.append('village_id', villageId.toString());
      const res = await safeFetch(`${API_BASE_URL}/complaints?${params.toString()}`, { headers: this.getAuthHeader() });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async submitComplaint(payload: {
    village_id: number;
    description: string;
    latitude?: number;
    longitude?: number;
  }): Promise<any | null> {
    try {
      if (!API_BASE_URL) return null;
      const res = await safeFetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(payload)
      });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async updateComplaintStatus(
    complaintId: number,
    status: string,
    officialRemarks?: string,
    overrideCategory?: string
  ): Promise<any | null> {
    try {
      if (!API_BASE_URL) return null;
      const res = await safeFetch(`${API_BASE_URL}/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: this.getAuthHeader('panchayat'),
        body: JSON.stringify({
          status,
          official_remarks: officialRemarks,
          official_override_category: overrideCategory
        })
      });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // --------------------------------------------------------------------------
  // Household Registry & Offline Survey Sync
  // --------------------------------------------------------------------------

  async getHouseholds(villageId?: number): Promise<any[] | null> {
    try {
      if (!API_BASE_URL) return null;
      const params = new URLSearchParams();
      if (villageId) params.append('village_id', villageId.toString());
      const res = await safeFetch(`${API_BASE_URL}/households?${params.toString()}`, { headers: this.getAuthHeader() });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async createHousehold(payload: any): Promise<any | null> {
    try {
      if (!API_BASE_URL) return null;
      const res = await safeFetch(`${API_BASE_URL}/households`, {
        method: 'POST',
        headers: this.getAuthHeader('survey'),
        body: JSON.stringify(payload)
      });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /** Batch offline survey sync to backend */
  async syncSurveys(surveys: Array<{
    client_uuid: string;
    survey_type: string;
    survey_data: Record<string, any>;
    latitude?: number;
    longitude?: number;
    household_qr_code?: string;
  }>): Promise<{
    synced_count: number;
    failed_count: number;
    results: any[];
  } | null> {
    try {
      if (!API_BASE_URL) return null;
      const res = await safeFetch(`${API_BASE_URL}/surveys/sync`, {
        method: 'POST',
        headers: this.getAuthHeader('survey'),
        body: JSON.stringify({ surveys })
      });
      if (!res || !res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}

export const apiService = new ApiService();
