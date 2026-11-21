import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Complaint, InfrastructureAsset, Village } from '../../types';
import { Layers, MapPin, AlertCircle, Wrench, ShieldAlert } from 'lucide-react';

interface VillageMapProps {
  village: Village;
  complaints: Complaint[];
  infrastructure: InfrastructureAsset[];
  selectedComplaintId?: string | null;
  onSelectComplaint?: (complaint: Complaint) => void;
  height?: string;
}

export const VillageMap: React.FC<VillageMapProps> = ({
  village,
  complaints,
  infrastructure,
  selectedComplaintId,
  onSelectComplaint,
  height = '500px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [filterLayer, setFilterLayer] = useState<{
    showComplaints: boolean;
    showInfra: boolean;
    showResolved: boolean;
  }>({
    showComplaints: true,
    showInfra: true,
    showResolved: false
  });

  // Helper to create custom HTML markers
  const createCustomIcon = (type: 'complaint' | 'infra', category: string, priority?: number) => {
    let bgColor = '#3b82f6';
    let iconLetter = 'I';

    if (type === 'complaint') {
      if (priority && priority >= 3000) bgColor = '#ef4444'; // Red
      else if (priority && priority >= 1500) bgColor = '#f97316'; // Orange
      else bgColor = '#eab308'; // Amber
      iconLetter = '!';
    } else {
      switch (category) {
        case 'Water Tank':
        case 'Handpump':
          bgColor = '#0284c7';
          iconLetter = '💧';
          break;
        case 'School':
          bgColor = '#8b5cf6';
          iconLetter = '🏫';
          break;
        case 'Health Sub-Center':
          bgColor = '#e11d48';
          iconLetter = '🏥';
          break;
        case 'Solar Streetlight':
        case 'Transformer':
          bgColor = '#f59e0b';
          iconLetter = '⚡';
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
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
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

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: village.center,
        zoom: 15,
        zoomControl: true
      });

      // CartoDB Voyager tiles (clean, professional, modern map style)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      // Village perimeter circle
      L.circle(village.center, {
        radius: 950,
        color: '#16a34a',
        fillColor: '#22c55e',
        fillOpacity: 0.06,
        dashArray: '6, 6',
        weight: 2
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(village.center, 15);
    }

    return () => {
      // Don't necessarily destroy on re-render, keep instance
    };
  }, [village]);

  // Update Markers when filters or data change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const markersGroup = markersLayerRef.current;
    markersGroup.clearLayers();

    // 1. Plot Infrastructure
    if (filterLayer.showInfra) {
      infrastructure.forEach(asset => {
        const icon = createCustomIcon('infra', asset.type);
        const marker = L.marker([asset.location.lat, asset.location.lng], { icon });

        const popupContent = `
          <div style="font-family: inherit; min-width: 190px;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: #0284c7; margin-bottom: 2px;">
              ${asset.type}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
              ${asset.name}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
              📍 ${asset.location.description}
            </div>
            <div style="display: flex; gap: 6px; font-size: 11px;">
              <span style="background: ${asset.condition === 'Good' ? '#dcfce7' : '#fee2e2'}; color: ${asset.condition === 'Good' ? '#15803d' : '#b91c1c'}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                ${asset.condition}
              </span>
              <span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px;">
                Beneficiaries: ${asset.beneficiariesCount}
              </span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(markersGroup);
      });
    }

    // 2. Plot Complaints
    if (filterLayer.showComplaints) {
      complaints.forEach(cmp => {
        if (!filterLayer.showResolved && cmp.status === 'Resolved') return;

        const icon = createCustomIcon('complaint', cmp.category, cmp.priorityScore);
        const marker = L.marker([cmp.location.lat, cmp.location.lng], { icon });

        const popupContent = `
          <div style="font-family: inherit; min-width: 220px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="background: #e0f2fe; color: #0369a1; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                ${cmp.category}
              </span>
              <span style="font-size: 11px; font-weight: 700; color: ${cmp.priorityScore >= 3000 ? '#dc2626' : '#d97706'};">
                Score: ${cmp.priorityScore}
              </span>
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
              ${cmp.title}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
              ${cmp.location.landmark}
            </div>
            <div style="font-size: 11px; background: #f8fafc; border-left: 3px solid #3b82f6; padding: 4px 6px; border-radius: 2px; margin-bottom: 6px;">
              <strong>AI Detection:</strong> ${(cmp.aiOutput.confidence * 100).toFixed(0)}% confident (${cmp.aiOutput.predictedCategory})
            </div>
            <div style="font-size: 11px; color: #334155;">
              Status: <strong>${cmp.status}</strong>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          if (onSelectComplaint) onSelectComplaint(cmp);
        });
        marker.addTo(markersGroup);

        // Highlight selected complaint
        if (selectedComplaintId === cmp.id && mapInstanceRef.current) {
          mapInstanceRef.current.panTo([cmp.location.lat, cmp.location.lng]);
          marker.openPopup();
        }
      });
    }
  }, [complaints, infrastructure, filterLayer, selectedComplaintId]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      {/* Map Header / Layer Toggles */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          <span>Layers:</span>
        </div>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterLayer.showComplaints}
            onChange={e => setFilterLayer(prev => ({ ...prev, showComplaints: e.target.checked }))}
            className="rounded text-rose-500 focus:ring-0"
          />
          <span className="text-slate-600 font-medium">Grievances ({complaints.length})</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterLayer.showInfra}
            onChange={e => setFilterLayer(prev => ({ ...prev, showInfra: e.target.checked }))}
            className="rounded text-sky-500 focus:ring-0"
          />
          <span className="text-slate-600 font-medium">Assets ({infrastructure.length})</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterLayer.showResolved}
            onChange={e => setFilterLayer(prev => ({ ...prev, showResolved: e.target.checked }))}
            className="rounded text-emerald-600 focus:ring-0"
          />
          <span className="text-slate-600 font-medium">Show Resolved</span>
        </label>
      </div>

      {/* Legend Badge Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-[11px] text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
          <MapPin className="w-3 h-3 text-emerald-600" /> GIS Coordinates: {village.name} GP
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          <span>Critical Grievance (Score &gt; 3000)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span>Active Grievance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span>
          <span>Public Infrastructure Asset</span>
        </div>
      </div>

      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
    </div>
  );
};
