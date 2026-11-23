import type { Metadata } from 'next';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';

export const metadata: Metadata = {
  title: 'Política de privacidad · Hackathon 2026',
  description:
    'Conoce qué información utiliza la plataforma del Hackathon Núcleo y cómo se muestra.',
};

export default function PrivacidadPage() {
  return (
    <PublicShell>
      <InnerHero
        eyebrow="Tus datos"
        title="Política de privacidad"
        description="Información sobre los datos que utilizamos para gestionar tu participación en el Hackathon Núcleo 2026."
      />
      <section className="section-wrap max-w-4xl space-y-8 leading-7 text-slate-300">
        <article className="info-panel">
          <h2 className="text-xl font-bold text-white">
            Información que utiliza la plataforma
          </h2>
          <p className="mt-3">
            Al ingresar con Google o GitHub recibimos datos básicos de la cuenta,
            como nombre, correo electrónico e imagen de perfil. Para completar
            la inscripción puedes proporcionar nombres, apellidos y universidad.
          </p>
          <p className="mt-3">
            También almacenamos la información del equipo y del proyecto que
            envíes: título, resumen, descripción, enlaces y archivos adjuntos.
          </p>
        </article>

        <article className="info-panel">
          <h2 className="text-xl font-bold text-white">
            Para qué se utiliza
          </h2>
          <p className="mt-3">
            Estos datos permiten administrar el acceso, formar equipos,
            identificar a sus integrantes, recibir entregas y organizar la
            evaluación del evento. La organización puede consultar los datos
            necesarios para gestionar la convocatoria; el jurado accede a los
            proyectos que le corresponde evaluar.
          </p>
        </article>

        <article className="info-panel">
          <h2 className="text-xl font-bold text-white">
            Información visible para otras personas
          </h2>
          <p className="mt-3">
            Las personas de tu equipo pueden consultar los nombres y la
            universidad de sus integrantes. La organización administra los
            equipos y sus entregas. Los proyectos solo aparecen en la galería
            pública cuando la organización habilita su publicación; al
            publicarse, pueden mostrarse sus datos descriptivos, enlaces,
            portada e integrantes.
          </p>
          <p className="mt-3">
            No incluyas en los campos públicos información personal que no
            quieras compartir.
          </p>
        </article>

        <article className="info-panel">
          <h2 className="text-xl font-bold text-white">
            Acceso, correcciones y consultas
          </h2>
          <p className="mt-3">
            Puedes revisar y actualizar los datos de tu perfil desde la opción
            «Editar perfil» después de ingresar. Para consultas sobre el uso de
            tus datos o solicitudes que no estén disponibles en la plataforma,
            comunícate con la organización por sus canales oficiales del evento.
          </p>
          <p className="mt-3">
            El acceso a las funciones de la plataforma se realiza mediante
            proveedores de inicio de sesión y servicios técnicos de alojamiento,
            base de datos y almacenamiento configurados para el evento.
          </p>
        </article>
      </section>
    </PublicShell>
  );
}
