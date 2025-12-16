// @ts-nocheck
'use client';

import React from 'react';

// IMPORTS RELATIVOS (sin alias) PARA EVITAR LÍOS
import AliveMap from '../alive-map/AliveMap';
import AgentContactCard from './AgentContactCard';

const StratosphereUI: React.FC = () => {
  return (
    // Contenedor principal: mapa de fondo + tarjeta agente encima
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 1. Mapa (fondo) */}
      <AliveMap />

      {/* 2. Tarjeta de agente (capa por encima, esquina izq) */}
      <div className="absolute top-20 left-10 z-50">
        <AgentContactCard
          name="Sarah Connor"
          codename="T-800"
          role="Tactical Ops"
          status="active"
          // onCall={() => console.log('CALL')}
          // onMessage={() => console.log('MSG')}
        />
      </div>
    </div>
  );
};

export default StratosphereUI;


