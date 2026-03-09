import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  FileText,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  CircleAlert,
  ArrowRight,
  Building2,
  User,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { agregarDonacionRegistrada } from "@/data/mockData";
import { usePersonas } from "@/context/PersonasContext";
import { toast } from "sonner";

const UMBRAL_IDENTIFICACION = 188282;
const UMBRAL_AVISO_SAT = 376000;

const formSchema = z.object({
  nombreDonante: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(200),
  tipoPersona: z.enum(["fisica", "moral"], {
    required_error: "Selecciona el tipo de persona",
  }),
  monto: z.string().refine((val) => {
    const num = parseFloat(val.replace(/,/g, ""));
    return !isNaN(num) && num > 0;
  }, "Ingresa un monto válido"),
  fechaDonacion: z.date({
    required_error: "Selecciona la fecha de la donación",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegistroDonacion() {
  const { addDonacion } = usePersonas();
  const navigate = useNavigate();
  const [montoNumerico, setMontoNumerico] = useState<number>(0);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null);
  const [modalStep, setModalStep] = useState<0 | 1 | 2>(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreDonante: "",
      monto: "",
    },
  });

  const tipoPersona = form.watch("tipoPersona");

  const handleMontoChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9.,]/g, "");
    const numericValue = parseFloat(cleanValue.replace(/,/g, "")) || 0;
    setMontoNumerico(numericValue);
    return cleanValue;
  };

  const superaUmbral = montoNumerico >= UMBRAL_IDENTIFICACION;

  const saveDonation = (data: FormValues, withConsent: boolean) => {
    const monto = parseFloat(data.monto.replace(/,/g, ""));
    agregarDonacionRegistrada({
      id: `dr-${Date.now()}`,
      nombreDonante: data.nombreDonante,
      tipoPersona: data.tipoPersona,
      monto,
      fecha: format(data.fechaDonacion, "yyyy-MM-dd"),
      documentosCompletos: false,
      alertaCumplimiento: superaUmbral,
      consentimientoAceptado: withConsent,
      fechaRegistro: new Date().toISOString(),
    });

    toast.success("Donación registrada correctamente", {
      description: superaUmbral
        ? "⚠️ Se requiere integración de expediente — revisa la sección de Personas."
        : "Registro completado sin alertas de cumplimiento.",
    });

    form.reset();
    setMontoNumerico(0);
    navigate("/");
  };

  const onSubmit = (data: FormValues) => {
    if (superaUmbral) {
      setPendingFormData(data);
      setConsentimientoAceptado(false);
      setModalStep(0);
      setShowLegalModal(true);
    } else {
      saveDonation(data, false);
    }
  };

  const handleConfirmWithConsent = () => {
    if (pendingFormData) {
      saveDonation(pendingFormData, true);
      setShowLegalModal(false);
      setPendingFormData(null);
    }
  };

  const esMoral = tipoPersona === "moral" || pendingFormData?.tipoPersona === "moral";
  const superaAviso = montoNumerico >= UMBRAL_AVISO_SAT;

  // Modal step content
  const steps = [
    { label: "Diagnóstico", icon: CircleAlert },
    { label: "Requisitos", icon: FileText },
    { label: "Sanciones", icon: ShieldAlert },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registro de Donación</h1>
        <p className="text-muted-foreground">
          Captura la información del donativo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Datos del Donativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombreDonante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo o Razón Social</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Juan Pérez García o Fundación Ejemplo S.A. de C.V."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="tipoPersona"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Persona</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fisica">Persona Física</SelectItem>
                            <SelectItem value="moral">Persona Moral</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto (MXN)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              placeholder="0.00"
                              className="pl-7"
                              {...field}
                              onChange={(e) => {
                                const formatted = handleMontoChange(e.target.value);
                                field.onChange(formatted);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="fechaDonacion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de la Donación</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Indicador de umbral inline */}
              {superaUmbral && (
                <div className={cn(
                  "flex items-center gap-3 rounded-lg border p-4",
                  superaAviso
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-warning/40 bg-warning/5"
                )}>
                  <AlertTriangle className={cn(
                    "h-5 w-5 shrink-0",
                    superaAviso ? "text-destructive" : "text-warning"
                  )} />
                  <p className={cn(
                    "text-sm font-medium",
                    superaAviso ? "text-destructive" : "text-warning"
                  )}>
                    {superaAviso
                      ? "Este monto supera el umbral de Aviso al SAT ($376,000 MXN). Se solicitará confirmación."
                      : "Este monto supera el umbral de Identificación ($188,282 MXN). Se solicitará confirmación."
                    }
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate("/")}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Registrar Donación
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Modal de Cumplimiento — Proceso de 3 pasos */}
      <AlertDialog open={showLegalModal} onOpenChange={(open) => {
        if (!open) {
          setShowLegalModal(false);
          setConsentimientoAceptado(false);
          setModalStep(0);
        }
      }}>
        <AlertDialogContent className="max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-lg">
              {esMoral ? (
                <Building2 className="h-6 w-6 text-primary" />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
              {esMoral ? "Persona Moral" : "Persona Física"} — Alerta de Cumplimiento
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-5 pt-3">
                {/* Stepper horizontal */}
                <div className="flex items-center justify-between gap-2">
                  {steps.map((step, i) => {
                    const StepIcon = step.icon;
                    const isActive = modalStep === i;
                    const isDone = modalStep > i;
                    return (
                      <div key={step.label} className="flex items-center gap-2 flex-1">
                        <button
                          type="button"
                          onClick={() => setModalStep(i as 0 | 1 | 2)}
                          className={cn(
                            "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors w-full justify-center",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : isDone
                              ? "bg-complete/15 text-complete"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <StepIcon className="h-3.5 w-3.5" />
                          )}
                          {step.label}
                        </button>
                        {i < steps.length - 1 && (
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Step 0: Diagnóstico */}
                {modalStep === 0 && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Diagnóstico</h4>
                    {esMoral ? (
                      <>
                        <p className="text-sm text-foreground">
                          Esta donación de <strong>Persona Moral</strong> supera los umbrales de la LFPIORPI.
                          Es obligatorio identificar al <strong>Beneficiario Controlador</strong>: cualquier persona física
                          que posea o controle directa o indirectamente el <strong>25% o más</strong> de la participación en la entidad.
                        </p>
                        <div className="flex items-center gap-2 rounded-md bg-primary/10 p-2.5 text-xs text-primary font-medium">
                          <Building2 className="h-4 w-4 shrink-0" />
                          Se requiere información sobre la estructura accionaria y cadena de control.
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-foreground">
                          Esta donación de <strong>Persona Física</strong> supera los umbrales de la LFPIORPI.
                          Se debe verificar la <strong>acumulación de donaciones en los últimos 6 meses</strong> para
                          determinar si el donante supera los umbrales de forma individual o acumulada.
                        </p>
                        <div className="flex items-center gap-2 rounded-md bg-warning/10 p-2.5 text-xs text-warning font-medium">
                          <User className="h-4 w-4 shrink-0" />
                          Verificar historial de donaciones del mismo donante en el semestre.
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 1: Requisitos */}
                {modalStep === 1 && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-foreground">Requisitos de Expediente</h4>
                    {esMoral ? (
                      <ul className="space-y-2 text-sm text-foreground">
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          Acta Constitutiva y poderes del representante legal
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          Constancia de Situación Fiscal (RFC)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          Comprobante de domicilio del establecimiento
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                          <strong>Identificación del Beneficiario Controlador (25%+)</strong>
                        </li>
                      </ul>
                    ) : (
                      <ul className="space-y-2 text-sm text-foreground">
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          Identificación oficial vigente (INE/Pasaporte)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          Constancia de Situación Fiscal (RFC)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          Comprobante de domicilio (no mayor a 3 meses)
                        </li>
                      </ul>
                    )}
                  </div>
                )}

                {/* Step 2: Sanciones + Checkbox */}
                {modalStep === 2 && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-destructive">Sanciones por Incumplimiento</h4>
                      <p className="text-sm text-foreground">
                        El incumplimiento puede derivar en multas de{" "}
                        <strong className="text-destructive">200 a 65,000 UMAS</strong>{" "}
                        (hasta <strong className="text-destructive">$7.6 millones MXN</strong>).
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fundamento: Arts. 52–55 de la LFPIORPI.
                      </p>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-4">
                      <Checkbox
                        id="consentimiento-legal"
                        checked={consentimientoAceptado}
                        onCheckedChange={(checked) => setConsentimientoAceptado(checked === true)}
                        className="mt-0.5"
                      />
                      <label htmlFor="consentimiento-legal" className="text-sm text-foreground cursor-pointer leading-relaxed">
                        <strong>Entendido.</strong> Reconozco los requisitos legales y las posibles sanciones.
                        Me comprometo a integrar el expediente completo del donante.
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel onClick={() => {
              setShowLegalModal(false);
              setConsentimientoAceptado(false);
              setModalStep(0);
            }}>
              Cancelar
            </AlertDialogCancel>
            {modalStep < 2 ? (
              <Button onClick={() => setModalStep((modalStep + 1) as 0 | 1 | 2)}>
                Siguiente
              </Button>
            ) : (
              <Button
                variant="destructive"
                disabled={!consentimientoAceptado}
                onClick={handleConfirmWithConsent}
              >
                Confirmar Registro
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
