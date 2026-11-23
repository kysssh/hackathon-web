import Link from 'next/link';

export function BackToPanel() {
  return (
    <Link
      href="/panel"
      className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-purple-300/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-100 transition-colors hover:bg-purple-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c5c0ff]"
    >
      <span aria-hidden="true">←</span>
      Volver al panel
    </Link>
  );
}
