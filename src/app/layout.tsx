import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Anton, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Hackathon 2026 | Núcleo Centro Cultural', template: '%s | Hackathon Núcleo 2026' },
  description: 'Cuatro semanas para crear proyectos que conectan cultura, comunidad y tecnología.',
  openGraph: { title: 'Hackathon Núcleo Centro Cultural 2026', description: 'Crea el futuro de la cultura y la tecnología.', locale: 'es_PE', type: 'website' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es" data-scroll-behavior="smooth" className={`${anton.variable} ${jakarta.variable} ${grotesk.variable}`}><body>{children}</body></html>;
}
