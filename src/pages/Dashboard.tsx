import { Link } from "react-router-dom";
import {
  AlertTriangle,
  FileWarning,
  DollarSign,
  ArrowRight,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";
import { personas } from "@/data/mockData";

export default function Dashboard() {
  const notificacionesPendientes = personas.filter((p) => p.notificacionPendiente).length;
  const expedientesIncompletos = personas.filter((p) =>
    p.documentos.some((d) => d.estado === "pendiente")
  ).length;
  const totalDonacionesMes = personas
    .flatMap((p) => p.donaciones)
    .filter((d) => d.fecha.startsWith("2025-02"))
    .reduce((sum, d) => sum + d.monto, 0);

  const personasUrgentes = personas.filter((p) => p.notificacionPendiente);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Dashboard de Control</h1>
        <p className="mt-1 text-muted-foreground">
          Resumen del estado de cumplimiento y documentación
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-urgent/30 bg-urgent/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notificaciones SAT Pendientes
            </CardTitle>
            <Bell className="h-5 w-5 text-urgent" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-urgent">{notificacionesPendientes}</div>
            <p className="mt-1 text-xs text-urgent/80">Requieren acción inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expedientes Incompletos
            </CardTitle>
            <FileWarning className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{expedientesIncompletos}</div>
            <p className="mt-1 text-xs text-muted-foreground">Documentos faltantes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Donaciones del Mes
            </CardTitle>
            <DollarSign className="h-5 w-5 text-complete" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              ${totalDonacionesMes.toLocaleString("es-MX")}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Febrero 2025</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-urgent" />
            Acciones Urgentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {personasUrgentes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay acciones urgentes en este momento.
            </p>
          ) : (
            <div className="space-y-3">
              {personasUrgentes.map((p) => {
                const docsPendientes = p.documentos.filter(
                  (d) => d.estado === "pendiente"
                ).length;
                const donacionesSinNotificar = p.donaciones.filter(
                  (d) => !d.notificada
                );
                const montoTotal = donacionesSinNotificar.reduce(
                  (s, d) => s + d.monto,
                  0
                );

                return (
                  <Link
                    key={p.id}
                    to={`/personas/${p.id}`}
                    className="flex items-center justify-between rounded-lg border border-urgent/20 bg-urgent/5 p-4 transition-colors hover:bg-urgent/10"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">
                        {p.nombre} {p.apellidos}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {donacionesSinNotificar.length > 0 && (
                          <StatusBadge status="urgent">
                            Aviso SAT: ${montoTotal.toLocaleString("es-MX")}
                          </StatusBadge>
                        )}
                        {docsPendientes > 0 && (
                          <StatusBadge status="pending">
                            {docsPendientes} doc. pendientes
                          </StatusBadge>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
