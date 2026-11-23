'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { ToastProvider, useToast } from '@/components/ui/toast';
import { Dialog } from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Accordion } from '@/components/ui/accordion';

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="display-font text-2xl uppercase text-[#f1eaff]">{title}</h2>
        {description && <p className="mt-1 text-sm text-[#c5bfd3]">{description}</p>}
      </div>
      <div className="rounded-[18px] border border-white/10 bg-[#241a38]/40 p-6">
        {children}
      </div>
    </section>
  );
}

function DevUiContent() {
  const { showToast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');

  return (
    <main className="mx-auto max-w-4xl space-y-14 px-6 py-12">
      <header className="space-y-3">
        <span className="eyebrow text-[#c5c0ff]">Sistema de diseño</span>
        <h1 className="display-font text-5xl uppercase text-[#f1eaff]">
          Componentes <span className="gradient-text">UI</span>
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-[#c5bfd3]">
          Todos los componentes reutilizables del hackathon. Usalos en las páginas
          privadas y públicas para mantener el estilo consistente.
        </p>
      </header>

      {/* ─── BUTTON ─────────────────────────────────────────── */}
      <Section title="Button" description="Variantes, tamaños y estado de carga.">
        <div className="space-y-6">
          <div>
            <p className="eyebrow mb-3 text-[#c5bfd3]">Variantes</p>
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="light">Light</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-3 text-[#c5bfd3]">Tamaños</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-3 text-[#c5bfd3]">Estados</p>
            <div className="flex flex-wrap gap-3">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── INPUT ──────────────────────────────────────────── */}
      <Section title="Input" description="Campos de texto con label, hint y error.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Nombre"
            placeholder="Tu nombre"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input label="Email" type="email" placeholder="vos@ejemplo.com" />
          <Input
            label="Con error"
            defaultValue="texto mal"
            error="Este campo no es válido"
          />
          <Input
            label="Con ayuda"
            placeholder="HACK-XXXX"
            hint="Lo recibís al crear tu equipo"
          />
          <Input label="Deshabilitado" disabled placeholder="No editable" />
          <Input label="Requerido" required placeholder="Obligatorio" />
        </div>
      </Section>

      {/* ─── TEXTAREA ───────────────────────────────────────── */}
      <Section title="Textarea" description="Texto largo para descripciones.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Textarea
            label="Descripción"
            placeholder="Contá tu idea..."
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            hint={`${textareaValue.length}/280 caracteres`}
          />
          <Textarea
            label="Con error"
            defaultValue="Muy corto"
            error="La descripción necesita al menos 40 caracteres"
          />
        </div>
      </Section>

      {/* ─── BADGE ──────────────────────────────────────────── */}
      <Section title="Badge" description="Etiquetas de estado y categoría.">
        <div className="flex flex-wrap gap-3">
          <Badge>Neutral</Badge>
          <Badge tone="brand">Brand</Badge>
          <Badge tone="success">Aprobado</Badge>
          <Badge tone="warning">Pendiente</Badge>
          <Badge tone="danger">Error</Badge>
          <Badge tone="winner">🏆 Ganador</Badge>
        </div>
      </Section>

      {/* ─── CARD ───────────────────────────────────────────── */}
      <Section title="Card" description="Contenedor con header, body y footer.">
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Byte Force</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-[#c5bfd3]">5 integrantes · Proyecto enviado</p>
            </CardBody>
            <CardFooter>
              <Button size="sm">Ver equipo</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Eco Ruta</CardTitle>
                <Badge tone="success">Finalista</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-[#c5bfd3]">
                Proyecto de movilidad sustentable para zonas rurales.
              </p>
            </CardBody>
            <CardFooter className="flex justify-between">
              <Button size="sm" variant="ghost">Detalles</Button>
              <Button size="sm">Calificar</Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      {/* ─── EMPTY STATE ────────────────────────────────────── */}
      <Section title="EmptyState" description="Cuando no hay datos que mostrar.">
        <div className="grid gap-5 md:grid-cols-2">
          <EmptyState
            title="Aún no hay proyectos"
            description="Cuando los equipos envíen sus proyectos, van a aparecer acá."
            icon="📭"
          />
          <EmptyState
            title="Sin resultados"
            description="Probá con otros términos de búsqueda."
            icon="🔍"
            action={<Button size="sm" variant="secondary">Limpiar filtros</Button>}
          />
        </div>
      </Section>

      {/* ─── SKELETON ───────────────────────────────────────── */}
      <Section title="Skeleton" description="Placeholder mientras carga.">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-32 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
      </Section>

      {/* ─── TOAST ──────────────────────────────────────────── */}
      <Section
        title="Toast"
        description="Avisos flotantes. Aparecen abajo a la derecha y se van solos."
      >
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => showToast('Proyecto guardado', 'success')}>
            Éxito
          </Button>
          <Button variant="secondary" onClick={() => showToast('Algo salió mal', 'error')}>
            Error
          </Button>
          <Button variant="ghost" onClick={() => showToast('Información útil', 'info')}>
            Info
          </Button>
        </div>
      </Section>

      {/* ─── DIALOG ─────────────────────────────────────────── */}
      <Section title="Dialog" description="Modal de confirmación. Cierra con Escape o clic afuera.">
        <Button onClick={() => setDialogOpen(true)}>Abrir diálogo</Button>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Confirmar envío"
          description="Una vez enviado, no vas a poder editar tu proyecto."
          footer={
            <>
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  showToast('Proyecto enviado', 'success');
                }}
              >
                Confirmar envío
              </Button>
            </>
          }
        >
          ¿Estás seguro de que querés enviar <strong>Eco Ruta</strong> al jurado?
        </Dialog>
      </Section>

      {/* ─── TABLE ──────────────────────────────────────────── */}
      <Section title="Table" description="Para el panel de organización.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Calificaciones</TableHead>
              <TableHead>Promedio</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold">Eco Ruta</TableCell>
              <TableCell>Eco Ruta</TableCell>
              <TableCell>3</TableCell>
              <TableCell>8.5</TableCell>
              <TableCell>
                <Badge tone="winner">Ganador</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Byte Force</TableCell>
              <TableCell>Byte Force</TableCell>
              <TableCell>2</TableCell>
              <TableCell>7.2</TableCell>
              <TableCell>
                <Badge tone="success">Finalista</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold">Solo Dev</TableCell>
              <TableCell>Solo Dev</TableCell>
              <TableCell>0</TableCell>
              <TableCell>—</TableCell>
              <TableCell>
                <Badge tone="warning">Sin calificar</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      {/* ─── ACCORDION ──────────────────────────────────────── */}
      <Section title="Accordion" description="Para preguntas frecuentes.">
        <Accordion
          items={[
            {
              id: 'q1',
              question: '¿Quién puede participar?',
              answer:
                'Cualquier persona mayor de 18 años interesada en cultura y tecnología. No hace falta ser programador.',
            },
            {
              id: 'q2',
              question: '¿Cuántos integrantes por equipo?',
              answer:
                'Entre 2 y 5 personas. El líder crea el equipo y recibe un código HACK-XXXX para invitar a los demás.',
            },
            {
              id: 'q3',
              question: '¿Hasta cuándo puedo enviar mi proyecto?',
              answer:
                'Hasta la fecha de cierre indicada en el cronograma. Después de esa fecha, el botón de envío se bloquea.',
            },
          ]}
        />
      </Section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-white/10 pt-8 text-center text-xs text-[#c5bfd3]">
        <p>
          Última actualización: {new Date().toLocaleDateString('es-PE')} · Hackathon
          Cultural 2026
        </p>
      </footer>
    </main>
  );
}

export default function DevUiPage() {
  return (
    <ToastProvider>
      <DevUiContent />
    </ToastProvider>
  );
}
