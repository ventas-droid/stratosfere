// Ubicación: ./app/components/alive-map/ui-panels/useStratosFavorites.ts
import { useState, useRef } from "react";
import { toggleFavoriteAction, deleteFromStockAction } from "@/app/actions";
import { sanitizePropertyData } from "../../../utils/propertyCore";

export const useStratosFavorites = (
  systemMode: string,
  activeUserKey: string | null,
  identityVerified: boolean,
  addNotification: (msg: string) => void,
  soundEnabled: boolean,
  playSynthSound: (sound: string) => void,
  setDataVersion: (fn: any) => void,
  setActivePanel: (fn: any) => void,
  setSelectedProp: (fn: any) => void
) => {
  const [localFavs, setLocalFavs] = useState<any[]>([]);
  const [agencyLikes, setAgencyLikes] = useState<any[]>([]);
  const [agencyFavs, setAgencyFavs] = useState<any[]>([]); // El stock de la agencia

  const prevFavIdsRef = useRef<Set<string>>(new Set());

  // ✅ Mirror SOLO por eventos (sin localStorage)
  const mirrorGlobalFavsForNanoCard = (list: any[]) => {
    try {
      const prevIds = prevFavIdsRef.current || new Set<string>();
      const nextIds = new Set(
        (Array.isArray(list) ? list : [])
          .map((x: any) => String(x?.id))
          .filter(Boolean)
      );

      // 1) Apagar los que ya no están
      prevIds.forEach((pid) => {
        if (!nextIds.has(pid)) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("sync-property-state", { detail: { id: pid, isFav: false } })
            );
          }
        }
      });

      // 2) Encender los nuevos
      nextIds.forEach((nid) => {
        if (!prevIds.has(nid)) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("sync-property-state", { detail: { id: nid, isFav: true } })
            );
          }
        }
      });

      // 3) Guardar snapshot en memoria (RAM)
      prevFavIdsRef.current = nextIds;
    } catch {}
  };

  // 3. TOGGLE FAVORITE (BIFURCADO: Agency Likes vs Private Likes)
  const handleToggleFavorite = async (prop: any) => {
    // A. Validaciones iniciales
    if (!prop || activeUserKey === null) return;
    if (soundEnabled) playSynthSound("click");

    const userKey = activeUserKey;

    // 🚫 SaaS puro: Validación de identidad
    if (!identityVerified || userKey === "anon") {
      addNotification("Inicia sesión para guardar Referencias");
      return;
    }

    // B. Limpieza de datos (Sanitización robusta)
    const cleaned = sanitizePropertyData(prop) || prop;

    // 🚫 Validación de ID seguro
    const safeIdRaw = cleaned?.id || prop?.id;
    if (!safeIdRaw) {
      console.warn("handleToggleFavorite: sin id real, abortado");
      return;
    }
    const safeId = String(safeIdRaw);

    // C. Selección de bóveda
    const isAgencyMode = systemMode === "AGENCY";
    const currentList = isAgencyMode ? agencyLikes : localFavs;
    const setTargetList = isAgencyMode ? setAgencyLikes : setLocalFavs;
    const targetName = isAgencyMode ? "Bóveda de Agencia" : "Favoritos Personales";

    // D. Estado actual (en la lista activa)
    const isCurrentlyFav = (Array.isArray(currentList) ? currentList : []).some(
      (f: any) => String(f?.id) === safeId
    );

    // ✅ Intención: si viene forzada (isFav), se respeta SIEMPRE (sin “redundante”)
    const desired =
      typeof prop?.isFav === "boolean" ? prop.isFav : !isCurrentlyFav;

    // Construimos el objeto seguro para guardar (solo si desired=true)
    const safeProp = {
      ...cleaned,
      id: safeId,
      title: cleaned?.title || prop?.title || "Propiedad",
      formattedPrice: cleaned?.formattedPrice || cleaned?.price || "Consultar",
      savedAt: Date.now(),
      isFavorited: true,
      isFav: true,
      isFavorite: true,
    };

    const dedupeById = (list: any[]) => {
      const m = new Map<string, any>();
      (Array.isArray(list) ? list : []).forEach((x: any) => {
        const id = x?.id != null ? String(x.id) : "";
        if (!id) return;
        m.set(id, x);
      });
      return Array.from(m.values());
    };

    // ✅ Broadcast TRIPLE (Details + NanoCard + Vault)
    const broadcastFav = (status: boolean) => {
      if (typeof window === "undefined") return;

      window.dispatchEvent(
        new CustomEvent("sync-property-state", { detail: { id: safeId, isFav: status } })
      );

      window.dispatchEvent(
        new CustomEvent("update-property-signal", {
          detail: { id: safeId, updates: { isFav: status, isFavorite: status, isFavorited: status } },
        })
      );

      window.dispatchEvent(
        new CustomEvent("fav-change-signal", { detail: { id: safeId, isFavorite: status } })
      );
    };

    // E. Snapshot para rollback
    const prevListSnapshot = Array.isArray(currentList) ? [...currentList] : [];

    // 1) Optimistic UI (lista)
    setTargetList((prev: any[]) => {
      const base = Array.isArray(prev) ? prev : [];
      if (desired) return dedupeById([...base, safeProp]);
      return base.filter((x: any) => String(x?.id) !== safeId);
    });

    // 2) Optimistic UI (Details si está abierta esa prop)
    setSelectedProp((prev: any) => {
      if (!prev) return prev;
      if (String(prev?.id) !== safeId) return prev;
      return { ...prev, isFav: desired, isFavorited: desired, isFavorite: desired };
    });

    addNotification(desired ? `Guardado en ${targetName}` : `Eliminado de ${targetName}`);
    broadcastFav(!!desired);

    // 3) Servidor (source of truth)
    try {
      const res: any = await toggleFavoriteAction(String(safeId), !!desired);

      const serverState =
        typeof res?.isFavorite === "boolean"
          ? res.isFavorite
          : typeof res?.data?.isFavorite === "boolean"
          ? res.data.isFavorite
          : !!desired;

      if (serverState !== !!desired) {
        setTargetList((prev: any[]) => {
          const base = Array.isArray(prev) ? prev : [];
          if (serverState) return dedupeById([...base, safeProp]);
          return base.filter((x: any) => String(x?.id) !== safeId);
        });

        setSelectedProp((prev: any) => {
          if (!prev) return prev;
          if (String(prev?.id) !== safeId) return prev;
          return { ...prev, isFav: serverState, isFavorited: serverState, isFavorite: serverState };
        });

        broadcastFav(!!serverState);
      } else {
        broadcastFav(!!serverState);
      }
    } catch (error) {
      console.error(error);
      setTargetList(prevListSnapshot);
      setSelectedProp((prev: any) => {
        if (!prev) return prev;
        if (String(prev?.id) !== safeId) return prev;
        return { ...prev, isFav: isCurrentlyFav, isFavorited: isCurrentlyFav, isFavorite: isCurrentlyFav };
      });
      broadcastFav(!!isCurrentlyFav);
      addNotification("❌ Error guardando en servidor");
    }
  };

  // 🔥 4. NUEVA FUNCIÓN: BORRADO LETAL DE AGENCIA
  const handleDeleteAgencyAsset = async (asset: any) => {
    if (!asset) return;
    if (soundEnabled) playSynthSound("click");

    const targetId = String(asset?.id || asset || "").trim();
    if (!targetId) return;

    const isOwnerHint = asset?.isOwner === true;

    setAgencyFavs((prev: any[]) =>
      (Array.isArray(prev) ? prev : []).filter((x: any) => String(x?.id) !== targetId)
    );

    setSelectedProp((prev: any) => {
      if (!prev) return prev;
      if (String(prev?.id) !== targetId) return prev;
      return { ...prev, isFav: false, isFavorited: false, isFavorite: false };
    });

    addNotification("Eliminando de Base de Datos...");

    try {
      const result: any = await deleteFromStockAction(targetId);

      if (!result?.success) {
        addNotification("❌ Error al borrar");
        setDataVersion((v: number) => v + 1);
        return;
      }

      const type =
        result?.type ||
        (isOwnerHint ? "property_deleted" : "favorite_removed");

      if (type === "favorite_removed" || type === "favorite_noop") {
        setAgencyLikes((prev: any[]) =>
          (Array.isArray(prev) ? prev : []).filter((x: any) => String(x?.id) !== targetId)
        );
        setLocalFavs((prev: any[]) =>
          (Array.isArray(prev) ? prev : []).filter((x: any) => String(x?.id) !== targetId)
        );
        addNotification("✅ Eliminado de Favoritos");
      }

      if (type === "property_deleted") {
        setAgencyLikes((prev: any[]) =>
          (Array.isArray(prev) ? prev : []).filter((x: any) => String(x?.id) !== targetId)
        );
        setLocalFavs((prev: any[]) =>
          (Array.isArray(prev) ? prev : []).filter((x: any) => String(x?.id) !== targetId)
        );

        setActivePanel((p: any) => {
          setSelectedProp((prev: any) => {
             const isThisOpen = String(prev?.id || "") === targetId;
             if (p === "DETAILS" && isThisOpen) return "NONE";
             return p;
          })
          return p; // Retornamos P para no romper la firma, el set anterior hace el trabajo real
        });

        addNotification("✅ Propiedad eliminada permanentemente");
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sync-property-state", { detail: { id: targetId, isFav: false } })
        );
      }

      setDataVersion((v: number) => v + 1);
    } catch (e) {
      console.error(e);
      addNotification("❌ Error al borrar");
      setDataVersion((v: number) => v + 1);
    }
  };

  return {
    localFavs,
    setLocalFavs,
    agencyLikes,
    setAgencyLikes,
    agencyFavs,
    setAgencyFavs,
    handleToggleFavorite,
    handleDeleteAgencyAsset,
    mirrorGlobalFavsForNanoCard,
  };
};