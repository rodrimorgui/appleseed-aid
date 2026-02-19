import { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  Bell,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { oscData } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function OrganizacionProfile() {
  const [umbral, setUmbral] = useState(oscData.umbralAlerta.toString());
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Configuración guardada",
      description: `Umbral de alerta actualizado a $${Number(umbral).toLocaleString("es-MX")} MXN`,
    });
  };

  const infoItems = [
    { icon: FileText, label: "RFC", value: oscData.rfc },
    { icon: FileText, label: "CLUNI", value: oscData.cluni },
    { icon: MapPin, label: "Domicilio", value: oscData.domicilio },
    { icon: User, label: "Representante Legal", value: oscData.representanteLegal },
    { icon: Mail, label: "Correo Electrónico", value: oscData.email },
    { icon: Phone, label: "Teléfono", value: oscData.telefono },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Perfil de la Organización</h1>
        <p className="mt-1 text-muted-foreground">
          Datos generales y configuración de alertas
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Datos Generales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 rounded-lg bg-primary/5 p-4">
              <h2 className="text-lg font-bold text-primary">{oscData.nombre}</h2>
            </div>
            <dl className="space-y-4">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </dt>
                    <dd className="text-sm font-medium">{item.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Alert Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Configuración de Alertas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <p className="text-sm font-medium">Umbral de Ley Anti-Lavado</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Se generará una alerta cuando una donación supere este monto. El
                umbral actual establecido por la ley es de $64,890 MXN.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="umbral">Umbral de alerta (MXN)</Label>
              <div className="flex gap-3">
                <Input
                  id="umbral"
                  type="number"
                  value={umbral}
                  onChange={(e) => setUmbral(e.target.value)}
                  className="font-mono"
                />
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Guardar
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Notificaciones activas</p>
              <div className="space-y-2">
                {[
                  "Donación supera umbral de ley",
                  "Documentos por vencer (30 días)",
                  "Plazo de aviso SAT próximo",
                ].map((alert) => (
                  <div
                    key={alert}
                    className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="h-2 w-2 rounded-full bg-complete" />
                    <span className="text-sm">{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
