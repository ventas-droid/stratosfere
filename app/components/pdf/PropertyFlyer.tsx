"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// ==========================================
// 1. ESTILOS INTELIGENTES (MULTIPÁGINA)
// ==========================================
const styles = StyleSheet.create({
  page: { 
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 80, // 🔥 IMPORTANTE: Espacio reservado para el footer en TODAS las páginas
    fontFamily: 'Helvetica', 
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
  
  // CABECERA (Solo en primera página o fija si se desea, aquí la dejamos fluida al inicio)
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
    paddingBottom: 15 
  },
  agentLogo: { 
    width: 60, 
    height: 60, 
    borderRadius: 10, 
    objectFit: 'cover', 
    backgroundColor: '#f0f0f0' 
  }, 
  agentInfo: { 
    flexDirection: 'column', 
    alignItems: 'flex-end' 
  },
  agentName: { fontSize: 12, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  agentContact: { fontSize: 9, color: '#555', marginTop: 2 },
  
  // IMAGEN HERO
  heroImage: { 
    width: '100%', 
    height: 250, 
    borderRadius: 6, 
    objectFit: 'cover', 
    marginBottom: 20,
    backgroundColor: '#f0f0f0' 
  },

  // INFO PRINCIPAL
  titleRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 5,
    alignItems: 'flex-start'
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#000', width: '65%' },
  price: { fontSize: 20, fontWeight: 'bold', color: '#000', textAlign: 'right' }, 
  address: { fontSize: 9, color: '#666', marginBottom: 15 },

  // MÉTRICAS
  metricsRow: { 
    flexDirection: 'row', 
    backgroundColor: '#F5F5F7', 
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8, 
    justifyContent: 'space-between', 
    marginBottom: 20 
  },
  metricItem: { alignItems: 'center', flexDirection: 'column' },
  metricValue: { fontSize: 12, fontWeight: 'bold', color: '#000' },
  metricLabel: { fontSize: 7, color: '#888', textTransform: 'uppercase', marginTop: 2 },

  // TEXTOS (Descripción larga)
  sectionTitle: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    color: '#000', 
    marginTop: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4
  },
  description: { 
    fontSize: 10, 
    lineHeight: 1.6, 
    color: '#444', 
    marginBottom: 20, 
    textAlign: 'justify' 
  },

  // GALERÍA EXTRA (Grid inteligente)
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridImage: {
    width: '48%', // Dos columnas
    height: 120,
    borderRadius: 6,
    marginBottom: 10,
    objectFit: 'cover',
    backgroundColor: '#eee'
  },

  // CARACTERÍSTICAS
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  featureBadge: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#e5e5e5', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 4, 
    marginBottom: 4
  },
  featureText: { fontSize: 8, color: '#555' },

  // PIE DE PÁGINA (FLOTANTE / FIJO)
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 30, 
    right: 30, 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    paddingTop: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  disclaimer: { fontSize: 7, color: '#aaa' },
  branding: { fontSize: 7, color: '#000', fontWeight: 'bold', textTransform: 'uppercase' },
  pageNumber: { fontSize: 7, color: '#aaa' }
});

const formatPrice = (p: any) => {
    if (!p) return "Consultar";
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(p));
};

