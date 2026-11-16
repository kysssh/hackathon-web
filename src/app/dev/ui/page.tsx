'use client';

import { useState } from 'react';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Countdown } from '@/components/ui/countdown';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { PublicShell } from '@/components/ui/public-shell';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Toast } from '@/components/ui/toast';

export default function DevUiPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <PublicShell>
      <div className="section-wrap max-w-5xl space-y-16">
        <div>
          <span className="eyebrow text-emerald-300">Catálogo de componentes</span>
          <h1 className="display-font mt-2 text-5xl uppercase tracking-wide text-white sm:text-6xl">
            Biblioteca UI (Semana 1)
          </h1>
          <p className="mt-4 text-slate-300">
            Muestrario de los componentes visuales reutilizables definidos en el contrato de diseño y páginas públicas (UX).
          </p>
        </div>

        {/* Botones */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-purple-200">
            1. Botones (Button)
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="light">Light</Button>
            <Button variant="danger">Peligro</Button>
            <Button variant="primary" loading>
              Cargando
            </Button>
            <Button variant="primary" disabled>
              Deshabilitado
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button size="sm">Pequeño (sm)</Button>
            <Button size="md">Mediano (md)</Button>
            <Button size="lg">Grande (lg)</Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-purple-200">
            2. Insignias (Badge)
          </h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">Predeterminado</Badge>
            <Badge variant="winner">★ Ganador</Badge>
            <Badge variant="finalist">Finalista</Badge>
            <Badge variant="success">Entregado</Badge>
            <Badge variant="warning">Pendiente</Badge>
            <Badge variant="neutral">Borrador</Badge>
          </div>
        </section>

        {/* Entradas */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-purple-200">
            3. Entradas de texto (Input & Textarea)
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Nombre del equipo"
              placeholder="Ej: Byte Force"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              hint="Entre 3 y 40 caracteres."
            />
            <Input
              label="Campo con error"
              defaultValue="Dato incorrecto"
              error="Este nombre de equipo ya fue utilizado."
            />
          </div>
          <Textarea
            label="Resumen del proyecto"
            placeholder="Breve descripción ejecutiva..."
            maxLength={280}
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            hint="Máximo 280 caracteres."
          />
        </section>

        {/* Tarjetas */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-purple-200">
            4. Tarjetas (Card)
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card variant="panel">
              <CardHeader>
                <CardTitle>Tarjeta de información</CardTitle>
                <CardDescription>
                  Diseñada con estilo panel para áreas operativas y formularios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  Contenido adaptable para datos del equipo o resúmenes de estado.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-slate-400">Actualizado recientemente</span>
                <Button size="sm" variant="secondary">
                  Detalles
                </Button>
              </CardFooter>
            </Card>

            <Card variant="feature">
              <span className="display-font text-5xl text-purple-300/60">01</span>
              <CardHeader className="mt-4">
                <CardTitle>Tarjeta de reto / característica</CardTitle>
                <CardDescription>
                  Utilizada en el landing público con efecto hover y elevación.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">
                  Perfecta para destacar tracks y categorías de la convocatoria.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Toasts */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-purple-200">
            5. Alertas y notificaciones (Toast)
          </h2>
          <div className="space-y-3 max-w-xl">
            <Toast variant="info" title="Información oficial">
              Las inscripciones de equipos cierran el 13 de noviembre.
            </Toast>
            <Toast variant="success" title="Proyecto enviado">
              Tu proyecto fue registrado satisfactoriamente dentro del plazo.
            </Toast>
            <Toast variant="warning" title="Faltan requisitos">
              Debes subir el pitch deck en PDF para habilitar la entrega.
            </Toast>
            <Toast variant="error" title="Acceso denegado">
              No tienes permisos para acceder al panel de organización.
            </Toast>
          </div>
        </section>

        {/* Tabla */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-purple-200">
            6. Tablas (Table)
          </h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold text-white">
                    Ruta Cultural AR
                  </TableCell>
                  <TableCell>Byte Force</TableCell>
                  <TableCell>
                    <Badge variant="winner">Ganador</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-purple-200">
                    9.45
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-white">
                    Memoria Viva
                  </TableCell>
                  <TableCell>Eco Ruta</TableCell>
                  <TableCell>
                    <Badge variant="finalist">Finalista</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-purple-200">
                    8.80
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* Acordeón y Cuenta Regresiva */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-purple-200">
            7. Acordeón (Accordion) y Cuenta Regresiva (Countdown)
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Preguntas frecuentes
              </h3>
              <Accordion>
                <AccordionItem title="¿Quién puede subir entregables?">
                  Cualquier integrante del equipo puede subir y gestionar los archivos
                  en el panel de proyecto antes del cierre.
                </AccordionItem>
                <AccordionItem title="¿Quién realiza la entrega final?">
                  Únicamente el líder del equipo puede confirmar la entrega definitiva.
                </AccordionItem>
              </Accordion>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
                Temporizador
              </h3>
              <div className="info-panel p-5">
                <Countdown target="2026-11-20T23:59:00-05:00" />
              </div>
            </div>
          </div>
        </section>

        {/* Estados vacíos y Skeletons */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-purple-200">
            8. Estados vacíos (EmptyState) y Carga (Skeleton)
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <EmptyState
              title="No hay proyectos registrados"
              description="Sé el primero en inscribir a tu equipo y comenzar a construir."
              action={<Button variant="primary">Crear equipo</Button>}
            />
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-9 w-24" />
              </div>
            </Card>
          </div>
        </section>

        {/* Modal interactivo */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-purple-200">
            9. Ventana modal (Dialog)
          </h2>
          <Button onClick={() => setDialogOpen(true)}>Abrir diálogo modal</Button>
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Confirmación de entrega"
            description="Revisa con atención antes de confirmar el envío formal."
          >
            <p className="text-sm text-slate-300">
              Una vez confirmada la entrega, el proyecto quedará visible para la
              revisión del jurado al cerrarse el plazo oficial.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={() => setDialogOpen(false)}>
                Entendido
              </Button>
            </div>
          </Dialog>
        </section>
      </div>
    </PublicShell>
  );
}
