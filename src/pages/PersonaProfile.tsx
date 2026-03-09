import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Upload,
  CircleCheck,
  CircleAlert,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Building2,
  User,
} from "lucide-react";
import BeneficiarioControladorSection from "@/components/BeneficiarioControladorSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UMBRAL_IDENTIFICACION, UMBRAL_AVISO } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import { usePersonas } from "@/context/PersonasContext";

export default function PersonaProfile() {
  const { id } = useParams();
  const { personas } = usePersonas();
  const persona = personas.find((p) => p.id === id);

  if (!persona) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-lg text-muted-foreground">Persona no encontrada</p>
        <Link to="/personas">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
        </Link>
      </div>
    );
  }

  const docsPendientes = persona.documentos.filter((d) => d.estado === "pendiente").length;

  // Calcular diagnóstico legal
  const totalDonaciones = persona.donaciones.reduce((sum, d) => sum + d.monto, 0);
  const maxDonacion = Math.max(...persona.donaciones.map((d) => d.monto));
  const montoReferencia = Math.max(totalDonaciones, maxDonacion);
  const esMoral = persona.tipoDonante === "Persona Moral";
  const superaAviso = montoReferencia >= UMBRAL_AVISO;
  const superaIdentificacion = montoReferencia >= UMBRAL_IDENTIFICACION;

  const getBannerConfig = () => {
    if (superaAviso) {
      return {
        icon: ShieldAlert,
        label: `${persona.tipoDonante} — Umbral de Aviso SAT superado`,
        sublabel: esMoral
          ? "Requiere identificación de Beneficiario Controlador (25%+) y aviso formal al SAT"
          : "Acumulado semestral supera $376,000 MXN — Notificación SAT obligatoria",
        className: "border-destructive/40 bg-destructive/5 text-destructive",
      };
    }
    if (superaIdentificacion) {
      return {
        icon: AlertTriangle,
        label: `${persona.tipoDonante} — Umbral de identificación superado`,
        sublabel: esMoral
          ? "Requiere identificación de Beneficiario Controlador (25%+) y expediente completo"
          : "Acumulado semestral supera $188,282 MXN — Expediente completo obligatorio",
        className: "border-warning/40 bg-warning/5 text-warning",
      };
    }
    return null;
  };

  const banner = getBannerConfig();

  return (
    <div className="space-y-6">
      {/* Banner de Diagnóstico Legal */}
      {banner && (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${banner.className}`}>
          <banner.icon className="h-5 w-5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">{banner.label}</p>
            <p className="text-xs opacity-80">{banner.sublabel}</p>
          </div>
          {esMoral ? (
            <Building2 className="h-4 w-4 shrink-0 ml-auto opacity-60" />
          ) : (
            <User className="h-4 w-4 shrink-0 ml-auto opacity-60" />
          )}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/personas">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {persona.nombre} {persona.apellidos}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{persona.tipoDonante}</span>
            <span className="font-mono">{persona.rfc}</span>
            {persona.email && <span>{persona.email}</span>}
            <span className="font-semibold text-foreground">
              Total donado: ${totalDonaciones.toLocaleString("es-MX")} MXN
            </span>
          </div>
        </div>
        {persona.notificacionPendiente ? (
          <StatusBadge status="urgent">Aviso SAT pendiente</StatusBadge>
        ) : (
          <StatusBadge status="complete">Al día</StatusBadge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section A: Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentación
              </span>
              {docsPendientes > 0 && (
                <StatusBadge status="urgent">{docsPendientes} pendientes</StatusBadge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {persona.documentos.map((doc) => (
              <div
                key={doc.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  doc.estado === "pendiente"
                    ? "border-urgent/30 bg-urgent/5"
                    : "border-border bg-muted/30"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    doc.estado === "cargado"
                      ? "bg-complete/10 text-complete"
                      : "bg-urgent/10 text-urgent"
                  }`}
                >
                  {doc.estado === "cargado" ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <CircleAlert className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{doc.tipo}</p>
                  {doc.estado === "cargado" ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {doc.nombre} · {doc.fechaCarga}
                    </p>
                  ) : (
                    <p className="text-xs text-urgent">No cargado</p>
                  )}
                </div>
                {doc.estado === "cargado" ? (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Upload className="h-3.5 w-3.5" />
                    Subir
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section B: Donation History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historial de Donaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead className="hidden sm:table-cell">Método</TableHead>
                  <TableHead>Notificada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {persona.donaciones.map((don) => (
                  <TableRow key={don.id}>
                    <TableCell className="text-sm">{don.fecha}</TableCell>
                    <TableCell className="font-medium">
                      ${don.monto.toLocaleString("es-MX")}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {don.metodoPago}
                    </TableCell>
                    <TableCell>
                      {don.notificada ? (
                        <CircleCheck className="h-5 w-5 text-complete" />
                      ) : (
                        <CircleAlert className="h-5 w-5 text-urgent animate-pulse-urgent" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Section C: Beneficiario Controlador (solo Persona Moral) */}
      {esMoral && (
        <BeneficiarioControladorSection
          personId={persona.id}
          beneficiarios={persona.beneficiariosControladores}
        />
      )}
    </div>
  );
}
