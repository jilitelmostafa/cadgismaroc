
import React, { useState, useEffect, useCallback, useRef } from 'react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ContactButtons from './components/ContactButtons';
import { ProvinceData } from './types';
import { PROVINCE_TO_REGION, DOWNLOAD_LINKS } from './constants';

const App: React.FC = () => {
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [filteredProvinces, setFilteredProvinces] = useState<ProvinceData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize data from GeoJSON logic (simplified for React)
  const loadData = useCallback(async () => {
    // In a real scenario, we'd fetch the GeoJSON and parse it here to populate the list.
    // For now, we'll derive it from our constants to ensure the list is always available.
    const uniqueProvinces = Object.keys(PROVINCE_TO_REGION).map(name => ({
      nomFr: name,
      nomAr: '—', // Placeholder if not in GeoJSON properties
      region: PROVINCE_TO_REGION[name],
      downloadUrl: DOWNLOAD_LINKS[name] || null
    }));
    setProvinces(uniqueProvinces);
    setFilteredProvinces(uniqueProvinces);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtering Logic
  useEffect(() => {
    const filtered = provinces.filter(p => {
      const matchesSearch = p.nomFr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.nomAr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = !regionFilter || p.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
    setFilteredProvinces(filtered);
  }, [searchTerm, regionFilter, provinces]);

  const handleProvinceSelect = (provinceName: string) => {
    setSelectedProvince(provinceName);
    // On mobile, maybe close sidebar after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100">
      <Header />
      
      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar for Provinces list */}
        <Sidebar 
          provinces={filteredProvinces}
          onSelect={handleProvinceSelect}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          regionFilter={regionFilter}
          setRegionFilter={setRegionFilter}
          selectedProvince={selectedProvince}
          isOpen={isSidebarOpen}
          toggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Map Area */}
        <div className="flex-1 relative">
          <MapComponent 
            selectedProvince={selectedProvince} 
            onProvinceClick={handleProvinceSelect} 
          />
          <ContactButtons />
        </div>
      </div>
    </div>
  );
};

export default App;
