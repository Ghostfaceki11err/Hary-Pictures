import React, { useState, useEffect } from 'react';
import { Camera, Award, Heart, Users, MapPin, Calendar, Sun, Moon } from 'lucide-react';
import { supabase } from '../admin/supabaseClient';

const About: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
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
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    
    // Fetch About Me image
    fetchAboutMeImage();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

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
    <div className="min-h-screen pt-20 bg-white text-blue-900 dark:bg-slate-900 dark:text-white">
      {/* Floating Dark/Light Mode Button */}
      <button
        className="fixed bottom-8 right-8 z-50 w-14 h-14 flex items-center justify-center rounded-full shadow-lg bg-white/90 dark:bg-slate-800 text-blue-900 dark:text-yellow-300 border border-blue-200 dark:border-slate-700 transition-colors duration-300 hover:bg-blue-100 dark:hover:bg-slate-700"
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={28} /> : <Moon size={28} />}
      </button>

      {/* Header */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            About Me
          </h1>
          <p className="text-xl leading-relaxed">
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
              <h2 className="text-4xl font-bold mb-6">
                Hello, I'm Fasika
              </h2>
              
              <p className="text-lg leading-relaxed">
               — a passionate photographer with a lifelong love for capturing moments. 
              My journey began as a curious kid snapping photos on my parents' mobile phone, 
              fascinated by the magic of freezing time with a single click. In my teenage years, I started exploring photography 
              more seriously with my own phone, experimenting with light, angles, and storytelling through images.
              </p>
              
              <p className="text-lg leading-relaxed">
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
            <h3 className="text-3xl font-bold text-center mb-12">
              My Expertise
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {skills.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-blue-400 font-semibold">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
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
            <h3 className="text-3xl font-bold text-center mb-12">
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
                  <h4 className="text-xl font-bold mb-2">{achievement.title}</h4>
                  <p className="text-sm leading-relaxed">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Offered Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-8 text-center">Services Offered</h3>
          <ul className="list-disc list-inside text-lg space-y-2 mx-auto max-w-xl">
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-8">
             
          </h3>
          <blockquote className="text-2xl italic leading-relaxed">
            "Just like your beauty! "
          </blockquote>
          <cite className="block text-blue-400 font-semibold mt-6">  </cite>
        </div>
      </section>
    </div>
  );
};

export default About;