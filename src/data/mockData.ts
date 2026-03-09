export interface Documento {
  id: string;
  tipo: string;
  nombre: string;
  fechaCarga: string;
  estado: "cargado" | "pendiente" | "vencido";
  url?: string;
}

export interface Donacion {
  id: string;
  fecha: string;
  monto: number;
  metodoPago: string;
  notificada: boolean;
}

export interface BeneficiarioControlador {
  id: string;
  personId: string;
  nombreCompleto: string;
  curp: string;
  nacionalidad: string;
  fechaNacimiento: string;
  porcentajeParticipacion: number;
  cargoControl: string;
  esPPE: boolean;
  observaciones: string;
  fechaAlta: string;
}

export interface Persona {
  id: string;
  nombre: string;
  apellidos: string;
  tipoDonante: "Persona Física" | "Persona Moral";
  rfc: string;
  email: string;
  telefono: string;
  documentos: Documento[];
  donaciones: Donacion[];
  notificacionPendiente: boolean;
  beneficiariosControladores: BeneficiarioControlador[];
}

// Umbrales legales LFPIORPI
export const UMBRAL_NOTIFICACION = 64890; // Umbral para notificar al SAT
export const UMBRAL_IDENTIFICACION = 188000; // Umbral para identificación completa
export const UMBRAL_AVISO = 376000; // Umbral para aviso formal al SAT

