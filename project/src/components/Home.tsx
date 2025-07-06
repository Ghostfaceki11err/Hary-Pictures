import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface HomeProps {
  onPageChange: (page: string) => void;
}

const Home: React.FC<HomeProps> = ({ onPageChange }) => {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const heroRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const portfolioItems = [
    {
      title: 'የመስክ ፎቶዎች',
      //category: 'የመስክ',
      size: 'large',
      image: '/Image/mesk/Caro_1744920338390_1.webp'
    },
    {
      title: 'ክርስትና',
      //category: 'CORPORATE • EVENT',
      size: 'medium',
      image: '/Image/cristina/Caro_1746478217049_3.webp'
    },
    {
      title: 'PORTRAITS',
      //category: 'PORTRAIT',
      size: 'medium',
      image: '/Image/portrait/IMG_20250209_212848_037.webp'
    },
    {
      title: 'ሽምግልና',
      //category: 'ሽምግልና',
      size: 'medium',
      image: '/Image/shimglina/Caro_1749502983577_1.webp'
    },
    {
      title: 'ሰርግ',
      //category: 'serg',
      size: 'medium',
      image: '/Image/serg/Caro_1751540927481_2.webp'
    },
    /*{
      title: 'COMMERCIAL',
      category: 'COMMERCIAL • EDITORIAL',
      size: 'medium',
      image: ' '
    },
    {
      title: 'NATURE & TRAVEL',
      category: 'DOCUMENTARY • TRAVEL',
      size: 'small',
      image: ' '
    },
    {
      title: 'EVENTS',
      category: 'CORPORATE • EVENT',
      size: 'medium',
      image: ' '
    },
    {
      title: 'ARTISTIC PORTRAITS',
      category: 'PORTRAIT • ARTISTIC',
      size: 'large',
      image: ' '
    },
    {
      title: 'PRODUCT PHOTOGRAPHY',
      category: 'FOOD • PRODUCT',
      size: 'small',
      image: ' '
    },
    {
      title: 'BRAND CAMPAIGNS',
      category: 'COMMERCIAL',
      size: 'medium',
      image: ' '
    },
    {
      title: 'WILD LIFE',
      category: 'NATURE • WILDLIFE',
      size: 'small',
      image: ' '
    }*/
  ];

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    const elements = [
      { ref: heroRef, id: 'hero' },
      { ref: portfolioRef, id: 'portfolio' },
      { ref: quoteRef, id: 'quote' },
      { ref: footerRef, id: 'footer' }
    ];

    elements.forEach(({ ref, id }) => {
      if (ref.current) {
        ref.current.id = id;
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`relative pt-32 pb-16 transition-all duration-1000 ${
          isVisible['hero'] 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Hero Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className={`text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-wider transition-all duration-1000 delay-300 ${
              isVisible['hero'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}>
            Hary Pictures
            </h1>
            <p className={`text-lg sm:text-xl text-gray-300 mb-8 tracking-widest font-light transition-all duration-1000 delay-500 ${
              isVisible['hero'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}>
              P H O T O G R A P H Y
            </p>
            <div className={`w-24 h-px bg-white mx-auto mb-8 transition-all duration-1000 delay-700 ${
              isVisible['hero'] 
                ? 'opacity-100 scale-x-100' 
                : 'opacity-0 scale-x-0'
            }`}></div>
            <p className={`text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto font-light transition-all duration-1000 delay-900 ${
              isVisible['hero'] 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}>
            A photographer based in Ethiopia specialized in graphic design, cinematography and event photography with 
            a passion for capturing moments and telling stories through images.
            </p>
          </div>

          {/* Large Hero Image */}
          <div className={`relative inline-block transition-all duration-1000 delay-1100 ${
            isVisible['hero'] 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}>
            <img 
              src="/Image/wide/wide1.jpg"
              alt="Featured Photography Work"
              className="block"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section 
        ref={portfolioRef}
        className={`py-20 bg-black transition-all duration-1000 ${
          isVisible['portfolio'] 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
            {portfolioItems.map((item, index) => (
              <div
                key={index}
                className={`group cursor-pointer transition-all duration-700 hover:scale-105 ${
                  item.size === 'large' ? 'sm:col-span-2 lg:col-span-2' :
                  item.size === 'medium' ? 'sm:col-span-1' :
                  'sm:col-span-1'
                } ${
                  isVisible['portfolio'] 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
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
                    loading="lazy"
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
                  {/* Removed category display since it's commented out in data */}
                </div>
              </div>
            ))}
          </div>

          {/* View Portfolio Button */}
          <div className={`text-center mt-16 transition-all duration-1000 delay-500 ${
            isVisible['portfolio'] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}>
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
      <section 
        ref={quoteRef}
        className={`py-20 bg-slate-900 transition-all duration-1000 ${
          isVisible['quote'] 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`w-24 h-px bg-white mx-auto mb-8 transition-all duration-1000 delay-300 ${
            isVisible['quote'] 
              ? 'opacity-100 scale-x-100' 
              : 'opacity-0 scale-x-0'
          }`}></div>
          <blockquote className={`text-2xl sm:text-3xl text-white font-light leading-relaxed tracking-wide mb-8 transition-all duration-1000 delay-500 ${
            isVisible['quote'] 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-10'
          }`}>
            "Just Like Your Beauty!"
          </blockquote>
          <div className={`w-24 h-px bg-white mx-auto transition-all duration-1000 delay-700 ${
            isVisible['quote'] 
              ? 'opacity-100 scale-x-100' 
              : 'opacity-0 scale-x-0'
          }`}></div>
        </div>
      </section>

      {/* Footer Info */}
      <section 
        ref={footerRef}
        className={`py-12 bg-black border-t border-gray-800 transition-all duration-1000 ${
          isVisible['footer'] 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-10'
        }`}
      >
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