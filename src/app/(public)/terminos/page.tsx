import type { Metadata } from 'next';
import { InnerHero } from '@/components/ui/inner-hero';
import { PublicShell } from '@/components/ui/public-shell';

export const metadata: Metadata = {
  title: 'Términos del Servicio · Hackathon UNI 2026',
  description: 'Conoce las condiciones de uso de la plataforma del Hackathon UNI 2026.',
};

export default function TerminosPage() {
  return (
    <PublicShell>
      <InnerHero
        eyebrow="Legal"
        title="Términos del Servicio"
        description="Última actualización: noviembre de 2026"
      />
      <section className="section-wrap">
        <div className="mx-auto max-w-3xl space-y-10 leading-7 text-slate-300">

          <div>
            <h2 className="text-xl font-bold text-white">1. Aceptación de las condiciones</h2>
            <p className="mt-3">
              Al acceder a la plataforma del <strong className="text-white">Hackathon UNI 2026</strong>{' '}
              y crear una cuenta, aceptas estos Términos del Servicio en su totalidad. Si no estás de
              acuerdo con alguna de las condiciones, no debes utilizar la plataforma.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">2. Descripción del servicio</h2>
            <p className="mt-3">
              La plataforma es una herramienta digital organizada por <strong className="text-white">Núcleo
              Centro Cultural</strong> para gestionar la inscripción de equipos, la entrega de proyectos
              y la evaluación del Hackathon UNI 2026, con sede en la Universidad Nacional de Ingeniería
              (UNI), Lima, Perú.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">3. Elegibilidad</h2>
            <p className="mt-3">
              La participación está abierta a estudiantes universitarios activos de cualquier institución
              de educación superior. Los equipos deben estar conformados por exactamente cuatro (4)
              integrantes. La organización se reserva el derecho de verificar la elegibilidad de los
              participantes en cualquier momento.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">4. Uso aceptable</h2>
            <p className="mt-3">Te comprometes a:</p>
            <ul className="mt-3 list-inside list-disc space-y-1">
              <li>Proporcionar información veraz al registrarte y al describir tu proyecto.</li>
              <li>No suplantar la identidad de otra persona ni crear cuentas falsas.</li>
              <li>No intentar acceder a áreas restringidas de la plataforma sin autorización.</li>
              <li>No publicar contenido ofensivo, difamatorio, ilegal o que infrinja derechos de terceros.</li>
              <li>Respetar las fechas y reglas del evento publicadas por la organización.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">5. Propiedad intelectual de los proyectos</h2>
            <p className="mt-3">
              Los equipos conservan todos los derechos sobre los proyectos que desarrollen y suban a la
              plataforma. Al enviar un proyecto, otorgas a Núcleo Centro Cultural una licencia no
              exclusiva, gratuita y limitada al evento para mostrar tu proyecto en la galería pública,
              materiales de difusión y comunicaciones relacionadas con el Hackathon UNI 2026.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">6. Contenido subido por los usuarios</h2>
            <p className="mt-3">
              Eres responsable de todo el contenido que subas a la plataforma (textos, imágenes, archivos
              PDF). Garantizas que tienes los derechos necesarios para publicarlo y que no infringe
              derechos de propiedad intelectual, privacidad ni ninguna ley aplicable. La organización
              puede eliminar contenido que infrinja estas condiciones sin previo aviso.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">7. Autenticación mediante terceros</h2>
            <p className="mt-3">
              El acceso a la plataforma se realiza exclusivamente mediante tu cuenta de Google o GitHub.
              Al utilizarlas, aceptas también las condiciones de servicio y políticas de privacidad de
              dichos proveedores. Núcleo Centro Cultural no almacena tus contraseñas de Google ni GitHub.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">8. Limitación de responsabilidad</h2>
            <p className="mt-3">
              La plataforma se proporciona "tal como está". Núcleo Centro Cultural no garantiza que el
              servicio esté disponible de forma ininterrumpida ni libre de errores. En la medida permitida
              por la ley, no nos hacemos responsables de daños directos, indirectos o consecuentes
              derivados del uso o la imposibilidad de uso de la plataforma.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">9. Modificaciones del servicio</h2>
            <p className="mt-3">
              Nos reservamos el derecho de modificar, suspender o interrumpir la plataforma en cualquier
              momento, especialmente tras la conclusión del Hackathon UNI 2026. También podemos actualizar
              estos Términos; los cambios sustanciales se comunicarán con al menos 7 días de anticipación.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">10. Ley aplicable y jurisdicción</h2>
            <p className="mt-3">
              Estos Términos se rigen por las leyes de la República del Perú. Cualquier disputa se
              someterá a los tribunales competentes de la ciudad de Lima, Perú.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">11. Contacto</h2>
            <p className="mt-3">
              Para consultas sobre estos Términos, escríbenos a{' '}
              <a href="mailto:kyshze10@gmail.com" className="text-link">kyshze10@gmail.com</a>.
            </p>
          </div>

        </div>
      </section>
    </PublicShell>
  );
}
