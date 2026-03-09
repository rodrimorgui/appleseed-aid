import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import {
  CalendarIcon,
  Upload,
  FileText,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  Scale,
  Shield,
  Users,
  ShieldAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { toast } from "sonner";

// Umbrales de la Ley Antilavado (valores en MXN)
const UMBRAL_IDENTIFICACION = 188000;
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

interface UploadedFile {
  id: string;
  name: string;
  type: "identificacion" | "domicilio" | "fiscal";
}

const documentTypes = [
  { id: "identificacion", label: "Identificación Oficial", description: "INE, Pasaporte o Cédula Profesional" },
  { id: "domicilio", label: "Comprobante de Domicilio", description: "No mayor a 3 meses" },
  { id: "fiscal", label: "Constancia de Situación Fiscal", description: "Emitida por el SAT" },
] as const;

export default function RegistroDonacion() {
  const navigate = useNavigate();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [montoNumerico, setMontoNumerico] = useState<number>(0);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [consentimientoAceptado, setConsentimientoAceptado] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreDonante: "",
      monto: "",
    },
  });

  const handleMontoChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9.,]/g, "");
    const numericValue = parseFloat(cleanValue.replace(/,/g, "")) || 0;
    setMontoNumerico(numericValue);
    return cleanValue;
  };

  const allDocsUploaded = documentTypes.every((doc) =>
    uploadedFiles.some((f) => f.type === doc.id)
  );

  const hasComplianceAlert =
    montoNumerico > UMBRAL_IDENTIFICACION && !allDocsUploaded;

  const handleDrop = useCallback((e: React.DragEvent, docType: string) => {
    e.preventDefault();
    setDragOver(null);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newFile: UploadedFile = {
        id: `${docType}-${Date.now()}`,
        name: files[0].name,
        type: docType as UploadedFile["type"],
      };
      setUploadedFiles((prev) => [...prev.filter((f) => f.type !== docType), newFile]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFile: UploadedFile = {
        id: `${docType}-${Date.now()}`,
        name: files[0].name,
        type: docType as UploadedFile["type"],
      };
      setUploadedFiles((prev) => [...prev.filter((f) => f.type !== docType), newFile]);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const saveDonation = (data: FormValues, withConsent: boolean) => {
    const monto = parseFloat(data.monto.replace(/,/g, ""));
    agregarDonacionRegistrada({
      id: `dr-${Date.now()}`,
      nombreDonante: data.nombreDonante,
      tipoPersona: data.tipoPersona,
      monto,
      fecha: format(data.fechaDonacion, "yyyy-MM-dd"),
      documentosCompletos: allDocsUploaded,
      alertaCumplimiento: hasComplianceAlert,
      consentimientoAceptado: withConsent,
      fechaRegistro: new Date().toISOString(),
    });

    toast.success("Donación registrada correctamente", {
      description: hasComplianceAlert
        ? "⚠️ Marcada con Alerta de Cumplimiento — Documentación Pendiente"
        : "Todos los requisitos de cumplimiento están en orden.",
    });

    form.reset();
    setUploadedFiles([]);
    setMontoNumerico(0);
    navigate("/");
  };

  const onSubmit = (data: FormValues) => {
    if (hasComplianceAlert) {
      setPendingFormData(data);
      setConsentimientoAceptado(false);
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

  const getAlertLevel = (): "none" | "warning" | "danger" => {
    if (montoNumerico > UMBRAL_AVISO_SAT) return "danger";
    if (montoNumerico > UMBRAL_IDENTIFICACION) return "warning";
    return "none";
  };

  const alertLevel = getAlertLevel();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Registro de Donación</h1>
        <p className="text-muted-foreground">
          Captura la información del donativo y cumple con la Ley Antilavado
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alertas de Cumplimiento */}
          {alertLevel === "warning" && (
            <Alert className="border-warning/50 bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <AlertTitle className="text-warning font-semibold">
                ⚠️ Umbral de Identificación Superado
              </AlertTitle>
              <AlertDescription className="text-warning/90">
                Esta donación supera el Umbral de Identificación ($188,000 MXN).
                Es <strong>OBLIGATORIO</strong> integrar el expediente completo del donante.
                {!allDocsUploaded && (
                  <span className="block mt-1 font-semibold">
                    Documentación incompleta — se marcará como Alerta de Cumplimiento.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {alertLevel === "danger" && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertTitle className="text-destructive font-semibold">
                🚨 Umbral de Aviso al SAT Superado
              </AlertTitle>
              <AlertDescription className="text-destructive/90">
                Esta donación supera el Umbral de Aviso ($376,000 MXN).
                Se generará <strong>automáticamente</strong> una notificación pendiente para el SAT.
                {!allDocsUploaded && (
                  <span className="block mt-1 font-semibold">
                    Documentación incompleta — se marcará como Alerta de Cumplimiento.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Card del Formulario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Datos del Donativo
              </CardTitle>
              <CardDescription>
                Ingresa la información del donante y los detalles de la donación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Datos del Donante */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Datos del Donante</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="nombreDonante"
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
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
                    </div>
                  </div>

                  <Separator />

                  {/* Datos del Donativo */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">Datos del Donativo</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
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
                  </div>

                  <Separator />

                  {/* Carga de Documentos */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground">
                      Documentación de Debida Diligencia
                      {alertLevel !== "none" && !allDocsUploaded && (
                        <span className="ml-2 text-xs font-normal text-destructive">
                          (Obligatorio para este monto — faltantes generarán alerta)
                        </span>
                      )}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      {documentTypes.map((doc) => {
                        const uploadedFile = uploadedFiles.find((f) => f.type === doc.id);
                        const isDragOver = dragOver === doc.id;
                        return (
                          <div
                            key={doc.id}
                            className={cn(
                              "relative rounded-lg border-2 border-dashed p-4 transition-colors",
                              isDragOver
                                ? "border-primary bg-primary/5"
                                : uploadedFile
                                ? "border-complete/50 bg-complete/5"
                                : "border-border hover:border-muted-foreground/50"
                            )}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(doc.id); }}
                            onDragLeave={() => setDragOver(null)}
                            onDrop={(e) => handleDrop(e, doc.id)}
                          >
                            <input
                              type="file"
                              id={`file-${doc.id}`}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileInput(e, doc.id)}
                            />
                            {uploadedFile ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <FileText className="h-5 w-5 text-complete" />
                                  <button type="button" onClick={() => removeFile(uploadedFile.id)} className="rounded p-1 hover:bg-muted">
                                    <X className="h-4 w-4 text-muted-foreground" />
                                  </button>
                                </div>
                                <p className="text-xs font-medium text-foreground truncate">{uploadedFile.name}</p>
                                <p className="text-xs text-complete">Archivo cargado</p>
                              </div>
                            ) : (
                              <label htmlFor={`file-${doc.id}`} className="flex cursor-pointer flex-col items-center gap-2 text-center">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                                <div>
                                  <p className="text-xs font-medium text-foreground">{doc.label}</p>
                                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">Arrastra o haz clic</p>
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/")}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {hasComplianceAlert ? "Guardar con Alerta" : "Registrar Donación"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Informativo */}
        <div className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-primary">
                <Scale className="h-5 w-5" />
                Ley Antilavado para OSC
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="rounded-lg bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    Umbral de Identificación
                  </div>
                  <p className="mt-1 text-lg font-bold text-foreground">1,605 UMA</p>
                  <p className="text-sm text-muted-foreground">≈ $188,000 MXN</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    A partir de este monto, es obligatorio integrar el expediente completo del donante.
                  </p>
                </div>
                <div className="rounded-lg bg-card p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    Umbral de Aviso
                  </div>
                  <p className="mt-1 text-lg font-bold text-foreground">3,210 UMA</p>
                  <p className="text-sm text-muted-foreground">≈ $376,000 MXN</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Donaciones que superen este umbral deben notificarse al SAT.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Beneficiario Controlador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-muted bg-muted/30">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Umbral del 25%:</strong> Si una persona física posee o controla
                  directa o indirectamente el 25% o más de los derechos de una persona moral,
                  debe identificarse como Beneficiario Controlador.
                </AlertDescription>
              </Alert>
              <p className="mt-3 text-xs text-muted-foreground">
                En caso de personas morales donantes, solicite información sobre su
                estructura accionaria para identificar posibles beneficiarios controladores.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Documentos Requeridos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>Identificación Oficial:</strong> INE, Pasaporte vigente o Cédula Profesional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>Comprobante de Domicilio:</strong> Con antigüedad no mayor a 3 meses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span><strong>Constancia Fiscal:</strong> Emitida por el SAT con RFC visible</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Consentimiento Legal */}
      <AlertDialog open={showLegalModal} onOpenChange={setShowLegalModal}>
        <AlertDialogContent className="max-w-lg border-destructive/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3 text-destructive text-xl">
              <ShieldAlert className="h-7 w-7" />
              Advertencia Legal — LFPIORPI
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-2">
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                  <p className="text-sm font-semibold text-destructive">
                    ⚠️ Está registrando una donación con documentación incompleta que supera los umbrales de la Ley Antilavado.
                  </p>
                  <p className="text-sm text-foreground">
                    El incumplimiento en la integración de expedientes o la omisión de avisos puede derivar en multas que oscilan entre{" "}
                    <strong className="text-destructive">200 y 65,000 UMAS</strong>{" "}
                    (hasta <strong className="text-destructive">$7.6 millones de MXN</strong>).
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Fundamento: Artículos 52, 53, 54 y 55 de la Ley Federal para la Prevención e Identificación de Operaciones con Recursos de Procedencia Ilícita (LFPIORPI).
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
                    Entiendo los riesgos legales y las posibles sanciones por registrar esta donación con documentación incompleta.
                  </label>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2">
            <AlertDialogCancel onClick={() => { setShowLegalModal(false); setConsentimientoAceptado(false); }}>
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={!consentimientoAceptado}
              onClick={handleConfirmWithConsent}
            >
              Confirmar Registro
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
