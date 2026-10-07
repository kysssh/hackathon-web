export function InnerHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <section className="inner-hero px-5 py-18 sm:py-24"><div className="mx-auto max-w-6xl"><span className="eyebrow text-purple-300">{eyebrow}</span><h1 className="display-font mt-4 max-w-4xl text-5xl uppercase leading-tight sm:text-7xl">{title}</h1><p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{description}</p></div></section>;
}
