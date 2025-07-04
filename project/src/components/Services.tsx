import React from 'react';

interface ServicesProps {
  onPageChange: (page: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onPageChange }) => {
  const services = [
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
      title: 'Fashion photography',
      image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=600',
      size: 'medium'
    },
    {
      title: 'Commercial photography',
      image: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=600',
      size: 'medium'
    },
    {
      title: 'Product photography',
      image: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=600',
      size: 'medium'
    },
    {
      title: 'Editorial photography',
      image: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=600',
      size: 'large'
    },
    {
      title: 'Travel photography',
      image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=600',
      size: 'medium'
    }*/
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-green-400 text-sm font-light tracking-widest mb-4">
              — Our Services
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              CAPTURING LIFE'S MOMENTS
            </h1>
            <p className="text-gray-300 text-lg font-light max-w-2xl">
              Exceptional Photography and other Services for Every Occasion
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group cursor-pointer transition-all duration-500 hover:scale-105 ${
                  service.size === 'large' ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-1'
                }`}
                onClick={() => onPageChange('contact')}
              >
                {/* Image Container */}
                <div className={`relative overflow-hidden mb-4 ${
                  service.size === 'large' ? 'aspect-[16/10]' : 'aspect-[4/5]'
                }`}>
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-all duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-500"></div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-white text-sm font-light tracking-widest">
                        VIEW SERVICE
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Title */}
                <div className="text-left">
                  <h3 className="text-white font-normal text-lg mb-2 group-hover:text-green-400 transition-colors duration-300">
                    {service.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    

     

      {/* Footer */}
      <section className="py-12 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm">
            <p>Copyright © 2025.</p>
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

export default Services;