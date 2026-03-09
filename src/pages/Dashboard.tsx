import { Link } from "react-router-dom";
import {
  AlertTriangle,
  FileWarning,
  Clock,
  ArrowRight,
  Bell,
  ShieldAlert,
  Users,
  Sparkles,
  TrendingUp,
  Calendar,
  FileCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "@/components/StatusBadge";
import { donacionesRegistradas, oscData, UMBRAL_NOTIFICACION, UMBRAL_IDENTIFICACION, UMBRAL_AVISO } from "@/data/mockData";
import { usePersonas } from "@/context/PersonasContext";

export default function Dashboard() {
  const { personas } = usePersonas();
  // Calculate KPIs
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysUntilDeadline = Math.max(0, Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Countdown to day 17 of current or next month
  const currentMonth17 = new Date(today.getFullYear(), today.getMonth(), 17);
  const target17 = today <= currentMonth17
    ? currentMonth17
    : new Date(today.getFullYear(), today.getMonth() + 1, 17);
  const daysUntil17 = Math.max(0, Math.ceil((target17.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const montoEnRiesgo = personas
    .flatMap((p) => p.donaciones)
    .filter((d) => !d.notificada && d.monto > oscData.umbralAlerta)
    .reduce((sum, d) => sum + d.monto, 0);

  const totalDonantes = personas.length;
  const donantesCompletos = personas.filter(
    (p) => !p.documentos.some((d) => d.estado === "pendiente") && !p.notificacionPendiente
  ).length;
  const porcentajeCumplimiento = Math.round((donantesCompletos / totalDonantes) * 100);

  // SAT Notifications: Only donors with donations > $376,000 (UMBRAL_AVISO)
  const notificacionesSAT = personas
    .map((p) => {
      const donacionesPendientes = p.donaciones.filter((d) => !d.notificada);
      const montoTotal = donacionesPendientes.reduce((s, d) => s + d.monto, 0);
      const maxDonacion = Math.max(...donacionesPendientes.map(d => d.monto), 0);
      const ultimaDonacion = donacionesPendientes[0];
      const fechaLimite = ultimaDonacion
        ? new Date(new Date(ultimaDonacion.fecha).setDate(new Date(ultimaDonacion.fecha).getDate() + 30))
        : null;
      return { ...p, montoTotal, maxDonacion, fechaLimite };
    })
    .filter((p) => p.montoTotal > UMBRAL_AVISO || p.maxDonacion > UMBRAL_AVISO);

  // Personas Físicas: > $188,282 with document status tracking
  const UMBRAL_PF = 188282;
  const personasFisicas = personas
    .filter((p) => {
      if (p.tipoDonante !== "Persona Física") return false;
      const montoTotal = p.donaciones.reduce((s, d) => s + d.monto, 0);
      const maxDonacion = Math.max(...p.donaciones.map(d => d.monto), 0);
      return montoTotal > UMBRAL_PF || maxDonacion > UMBRAL_PF;
    })
    .map((p) => {
      const montoTotal = p.donaciones.reduce((s, d) => s + d.monto, 0);
      // Track specific required docs
      const ine = p.documentos.find(d => d.tipo === "INE");
      const csf = p.documentos.find(d => d.tipo === "Constancia de Situación Fiscal");
      const domicilio = p.documentos.find(d => d.tipo === "Comprobante de Domicilio");
      return {
        ...p,
        montoTotal,
        ineOk: ine?.estado === "cargado",
        csfOk: csf?.estado === "cargado",
        domicilioOk: domicilio?.estado === "cargado",
      };
    });

  // Personas Morales: institutional donors with beneficiary controller alerts
  const personasMorales = personas
    .filter((p) => p.tipoDonante === "Persona Moral")
    .map((p) => {
      const montoTotal = p.donaciones.reduce((s, d) => s + d.monto, 0);
      const docsCompletos = p.documentos.filter(d => d.estado === "cargado").length;
      const docsTotal = p.documentos.length;
      return { ...p, montoTotal, docsCompletos, docsTotal };
    });

  // Simulated controlling beneficiary alerts
  const alertasBeneficiarios = [
    {
      id: "bc1",
      donante: "Grupo Inversiones del Norte S.A.",
      porcentaje: 28,
      mensaje: "Participación accionaria supera el 25%",
      requiereAccion: true,
    },
    {
      id: "bc2",
      donante: "Fideicomiso Apoyo Social",
      porcentaje: 32,
      mensaje: "Identificar beneficiario final del fideicomiso",
      requiereAccion: true,
    },
  ];

  const documentosParaProcesar = 5;

  // Helper for doc icon
  const DocIcon = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className="flex flex-col items-center gap-1">
      <div className={`rounded-lg p-2 transition-colors ${ok ? "bg-complete/15" : "bg-muted"}`}>
        <FileCheck className={`h-4 w-4 ${ok ? "text-complete" : "text-muted-foreground/40"}`} />
      </div>
      <span className={`text-[10px] font-medium ${ok ? "text-complete" : "text-muted-foreground/50"}`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Panel de Control</h1>
        <p className="mt-1 text-muted-foreground">
          Estado de cumplimiento y riesgos legales
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Días para Cierre de Avisos</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-primary">{daysUntilDeadline}</span>
                  <span className="text-sm text-muted-foreground">días</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Fecha límite: {endOfMonth.toLocaleDateString("es-MX", { month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-urgent/30 bg-gradient-to-br from-urgent/5 to-urgent/10 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monto en Riesgo Legal</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-urgent">
                    ${montoEnRiesgo.toLocaleString("es-MX")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-urgent/80">
                  Donaciones sin notificar al SAT
                </p>
              </div>
              <div className="rounded-xl bg-urgent/10 p-3">
                <ShieldAlert className="h-6 w-6 text-urgent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-complete/30 bg-gradient-to-br from-complete/5 to-complete/10 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cumplimiento Total</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-complete">{porcentajeCumplimiento}%</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {donantesCompletos} de {totalDonantes} donantes al corriente
                </p>
              </div>
              <div className="rounded-xl bg-complete/10 p-3">
                <TrendingUp className="h-6 w-6 text-complete" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Artu.ai Shortcut */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 shadow-sm">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Artu.ai — Asistente de Documentación</p>
              <p className="text-sm text-muted-foreground">
                Tienes <span className="font-semibold text-primary">{documentosParaProcesar} documentos</span> listos para procesamiento automático
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Procesar ahora
            <ArrowRight className="h-4 w-4" />
          </button>
        </CardContent>
      </Card>

      {/* === BENTO GRID: 3 Columns === */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* CARD 1: Notificaciones SAT (Rojo) */}
        <Card className="border-urgent/20 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="rounded-lg bg-urgent/10 p-2">
                  <Bell className="h-5 w-5 text-urgent" />
                </div>
                Notificaciones SAT
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Donantes con monto &gt; ${UMBRAL_AVISO.toLocaleString("es-MX")} MXN — Requieren aviso formal
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {notificacionesSAT.length === 0 ? (
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <FileCheck className="mx-auto h-8 w-8 text-complete" />
                <p className="mt-2 text-sm text-muted-foreground">Sin notificaciones pendientes</p>
              </div>
            ) : (
              notificacionesSAT.map((p) => (
                <Link
                  key={p.id}
                  to={`/personas/${p.id}`}
                  className="block rounded-xl border border-urgent/20 bg-gradient-to-r from-urgent/5 to-transparent p-4 transition-all hover:border-urgent/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{p.nombre} {p.apellidos}</p>
                      <StatusBadge status="urgent">
                        ${p.montoTotal.toLocaleString("es-MX")} MXN
                      </StatusBadge>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {p.fechaLimite && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <Clock className="h-3.5 w-3.5 text-urgent" />
                      <span className="font-medium text-urgent">
                        Límite: {p.fechaLimite.toLocaleDateString("es-MX")}
                      </span>
                    </div>
                  )}
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* CARD 2: Expedientes Personas Físicas (Ámbar) */}
        <Card className="border-warning/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="rounded-lg bg-warning/10 p-2">
                <FileWarning className="h-5 w-5 text-warning" />
              </div>
              Expedientes Personas Físicas
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Donantes con monto &gt; ${UMBRAL_PF.toLocaleString("es-MX")} MXN — Requieren identificación completa
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {personasFisicas.length === 0 ? (
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <FileCheck className="mx-auto h-8 w-8 text-complete" />
                <p className="mt-2 text-sm text-muted-foreground">Sin expedientes pendientes</p>
              </div>
            ) : (
              personasFisicas.map((p) => (
                <Link
                  key={p.id}
                  to={`/personas/${p.id}`}
                  className="block rounded-xl border border-warning/20 bg-gradient-to-r from-warning/5 to-transparent p-4 transition-all hover:border-warning/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.nombre} {p.apellidos}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Acumulado: ${p.montoTotal.toLocaleString("es-MX")} MXN
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {/* Document icons: gray → green */}
                  <div className="mt-3 flex items-center gap-4">
                    <DocIcon ok={p.ineOk} label="INE" />
                    <DocIcon ok={p.csfOk} label="RFC" />
                    <DocIcon ok={p.domicilioOk} label="Domicilio" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* CARD 3: Estructura Personas Morales (Azul) */}
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Estructura Personas Morales
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Donantes institucionales y umbral de Beneficiario Controlador (25%)
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Registered Personas Morales */}
            {personasMorales.map((p) => (
              <Link
                key={p.id}
                to={`/personas/${p.id}`}
                className="block rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.nombre} {p.apellidos}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Donaciones: ${p.montoTotal.toLocaleString("es-MX")} MXN
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">{p.docsCompletos}/{p.docsTotal}</span>
                </div>
                <Progress value={(p.docsCompletos / p.docsTotal) * 100} className="mt-2 h-1.5" />
              </Link>
            ))}

            {/* Beneficiary Controller Alerts */}
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <p className="text-xs font-semibold text-warning">Alertas Beneficiario Controlador (≥25%)</p>
              </div>
            </div>

            {alertasBeneficiarios.map((alerta) => (
              <div
                key={alerta.id}
                className="rounded-xl border border-warning/20 bg-gradient-to-r from-warning/5 to-transparent p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{alerta.donante}</p>
                    <p className="text-xs text-muted-foreground">{alerta.mensaje}</p>
                  </div>
                  <StatusBadge status="warning">{alerta.porcentaje}%</StatusBadge>
                </div>
                {alerta.requiereAccion && (
                  <div className="mt-3 flex items-center gap-2">
                    <ShieldAlert className="h-3.5 w-3.5 text-urgent" />
                    <span className="text-xs font-medium text-urgent">
                      Identificar beneficiario final
                    </span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
