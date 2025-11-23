import React, { useState, useEffect } from 'react';
import { Camera, Award, Heart, Users, MapPin, Calendar, Instagram } from 'lucide-react';
import { supabase } from '../admin/supabaseClient';

// Custom TikTok icon component
const TikTokIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Custom Telegram icon component
const TelegramIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.169 1.858-.896 6.728-.896 6.728-.896 6.728-1.277 5.66-1.277 5.66s-.17.34-.425.41c-.34.085-.596-.056-.596-.056l-2.55-1.888-1.445-1.002s-.255-.17-.17-.51c.085-.34.425-.68.425-.68l2.04-1.956s.255-.17.255-.425c0-.17-.17-.255-.17-.255L6.8 9.616s-.34-.085-.51.085c-.17.17-.085.425-.085.425l1.53 4.93s.085.34-.085.51c-.17.17-.425.085-.425.085l-1.956-.34s-.34-.085-.34-.34c0-.17.17-.34.17-.34l7.48-4.585s.34-.17.51-.085c.17.085.17.34.17.34l-1.53 4.93s-.085.34.085.51c.17.17.425.085.425.085l1.956.34s.34.085.34.34c0 .17-.17.34-.17.34l-2.55 1.888s-.34.17-.51.085c-.17-.085-.17-.34-.17-.34l1.53-4.93s.085-.34-.085-.51c-.17-.17-.425-.085-.425-.085l-1.956-.34s-.34-.085-.34-.34c0-.17.17-.34.17-.34l7.48-4.585s.34-.17.51-.085c.17.085.17.34.17.34z"/>
  </svg>
);

const About: React.FC = () => {
  const [aboutMeImage, setAboutMeImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  // Fetch About Me image from Supabase
  const fetchAboutMeImage = async () => {
    try {
      setImageLoading(true);
      
      // First, find the About Me category
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name_am, slug')
        .eq('name_am', 'About Me')
        .eq('slug', 'about-me')
        .single();

      if (categoryError && categoryError.code !== 'PGRST116') {
        console.error('Error fetching about me category:', categoryError);
        return;
      }

      if (categoryData) {
        // Fetch the first image from the About Me category
        const { data: pictureData, error: pictureError } = await supabase
          .from('pictures')
          .select('image_url')
          .eq('category_id', categoryData.id)
          .limit(1)
          .single();

        if (pictureError && pictureError.code !== 'PGRST116') {
          console.error('Error fetching about me image:', pictureError);
          return;
        }

        if (pictureData) {
          setAboutMeImage(pictureData.image_url);
        }
      }
    } catch (err) {
      console.error('Error fetching about me image:', err);
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    // Fetch About Me image
    fetchAboutMeImage();
  }, []);

  const skills = [
    { name: 'Photography', level: 95 },
    { name: 'Cinematography', level: 92 },
    { name: 'Photoshop', level: 95 },
    { name: 'Studio Lighting', level: 90 }
    /*{ name: 'Landscape Photography', level: 85 },*/
    /*{ name: 'Photo Editing', level: 92 },*/
  ];

  const achievements = [
    { icon: Award, title: 'Photography Certificate ', description: 'Completed And Receved Certificate From Endrias Film College ' },
    { icon: Users, title: 'Happy Clients', description: '30+ satisfied clients across various photography genres' },
    { icon: Camera, title: 'Projects Completed', description: '50+ successful photography projects and counting' },
    { icon: Heart, title: 'Years of Passion', description: '4+ years of dedicated photography experience' }
  ];

  return (
    <div className="min-h-screen pt-20 bg-black text-white">
      {/* Header */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            About Me
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Passionate photographer dedicated to capturing life's most precious moments
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Profile Image */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
                {imageLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                ) : aboutMeImage ? (
                  <img
                    src={aboutMeImage}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white">
                    <Camera size={64} className="mb-4 opacity-60" />
                    <p className="text-lg font-medium opacity-80">Profile Image</p>
                    <p className="text-sm opacity-60 mt-1">Coming Soon</p>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-4 rounded-2xl shadow-lg">
                <MapPin size={24} />
              </div>
            </div>

            {/* Bio Content */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white mb-6">
                Hello, I'm Fasika
              </h2>
              
              <p className="text-lg text-gray-300 leading-relaxed">
               — a passionate photographer with a lifelong love for capturing moments. 
              My journey began as a curious kid snapping photos on my parents' mobile phone, 
              fascinated by the magic of freezing time with a single click. In my teenage years, I started exploring photography 
              more seriously with my own phone, experimenting with light, angles, and storytelling through images.
              </p>
              
              <p className="text-lg text-gray-300 leading-relaxed">
                Today, I've turned that childhood passion into a professional pursuit. 
                Equipped with a full photography setup, I dedicate myself to creating stunning 
                visuals that tell stories, evoke emotions, and preserve memories. Beyond photography, 
                I'm also skilled in graphic design and Photoshop, which allows me to elevate my work with 
                creative edits and professional-quality retouching. Photography isn't just what I do — it's who I am, 
                and I'm excited to share my vision with the world.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Calendar size={20} />
                  <span>Available for bookings</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <MapPin size={20} />
                  <span>Based in Addis Ababa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              My Expertise
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {skills.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">{skill.name}</span>
                    <span className="text-blue-400 font-semibold">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${skill.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <h3 className="text-3xl font-bold text-white text-center mb-12">
              Achievements & Milestones
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="text-center group hover:transform hover:scale-105 transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 group-hover:bg-blue-500 transition-colors duration-300">
                    <achievement.icon size={32} className="text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{achievement.title}</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Offered Section */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Services Offered</h3>
          <ul className="list-disc list-inside text-lg text-gray-300 space-y-2 mx-auto max-w-xl">
            <li>Wedding photography</li>
            <li>Event photography</li>
            <li>Family event</li>
            <li>Fashion photography</li>
            <li>Commercial photography</li>
            <li>Product photography</li>
            <li>Portrait photography</li>
            <li>Street photography</li>
            <li>Black and white photography</li>
            <li>Real estate photography</li>
          </ul>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-8">
             
          </h3>
          <blockquote className="text-2xl text-white italic leading-relaxed">
            "Just like your beauty! "
          </blockquote>
          <cite className="block text-blue-400 font-semibold mt-6">  </cite>
        </div>
      </section>

      {/* Footer */}
      <section className="py-12 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm">
            <p>Copyright © 2025</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a 
                href="https://www.instagram.com/hary_picture7?igsh=MXFqeDFmeGFxdXRzNQ==" 
                className="hover:text-white transition-colors duration-300" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://t.me/harygraphic" 
                className="hover:text-white transition-colors duration-300" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Telegram"
              >
                <TelegramIcon size={20} />
              </a>
              <a 
                href="https://www.tiktok.com/@hary.picture?_t=ZM-90Pkwl5a2HM&_r=1" 
                className="hover:text-white transition-colors duration-300" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <TikTokIcon size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;