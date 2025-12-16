// EN app/components/alive-map/useAgentLogic.tsx
// @ts-nocheck
import { useMemo, useCallback } from 'react';

const AGENTS_DATABASE = [
    { id: 'A7', name: 'Agente Estratosfera 7.0', title: 'Senior Investment Analyst', phone: '+34 91 555 1010', email: 'agent@stratosfere.com', photoUrl: 'https://placehold.co/100x100/101010/808080?text=AGENT_7', rating: 4.8, deals: 27 },
];

export const useAgentLogic = (selectedProperty: any) => {
    const agentData = useMemo(() => {
        if (!selectedProperty || !selectedProperty.id) return null;
        return AGENTS_DATABASE[0]; // Simplificado para estabilidad
    }, [selectedProperty]);

    const handleContactAgent = useCallback((method: string) => {
        if (!agentData) return;
        console.log(`[AGENCY LOG] Contactando vía ${method}`);
    }, [agentData]);

    return { agentData, handleContactAgent };
};

