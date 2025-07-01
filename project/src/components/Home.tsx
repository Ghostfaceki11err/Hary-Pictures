import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HomeProps {
  onPageChange: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ onPageChange }) => {
  const portfolioItems = [
    {
      title: 'የመስክ ፎቶዎች',
      //category: 'የመስክ',
      size: 'large',
      image: '/Image/mesk/Caro_1744920338390_1.png'
    },
    {
      title: 'ክርስትና',
      //category: 'CORPORATE • EVENT',
      size: 'medium',
      image: '/Image/cristina/Caro_1746478217049_3.png'
    },
    {
      title: 'PORTRAITS',
      //category: 'PORTRAIT',
      size: 'medium',
      image: '/Image/portrait/IMG_20250209_212848_037.jpg'
    },
    {
      title: 'ሽምግልና',
      //category: 'ሽምግልና',
      size: 'medium',
      image: '/Image/shimglina/Caro_1749502983577_1.png'
    },
    /*{
      title: 'DOCUMENTARY',
      category: 'DOCUMENTARY',
      size: 'large',
      image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'COMMERCIAL',
      category: 'COMMERCIAL • EDITORIAL',
      size: 'medium',
      image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      title: 'NATURE & TRAVEL',
      category: 'DOCUMENTARY • TRAVEL',
      size: 'small',
      image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=500'
    },
    {
      title: 'EVENTS',
      category: 'CORPORATE • EVENT',
      size: 'medium',
      image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      title: 'ARTISTIC PORTRAITS',
      category: 'PORTRAIT • ARTISTIC',
      size: 'large',
      image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      title: 'PRODUCT PHOTOGRAPHY',
      category: 'FOOD • PRODUCT',
      size: 'small',
      image: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=500'
    },
    {
      title: 'BRAND CAMPAIGNS',
      category: 'COMMERCIAL',
      size: 'medium',
      image: 'https://images.pexels.com/photos/1181712/pexels-photo-1181712.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      title: 'WILD LIFE',
      category: 'NATURE • WILDLIFE',
      size: 'small',
      image: 'https://images.pexels.com/photos/1181772/pexels-photo-1181772.jpeg?auto=compress&cs=tinysrgb&w=500'
    }*/
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16">
        {/* Hero Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-wider">
            Hary Pictures
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 tracking-widest font-light">
              P H O T O G R A P H Y
            </p>
            <div className="w-24 h-px bg-white mx-auto mb-8"></div>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto font-light">
            A photographer based in Ethiopia specialized in graphic design, cinematography and event photography with 
            a passion for capturing moments and telling stories through images.
            </p>
          </div>

          {/* Large Hero Image */}
          <div className="relative h-96 sm:h-[500px] lg:h-[600px] overflow-hidden max-w-6xl mx-auto">
            <img 
              src="/Image/mesk/Caro_1744920338390_1.png"
              alt="Featured Photography Work"
              className="w-full h-full object-contain transition-all duration-700"
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
            {portfolioItems.map((item, index) => (
              <div
                key={index}
                className={`group cursor-pointer transition-all duration-500 hover:scale-105 ${
                  item.size === 'large' ? 'sm:col-span-2 lg:col-span-2' :
                  item.size === 'medium' ? 'sm:col-span-1' :
                  'sm:col-span-1'
                }`}
                onClick={() => onPageChange('portfolio')}
              >
                {/* Image Container */}
                <div className={`relative overflow-hidden mb-4 ${
                  item.size === 'large' ? 'aspect-[4/3]' :
                  item.size === 'medium' ? 'aspect-[3/4]' :
                  'aspect-square'
                }`}>
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500"></div>
                  
                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/30 transition-all duration-500"></div>
                </div>

                {/* Title and Category Below Image */}
                <div className="text-center">
                  <h3 className="text-white font-bold text-sm mb-1 tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs tracking-widest font-light">
                    {item.category}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* View Portfolio Button */}
          <div className="text-center mt-16">
            <button
              onClick={() => onPageChange('portfolio')}
              className="group bg-transparent border border-white text-white hover:bg-white hover:text-black px-8 py-3 font-medium tracking-widest transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              VIEW PORTFOLIO
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-px bg-white mx-auto mb-8"></div>
          <blockquote className="text-2xl sm:text-3xl text-white font-light leading-relaxed tracking-wide mb-8">
            "Just Like Your Beauty!"
          </blockquote>
          <div className="w-24 h-px bg-white mx-auto"></div>
        </div>
      </section>

      {/* Footer Info */}
      <section className="py-12 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm">
            <p>Copyright © 2025</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="https://www.instagram.com/hary_picture7?igsh=MXFqeDFmeGFxdXRzNQ==" className="hover:text-white transition-colors duration-300" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://t.me/harygraphic" className="hover:text-white transition-colors duration-300" target="_blank" rel="noopener noreferrer">Telegram</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;