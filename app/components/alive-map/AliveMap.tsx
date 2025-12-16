// @ts-nocheck
"use client";

import React, { useState } from 'react';
import { useMapLogic } from './useMapLogic';
import { useAgentLogic } from './useAgentLogic'; 
import { 
  Gatekeeper, TopBar, ViewControlDock, StatusDeck, 
  OmniSearchDock, 
  FilterPanel, CommandCenterPanel, 
  TheVault, ChatPanel, ProfileDashboard,
  PropertyCaptureForm 
} from './ui-panels';
import { CORPORATE_BLUE, NEON_GLOW, TEXT_COLOR } from './data';

// --- CONFIGURACIÓN DE ESTILOS (PROTOCOLOS VISUALES) ---
const GLOBAL_STYLES = `
  /* ANIMACIÓN DE ONDA (Pulse-Ring) */
  @keyframes pulse-ring {
    0% { transform: scale(0.5); opacity: 1; }
    100% { transform: scale(3.0); opacity: 0; }
  }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
  
  /* CLASES DE UTILIDAD */
  .animate-fade-in-up { animation: fadeInUp 0.4s ease-out; }
  .animate-slide-left { animation: slideLeft 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
  
  /* ESTILOS GLOBALES */
  html, body { 
    margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; 
    background: #050505; color: ${TEXT_COLOR}; 
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
  }
  
  /* --- [KILL SWITCH] ZONA DE LIMPIEZA VISUAL MAPBOX --- */
  /* Esta sección elimina forzosamente los controles duplicados de abajo */
  .mapboxgl-ctrl-bottom-left, 
  .mapboxgl-ctrl-bottom-right,
  .mapboxgl-ctrl-top-left,
  .mapboxgl-ctrl-top-right {
    display: none !important; 
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  /* Aseguramos eliminación de botones específicos si flotan fuera de contenedores */
  .mapboxgl-ctrl-group, .mapboxgl-ctrl-compass, .mapboxgl-ctrl-zoom-in, .mapboxgl-ctrl-zoom-out {
      display: none !important;
  }
  
  /* OVERRIDES DE POPUPS */
  .mapboxgl-popup-content { background: transparent !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
  .mapboxgl-popup-tip { display: none; }
  
  /* PIN PULSANTE ACTIVO */
  .pin-wave-active {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    border-radius: 50%;
    background-color: ${CORPORATE_BLUE};
    box-shadow: ${NEON_GLOW};
    animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    z-index: -1; pointer-events: none;
  }

  /* SCROLLBARS TÁCTICOS */
  .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
  .custom-scrollbar::-webkit-scrollbar-track { background: #050505; } 
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
  
  .backdrop-blur-xl { backdrop-filter: blur(24px); } 
  .backdrop-blur-2xl { backdrop-filter: blur(40px); }
`;

