import React from 'react';
const sponsors = [
  'pillarh.png',
  'municipalidad.png',
  'mercaditoladespensa.png',
  'pillarh.png',
  'municipalidad.png',
  'mercaditoladespensa.png',
  'pillarh.png',
  'municipalidad.png',
  'mercaditoladespensa.png',
];

// Se duplica la lista para que el efecto de bucle sea infinito y sin cortes
const allSponsors = [...sponsors, ...sponsors];

export default function SponsorBanner() {
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-900/80 py-4 mt-8 overflow-hidden backdrop-blur-sm border-y border-yellow-400/20">
      <div className="animate-scroll flex items-center">
        {allSponsors.map((logo, index) => (
          <div key={index} className="flex-shrink-0 mx-10">
            <img 
              src={`${import.meta.env.BASE_URL}img/sponsors/${logo}`} 
              alt={`Patrocinador ${index + 1}`}
              className="h-10 md:h-12 max-w-none" // max-w-none es importante para que las imágenes no se encojan
            />
          </div>
        ))}
      </div>
    </div>
  );
}