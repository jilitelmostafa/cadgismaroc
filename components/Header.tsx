
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-amber-600 to-blue-800 text-white shadow-lg p-4 z-50 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-white p-1 rounded-full w-10 h-10 flex items-center justify-center text-blue-800 font-bold text-xl">
          C
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">CadGIS Morocco</h1>
          <p className="text-xs text-amber-100 hidden sm:block">Titres fonciers | Bornes | Zonage | Limites ADM</p>
        </div>
      </div>
      <div className="hidden md:flex space-x-4 text-sm font-medium">
        <span className="hover:text-amber-200 cursor-pointer">Tableau de bord</span>
        <span className="hover:text-amber-200 cursor-pointer">Cartographie</span>
        <span className="hover:text-amber-200 cursor-pointer">Rapports</span>
      </div>
    </header>
  );
};

export default Header;
