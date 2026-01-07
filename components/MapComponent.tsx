
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GEOJSON_URL, PROVINCE_TO_REGION, DOWNLOAD_LINKS } from '../constants';
import { BaseMapType } from '../types';

declare var ol: any;

interface MapComponentProps {
  selectedProvince: string | null;
  onProvinceClick: (name: string | null) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ selectedProvince, onProvinceClick }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const popupElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  
  const [baseMap, setBaseMap] = useState<BaseMapType>('OSM');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [coords, setCoords] = useState({ lat: 0, lon: 0 });
  const [isLayersExpanded, setIsLayersExpanded] = useState(false);

  const getProvinceName = useCallback((feature: any) => {
    const props = feature.getProperties();
    const possibleKeys = ["NOM-PROV", "NOM_PROV", "name", "NAME", "nom", "Nom", "الاقليم", "الإقليم"];
    for (let key of possibleKeys) {
      if (props[key]) return props[key];
    }
    return null;
  }, []);

  useEffect(() => {
    if (!mapElement.current || !popupElement.current) return;

    const vectorSource = new ol.source.Vector({
      url: GEOJSON_URL,
      format: new ol.format.GeoJSON()
    });

    const vectorLayer = new ol.layer.Vector({
      source: vectorSource,
      style: (feature: any) => {
        const name = getProvinceName(feature);
        const isSelected = name === selectedProvince;
        
        return new ol.style.Style({
          stroke: new ol.style.Stroke({ 
            color: isSelected ? "#facc15" : "#1e293b", 
            width: isSelected ? 3.5 : 1 
          }),
          fill: new ol.style.Fill({ 
            color: isSelected ? "rgba(250,204,21,0.3)" : "rgba(30,41,59,0.03)" 
          }),
          text: new ol.style.Text({
            text: name || "",
            font: isSelected ? "bold 14px Arial" : "11px Arial",
            fill: new ol.style.Fill({ color: isSelected ? "#000" : "#64748b" }),
            stroke: new ol.style.Stroke({ color: "#fff", width: 2.5 })
          })
        });
      }
    });

    const osmLayer = new ol.layer.Tile({ source: new ol.source.OSM(), visible: true, name: 'OSM' });
    const satelliteLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      }),
      visible: false,
      name: 'Satellite'
    });
    const terrainLayer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: "https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
      }),
      visible: false,
      name: 'Terrain'
    });

    const overlay = new ol.Overlay({
      element: popupElement.current,
      autoPan: { animation: { duration: 250 } },
      positioning: 'bottom-center',
      stopEvent: true,
      offset: [0, -20]
    });
    overlayRef.current = overlay;

    const map = new ol.Map({
      target: mapElement.current,
      layers: [osmLayer, satelliteLayer, terrainLayer, vectorLayer],
      overlays: [overlay],
      view: new ol.View({
        center: ol.proj.fromLonLat([-7.9, 31.6]),
        zoom: 6,
        maxZoom: 18,
        minZoom: 5
      })
    });

    mapRef.current = map;

    // IMMEDIATE SINGLE CLICK FEEDBACK
    map.on("singleclick", (evt: any) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f: any) => f);
      if (feature) {
        const name = getProvinceName(feature);
        if (name) {
          onProvinceClick(name);
          // Force immediate overlay update
          overlay.setPosition(ol.extent.getCenter(feature.getGeometry().getExtent()));
        }
      } else {
        onProvinceClick(null);
        overlay.setPosition(undefined);
      }
    });

    map.on("pointermove", (evt: any) => {
      const coordinate = ol.proj.toLonLat(evt.coordinate);
      setCoords({ lon: coordinate[0], lat: coordinate[1] });
      
      const pixel = map.getEventPixel(evt.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    return () => map.setTarget(undefined);
  }, [onProvinceClick, getProvinceName]);

  // SYNC STATE CHANGES (Selection & Zoom)
  useEffect(() => {
    if (!mapRef.current || !overlayRef.current) return;
    
    const vectorLayer = mapRef.current.getLayers().getArray().find((l: any) => l instanceof ol.layer.Vector);
    if (vectorLayer) {
      vectorLayer.changed(); // Redraw vector styles
      
      if (selectedProvince) {
        const source = vectorLayer.getSource();
        const features = source.getFeatures();
        const feature = features.find((f: any) => getProvinceName(f) === selectedProvince);
        
        if (feature) {
          const geometry = feature.getGeometry();
          const extent = geometry.getExtent();
          const center = ol.extent.getCenter(extent);
          
          overlayRef.current.setPosition(center);
          
          // Tight Zoom-In Logic
          mapRef.current.getView().fit(extent, { 
            duration: 1000, 
            padding: [80, 80, 80, 80], // Less padding for tighter zoom
            maxZoom: 13, // Slightly deeper zoom level
            easing: ol.easing.easeOut
          });
        }
      } else {
        overlayRef.current.setPosition(undefined);
      }
    }
  }, [selectedProvince, getProvinceName]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.getLayers().getArray().forEach((layer: any) => {
      if (layer instanceof ol.layer.Tile) {
        layer.setVisible(layer.get('name') === baseMap);
      }
    });
  }, [baseMap]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 3) { setSuggestions([]); return; }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ", Maroc")}&limit=5`);
      setSuggestions(await res.json());
    } catch (err) { console.error(err); }
  };

  const goToLocation = (lon: string, lat: string, label: string) => {
    if (!mapRef.current) return;
    const coord = ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)]);
    mapRef.current.getView().animate({ center: coord, zoom: 12, duration: 1000 });
    setSearchQuery(label);
    setSuggestions([]);
    setIsSearchExpanded(false);
  };

  return (
    <div className="w-full h-full relative group/map overflow-hidden">
      <div ref={mapElement} className="w-full h-full" />
      
      {/* --- MAP ANCHORED POPUP --- */}
      <div 
        ref={popupElement} 
        className={`bg-white/98 backdrop-blur-lg shadow-[0_20px_50px_rgba(0,0,0,0.25)] rounded-[2rem] border border-slate-200 p-5 w-64 z-[500] pointer-events-auto transition-all duration-300 transform origin-bottom ${!selectedProvince ? 'opacity-0 scale-90 translate-y-2 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}`}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 overflow-hidden pr-2">
            <h4 className="text-sm font-black text-slate-900 truncate leading-tight uppercase tracking-tight">{selectedProvince}</h4>
            <span className="text-[10px] text-blue-600 font-black uppercase tracking-widest block opacity-70 mt-1">
              {selectedProvince ? (PROVINCE_TO_REGION[selectedProvince] || "Région du Royaume") : ""}
            </span>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onProvinceClick(null); overlayRef.current.setPosition(undefined); }}
            className="text-slate-300 hover:text-red-500 transition-colors p-1"
          >
            <i className="fas fa-times-circle text-xl"></i>
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="text-[10px] text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex items-center gap-2">
            <i className="fas fa-at text-blue-500 text-xs"></i>
            <span className="truncate font-semibold select-all">contact@cartomaroc.com</span>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const link = DOWNLOAD_LINKS[selectedProvince || ''];
                if(link) window.open(link, '_blank');
                else alert("Base de données non disponible pour cette zone.");
              }} 
              className="flex-1 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all text-[10px] font-black uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-blue-200 active:scale-90"
            >
              <i className="fas fa-database"></i> Base
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                const msg = `Bonjour, je suis intéressé par la base de données CadGIS pour la province de (${selectedProvince}).`;
                window.open(`https://wa.me/212668090285?text=${encodeURIComponent(msg)}`, '_blank');
              }} 
              className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all text-[10px] font-black uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-200 active:scale-90"
            >
              <i className="fab fa-whatsapp text-sm"></i> WhatsApp
            </button>
          </div>
        </div>
        {/* Pointer Arrow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-slate-200 rotate-45 rounded-sm shadow-[5px_5px_10px_rgba(0,0,0,0.05)]"></div>
      </div>

      {/* --- FLOATING MAP CONTROLS --- */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col items-end gap-3">
        <div className="flex flex-col items-end gap-1.5">
          <button 
            onClick={() => setIsLayersExpanded(!isLayersExpanded)}
            className="w-11 h-11 bg-white rounded-2xl shadow-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-blue-50 transition-all active:scale-90"
          >
            <i className="fas fa-layer-group text-lg"></i>
          </button>
          {isLayersExpanded && (
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col w-32 animate-in fade-in slide-in-from-top-2 duration-200">
              {(['OSM', 'Satellite', 'Terrain'] as BaseMapType[]).map(type => (
                <button 
                  key={type} 
                  onClick={() => { setBaseMap(type); setIsLayersExpanded(false); }} 
                  className={`px-4 py-3 text-[11px] font-black uppercase text-left transition-all ${baseMap === type ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- SEARCH BOX --- */}
      <div className="absolute top-16 md:top-4 left-4 z-[400] flex flex-col items-start">
        {!isSearchExpanded ? (
          <button 
            onClick={() => setIsSearchExpanded(true)} 
            className="w-11 h-11 bg-white rounded-2xl shadow-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-blue-50 transition-all active:scale-90"
          >
            <i className="fas fa-search"></i>
          </button>
        ) : (
          <div className="relative animate-in slide-in-from-left-4 duration-300">
            <input 
              autoFocus 
              type="text" 
              value={searchQuery} 
              onChange={handleSearch} 
              onBlur={() => searchQuery === '' && setIsSearchExpanded(false)} 
              placeholder="Rechercher une ville ou lieu..." 
              className="w-64 md:w-80 pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
            />
            <i className="fas fa-location-arrow absolute left-4 top-4 text-blue-500"></i>
            <button 
              onClick={() => setIsSearchExpanded(false)} 
              className="absolute right-4 top-4 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <i className="fas fa-times-circle text-lg"></i>
            </button>
            {suggestions.length > 0 && (
              <ul className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-sm z-[600]">
                {suggestions.map((item, idx) => (
                  <li 
                    key={idx} 
                    onClick={() => goToLocation(item.lon, item.lat, item.display_name)} 
                    className="px-5 py-4 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 truncate transition-colors font-semibold text-slate-800"
                  >
                    {item.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* --- COORDINATES BAR --- */}
      <div className="hidden md:block absolute bottom-6 right-24 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 shadow-xl pointer-events-none">
        <p className="text-[11px] font-mono text-slate-800 tracking-tighter">
          LAT: <span className="text-blue-600 font-black">{coords.lat.toFixed(2)}</span> • LON: <span className="text-blue-600 font-black">{coords.lon.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
};

export default MapComponent;
