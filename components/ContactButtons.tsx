
import React, { useState } from 'react';

const ContactButtons: React.FC = () => {
  const [showEmailLabel, setShowEmailLabel] = useState(false);
  const emailAddress = "contact@cartomaroc.com";

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowEmailLabel(true);
    setTimeout(() => {
      setShowEmailLabel(false);
    }, 4000);
  };

  return (
    <div className="fixed bottom-32 md:bottom-6 right-6 flex flex-col space-y-4 z-[1000] items-end">
      {/* Email Button Group */}
      <div className="flex items-center space-x-3">
        {showEmailLabel && (
          <div className="bg-white px-4 py-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-200 text-slate-800 text-xs font-bold animate-in slide-in-from-right-4 fade-in duration-300">
            {emailAddress}
          </div>
        )}
        <button 
          onClick={handleEmailClick}
          className="w-12 h-12 md:w-14 md:h-14 bg-white text-blue-800 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all border border-slate-100 group"
          title="Afficher l'Email"
        >
          <i className="fas fa-envelope text-xl md:text-2xl group-hover:rotate-12 transition-transform"></i>
        </button>
      </div>

      {/* WhatsApp Button */}
      <a 
        href="https://wa.me/212668090285"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 md:w-14 md:h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all border border-emerald-400 group"
        title="WhatsApp"
      >
        <i className="fab fa-whatsapp text-2xl md:text-3xl group-hover:scale-110 transition-transform"></i>
      </a>
    </div>
  );
};

export default ContactButtons;
