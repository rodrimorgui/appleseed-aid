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
import { personas, donacionesRegistradas, oscData } from "@/data/mockData";

export default function Dashboard() {
  // Calculate KPIs
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysUntilDeadline = Math.max(0, Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const montoEnRiesgo = personas
    .flatMap((p) => p.donaciones)
    .filter((d) => !d.notificada && d.monto > oscData.umbralAlerta)
    .reduce((sum, d) => sum + d.monto, 0);

  const totalDonantes = personas.length;
  const donantesCompletos = personas.filter(
    (p) => !p.documentos.some((d) => d.estado === "pendiente") && !p.notificacionPendiente
  ).length;
  const porcentajeCumplimiento = Math.round((donantesCompletos / totalDonantes) * 100);

  // Notifications pending SAT
  const notificacionesSAT = personas
    .filter((p) => p.notificacionPendiente)
    .map((p) => {
      const donacionesPendientes = p.donaciones.filter((d) => !d.notificada);
      const montoTotal = donacionesPendientes.reduce((s, d) => s + d.monto, 0);
      const ultimaDonacion = donacionesPendientes[0];
      const fechaLimite = ultimaDonacion
        ? new Date(new Date(ultimaDonacion.fecha).setDate(new Date(ultimaDonacion.fecha).getDate() + 30))
        : null;
      return { ...p, montoTotal, fechaLimite };
    });

  // Pending documentation with progress
  const documentacionPendiente = personas
    .filter((p) => p.documentos.some((d) => d.estado === "pendiente"))
    .map((p) => {
      const total = p.documentos.length;
      const completados = p.documentos.filter((d) => d.estado === "cargado").length;
      const progreso = Math.round((completados / total) * 100);
      return { ...p, total, completados, progreso };
    });

  // Donations from registry with alerts
  const donacionesConAlerta = donacionesRegistradas.filter((d) => d.alertaCumplimiento);

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

  // Simulated documents ready for Artu.ai
  const documentosParaProcesar = 5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Panel de Control</h1>
        <p className="mt-1 text-muted-foreground">
          Estado de cumplimiento y riesgos legales
        </p>
      </div>

      {/* KPI Row - Bento Style */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Days until deadline */}
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

        {/* Amount at risk */}
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

        {/* Compliance percentage */}
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

      {/* Artu.ai Navigation Shortcut */}
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

      {/* Main Grid - Bento Box Layout */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Column 1: SAT Notifications (Urgent - Red) */}
        <Card className="border-urgent/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="rounded-lg bg-urgent/10 p-2">
                <Bell className="h-5 w-5 text-urgent" />
              </div>
              Notificaciones SAT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notificacionesSAT.length === 0 ? (
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <FileCheck className="mx-auto h-8 w-8 text-complete" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Sin notificaciones pendientes
                </p>
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
                      <p className="font-medium">
                        {p.nombre} {p.apellidos}
                      </p>
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
                        Fecha límite: {p.fechaLimite.toLocaleDateString("es-MX")}
                      </span>
                    </div>
                  )}
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Column 2: Pending Documentation (Warning - Amber) */}
        <Card className="border-warning/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="rounded-lg bg-warning/10 p-2">
                <FileWarning className="h-5 w-5 text-warning" />
              </div>
              Documentación Pendiente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documentacionPendiente.length === 0 && donacionesConAlerta.length === 0 ? (
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <FileCheck className="mx-auto h-8 w-8 text-complete" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Todos los expedientes están completos
                </p>
              </div>
            ) : (
              <>
                {documentacionPendiente.map((p) => (
                  <Link
                    key={p.id}
                    to={`/personas/${p.id}`}
                    className="block rounded-xl border border-warning/20 bg-gradient-to-r from-warning/5 to-transparent p-4 transition-all hover:border-warning/40 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {p.nombre} {p.apellidos}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {p.completados}/{p.total}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Progress value={p.progreso} className="h-2" />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {p.total - p.completados} documento(s) pendiente(s)
                    </p>
                  </Link>
                ))}
                {donacionesConAlerta.map((d) => (
                  <Link
                    key={d.id}
                    to="/donaciones"
                    className="block rounded-xl border border-warning/20 bg-gradient-to-r from-warning/5 to-transparent p-4 transition-all hover:border-warning/40 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{d.nombreDonante}</p>
                      <StatusBadge status="warning">Nueva</StatusBadge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Donación de ${d.monto.toLocaleString("es-MX")} — Documentación incompleta
                    </p>
                  </Link>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Column 3: Controlling Beneficiaries (System - Blue) */}
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              Beneficiarios Controladores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-primary/10 bg-primary/5 p-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-primary">Umbral del 25%:</span> Identifica personas físicas con participación ≥25% en personas morales donantes.
              </p>
            </div>

            {alertasBeneficiarios.length === 0 ? (
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <FileCheck className="mx-auto h-8 w-8 text-complete" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Sin alertas de beneficiarios
                </p>
              </div>
            ) : (
              alertasBeneficiarios.map((alerta) => (
                <div
                  key={alerta.id}
                  className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{alerta.donante}</p>
                      <p className="text-xs text-muted-foreground">{alerta.mensaje}</p>
                    </div>
                    <StatusBadge status="pending">{alerta.porcentaje}%</StatusBadge>
                  </div>
                  {alerta.requiereAccion && (
                    <div className="mt-3 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                      <span className="text-xs font-medium text-warning">
                        Requiere identificación del beneficiario final
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
