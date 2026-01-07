
import React, { useState } from 'react';
import { ProvinceData } from '../types';
import { REGIONS_LIST } from '../constants';

interface SidebarProps {
  provinces: ProvinceData[];
  onSelect: (name: string) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  regionFilter: string;
  setRegionFilter: (val: string) => void;
  selectedProvince: string | null;
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  provinces, 
  onSelect, 
  searchTerm, 
  setSearchTerm, 
  regionFilter, 
  setRegionFilter, 
  selectedProvince,
  isOpen,
  toggle
}) => {
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className={`
        hidden md:flex flex-col w-80 bg-white border-r border-slate-200 h-full transition-all duration-300 shadow-xl z-30
      `}>
        <div className="p-4 space-y-4 flex-shrink-0 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <i className="fas fa-filter mr-2 text-blue-600"></i>
            Provinces du Maroc
          </h2>
          
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une province..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
              />
              <i className="fas fa-search absolute left-3 top-2.5 text-slate-400"></i>
            </div>

            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Toutes les régions</option>
              {REGIONS_LIST.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <th className="px-4 py-3">Province</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {provinces.map((p) => (
                <tr 
                  key={p.nomFr}
                  onClick={() => onSelect(p.nomFr)}
                  className={`cursor-pointer transition-colors hover:bg-blue-50 ${selectedProvince === p.nomFr ? 'bg-blue-100 border-l-4 border-blue-600' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{p.nomFr}</div>
                    <div className="text-[10px] text-slate-500">{p.region}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <i className={`fas ${p.downloadUrl ? 'fa-download text-emerald-500' : 'fa-info-circle text-slate-300'}`}></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM PANEL --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1100] bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] rounded-t-[2.5rem] transition-all duration-300">
        <div className="p-5 space-y-4">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-2"></div>
          
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Province..."
                className="w-full pl-9 pr-4 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <i className="fas fa-search absolute left-3.5 top-3.5 text-slate-400 text-sm"></i>
            </div>
            
            <button 
              onClick={() => setIsMobileListOpen(!isMobileListOpen)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 ${isMobileListOpen ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'}`}
            >
              <i className={`fas ${isMobileListOpen ? 'fa-times' : 'fa-list-ul'}`}></i>
              <span>{isMobileListOpen ? 'Fermer' : 'Liste'}</span>
            </button>
          </div>

          <div className="relative">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-semibold text-slate-700 shadow-sm"
            >
              <option value="">Filtrer par Région</option>
              {REGIONS_LIST.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-4 top-4 text-slate-400 pointer-events-none text-xs"></i>
          </div>

          {/* Collapsible Mobile List */}
          {isMobileListOpen && (
            <div className="max-h-[40vh] overflow-y-auto mt-4 pt-2 border-t border-slate-50 animate-in slide-in-from-bottom-4 duration-300">
              <div className="grid grid-cols-1 gap-2 pb-4">
                {provinces.length > 0 ? provinces.map((p) => (
                  <button
                    key={p.nomFr}
                    onClick={() => {
                      onSelect(p.nomFr);
                      setIsMobileListOpen(false);
                    }}
                    className={`flex items-center justify-between p-3.5 rounded-2xl text-sm border transition-all ${
                      selectedProvince === p.nomFr 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-slate-700 border-slate-100 hover:border-blue-200'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-bold">{p.nomFr}</div>
                      <div className={`text-[10px] ${selectedProvince === p.nomFr ? 'text-blue-100' : 'text-slate-500'}`}>{p.region}</div>
                    </div>
                    <i className="fas fa-chevron-right opacity-30 text-[10px]"></i>
                  </button>
                )) : (
                  <div className="text-center py-10 text-slate-400 italic text-sm">Aucun résultat</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