export const PropertyFlyer = ({ property, agent }: any) => {
  const prop = property || {};
  const ag = agent || {};

  // Gestión de imágenes (Principal + Extras)
  let allImages = prop.images || [];
  if (!Array.isArray(allImages)) allImages = prop.mainImage ? [prop.mainImage] : [];
  if (allImages.length === 0 && prop.mainImage) allImages = [prop.mainImage];

  const heroImg = allImages.length > 0 ? allImages[0] : "https://dummyimage.com/600x400/eee/aaa&text=Stratos";
  // Tomamos hasta 6 fotos extra para el dossier (si hay más, las ignoramos para no saturar)
  const extraImages = allImages.slice(1, 7); 

  // Datos Agente
  const agentImg = ag.companyLogo || ag.avatar || "https://dummyimage.com/100x100/eee/aaa&text=Agente";


 // --- 🔥 LÓGICA DE EXTRACCIÓN MAESTRA (TIPOLOGÍA + COMUNIDAD + CARACTERÍSTICAS) 🔥 ---
  
  // A) DICCIONARIO
  const getNiceLabel = (key: string) => {
      const k = String(key).replace(/[\[\]"']/g, "").toLowerCase().trim();
      const map: Record<string, string> = {
          'pool': 'Piscina', 'piscina': 'Piscina',
          'garage': 'Garaje', 'garaje': 'Garaje', 'parking': 'Garaje',
          'garden': 'Jardín', 'jardin': 'Jardín', 'jardín': 'Jardín',
          'elevator': 'Ascensor', 'ascensor': 'Ascensor', 'lift': 'Ascensor',
          'terrace': 'Terraza', 'terraza': 'Terraza',
          'storage': 'Trastero', 'trastero': 'Trastero',
          'ac': 'Aire Acond.', 'aire': 'Aire Acond.',
          'heating': 'Calefacción', 'calefaccion': 'Calefacción',
          'security': 'Seguridad', 'seguridad': 'Seguridad', 'alarm': 'Alarma',
          'furnished': 'Amueblado', 'amueblado': 'Amueblado',
          'wardrobes': 'Armarios', 'armarios': 'Armarios',
          'exterior': 'Exterior', 'interior': 'Interior',
          'gym': 'Gimnasio', 'gimnasio': 'Gimnasio'
      };
      return map[k] || (k.charAt(0).toUpperCase() + k.slice(1));
  };

  // B) LISTA NEGRA
  const BLACKLIST = ['pack_basic', 'pack_pro', 'destacado', 'oferta', 'undefined', 'null', 'true', 'false'];

  // C) RECOLECTOR
  const uniqueFeaturesMap = new Map<string, string>();

  const addFeature = (rawKey: string) => {
      if (!rawKey) return;
      const cleanKey = String(rawKey).replace(/[\[\]"']/g, "").toLowerCase().trim();
      if (!cleanKey || BLACKLIST.includes(cleanKey)) return;
      const label = getNiceLabel(cleanKey);
      uniqueFeaturesMap.set(label, label);
  };

  // --- 1. INYECCIÓN DE DATOS ESTRUCTURALES (LO QUE FALTABA) ---
  
  // Tipología (Ej: "Tipo: Ático")
  if (prop.type) {
      const typeMap: Record<string, string> = {
          'flat': 'Piso', 'penthouse': 'Ático', 'duplex': 'Dúplex',
          'house': 'Casa', 'villa': 'Villa', 'chalet': 'Chalet',
          'studio': 'Estudio', 'commercial': 'Local', 'office': 'Oficina',
          'land': 'Terreno', 'plot': 'Parcela'
      };
      const label = typeMap[String(prop.type).toLowerCase()] || prop.type;
      // Lo ponemos al principio con un prefijo para que se entienda
      uniqueFeaturesMap.set('zzz_type', `Tipo: ${label.charAt(0).toUpperCase() + label.slice(1)}`);
  }

  // Gastos de Comunidad (Ej: "Comunidad: 78€")
  if (prop.communityFees && Number(prop.communityFees) > 0) {
      uniqueFeaturesMap.set('zzz_community', `Comunidad: ${prop.communityFees}€`);
  }

  // --- 2. FUENTE: SelectedServices ---
  if (prop.selectedServices) {
      let raw = String(prop.selectedServices);
      if (raw.trim().startsWith('[')) raw = raw.replace(/[\[\]]/g, ""); 
      const services = raw.split(',');
      services.forEach((s) => addFeature(s));
  }

  // --- 3. FUENTE: Booleanos ---
  const booleanKeys = ['garage', 'pool', 'garden', 'terrace', 'elevator', 'ascensor', 'storage', 'ac', 'heating', 'furnished', 'wardrobes', 'security'];
  booleanKeys.forEach(k => {
      if (prop[k] === true || prop[k] === 1 || prop[k] === "true") {
          addFeature(k);
      }
  });

  // D) LISTA FINAL
  const featuresList = Array.from(uniqueFeaturesMap.values());


  // 2. RECOLECTOR DE CARACTERÍSTICAS (BOOLEANOS + TEXTO)
  const featuresSet = new Set<string>();

  // A) Rastrear 'selectedServices' (Texto separado por comas)
  if (prop.selectedServices) {
      const services = Array.isArray(prop.selectedServices) 
          ? prop.selectedServices 
          : prop.selectedServices.split(',');
      
      services.forEach((s: string) => {
          const clean = s.trim().toLowerCase();
          if(clean) featuresSet.add(clean);
      });
  }

  
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        
        {/* === PIE DE PÁGINA REPETIDO (FIXED) === */}
        {/* Al poner 'fixed', esto se repite en CADA página automáticamente */}
        <View style={styles.footer} fixed>
            <Text style={styles.disclaimer}>
                Documento informativo sin valor contractual. Ref: {prop.refCode || prop.id || 'N/A'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={styles.branding}>AGENCIA PARTNER Stratosfere OS</Text>
                {/* Número de página automático */}
                <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} />
            </View>
        </View>

        {/* === CABECERA (Solo página 1) === */}
        <View style={styles.header}>
            <Image src={agentImg} style={styles.agentLogo} />
            <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{ag.companyName || ag.name || "Agencia Partner"}</Text>
                <Text style={styles.agentContact}>{ag.email || "info@stratos.os"}</Text>
                {ag.mobile ? <Text style={styles.agentContact}>Móvil: {ag.mobile}</Text> : null}
                {ag.phone ? <Text style={styles.agentContact}>Fijo: {ag.phone}</Text> : null}
                {ag.website && <Text style={styles.agentContact}>{ag.website}</Text>}
            </View>
        </View>

        {/* === CONTENIDO PRINCIPAL === */}
        <Image src={heroImg} style={styles.heroImage} />

        <View style={styles.titleRow}>
            <Text style={styles.title}>{prop.title || "Oportunidad Exclusiva"}</Text>
            <Text style={styles.price}>{formatPrice(prop.price)}</Text>
        </View>
        
        <Text style={styles.address}>
            {prop.address ? `${prop.address}, ` : ''}{prop.city || "Ubicación consultable"}
        </Text>

        <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{prop.rooms || 0}</Text>
                <Text style={styles.metricLabel}>Dormitorios</Text>
            </View>
            <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{prop.baths || 0}</Text>
                <Text style={styles.metricLabel}>Baños</Text>
            </View>
            <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{prop.mBuilt || 0} m²</Text>
                <Text style={styles.metricLabel}>Construidos</Text>
            </View>
            {prop.mPlot ? (
                <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{prop.mPlot} m²</Text>
                    <Text style={styles.metricLabel}>Parcela</Text>
                </View>
            ) : null}
        </View>

       {/* === CARACTERÍSTICAS (DINÁMICAS E INTELIGENTES) === */}
        <View wrap={false}> 
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.featuresGrid}>
                {featuresList.length > 0 ? (
                    // Aquí pintamos TODO lo que el sistema ha encontrado (Texto + Booleanos)
                    featuresList.map((feat, i) => (
                        <View key={i} style={styles.featureBadge}>
                            <Text style={styles.featureText}>{feat}</Text>
                        </View>
                    ))
                ) : (
                    // Si no hay nada, mensaje discreto
                    <Text style={{ fontSize: 9, color: '#999' }}>Consultar detalles.</Text>
                )}
            </View>
        </View>
        {/* === DESCRIPCIÓN (Puede romper página) === */}
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>
            {prop.description 
                ? prop.description.replace(/<[^>]+>/g, '') // Quitamos HTML
                : "Sin descripción detallada disponible."}
        </Text>

        {/* === GALERÍA (Puede romper página) === */}
        {extraImages.length > 0 && (
            <>
                <Text style={styles.sectionTitle} break={extraImages.length > 2}>Galería</Text>
                <View style={styles.gridContainer}>
                    {extraImages.map((img: string, i: number) => (
                        <Image key={i} src={img} style={styles.gridImage} />
                    ))}
                </View>
            </>
        )}

      </Page>
    </Document>
  );
};