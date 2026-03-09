import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Persona, Donacion, Documento, personas as mockPersonas, UMBRAL_IDENTIFICACION, UMBRAL_AVISO } from "@/data/mockData";

interface PersonasContextType {
  personas: Persona[];
  addDonacion: (params: {
    nombreDonante: string;
    tipoPersona: "fisica" | "moral";
    monto: number;
    fecha: string;
    metodoPago?: string;
    rfc?: string;
  }) => Persona;
  getPersona: (id: string) => Persona | undefined;
}

const PersonasContext = createContext<PersonasContextType | null>(null);

export function usePersonas() {
  const ctx = useContext(PersonasContext);
  if (!ctx) throw new Error("usePersonas must be used within PersonasProvider");
  return ctx;
}

function buildDefaultDocs(tipo: "fisica" | "moral"): Documento[] {
  if (tipo === "moral") {
    return [
      { id: `d-${Date.now()}-1`, tipo: "Acta Constitutiva", nombre: "", fechaCarga: "", estado: "pendiente" },
      { id: `d-${Date.now()}-2`, tipo: "Constancia de Situación Fiscal", nombre: "", fechaCarga: "", estado: "pendiente" },
      { id: `d-${Date.now()}-3`, tipo: "Poder Notarial", nombre: "", fechaCarga: "", estado: "pendiente" },
      { id: `d-${Date.now()}-4`, tipo: "INE del Representante", nombre: "", fechaCarga: "", estado: "pendiente" },
      { id: `d-${Date.now()}-5`, tipo: "Comprobante de Domicilio", nombre: "", fechaCarga: "", estado: "pendiente" },
    ];
  }
  return [
    { id: `d-${Date.now()}-1`, tipo: "INE", nombre: "", fechaCarga: "", estado: "pendiente" },
    { id: `d-${Date.now()}-2`, tipo: "Constancia de Situación Fiscal", nombre: "", fechaCarga: "", estado: "pendiente" },
    { id: `d-${Date.now()}-3`, tipo: "Comprobante de Domicilio", nombre: "", fechaCarga: "", estado: "pendiente" },
  ];
}

function findExistingPersona(personas: Persona[], nombre: string, rfc?: string): Persona | undefined {
  if (rfc) {
    const byRfc = personas.find((p) => p.rfc.toLowerCase() === rfc.toLowerCase());
    if (byRfc) return byRfc;
  }
  // Match by full name (nombre + apellidos combined)
  const normalizedName = nombre.trim().toLowerCase();
  return personas.find(
    (p) => `${p.nombre} ${p.apellidos}`.trim().toLowerCase() === normalizedName
  );
}

export function PersonasProvider({ children }: { children: ReactNode }) {
  const [personasList, setPersonasList] = useState<Persona[]>(() => [...mockPersonas]);

  const getPersona = useCallback(
    (id: string) => personasList.find((p) => p.id === id),
    [personasList]
  );

  const addDonacion = useCallback(
    (params: {
      nombreDonante: string;
      tipoPersona: "fisica" | "moral";
      monto: number;
      fecha: string;
      metodoPago?: string;
      rfc?: string;
    }) => {
      const newDonacion: Donacion = {
        id: `don-${Date.now()}`,
        fecha: params.fecha,
        monto: params.monto,
        metodoPago: params.metodoPago || "Transferencia",
        notificada: false,
      };

      let resultPersona: Persona;

      setPersonasList((prev) => {
        const existing = findExistingPersona(prev, params.nombreDonante, params.rfc);

        if (existing) {
          // Update existing persona
          const updated = prev.map((p) => {
            if (p.id !== existing.id) return p;
            const updatedDonaciones = [newDonacion, ...p.donaciones];
            const totalDonado = updatedDonaciones.reduce((s, d) => s + d.monto, 0);
            const maxDonacion = Math.max(...updatedDonaciones.map((d) => d.monto));
            const montoRef = Math.max(totalDonado, maxDonacion);
            return {
              ...p,
              donaciones: updatedDonaciones,
              notificacionPendiente: montoRef >= UMBRAL_AVISO ? true : p.notificacionPendiente,
            };
          });
          resultPersona = updated.find((p) => p.id === existing.id)!;
          return updated;
        } else {
          // Create new persona
          const nameParts = params.nombreDonante.trim().split(" ");
          const nombre = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(" ");
          const apellidos = nameParts.slice(Math.ceil(nameParts.length / 2)).join(" ") || "";
          const tipoDonante = params.tipoPersona === "moral" ? "Persona Moral" : "Persona Física";

          const totalDonado = params.monto;
          const needsNotification = totalDonado >= UMBRAL_AVISO;

          const newPersona: Persona = {
            id: `p-${Date.now()}`,
            nombre,
            apellidos,
            tipoDonante,
            rfc: params.rfc || "POR CAPTURAR",
            email: "",
            telefono: "",
            documentos: buildDefaultDocs(params.tipoPersona),
            donaciones: [newDonacion],
            notificacionPendiente: needsNotification,
          };

          resultPersona = newPersona;
          return [...prev, newPersona];
        }
      });

      return resultPersona!;
    },
    []
  );

  return (
    <PersonasContext.Provider value={{ personas: personasList, addDonacion, getPersona }}>
      {children}
    </PersonasContext.Provider>
  );
}
