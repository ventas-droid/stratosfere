"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// ==========================================
// 1. DICCIONARIOS DE COLORES Y DATOS TÁCTICOS
// ==========================================
const ratingColors = {
  A: '#387c53', B: '#689f53', C: '#b3cf55', D: '#f3d65b',
  E: '#ed9a5c', F: '#df665c', G: '#b32e2e', N_A: '#AAA'
};

// ==========================================
// 2. ESTILOS EDITORIALES "STRATOS BLACK PREMIUM"
// ==========================================
const styles = StyleSheet.create({
  page: {
    paddingTop: 0, paddingLeft: 0, paddingRight: 0, paddingBottom: 90,
    fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', flexDirection: 'column',
  },

  heroSection: { position: 'relative', width: '100%', height: 350, backgroundColor: '#111' },
  heroImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, backgroundColor: '#000000', opacity: 0.5 },
  heroContent: { position: 'absolute', bottom: 50, left: 35, right: 35 },
  badgeTag: { backgroundColor: '#2563EB', color: '#FFF', fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
  heroTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6, lineHeight: 1.1 },
  heroAddress: { fontSize: 10, color: '#F1F5F9', marginBottom: 10, fontWeight: 'normal' },
  heroPrice: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },

  contentWrapper: { paddingLeft: 35, paddingRight: 35, paddingTop: 10, flex: 1 },

  metricsCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginTop: -40, marginBottom: 25, justifyContent: 'space-around', borderWidth: 1, borderColor: '#E5E7EB' },
  metricItem: { alignItems: 'center', flexDirection: 'column' },
  metricValue: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  metricLabel: { fontSize: 8, color: '#64748B', textTransform: 'uppercase', marginTop: 4, letterSpacing: 0.5 },

  twoColLayout: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  mainCol: { width: '58%' },
  sideCol: { width: '38%' },

  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#0F172A', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 4 },
  descriptionText: { fontSize: 9, lineHeight: 1.6, color: '#475569', textAlign: 'justify' },

  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  featureBullet: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#2563EB', marginRight: 6 },
  featureText: { fontSize: 9, color: '#334155' },

  energySection: { marginTop: 20, marginBottom: 10, padding: 20, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#EEE', flexDirection: 'column', gap: 15 },
  energyScaleLabel: { fontSize: 9, fontWeight: 'bold', color: '#0F172A', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  energyGrid: { flexDirection: 'row', gap: 2 },
  energyBox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  energyLetter: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8' },
  pendingBadge: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE', color: '#1E40AF', fontSize: 10, fontWeight: 'bold', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', marginTop: 5 },

  agentCard: { marginBottom: 25, padding: 25, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, flexDirection: 'column', gap: 15 },
  agentHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 15, justifyContent: 'space-between' },
  agentIdentity: { flexDirection: 'row', alignItems: 'center' },
  agentLogo: { width: 48, height: 48, borderRadius: 8, objectFit: 'cover', backgroundColor: '#FFF', marginRight: 12 },
  agentBrandingText: { flexDirection: 'column' },
  agentName: { fontSize: 12, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
  agentRoleText: { fontSize: 8, color: '#2563EB', textTransform: 'uppercase', fontWeight: 'bold' },
  stratosBranding: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stratosBrandingLabel: { fontSize: 8, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 'normal', pt: 2 },
  stratosLogoText: { fontSize: 12, fontWeight: 'black', color: '#000000' },
  stratosDot: { color: '#2563EB' },
  agentDataSection: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  agentDataItem: { width: '45%', flexDirection: 'column', gap: 2 },
  agentDataLabel: { fontSize: 7, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold' },
  agentDataValue: { fontSize: 9, fontWeight: 'bold', color: '#0F172A' },

  pageTwoWrapper: { padding: 35, flex: 1, backgroundColor: '#FFF' },

  footer: { position: 'absolute', bottom: 25, left: 35, right: 35, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
  disclaimer: { fontSize: 7, color: '#A1A1AA' },
  pageNumber: { fontSize: 7, color: '#A1A1AA', fontWeight: 'bold' },

  backCoverPage: { padding: 0, backgroundColor: '#F8FAFC', flex: 1, justifyContent: 'center', alignItems: 'center' },
  backCoverLogo: { width: 120, height: 120, borderRadius: 20, objectFit: 'cover', marginBottom: 20 },
  backCoverName: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 5 },
  backCoverWeb: { fontSize: 10, color: '#64748B', marginBottom: 20 },
  backCoverBranding: { position: 'absolute', bottom: 40, alignItems: 'center' }
});

// ==========================================
// 3. FUNCIONES TÁCTICAS
// ==========================================
const formatPrice = (p: any) => {
  if (!p) return "Consultar Precio";
  const numericString = String(p).replace(/[^0-9]/g, '');
  if (!numericString) return "Consultar Precio";
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(numericString));
};

