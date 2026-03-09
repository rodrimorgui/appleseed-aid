import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ArrowRight, CircleAlert, CircleCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { UMBRAL_IDENTIFICACION, UMBRAL_AVISO } from "@/data/mockData";

export default function PersonasManager() {
  const { personas } = usePersonas();
  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [mostrarSoloPendientes, setMostrarSoloPendientes] = useState(true);

  const filtered = useMemo(() => {
    return personas.filter((p) => {
      const matchSearch =
        `${p.nombre} ${p.apellidos}`.toLowerCase().includes(search.toLowerCase()) ||
        p.rfc.toLowerCase().includes(search.toLowerCase());
      const matchTipo =
        tipoFiltro === "todos" || p.tipoDonante === tipoFiltro;
      const hasPending =
        !mostrarSoloPendientes ||
        p.documentos.some((d) => d.estado === "pendiente") ||
        p.notificacionPendiente;
      return matchSearch && matchTipo && hasPending;
    });
  }, [search, tipoFiltro, mostrarSoloPendientes]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Gestor de Personas</h1>
        <p className="mt-1 text-muted-foreground">
          Administra la documentación de donantes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o RFC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de donante" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="Persona Física">Persona Física</SelectItem>
            <SelectItem value="Persona Moral">Persona Moral</SelectItem>
          </SelectContent>
        </Select>
        <button
          onClick={() => setMostrarSoloPendientes(!mostrarSoloPendientes)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            mostrarSoloPendientes
              ? "border-urgent/30 bg-urgent/5 text-urgent"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          <Filter className="h-4 w-4" />
          Solo pendientes
        </button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Tipo</TableHead>
              <TableHead className="hidden md:table-cell">RFC</TableHead>
              <TableHead>Documentación</TableHead>
              <TableHead>Cumplimiento</TableHead>
              <TableHead>Notificación</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  No se encontraron personas con los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const docsPendientes = p.documentos.filter(
                  (d) => d.estado === "pendiente"
                ).length;
                const docsTotal = p.documentos.length;
                const todosCompletos = docsPendientes === 0;
                const totalDonado = p.donaciones.reduce((s, d) => s + d.monto, 0);
                const superaAviso = totalDonado >= UMBRAL_AVISO;
                const superaIdentificacion = totalDonado >= UMBRAL_IDENTIFICACION;

                return (
                  <TableRow key={p.id} className="group">
                    <TableCell className="font-medium">
                      <Link to={`/personas/${p.id}`} className="hover:text-primary">
                        {p.nombre} {p.apellidos}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {p.tipoDonante}
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-sm text-muted-foreground">
                      {p.rfc}
                    </TableCell>
                    <TableCell>
                      {todosCompletos ? (
                        <StatusBadge status="complete">
                          {docsTotal}/{docsTotal} completos
                        </StatusBadge>
                      ) : (
                        <StatusBadge status="urgent">
                          {docsPendientes} pendientes
                        </StatusBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      {superaAviso ? (
                        <StatusBadge status="urgent">Aviso SAT</StatusBadge>
                      ) : superaIdentificacion ? (
                        <StatusBadge status="warning">Identificación</StatusBadge>
                      ) : (
                        <StatusBadge status="complete">Normal</StatusBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.notificacionPendiente ? (
                        <CircleAlert className="h-5 w-5 text-urgent animate-pulse-urgent" />
                      ) : (
                        <CircleCheck className="h-5 w-5 text-complete" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/personas/${p.id}`}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
