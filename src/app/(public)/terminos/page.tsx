import type { Metadata } from 'next';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';
import { eventConfig } from '@/config/event';

export const metadata: Metadata = {
  title: 'Términos y condiciones · Hackathon 2026',
  description:
    'Reglas de uso de la plataforma para participantes del Hackathon Núcleo 2026.',
};

export default function TerminosPage() {
  return (
    <PublicShell>
      <InnerHero
        eyebrow="Uso de la plataforma"
        title="Términos y condiciones"
        description="Reglas para utilizar la plataforma y participar en el Hackathon Núcleo 2026."
      />
      <section className="section-wrap max-w-4xl space-y-8 leading-7 text-slate-300">
        <article className="info-panel">
          <h2 className="text-xl font-bold text-white">Cuenta y perfil</h2>
          <p className="mt-3">
            Ingresa con tu propia cuenta de Google o GitHub y proporciona
            información correcta para identificarte durante el evento. Mantén
            el control de tu cuenta y no compartas tus credenciales.
          </p>
        </article>

        <article className="info-panel">
          <h2 className="text-xl font-bold text-white">Equipos</h2>
          <p className="mt-3">
            Cada participante puede pertenecer a un solo equipo. Los equipos
            deben tener {eventConfig.team.minMembers} integrantes. Quien crea
            el equipo es su líder y es la única persona que puede consultar el
            código de invitación desde la plataforma; el líder debe compartirlo
            con quienes se unirán.
          </p>
        </article>

        <article className="info-panel">
          <h2 className="text-xl font-bold text-white">
            Proyectos y archivos
          </h2>
          <p className="mt-3">
            Envía contenido relacionado con el evento y que tengas derecho a
            compartir. Los archivos requeridos dependen de la fase: documento
            Word y portada en la primera; presentación, portada actualizada y
            enlace del video en Drive en la segunda; y presentación y portada
            actualizadas, dominio desplegado y repositorio de GitHub en
            semifinal. Las presentaciones aceptan PDF, PPT o PPTX; el Word
            acepta DOC o DOCX. La portada acepta PNG, JPG o WEBP. Los archivos
            extra son opcionales; los límites se indican junto a cada sección.
          </p>
          <p className="mt-3">
            Solo el líder puede enviar el proyecto. El envío debe completarse
            durante la ventana indicada en el{' '}
            <a href="/cronograma" className="text-link">
              cronograma
            </a>
            . La organización determina qué proyectos se publican en la galería.
          </p>
        </article>

        <article className="info-panel">
          <h2 className="text-xl font-bold text-white">
            Uso adecuado y administración
          </h2>
          <p className="mt-3">
            No cargues contenido ilegal, dañino, engañoso o que infrinja
            derechos de otras personas. La organización administra la
            convocatoria, puede revisar las entregas para su evaluación y
            publicación, y puede actualizar la información del evento mediante
            sus canales oficiales.
          </p>
        </article>
      </section>
    </PublicShell>
  );
}
