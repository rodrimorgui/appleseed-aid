import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  UserPlus,
  Pencil,
  ShieldCheck,
  ShieldAlert,
  Users,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import StatusBadge from "@/components/StatusBadge";
import { usePersonas } from "@/context/PersonasContext";
import type { BeneficiarioControlador } from "@/data/mockData";

const formSchema = z.object({
  nombreCompleto: z.string().min(2, "Mínimo 2 caracteres").max(200),
  nacionalidad: z.string().min(2, "Requerido").max(100),
  fechaNacimiento: z.string().min(1, "Requerido"),
  porcentajeParticipacion: z
    .string()
    .refine((v) => {
      const n = parseFloat(v);
      return !isNaN(n) && n > 0 && n <= 100;
    }, "Debe ser un número entre 0 y 100"),
  cargoControl: z.string().min(2, "Requerido").max(200),
  curp: z.string().max(18).optional(),
  esPPE: z.boolean().default(false),
  observaciones: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  personId: string;
  beneficiarios: BeneficiarioControlador[];
}

export default function BeneficiarioControladorSection({ personId, beneficiarios }: Props) {
  const { addBeneficiario, updateBeneficiario } = usePersonas();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreCompleto: "",
      nacionalidad: "Mexicana",
      fechaNacimiento: "",
      porcentajeParticipacion: "",
      cargoControl: "",
      curp: "",
      esPPE: false,
      observaciones: "",
    },
  });

  const openAdd = () => {
    setEditingId(null);
    form.reset({
      nombreCompleto: "",
      nacionalidad: "Mexicana",
      fechaNacimiento: "",
      porcentajeParticipacion: "",
      cargoControl: "",
      curp: "",
      esPPE: false,
      observaciones: "",
    });
    setOpen(true);
  };

  const openEdit = (bc: BeneficiarioControlador) => {
    setEditingId(bc.id);
    form.reset({
      nombreCompleto: bc.nombreCompleto,
      nacionalidad: bc.nacionalidad,
      fechaNacimiento: bc.fechaNacimiento,
      porcentajeParticipacion: String(bc.porcentajeParticipacion),
      cargoControl: bc.cargoControl,
      curp: bc.curp || "",
      esPPE: bc.esPPE,
      observaciones: bc.observaciones || "",
    });
    setOpen(true);
  };

  const onSubmit = (data: FormValues) => {
    const payload = {
      nombreCompleto: data.nombreCompleto,
      curp: data.curp || "",
      nacionalidad: data.nacionalidad,
      fechaNacimiento: data.fechaNacimiento,
      porcentajeParticipacion: parseFloat(data.porcentajeParticipacion),
      cargoControl: data.cargoControl,
      esPPE: data.esPPE,
      observaciones: data.observaciones || "",
    };

    if (editingId) {
      updateBeneficiario(personId, editingId, payload);
    } else {
      addBeneficiario(personId, payload);
    }
    setOpen(false);
  };

  const hasBeneficiarios = beneficiarios.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Beneficiario Controlador
          </span>
          <div className="flex items-center gap-2">
            {hasBeneficiarios ? (
              <StatusBadge status="complete">Registrado</StatusBadge>
            ) : (
              <StatusBadge status="urgent">Pendiente de registrar</StatusBadge>
            )}
            <Button size="sm" className="gap-1.5" onClick={openAdd}>
              <UserPlus className="h-3.5 w-3.5" />
              Agregar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!hasBeneficiarios && (
          <div className="flex items-center gap-3 rounded-lg border border-urgent/30 bg-urgent/5 p-4">
            <ShieldAlert className="h-5 w-5 text-urgent shrink-0" />
            <div>
              <p className="text-sm font-medium text-urgent">Falta registrar beneficiario controlador</p>
              <p className="text-xs text-muted-foreground">
                La LFPIORPI requiere identificar a toda persona física que posea o controle directa o
                indirectamente el 25% o más de la participación en la entidad.
              </p>
            </div>
          </div>
        )}

        {beneficiarios.map((bc) => (
          <div
            key={bc.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Crown className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{bc.nombreCompleto}</p>
                {bc.esPPE && (
                  <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                    PPE
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {bc.porcentajeParticipacion}% · {bc.cargoControl} · {bc.nacionalidad}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(bc)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {editingId ? "Editar" : "Agregar"} Beneficiario Controlador
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombreCompleto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl><Input placeholder="Nombre completo" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nacionalidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nacionalidad</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fechaNacimiento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de nacimiento</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="porcentajeParticipacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>% de participación</FormLabel>
                        <FormControl>
                          <Input placeholder="25" inputMode="decimal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cargoControl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo o forma de control</FormLabel>
                        <FormControl><Input placeholder="Ej: Accionista mayoritario" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="curp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CURP o identificación</FormLabel>
                      <FormControl>
                        <Input placeholder="Opcional" className="font-mono uppercase" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="esPPE"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Es Persona Políticamente Expuesta (PPE)
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl><Textarea placeholder="Opcional" rows={2} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingId ? "Guardar cambios" : "Registrar beneficiario"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
