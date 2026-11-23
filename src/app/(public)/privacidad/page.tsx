import type { Metadata } from 'next';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';

export const metadata: Metadata = {
  title: 'Política de Privacidad · Hackathon UNI 2026',
  description: 'Conoce cómo recopilamos, usamos y protegemos tus datos personales en la plataforma del Hackathon UNI 2026.',
};

export default function PrivacidadPage() {
  return (
    <PublicShell>
      <InnerHero
        eyebrow="Legal"
        title="Política de Privacidad"
        description="Última actualización: noviembre de 2026"
      />
      <section className="section-wrap">
        <div className="mx-auto max-w-3xl space-y-10 leading-7 text-slate-300">

          <div>
            <h2 className="text-xl font-bold text-white">1. Responsable del tratamiento</h2>
            <p className="mt-3">
              El responsable del tratamiento de los datos personales recogidos a través de esta
              plataforma es <strong className="text-white">Núcleo Centro Cultural</strong>, organizador
              del Hackathon UNI 2026, con sede en la Universidad Nacional de Ingeniería (UNI), Lima, Perú.
              Para cualquier consulta relacionada con el tratamiento de tus datos puedes escribirnos a{' '}
              <a href="mailto:kyshze10@gmail.com" className="text-link">kyshze10@gmail.com</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">2. Datos que recopilamos</h2>
            <p className="mt-3">
              Cuando inicias sesión con Google o GitHub, obtenemos exclusivamente los datos que esos
              proveedores comparten con nosotros bajo tu autorización:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>Nombre y apellido (o nombre de usuario).</li>
              <li>Dirección de correo electrónico.</li>
              <li>URL de foto de perfil (opcional, según configuración de tu cuenta).</li>
            </ul>
            <p className="mt-3">
              Adicionalmente, recopilamos la información que tú y tu equipo ingresan voluntariamente en
              la plataforma: nombre del equipo, nombre y descripción del proyecto, enlaces de repositorio
              y demo, archivos adjuntos (pitch deck e imagen de portada).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">3. Finalidad del tratamiento</h2>
            <p className="mt-3">Usamos tus datos exclusivamente para:</p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>Gestionar tu cuenta e identificarte dentro de la plataforma.</li>
              <li>Permitirte crear o unirte a un equipo y registrar tu proyecto.</li>
              <li>Mostrar tu nombre e imagen en la galería pública de proyectos (solo si tu equipo
                envía el proyecto y la organización lo hace visible).</li>
              <li>Asignar roles de jurado u organizador según la lista de correos configurada.</li>
              <li>Comunicaciones relacionadas con el evento (resultados, avisos importantes).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">4. Base legal</h2>
            <p className="mt-3">
              El tratamiento se basa en tu consentimiento explícito, otorgado al iniciar sesión con
              Google o GitHub y al aceptar estas condiciones. Puedes retirar tu consentimiento en
              cualquier momento solicitando la eliminación de tu cuenta.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">5. Compartición de datos con terceros</h2>
            <p className="mt-3">
              No vendemos ni cedemos tus datos a terceros con fines comerciales. Para el funcionamiento
              de la plataforma utilizamos los siguientes servicios:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li><strong className="text-white">Supabase</strong> (base de datos y almacenamiento de archivos), con servidores en AWS.</li>
              <li><strong className="text-white">Vercel</strong> (alojamiento de la aplicación web).</li>
              <li><strong className="text-white">Google LLC</strong> y <strong className="text-white">GitHub Inc.</strong> como proveedores de autenticación OAuth.</li>
            </ul>
            <p className="mt-3">
              Estos proveedores actúan como encargados del tratamiento y están sujetos a sus propias
              políticas de privacidad y a la normativa aplicable.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">6. Conservación de datos</h2>
            <p className="mt-3">
              Conservamos tus datos mientras tu cuenta esté activa o mientras sean necesarios para las
              finalidades descritas. Una vez concluido el evento y el período de archivo (máximo 12 meses
              después del Demo Day), eliminaremos o anonimizaremos los datos personales, salvo que la ley
              exija conservarlos por más tiempo.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">7. Tus derechos</h2>
            <p className="mt-3">
              De acuerdo con la Ley N.° 29733 (Ley de Protección de Datos Personales del Perú) y su
              reglamento, tienes derecho a:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>Acceder a los datos que tenemos sobre ti.</li>
              <li>Rectificar datos inexactos o incompletos.</li>
              <li>Cancelar o solicitar la eliminación de tus datos.</li>
              <li>Oponerte al tratamiento de tus datos.</li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquiera de estos derechos, escríbenos a{' '}
              <a href="mailto:kyshze10@gmail.com" className="text-link">kyshze10@gmail.com</a>{' '}
              indicando tu nombre, correo y la solicitud concreta.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">8. Cookies y almacenamiento local</h2>
            <p className="mt-3">
              La plataforma utiliza una única cookie de sesión firmada (HttpOnly, Secure) para mantener
              tu inicio de sesión activo. No utilizamos cookies de seguimiento ni publicidad de terceros.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">9. Cambios en esta política</h2>
            <p className="mt-3">
              Podemos actualizar esta política para reflejar cambios en la plataforma o en la normativa.
              Te notificaremos de cambios significativos mediante un aviso en la plataforma o por correo
              electrónico. El uso continuado tras la notificación implica la aceptación de los cambios.
            </p>
          </div>

        </div>
      </section>
    </PublicShell>
  );
}
