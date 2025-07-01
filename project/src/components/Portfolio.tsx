import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';

const Portfolio: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  type PortfolioItem = {
    id: number;
    category: string;
    title: string;
    description: string;
    image?: string;
  };

  const categories = [
    { id: 'all', label: 'All Work' },
    { id: 'የመስክ ፎቶዎች', label: 'የመስክ ፎቶዎች' },
    { id: 'portrait', label: 'Portraits' },
    { id: 'ክርስትና', label: 'ክርስትና' },
    { id: 'ሽምግልና', label: 'ሽምግልና' }
  ];

  const meskImages = [
    '/Image/mesk/Caro_1744920337266_0.png',
    '/Image/mesk/Caro_1744920338390_1.png',
    '/Image/mesk/Caro_1744920339210_2.png',
    '/Image/mesk/Caro_1744920340106_3.png',
    '/Image/mesk/Caro_1744920340911_4.png',
    '/Image/mesk/Caro_1744920341748_5.png',
    '/Image/mesk/Caro_1744920342536_6.png',
    '/Image/mesk/Caro_1744920343220_7.png',
    '/Image/mesk/Caro_1744920344046_8.png',
    '/Image/mesk/Caro_1744920344845_9.png',
    '/Image/mesk/Caro_1744921380662_1.png',
    '/Image/mesk/Caro_1744921381612_2.png',
    '/Image/mesk/Caro_1744921382495_3.png',
    '/Image/mesk/Caro_1744921383561_4.png',
    '/Image/mesk/Caro_1744921384396_5.png',
    '/Image/mesk/Caro_1744921387263_8.png',
    '/Image/mesk/Caro_1744921388056_9.png',
    '/Image/mesk/Caro_1744921863423_0.png',
    '/Image/mesk/Caro_1744921864509_1.png',
    '/Image/mesk/Caro_1744921865407_2.png',
    '/Image/mesk/Caro_1744921866382_3.png',
  ];

  const portraitImages = [
    '/Image/portrait/IMG_20250209_210543_070.jpg',
    '/Image/portrait/IMG_20250209_212716_397.jpg',
    '/Image/portrait/IMG_20250209_212848_037.jpg',
  ];

  const portraitItems: PortfolioItem[] = portraitImages.map((img, idx) => ({
    id: 200 + idx,
    category: 'portrait',
    title: `Portrait ${idx + 1}`,
    description: 'Portrait photography',
    image: img
  }));

  const shimglinaImages = [
    '/Image/shimglina/Caro_1749502988071_5.png',
    '/Image/shimglina/Caro_1749502983577_1.png',
    '/Image/shimglina/Caro_1749502985837_3.png',
    '/Image/shimglina/Caro_1747084532140_6.png',
    '/Image/shimglina/Caro_1747085559964_1.png',
    '/Image/shimglina/Caro_1747084527401_2.png',
    '/Image/shimglina/Caro_1747084524732_0.png',
    '/Image/shimglina/Caro_1740055145650_3.png',
    '/Image/shimglina/Caro_1740113961896_0.png',
    '/Image/shimglina/Caro_1740055144495_2.png',
    '/Image/shimglina/Caro_1740055143390_1.png',
    '/Image/shimglina/Caro_1740055142324_0.png',
    '/Image/shimglina/Caro_1749502989407_6.png',
    '/Image/shimglina/Caro_1749502986917_4.png',
    '/Image/shimglina/Caro_1749502984697_2.png',
    '/Image/shimglina/Caro_1749502982509_0.png',
    '/Image/shimglina/Caro_1747084526251_1.png',
    '/Image/shimglina/Caro_1747084529673_4.png',
    '/Image/shimglina/Caro_1747084528554_3.png',
  ];

  const shimglinaItems: PortfolioItem[] = shimglinaImages.map((img, idx) => ({
    id: 300 + idx,
    category: 'ሽምግልና',
    title: `Shimglina ${idx + 1}`,
    description: 'ሽምግልና ፎቶዎች',
    image: img
  }));

  const cristinaImages = [
    '/Image/cristina/Caro_1746461453024_0.png',
    '/Image/cristina/Caro_1746461454349_1.png',
    '/Image/cristina/Caro_1746461455323_2.png',
    '/Image/cristina/Caro_1746478217049_3.png',
    '/Image/cristina/Caro_1746650889272_0.png',
  ];

  const cristinaItems: PortfolioItem[] = cristinaImages.map((img, idx) => ({
    id: 400 + idx,
    category: 'ክርስትና',
    title: `Cristina ${idx + 1}`,
    description: 'ክርስትና ፎቶዎች',
    image: img
  }));

  const portfolioItems: PortfolioItem[] = [
    ...meskImages.map((img, idx) => ({
      id: idx + 1,
      category: 'የመስክ ፎቶዎች',
      title: `Field Photo ${idx + 1}`,
      description: 'የመስክ ፎቶዎች ስእሎች',
      image: img
    })),
    ...portraitItems,
    ...shimglinaItems,
    ...cristinaItems,
    /*{ id: 101, category: 'ክርስትና', title: ' ', description: ' ', image: '/Image/cristina/Caro_1746461453024_0.png' },*/
    /*{ id: 104, category: 'ክርስትና', title: ' ', description: ' ', image: '/Image/cristina/Caro_1746461454349_1.png' },*/
    /*{ id: 107, category: 'ክርስትና', title: ' ', description: ' ', image: '/Image/cristina/Caro_1746461455323_2.png' },*/
  ];

  const filteredItems = selectedCategory === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            My Portfolio
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            A collection of my finest work, showcasing the beauty and emotion in every frame
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                onClick={() => {
                  if (item.image) {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  } else {
                    setSelectedImage(index);
                  }
                }}
              >
                {/* Show image if available, else fallback to gradient */}
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="aspect-square w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                  />
                ) : (
                <div className="aspect-square bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-200 text-sm">{item.description}</p>
                </div>

                {/* Camera Icon if no image */}
                {!item.image && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={48} className="text-white opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-blue-600/80 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {item.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal for images */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={filteredItems.filter(i => i.image).map(i => ({ src: i.image!, title: i.title, description: i.description }))}
          on={{ view: ({ index }) => setLightboxIndex(index) }}
          plugins={[Fullscreen, Zoom, Slideshow]}
          slideshow={{ delay: 8000 }}
          render={{
            slideHeader: () => (
              <div className="absolute top-4 left-4 z-50">
                <div className="text-white text-lg font-semibold bg-black/60 rounded px-3 py-1">
                  {lightboxIndex + 1} / {filteredItems.filter(i => i.image).length}
                </div>
              </div>
            )
          }}
        />
      )}
      {/* Lightbox Modal for non-image items */}
      {selectedImage !== null && !filteredItems[selectedImage].image && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-300"
            >
              <X size={32} />
            </button>
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 aspect-video rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <Camera size={64} className="mx-auto mb-4 opacity-80" />
                <h3 className="text-2xl font-bold mb-2">{filteredItems[selectedImage].title}</h3>
                <p className="text-lg opacity-90">{filteredItems[selectedImage].description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;