import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Persona, Donacion, Documento, BeneficiarioControlador, personas as mockPersonas, UMBRAL_IDENTIFICACION, UMBRAL_AVISO } from "@/data/mockData";

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
  addBeneficiario: (personId: string, data: Omit<BeneficiarioControlador, "id" | "personId" | "fechaAlta">) => void;
  updateBeneficiario: (personId: string, beneficiarioId: string, data: Partial<Omit<BeneficiarioControlador, "id" | "personId">>) => void;
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
            beneficiariosControladores: [],
          };

          resultPersona = newPersona;
          return [...prev, newPersona];
        }
      });

      return resultPersona!;
    },
    []
  );

  const addBeneficiario = useCallback(
    (personId: string, data: Omit<BeneficiarioControlador, "id" | "personId" | "fechaAlta">) => {
      setPersonasList((prev) =>
        prev.map((p) => {
          if (p.id !== personId || p.tipoDonante !== "Persona Moral") return p;
          const nuevo: BeneficiarioControlador = {
            ...data,
            id: `bc-${Date.now()}`,
            personId,
            fechaAlta: new Date().toISOString().split("T")[0],
          };
          return { ...p, beneficiariosControladores: [...p.beneficiariosControladores, nuevo] };
        })
      );
    },
    []
  );

  const updateBeneficiario = useCallback(
    (personId: string, beneficiarioId: string, data: Partial<Omit<BeneficiarioControlador, "id" | "personId">>) => {
      setPersonasList((prev) =>
        prev.map((p) => {
          if (p.id !== personId) return p;
          return {
            ...p,
            beneficiariosControladores: p.beneficiariosControladores.map((bc) =>
              bc.id === beneficiarioId ? { ...bc, ...data } : bc
            ),
          };
        })
      );
    },
    []
  );

  return (
    <PersonasContext.Provider value={{ personas: personasList, addDonacion, getPersona, addBeneficiario, updateBeneficiario }}>
      {children}
    </PersonasContext.Provider>
  );
}