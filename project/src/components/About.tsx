import React from 'react';
import { Camera, Award, Heart, Users, MapPin, Calendar } from 'lucide-react';

const About: React.FC = () => {
  const skills = [
    { name: 'Photography', level: 95 },
    { name: 'Cinematography', level: 92 },
    { name: 'Photoshop', level: 95 },
    { name: 'Studio Lighting', level: 90 }
    /*{ name: 'Landscape Photography', level: 85 },*/
    /*{ name: 'Photo Editing', level: 92 },*/
  ];

  const achievements = [
    { icon: Award, title: 'Photography Certificate ', description: 'Completed And Receved Certificate From ********** ' },
    { icon: Users, title: 'Happy Clients', description: '30+ satisfied clients across various photography genres' },
    { icon: Camera, title: 'Projects Completed', description: '50+ successful photography projects and counting' },
    { icon: Heart, title: 'Years of Passion', description: '4+ years of dedicated photography experience' }
  ];

  return (
    <div className="min-h-screen pt-20">
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
                <img
                  src="/Image/profile/profile.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover rounded-3xl"
                />
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
              **** ** * ***** ** ********** ***********,
                * ********* ** ******** *** ******** ******** *** **** **** **************.
                ** ****** ***** **** * ****** **** *** ************* ****** ******,
                *** ** *** ****** **** * ****** *** ******** ******* *** ** *******.
              </p>
              
              <p className="text-lg text-gray-300 leading-relaxed">
                **** ** * ***** ** ********** ***********,
                * ********* ** ******** *** ******** ******** *** **** **** **************.
                ** ****** ***** **** * ****** **** *** ************* ****** ******,
                *** ** *** ****** **** * ****** *** ******** ******* *** ** *******.
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
                    <span className="text-white font-medium">{skill.name}</span>
                    <span className="text-blue-400 font-semibold">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
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
                  <p className="text-gray-300 text-sm leading-relaxed">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Services Offered Section */}
      <section className="py-12">
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
      <section className="py-20 bg-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-8">
            My Thoughts
          </h3>
          <blockquote className="text-2xl text-gray-300 italic leading-relaxed">
            "A Frozen Moment in Time Highlights photography's ability to preserve fleeting instants forever"
          </blockquote>
          <cite className="block text-blue-400 font-semibold mt-6">- Fasika </cite>
        </div>
      </section>
    </div>
  );
};

export default About;