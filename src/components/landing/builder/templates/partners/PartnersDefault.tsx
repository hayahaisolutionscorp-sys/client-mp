import type { PartnersTemplateProps } from "../../types";

export default function PartnersDefault({ partners, theme }: PartnersTemplateProps) {
  if (partners.length === 0) return null;

  return (
    <section id="Partner" className="bg-white px-6 py-14">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold mb-10" style={{ color: theme.text }}>
          Our Partners
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
          {partners.map((partner) => (
             <div key={partner.id} className="flex items-center justify-center">
                <img 
                    src={partner.logo_url} 
                    alt={partner.name} 
                    className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-110" 
                />
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}