export const personas: Persona[] = [
  {
    id: "1",
    nombre: "María Elena",
    apellidos: "García López",
    tipoDonante: "Persona Física",
    rfc: "GALM850315ABC",
    email: "maria.garcia@email.com",
    telefono: "55 1234 5678",
    documentos: [
      { id: "d1", tipo: "INE", nombre: "INE_MariaGarcia.pdf", fechaCarga: "2025-01-15", estado: "cargado" },
      { id: "d2", tipo: "Constancia de Situación Fiscal", nombre: "CSF_MariaGarcia.pdf", fechaCarga: "2025-01-15", estado: "cargado" },
      { id: "d3", tipo: "Comprobante de Domicilio", nombre: "", fechaCarga: "", estado: "pendiente" },
    ],
    donaciones: [
      // Monto > $64,890 = requiere notificación SAT
      { id: "don1", fecha: "2025-02-01", monto: 75000, metodoPago: "Transferencia", notificada: false },
      { id: "don2", fecha: "2025-01-15", monto: 50000, metodoPago: "Cheque", notificada: true },
    ],
    notificacionPendiente: true,
    beneficiariosControladores: [],
  },
  {
    id: "2",
    nombre: "Roberto",
    apellidos: "Hernández Martínez",
    tipoDonante: "Persona Física",
    rfc: "HEMR900420DEF",
    email: "roberto.hdz@email.com",
    telefono: "55 9876 5432",
    documentos: [
      { id: "d5", tipo: "INE", nombre: "INE_Roberto.pdf", fechaCarga: "2025-02-01", estado: "cargado" },
      { id: "d6", tipo: "Constancia de Situación Fiscal", nombre: "CSF_Roberto.pdf", fechaCarga: "2025-02-01", estado: "cargado" },
      { id: "d7", tipo: "Comprobante de Domicilio", nombre: "Domicilio_Roberto.pdf", fechaCarga: "2025-02-01", estado: "cargado" },
    ],
    donaciones: [
      // Monto > $188,000 = requiere identificación completa + notificación
      { id: "don3", fecha: "2025-02-10", monto: 195000, metodoPago: "Transferencia", notificada: false },
    ],
    notificacionPendiente: true,
    beneficiariosControladores: [],
  },
  {
    id: "3",
    nombre: "Fundación Esperanza",
    apellidos: "A.C.",
    tipoDonante: "Persona Moral",
    rfc: "FES100101GHI",
    email: "contacto@fundacionesperanza.org",
    telefono: "55 5555 1234",
    documentos: [
      { id: "d8", tipo: "Acta Constitutiva", nombre: "Acta_FundEsperanza.pdf", fechaCarga: "2024-12-01", estado: "cargado" },
      { id: "d9", tipo: "Constancia de Situación Fiscal", nombre: "CSF_FundEsperanza.pdf", fechaCarga: "2024-12-01", estado: "cargado" },
      { id: "d10", tipo: "Poder Notarial", nombre: "", fechaCarga: "", estado: "pendiente" },
      { id: "d11", tipo: "INE del Representante", nombre: "", fechaCarga: "", estado: "pendiente" },
      { id: "d12", tipo: "Comprobante de Domicilio", nombre: "", fechaCarga: "", estado: "pendiente" },
    ],
    donaciones: [
      // Monto > $376,000 = requiere AVISO FORMAL al SAT (máximo riesgo)
      { id: "don4", fecha: "2025-02-05", monto: 420000, metodoPago: "Transferencia", notificada: false },
      { id: "don5", fecha: "2025-01-20", monto: 180000, metodoPago: "Transferencia", notificada: true },
    ],
    notificacionPendiente: true,
    beneficiariosControladores: [],
  },
  {
    id: "4",
    nombre: "Carlos Alberto",
    apellidos: "Sánchez Vega",
    tipoDonante: "Persona Física",
    rfc: "SAVC780110JKL",
    email: "carlos.sanchez@email.com",
    telefono: "55 4321 8765",
    documentos: [
      { id: "d13", tipo: "INE", nombre: "INE_Carlos.pdf", fechaCarga: "2025-01-20", estado: "cargado" },
      { id: "d14", tipo: "Constancia de Situación Fiscal", nombre: "CSF_Carlos.pdf", fechaCarga: "2025-01-20", estado: "cargado" },
      { id: "d15", tipo: "Comprobante de Domicilio", nombre: "Domicilio_Carlos.pdf", fechaCarga: "2025-01-20", estado: "cargado" },
    ],
    donaciones: [
      // Monto < $64,890 = NO requiere notificación
      { id: "don7", fecha: "2025-01-10", monto: 45000, metodoPago: "Efectivo", notificada: true },
    ],
    notificacionPendiente: false,
    beneficiariosControladores: [],
  },
  {
    id: "5",
    nombre: "Ana Lucía",
    apellidos: "Torres Ramírez",
    tipoDonante: "Persona Física",
    rfc: "TORA950605MNO",
    email: "ana.torres@email.com",
    telefono: "55 6789 0123",
    documentos: [
      { id: "d16", tipo: "INE", nombre: "", fechaCarga: "", estado: "pendiente" },
      { id: "d17", tipo: "Constancia de Situación Fiscal", nombre: "", fechaCarga: "", estado: "pendiente" },
      { id: "d18", tipo: "Comprobante de Domicilio", nombre: "", fechaCarga: "", estado: "pendiente" },
    ],
    donaciones: [
      // Monto > $188,000 = requiere identificación completa (ALTO RIESGO: sin documentos)
      { id: "don8", fecha: "2025-02-14", monto: 210000, metodoPago: "Transferencia", notificada: false },
    ],
    notificacionPendiente: true,
    beneficiariosControladores: [],
  },
];

export interface DonacionRegistrada {
  id: string;
  nombreDonante: string;
  tipoPersona: "fisica" | "moral";
  monto: number;
  fecha: string;
  documentosCompletos: boolean;
  alertaCumplimiento: boolean;
  consentimientoAceptado: boolean;
  fechaRegistro: string;
}

// Store de donaciones registradas desde el formulario
export const donacionesRegistradas: DonacionRegistrada[] = [];

export function agregarDonacionRegistrada(donacion: DonacionRegistrada) {
  donacionesRegistradas.unshift(donacion);
}

export interface OSCData {
  nombre: string;
  rfc: string;
  cluni: string;
  domicilio: string;
  representanteLegal: string;
  email: string;
  telefono: string;
  umbralAlerta: number;
}

export const oscData: OSCData = {
  nombre: "Appleseed México A.C.",
  rfc: "APM150301XYZ",
  cluni: "APM-2015-001234",
  domicilio: "Av. Reforma 505, Col. Cuauhtémoc, CDMX, CP 06500",
  representanteLegal: "Lic. Alejandro Ruiz Mendoza",
  email: "contacto@appleseedmexico.org",
  telefono: "55 1111 2222",
  umbralAlerta: 64890,
};