const AliveMap = ({
  // 🔓 ABRIMOS PUERTAS: Aceptamos suministros del archivo Page.tsx
  externalSound, externalSoundEnabled, externalToggleSound,
  externalLang, externalSetLang, externalFavorites,
  externalOnToggleFavorite, externalOnSearch, externalOnFlyTo
}) => {
  // Lógica central extraída del Hook
  const {
    mapContainer, viewState, currentView,
    t, sound, lang, setLang, soundEnabled, toggleSound,
    handleUnlock, handleGPS, handleViewChange, handleOmniSearch,
    handleContactAgent, 
    removeFromFavs,
    setActiveTab, activeTab, 
    showFilters, setShowFilters, filters, setFilters,
    showCommandCenter, setShowCommandCenter,
    selectedProperty, setSelectedProperty,
    favorites, systemNotifs, setSystemNotifs, chatContext
  } = useMapLogic();
  
  // Lógica del Agente
  const { agentData, handleContactAgent: handleAgentContact } = useAgentLogic(selectedProperty); 

  // Estados Locales
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCaptureFormOpen, setIsCaptureFormOpen] = useState(false);
  
  // --- 🔔 ZONA DE NOTIFICACIONES (Todo junto y ordenado AQUÍ) ---
  
  // 1. Crear notificación
  const addSystemNotification = (title, desc) => {
    setSystemNotifs(prev => [{ title, desc }, ...prev]);
  };

  // 2. Borrar UNA notificación
  const removeNotification = (indexToRemove) => {
    setSystemNotifs(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // 3. Borrar TODAS
  const clearAllNotifications = () => {
    setSystemNotifs([]);
  };
  // -------------------------------------------------------------

  const handleFlyToFavorite = (fav) => {
    setSelectedProperty(fav);
    setActiveTab('map');
    setShowCommandCenter(true);
  };
  
  const openCaptureForm = () => setIsCaptureFormOpen(true);
  const closeCaptureForm = () => setIsCaptureFormOpen(false);

  // ✅ SOLUCIÓN PERFIL: Función para cerrar
  const closeProfile = () => {
    setIsProfileOpen(false);
    setActiveTab('map'); // Importante: devolvemos el foco al mapa
  };

  // LÓGICA BLINDADA: INTERRUPTOR (TOGGLE)
  const handleTabChange = (tabId) => {
    sound?.playClick(); 

    // 1. SI PULSAMOS EL MISMO BOTÓN QUE YA ESTÁ ACTIVO -> CERRAMOS
    if (activeTab === tabId && tabId !== 'map') {
      setActiveTab('map');
      if (tabId === 'profile') setIsProfileOpen(false);
      return; 
    }

    // 2. SI ES UN BOTÓN DIFERENTE -> ABRIMOS
    setActiveTab(tabId);

    // 3. GESTIÓN ESPECÍFICA DEL PERFIL
    if (tabId === 'profile') {
      setIsProfileOpen(true);
    } else {
      setIsProfileOpen(false);
    }

    // 4. LIMPIEZA TÁCTICA
    if (tabId !== 'map') setIsCaptureFormOpen(false);
  };

  
return (
    <>
      <style jsx global>{GLOBAL_STYLES}</style>
      
      <div ref={mapContainer} className="w-full h-full relative" style={{ height: '100vh', width: '100vw' }} />
      
      {viewState === 'ACTIVE' ? (
        <>
          <TopBar onGPS={handleGPS} t={t} />
          
          {/* ✅ CONTROLES ACTIVADOS */}
          <ViewControlDock 
            onViewChange={handleViewChange} 
            currentView={currentView} 
            t={t} 
            sound={sound} 
          />
          
          <StatusDeck 
            notifications={systemNotifs} 
            
            // 👇 AQUÍ ESTÁ LA CLAVE: Cambiamos 'clear' por 'clearNotifications'
            clearNotifications={() => setSystemNotifs([])} 
            
            lang={lang} 
            setLang={setLang} 
            sound={sound} 
            soundEnabled={soundEnabled} 
            toggleSound={toggleSound} 
            t={t} 
            onOpenChat={() => handleTabChange('chat')} 
            onOpenProfile={() => handleTabChange('profile')} 
          />
          
          <OmniSearchDock 
            onSearch={handleOmniSearch} 
            setActiveTab={handleTabChange} 
            activeTab={activeTab} 
            toggleFilters={() => setShowFilters(!showFilters)} 
            t={t} 
            sound={sound} 
            addNotification={addSystemNotification}
            onOpenCapture={openCaptureForm} 
          />
          
          {showFilters && (
            <FilterPanel 
              filters={filters} setFilters={setFilters} 
              onClose={() => setShowFilters(false)} t={t} sound={sound} 
            />
          )}

          {showCommandCenter && (
            <CommandCenterPanel 
              property={selectedProperty} 
              onClose={() => setShowCommandCenter(false)} 
              t={t} sound={sound} 
              onContactAgent={handleContactAgent} 
              agentData={agentData} 
              handleAgentContact={handleAgentContact} 
            />
          )}
          
          {activeTab === 'vault' && (
            <TheVault 
              favorites={favorites} 
              onClose={() => setActiveTab('map')} 
              t={t} sound={sound} 
              removeFromFavs={removeFromFavs} 
              onFlyTo={handleFlyToFavorite} 
            />
          )}

          {activeTab === 'chat' && (
            <ChatPanel t={t} sound={sound} onClose={() => setActiveTab('map')} context={chatContext} />
          )}

        </>
      ) : (
        <Gatekeeper onUnlock={handleUnlock} t={t} sound={sound} />
      )}
      
      {/* 👇 AQUÍ ESTÁ EL CAMBIO CRUCIAL PARA LAS NOTIFICACIONES 👇 */}
      {isProfileOpen && (
        <ProfileDashboard 
          t={t} 
          onClose={closeProfile} 
          sound={sound}
          notifications={systemNotifs}                  // 1. Pasamos la lista
          onRemoveNotification={removeNotification}     // 2. Pasamos el borrador individual
          onClearNotifications={clearAllNotifications}  // 3. Pasamos el borrador total
        />
      )}

      {isCaptureFormOpen && (
          <PropertyCaptureForm
              onClose={closeCaptureForm}
              t={t}
              sound={sound}
          />
      )}
      
    </>
  );
}; // Cierre del componente AliveMap

export default AliveMap;