const getSafeImageUrl = (url: string) => {
  if (!url) return "https://dummyimage.com/800x600/f1f5f9/94a3b8&text=Imagen+No+Disponible";
  if (url.startsWith('data:')) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=jpg`;
};

const normalizeRole = (value: any) => String(value || "").trim().toUpperCase();

const looksAgency = (person: any) => {
  if (!person || typeof person !== "object") return false;

  const role = normalizeRole(person.role || person.badge);

  if (role === "AGENCIA" || role === "AGENCY") return true;
  if (role === "PARTICULAR") return false;

  if (person.companyName) return true;
  if (person.companyLogo) return true;
  if (person.licenseNumber) return true;
  if (person.website) return true;

  return false;
};

const resolvePdfContact = (property: any, agent: any) => {
  const prop = property || {};
  const ag = agent || {};

  const ownerSnapshot =
    prop?.ownerSnapshot && typeof prop.ownerSnapshot === "object"
      ? prop.ownerSnapshot
      : null;

  const propUser =
    prop?.user && typeof prop.user === "object"
      ? prop.user
      : null;

  const explicitOwnerParticular =
    normalizeRole(ownerSnapshot?.role) === "PARTICULAR" ||
    normalizeRole(propUser?.role) === "PARTICULAR";

  const explicitAgency =
    normalizeRole(ownerSnapshot?.role) === "AGENCIA" ||
    normalizeRole(ownerSnapshot?.role) === "AGENCY" ||
    normalizeRole(propUser?.role) === "AGENCIA" ||
    normalizeRole(propUser?.role) === "AGENCY";

  if (explicitOwnerParticular) {
    return {
      person: ownerSnapshot || propUser || ag || {},
      isAgency: false,
    };
  }

  if (explicitAgency) {
    const agencyPerson = looksAgency(propUser) ? propUser : (looksAgency(ag) ? ag : ownerSnapshot || propUser || ag || {});
    return {
      person: agencyPerson || {},
      isAgency: true,
    };
  }

  if (ownerSnapshot && !looksAgency(ownerSnapshot)) {
    return {
      person: ownerSnapshot,
      isAgency: false,
    };
  }

  if (propUser && !looksAgency(propUser)) {
    return {
      person: propUser,
      isAgency: false,
    };
  }

  if (looksAgency(ag)) {
    return {
      person: ag,
      isAgency: true,
    };
  }

  if (propUser) {
    return {
      person: propUser,
      isAgency: looksAgency(propUser),
    };
  }

  if (ownerSnapshot) {
    return {
      person: ownerSnapshot,
      isAgency: looksAgency(ownerSnapshot),
    };
  }

  return {
    person: ag || {},
    isAgency: looksAgency(ag),
  };
};

// ==========================================
// 4. COMPONENTE DEL DOSSIER PDF
// ==========================================
export const PropertyFlyer = ({ property, agent }: any) => {
  const prop = property || {};
  const ag = agent || {};

  const resolvedContact = resolvePdfContact(prop, ag);
  const pdfPerson = resolvedContact.person || {};
  const isAgencyPdf = !!resolvedContact.isAgency;

  const pdfDisplayName = isAgencyPdf
    ? (pdfPerson.companyName || pdfPerson.name || "Agencia Partner Stratosfere")
    : (pdfPerson.name || pdfPerson.companyName || "Cliente Particular");

  const pdfRoleText = isAgencyPdf ? "Agente Gestor Exclusivo" : "Cliente Particular";
  const pdfBrandingLabel = isAgencyPdf ? "Socio de" : "Cliente de";

  const pdfPhone = pdfPerson.mobile || pdfPerson.phone || "";
  const pdfEmail = pdfPerson.email || "";
  const pdfWebsite = pdfPerson.website || "";
  const pdfAddress = pdfPerson.address || pdfPerson.hqAddress || "";
  const pdfZone = pdfPerson.zone || "";

  let allImages = prop.images || [];
  if (!Array.isArray(allImages)) allImages = prop.mainImage ? [prop.mainImage] : [];
  if (allImages.length === 0 && prop.mainImage) allImages = [prop.mainImage];
  if (allImages.length === 0 && prop.img) allImages = [prop.img];

  const imageUrls = allImages.map((i: any) => getSafeImageUrl(typeof i === 'string' ? i : i.url));
  const heroImg = imageUrls.length > 0 ? imageUrls[0] : getSafeImageUrl("");

  const extraImages = imageUrls.slice(1);

  const imageRows = [];
  for (let i = 0; i < extraImages.length; i += 2) {
    imageRows.push(extraImages.slice(i, i + 2));
  }

  const agentImg = getSafeImageUrl(
    isAgencyPdf
      ? (pdfPerson.companyLogo || pdfPerson.avatar || "")
      : (pdfPerson.avatar || pdfPerson.companyLogo || "")
  );

  const featuresSet = new Set<string>();
  if (prop.type) featuresSet.add(`Tipo: ${prop.type.charAt(0).toUpperCase() + prop.type.slice(1)}`);
  if (prop.communityFees && Number(String(prop.communityFees).replace(/[^0-9.]/g, '')) > 0) {
    featuresSet.add(`Comunidad: ${Number(String(prop.communityFees).replace(/[^0-9.]/g, ''))}€/m`);
  }

  const getNiceLabel = (key: string) => {
    const map: Record<string, string> = {
      'pool': 'Piscina Privada', 'garage': 'Garaje Incluido', 'garden': 'Jardín',
      'elevator': 'Ascensor', 'terrace': 'Terraza', 'storage': 'Trastero',
      'ac': 'Aire Acondicionado', 'heating': 'Calefacción Central', 'security': 'Sistema de Seguridad',
      'furnished': 'Amueblado', 'wardrobes': 'Armarios Empotrados', 'exterior': 'Totalmente Exterior'
    };
    return map[String(key).replace(/[\[\]"']/g, "").toLowerCase().trim()] || null;
  };

  if (prop.selectedServices) {
    let raw = String(prop.selectedServices);
    if (raw.trim().startsWith('[')) raw = raw.replace(/[\[\]]/g, "");
    raw.split(',').forEach((s) => {
      const label = getNiceLabel(s);
      if (label) featuresSet.add(label);
    });
  }

  ['garage', 'pool', 'garden', 'terrace', 'elevator', 'ascensor', 'storage', 'ac', 'heating', 'furnished', 'wardrobes', 'security'].forEach(k => {
    if (prop[k] === true || prop[k] === 1 || prop[k] === "true") {
      const label = getNiceLabel(k);
      if (label) featuresSet.add(label);
    }
  });

  const featuresList = Array.from(featuresSet).slice(0, 10);
  const hasEnergyData = prop.energyConsumption || prop.energyEmissions || prop.energyPending;

  const renderRatingScale = (rating: string | undefined, label: string) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    return (
      <View>
        <Text style={styles.energyScaleLabel}>{label}</Text>
        <View style={styles.energyGrid}>
          {letters.map(letter => {
            const isActive = rating?.toUpperCase() === letter;
            const letterColor = isActive ? ratingColors[letter as keyof typeof ratingColors] : ratingColors.N_A;
            return (
              <View key={letter} style={[styles.energyBox, isActive && { backgroundColor: letterColor, borderColor: letterColor }]}>
                <Text style={[styles.energyLetter, isActive && { color: '#FFF' }]}>{letter}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Document>
      {/* ================= PÁGINA 1: FICHA TÉCNICA ================= */}
      <Page size="A4" style={styles.page}>
        <View style={styles.heroSection}>
          <Image src={heroImg} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.badgeTag}>{prop.type || "EXCLUSIVA"}</Text>
            <Text style={styles.heroTitle}>{prop.title || "Propiedad de Lujo"}</Text>
            <Text style={styles.heroAddress}>{prop.city ? String(prop.city).toUpperCase() : "UBICACIÓN PRIVADA"}</Text>
            <Text style={styles.heroPrice}>{formatPrice(prop.price)}</Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.metricsCard}>
            <View style={styles.metricItem}><Text style={styles.metricValue}>{prop.rooms || 0}</Text><Text style={styles.metricLabel}>Dormitorios</Text></View>
            <View style={styles.metricItem}><Text style={styles.metricValue}>{prop.baths || 0}</Text><Text style={styles.metricLabel}>Baños</Text></View>
            <View style={styles.metricItem}><Text style={styles.metricValue}>{prop.mBuilt || prop.m2 || 0}</Text><Text style={styles.metricLabel}>Metros M²</Text></View>
          </View>

          <View style={styles.twoColLayout}>
            <View style={styles.mainCol}>
              <Text style={styles.sectionTitle}>Memoria Descriptiva</Text>
              <Text style={styles.descriptionText}>
                {prop.description ? prop.description.replace(/<[^>]+>/g, '').substring(0, 1000) + (prop.description.length > 1000 ? '...' : '') : "Este inmueble representa una oportunidad única. Para más detalles, contacte con el agente."}
              </Text>
            </View>
            <View style={styles.sideCol}>
              <Text style={styles.sectionTitle}>Ficha Técnica</Text>
              {featuresList.length > 0 ? featuresList.map((feat, i) => (
                <View key={i} style={styles.featureItem}><View style={styles.featureBullet} /><Text style={styles.featureText}>{feat}</Text></View>
              )) : <Text style={styles.featureText}>Consultar equipamiento completo.</Text>}
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.disclaimer}>Documento informativo sin valor contractual. Ref: {prop.refCode || prop.id || 'N/A'}</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Pág. ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>

      {/* ================= PÁGINAS FLUIDAS ================= */}
      <Page size="A4" style={[styles.page, { paddingTop: 40 }]}>
        <View style={styles.pageTwoWrapper}>

          <View style={styles.agentCard} wrap={false}>
            <View style={styles.agentHeader}>
              <View style={styles.agentIdentity}>
                <Image src={agentImg} style={styles.agentLogo} />
                <View style={styles.agentBrandingText}>
                  <Text style={styles.agentName}>{pdfDisplayName}</Text>
                  <Text style={styles.agentRoleText}>{pdfRoleText}</Text>
                </View>
              </View>
              <View style={styles.stratosBranding}>
                <Text style={styles.stratosBrandingLabel}>{pdfBrandingLabel}</Text>
                <Text style={styles.stratosLogoText}>Stratosfere OS<Text style={styles.stratosDot}>.</Text></Text>
              </View>
            </View>

            <View style={styles.agentDataSection}>
              {pdfZone && isAgencyPdf && (
                <View style={styles.agentDataItem}>
                  <Text style={styles.agentDataLabel}>Zona Operativa</Text>
                  <Text style={styles.agentDataValue}>{pdfZone}</Text>
                </View>
              )}

              {pdfPhone && (
                <View style={styles.agentDataItem}>
                  <Text style={styles.agentDataLabel}>Teléfono Contacto</Text>
                  <Text style={styles.agentDataValue}>{pdfPhone}</Text>
                </View>
              )}

              {pdfAddress && (
                <View style={styles.agentDataItem}>
                  <Text style={styles.agentDataLabel}>{isAgencyPdf ? "Sede / Dirección" : "Dirección"}</Text>
                  <Text style={styles.agentDataValue}>{pdfAddress}</Text>
                </View>
              )}

              {pdfWebsite && isAgencyPdf && (
                <View style={styles.agentDataItem}>
                  <Text style={styles.agentDataLabel}>Sitio Web</Text>
                  <Text style={styles.agentDataValue}>{pdfWebsite}</Text>
                </View>
              )}

              {pdfEmail && !isAgencyPdf && (
                <View style={styles.agentDataItem}>
                  <Text style={styles.agentDataLabel}>Email Contacto</Text>
                  <Text style={styles.agentDataValue}>{pdfEmail}</Text>
                </View>
              )}
            </View>
          </View>

          {imageRows.length > 0 && (
            <View>
              <Text style={[styles.sectionTitle, { marginBottom: 15 }]} wrap={false}>Anexo Visual</Text>
              {imageRows.map((row, rowIndex) => (
                <View key={rowIndex} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }} wrap={false}>
                  {row.map((img, colIndex) => (
                    <Image key={colIndex} src={img} style={{ width: '48%', height: 160, borderRadius: 8, objectFit: 'cover', backgroundColor: '#F1F5F9' }} />
                  ))}
                </View>
              ))}
            </View>
          )}

          {hasEnergyData && (
            <View style={styles.energySection} wrap={false}>
              <View style={{ marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 6 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0F172A', textTransform: 'uppercase' }}>Certificación de Eficiencia</Text>
              </View>
              {prop.energyPending ? (
                <View style={{ alignItems: 'flex-start', gap: 5 }}>
                  <Text style={styles.energyScaleLabel}>Situación actual</Text>
                  <Text style={styles.pendingBadge}>Trámite / Exento</Text>
                  <Text style={{ fontSize: 8, color: '#64748B', fontStyle: 'italic', marginTop: 3 }}>Aún no se dispone del certificado oficial.</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 25, flexWrap: 'wrap' }}>
                  {renderRatingScale(prop.energyConsumption, "Consumo de Energía")}
                  {renderRatingScale(prop.energyEmissions, "Emisiones CO₂")}
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.disclaimer}>Documento informativo sin valor contractual. Ref: {prop.refCode || prop.id || 'N/A'}</Text>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Pág. ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>

      {/* ================= PÁGINA FINAL: CONTRAPORTADA ================= */}
      <Page size="A4" style={styles.backCoverPage}>
        <Image src={agentImg} style={styles.backCoverLogo} />
        <Text style={styles.backCoverName}>{pdfDisplayName}</Text>
        <Text style={styles.backCoverWeb}>
          {isAgencyPdf ? (pdfWebsite || pdfEmail || pdfPhone || "") : (pdfEmail || pdfPhone || "")}
        </Text>

        <View style={styles.backCoverBranding}>
          <Text style={styles.stratosBrandingLabel}>Generado con la tecnología de</Text>
          <Text style={[styles.stratosLogoText, { fontSize: 16, marginTop: 4 }]}>
            Stratosfere OS<Text style={styles.stratosDot}>.</Text>
          </Text>
        </View>
      </Page>
    </Document>
  );
};