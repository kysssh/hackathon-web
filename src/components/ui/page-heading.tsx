export function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="max-w-3xl"><span className="eyebrow text-purple-300">{eyebrow}</span><h2 className="display-font mt-3 text-4xl uppercase leading-tight sm:text-6xl">{title}</h2>{description && <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">{description}</p>}</div>;
}
