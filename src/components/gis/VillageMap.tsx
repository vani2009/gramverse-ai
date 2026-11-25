import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Complaint, InfrastructureAsset, Village } from '../../types';
import { Layers, MapPin, AlertCircle, Search, Filter, Globe2 } from 'lucide-react';
import { apiService } from '../../services/apiService';

// Fix leaflet default icon assets if standard markers are ever created
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface VillageMapProps {
  village: Village;
  complaints: Complaint[];
  infrastructure: InfrastructureAsset[];
  allVillages?: Village[];
  allowBlockFilter?: boolean;
  initialBlock?: string;
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: Complaint) => void;
  onSelectVillage?: (village: Village) => void;
  height?: string;
  title?: string;
}

export const VillageMap: React.FC<VillageMapProps> = ({
  village,
  complaints,
  infrastructure,
  allVillages,
  allowBlockFilter = true,
  initialBlock = 'all',
  selectedComplaintId,
  onSelectComplaint,
  onSelectVillage,
  height = '500px',
  title
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const boundariesLayerRef = useRef<L.LayerGroup | null>(null);
  const radiusLayerRef = useRef<L.LayerGroup | null>(null);

  const villageList = allVillages && allVillages.length > 0 ? allVillages : [village];
  const availableBlocks = Array.from(new Set(villageList.map(v => v.block)));

  // Filter states
  const [selectedBlock, setSelectedBlock] = useState<string>(initialBlock);
  const [selectedVillageId, setSelectedVillageId] = useState<string>(
    allowBlockFilter && initialBlock === 'all' ? 'all' : village.id
  );

  const [filterLayer, setFilterLayer] = useState<{
    showComplaints: boolean;
    showInfra: boolean;
    showResolved: boolean;
  }>({
    showComplaints: true,
    showInfra: true,
    showResolved: false
  });

  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [proximityMode, setProximityMode] = useState(false);
  const [proximityRadius, setProximityRadius] = useState<number>(1000);
  const [, setNearbyResults] = useState<{ count: number; center: [number, number] } | null>(null);

  // Sync initialBlock prop changes
  useEffect(() => {
    if (initialBlock) {
      setSelectedBlock(initialBlock);
      if (initialBlock !== 'all') {
        const firstInBlock = villageList.find(v => v.block.toLowerCase() === initialBlock.toLowerCase());
        if (firstInBlock && selectedVillageId !== 'all') {
          setSelectedVillageId(firstInBlock.id);
        }
      }
    }
  }, [initialBlock]);

  // Check backend PostGIS health on mount
  useEffect(() => {
    let mounted = true;
    apiService.checkHealth().then(health => {
      if (mounted) {
        setIsBackendConnected(!!(health && health.status === 'healthy'));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Filter villages by block
  const blockVillages = selectedBlock === 'all'
    ? villageList
    : villageList.filter(v => v.block.toLowerCase() === selectedBlock.toLowerCase());

  // Filtered dataset according to block and village selections
  const displayedComplaints = complaints.filter(cmp => {
    const vMatch = villageList.find(v => v.id === cmp.villageId);
    const blockMatches = selectedBlock === 'all' || (vMatch && vMatch.block.toLowerCase() === selectedBlock.toLowerCase());
    const villageMatches = selectedVillageId === 'all' || cmp.villageId === selectedVillageId;
    return blockMatches && villageMatches;
  });

  const displayedInfrastructure = infrastructure.filter(inf => {
    const vMatch = villageList.find(v => v.id === inf.villageId);
    const blockMatches = selectedBlock === 'all' || (vMatch && vMatch.block.toLowerCase() === selectedBlock.toLowerCase());
    const villageMatches = selectedVillageId === 'all' || inf.villageId === selectedVillageId;
    return blockMatches && villageMatches;
  });

  // Helper to create custom HTML markers
  const createCustomIcon = (type: 'complaint' | 'infra', category: string, priority?: number) => {
    let bgColor = '#3b82f6';
    let iconLetter = 'I';

    if (type === 'complaint') {
      if (priority && priority >= 3000) bgColor = '#ef4444'; // Red for Critical
      else if (priority && priority >= 1500) bgColor = '#f97316'; // Orange for High
      else bgColor = '#eab308'; // Amber for Moderate
      iconLetter = '!';
    } else {
      switch (category.toLowerCase()) {
        case 'water tank':
        case 'water_tank':
        case 'handpump':
          bgColor = '#0284c7';
          iconLetter = '💧';
          break;
        case 'school':
          bgColor = '#8b5cf6';
          iconLetter = '🏫';
          break;
        case 'health sub-center':
        case 'health_center':
          bgColor = '#e11d48';
          iconLetter = '🏥';
          break;
        case 'solar streetlight':
        case 'streetlight':
        case 'transformer':
          bgColor = '#f59e0b';
          iconLetter = '⚡';
          break;
        case 'road':
        case 'road stretches':
          bgColor = '#64748b';
          iconLetter = '🛣️';
          break;
        default:
          bgColor = '#10b981';
          iconLetter = '📍';
      }
    }

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          background-color: ${bgColor};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          border: 2px solid white;
          cursor: pointer;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 13px;
            font-weight: bold;
            color: white;
            text-shadow: 0 1px 2px rgba(0,0,0,0.4);
          ">${iconLetter}</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  // Perform PostGIS radius search on map click
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (!proximityMode || !mapInstanceRef.current || !radiusLayerRef.current) return;

    const { lat, lng } = e.latlng;
    const radiusLayer = radiusLayerRef.current;
    radiusLayer.clearLayers();

    // Draw visual buffer circle
    L.circle([lat, lng], {
      radius: proximityRadius,
      color: '#0284c7',
      fillColor: '#38bdf8',
      fillOpacity: 0.18,
      weight: 2,
      dashArray: '4, 4'
    }).addTo(radiusLayer);

    const centerMarker = L.circleMarker([lat, lng], {
      radius: 6,
      color: '#0369a1',
      fillColor: '#ffffff',
      fillOpacity: 1,
      weight: 3
    }).addTo(radiusLayer);

    try {
      const geojson = await apiService.getNearbyAssets(lat, lng, proximityRadius);
      const matchCount = geojson ? geojson.features.length : 0;
      setNearbyResults({ count: matchCount, center: [lat, lng] });

      centerMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; min-width: 170px;">
          <strong>Proximity Search Center</strong><br />
          Radius: <strong>${proximityRadius} meters</strong><br />
          Assets Detected: <strong>${matchCount}</strong>
        </div>
      `).openPopup();
    } catch {
      setNearbyResults({ count: 1, center: [lat, lng] });
    }
  };

  // Initialize Leaflet Map Instance
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Determine initial center and zoom based on block/village
    let initialCenter: [number, number] = village.center;
    let initialZoom = 14;

    if (selectedVillageId !== 'all') {
      const targetedVillage = villageList.find(v => v.id === selectedVillageId);
      if (targetedVillage) {
        initialCenter = targetedVillage.center;
        initialZoom = 15;
      }
    } else if (selectedBlock.toLowerCase() === 'ashta') {
      initialCenter = [23.0722, 76.8400];
      initialZoom = 13;
    } else if (selectedBlock.toLowerCase() === 'bhimpur') {
      initialCenter = [21.8418, 77.6212];
      initialZoom = 14;
    } else {
      initialCenter = [22.4500, 77.2000];
      initialZoom = 8;
    }

    const map = L.map(container, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Primary: OpenStreetMap standard tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const boundariesGroup = L.layerGroup().addTo(map);
    boundariesLayerRef.current = boundariesGroup;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    const radiusGroup = L.layerGroup().addTo(map);
    radiusLayerRef.current = radiusGroup;

    map.on('click', handleMapClick);
    mapInstanceRef.current = map;

    // Trigger invalidateSize to prevent grey / blank canvas
    const t1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const t2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Map Center and Boundaries when Block or Village Selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const boundariesGroup = boundariesLayerRef.current;
    if (!map || !boundariesGroup) return;

    boundariesGroup.clearLayers();

    // Draw boundary perimeter circles and labels for active villages in scope
    blockVillages.forEach(v => {
      if (selectedVillageId !== 'all' && v.id !== selectedVillageId) return;

      L.circle(v.center, {
        radius: 1300,
        color: '#16a34a',
        fillColor: '#22c55e',
        fillOpacity: 0.08,
        dashArray: '6, 6',
        weight: 2
      }).addTo(boundariesGroup);

      // Label at center
      const labelIcon = L.divIcon({
        className: 'village-label-marker',
        html: `
          <div style="
            background: rgba(255, 255, 255, 0.92);
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            color: #065f46;
            border: 1px solid #a7f3d0;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            🏡 ${v.name} GP (${v.block} Block)
          </div>
        `,
        iconSize: [0, 0]
      });

      L.marker(v.center, { icon: labelIcon }).addTo(boundariesGroup);
    });

    // Adjust map viewport smoothly
    if (selectedVillageId !== 'all') {
      const v = villageList.find(vil => vil.id === selectedVillageId);
      if (v) {
        map.setView(v.center, 15, { animate: true });
      }
    } else if (selectedBlock.toLowerCase() === 'ashta') {
      map.setView([23.0722, 76.8400], 13, { animate: true });
    } else if (selectedBlock.toLowerCase() === 'bhimpur') {
      map.setView([21.8418, 77.6212], 14, { animate: true });
    } else {
      // Zoom out to show all blocks
      map.setView([22.4500, 77.2000], 8, { animate: true });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [selectedBlock, selectedVillageId]);

  // Update Markers when filters, complaints or infrastructure change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Plot Civic Infrastructure Assets
    if (filterLayer.showInfra) {
      displayedInfrastructure.forEach(asset => {
        const vMatch = villageList.find(v => v.id === asset.villageId);
        const blockName = vMatch ? vMatch.block : 'Block';
        const icon = createCustomIcon('infra', asset.type);
        const marker = L.marker([asset.location.lat, asset.location.lng], { icon });

        const popupContent = `
          <div style="font-family: inherit; min-width: 220px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
              <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800; color: #0284c7;">
                ${asset.type}
              </span>
              <span style="background: ${asset.condition === 'Good' ? '#dcfce7' : '#fee2e2'}; color: ${asset.condition === 'Good' ? '#15803d' : '#b91c1c'}; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">
                ${asset.condition}
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
              ${asset.name}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
              📍 ${asset.villageName} GP (${blockName} Block)
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              ${asset.location.description}
            </div>
            <div style="display: flex; gap: 6px; font-size: 11px; border-top: 1px solid #f1f5f9; padding-top: 4px;">
              <span style="color: #334155;">Beneficiaries: <strong>${asset.beneficiariesCount}</strong></span>
              <span style="color: #64748b;">• Installed ${asset.installYear}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersGroup);
      });
    }

    // 2. Plot Citizen Problems & Grievances
    if (filterLayer.showComplaints) {
      displayedComplaints.forEach(cmp => {
        if (!filterLayer.showResolved && cmp.status === 'Resolved') return;

        const vMatch = villageList.find(v => v.id === cmp.villageId);
        const blockName = vMatch ? vMatch.block : 'Block';
        const icon = createCustomIcon('complaint', cmp.category, cmp.priorityScore);
        const marker = L.marker([cmp.location.lat, cmp.location.lng], { icon });

        const isCritical = cmp.priorityScore >= 3000;
        const popupContent = `
          <div style="font-family: inherit; min-width: 240px; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="background: #fee2e2; color: #b91c1c; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 800; letter-spacing: 0.3px;">
                ⚠️ PROBLEM: ${cmp.category}
              </span>
              <span style="font-size: 11px; font-weight: 800; color: ${isCritical ? '#dc2626' : '#d97706'};">
                Score: ${cmp.priorityScore} (Sev: ${cmp.severity}/5)
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">
              ${cmp.title}
            </div>
            <div style="font-size: 11px; font-weight: 600; color: #047857; margin-bottom: 3px;">
              📍 ${cmp.villageName} GP (${blockName} Block)
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
              ${cmp.location.landmark}
            </div>
            <div style="font-size: 11px; color: #334155; margin-bottom: 6px; line-height: 1.4;">
              ${cmp.description}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 4px; font-size: 11px;">
              <span>Status: <strong style="color: ${cmp.status === 'Resolved' ? '#16a34a' : '#d97706'};">${cmp.status}</strong></span>
              <span style="color: #64748b;">Pop: ${cmp.affectedPopulation}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectComplaint) onSelectComplaint(cmp);
        });
        marker.addTo(markersGroup);

        if (selectedComplaintId === cmp.id) {
          map.panTo([cmp.location.lat, cmp.location.lng]);
          marker.openPopup();
        }
      });
    }
  }, [displayedComplaints, displayedInfrastructure, filterLayer, selectedComplaintId]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm" style={{ minHeight: height }}>
      {/* Top Left: Block & Village Selector + PostGIS status */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 text-xs max-w-[85%] sm:max-w-none">
        {/* Block Selector */}
        {allowBlockFilter && (
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200 font-semibold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={selectedBlock}
              onChange={e => {
                const nextBlock = e.target.value;
                setSelectedBlock(nextBlock);
                setSelectedVillageId('all');
              }}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Blocks (Ashta, Bhimpur)</option>
              {availableBlocks.map(blk => (
                <option key={blk} value={blk}>
                  {blk} Block {blk === 'Ashta' ? '(Sehore)' : blk === 'Bhimpur' ? '(Betul)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Village Selector */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200 font-semibold text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <select
            value={selectedVillageId}
            onChange={e => {
              const val = e.target.value;
              setSelectedVillageId(val);
              if (val !== 'all') {
                const found = villageList.find(v => v.id === val);
                if (found && onSelectVillage) onSelectVillage(found);
              }
            }}
            className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">
              {selectedBlock === 'all' ? 'All Villages in All Blocks' : `All Villages in ${selectedBlock} Block`}
            </option>
            {blockVillages.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} GP ({v.block})
              </option>
            ))}
          </select>
        </div>

        {/* PostGIS Connection Badge */}
        <div className={`px-2.5 py-1.5 rounded-xl shadow-md border backdrop-blur-md flex items-center gap-1.5 font-semibold ${
          isBackendConnected 
            ? 'bg-emerald-50/95 border-emerald-300 text-emerald-800' 
            : 'bg-amber-50/95 border-amber-300 text-amber-800'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="hidden sm:inline">{isBackendConnected ? 'PostGIS Spatial API' : 'Local GIS Cache'}</span>
        </div>

        {/* Radius Search Button */}
        <button
          onClick={() => {
            const next = !proximityMode;
            setProximityMode(next);
            if (!next && radiusLayerRef.current) {
              radiusLayerRef.current.clearLayers();
              setNearbyResults(null);
            }
          }}
          className={`px-2.5 py-1.5 rounded-xl shadow-md border backdrop-blur-md font-semibold flex items-center gap-1.5 transition ${
            proximityMode
              ? 'bg-sky-600 text-white border-sky-700 ring-2 ring-sky-300'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Click to activate proximity radius search"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{proximityMode ? `${proximityRadius}m Buffer` : 'Radius Search'}</span>
        </button>

        {proximityMode && (
          <select
            value={proximityRadius}
            onChange={e => setProximityRadius(Number(e.target.value))}
            className="px-2 py-1.5 rounded-xl bg-white shadow-md border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
          >
            <option value={500}>500m</option>
            <option value={1000}>1,000m</option>
            <option value={2000}>2,000m</option>
          </select>
        )}
      </div>

      {/* Top Right: Layer Toggles */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Layers:</span>
        </div>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterLayer.showComplaints}
            onChange={e => setFilterLayer(prev => ({ ...prev, showComplaints: e.target.checked }))}
            className="rounded text-rose-500 focus:ring-0"
          />
          <span className="text-rose-700 font-bold">Problems ({displayedComplaints.length})</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterLayer.showInfra}
            onChange={e => setFilterLayer(prev => ({ ...prev, showInfra: e.target.checked }))}
            className="rounded text-sky-500 focus:ring-0"
          />
          <span className="text-sky-700 font-bold">Assets ({displayedInfrastructure.length})</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterLayer.showResolved}
            onChange={e => setFilterLayer(prev => ({ ...prev, showResolved: e.target.checked }))}
            className="rounded text-emerald-600 focus:ring-0"
          />
          <span className="text-slate-600 font-medium hidden sm:inline">Resolved</span>
        </label>
      </div>

      {/* Title Badge (optional) */}
      {title && (
        <div className="absolute top-14 left-3 z-[1000] bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1 rounded-lg backdrop-blur-md shadow-md">
          {title}
        </div>
      )}

      {/* Legend Badge Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-[11px] text-slate-600 space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
          <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {selectedBlock === 'all'
              ? 'Multi-Block Spatial GIS View (MP)'
              : `${selectedBlock} Block Map (${blockVillages.length} Villages)`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          <span>Critical Problem / Grievance (Score &gt; 3000)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>Active Problem / Grievance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
          <span>Civic Infrastructure (Water, School, Health, Roads, Power)</span>
        </div>
      </div>

      {/* Actual Leaflet Map DOM Node */}
      <div 
        ref={mapContainerRef} 
        id="gramverse-leaflet-map"
        style={{ height: height, width: '100%', minHeight: height, backgroundColor: '#e2e8f0' }} 
        className="z-0"
      />
    </div>
  );
};
