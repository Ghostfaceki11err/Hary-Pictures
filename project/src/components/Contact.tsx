import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Instagram, Facebook, Twitter, CheckCircle, AlertCircle } from 'lucide-react';

// Custom Telegram SVG component
const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width={props.width || 20}
    height={props.height || 20}
    {...props}
  >
    <path
      d="M21.944 3.685a1.5 1.5 0 0 0-1.62-.23L3.5 10.5a1.5 1.5 0 0 0 .13 2.78l4.47 1.6 1.6 4.47a1.5 1.5 0 0 0 2.78.13l7.045-16.824a1.5 1.5 0 0 0-.481-1.971zM10.5 19.5l-1.6-4.47-4.47-1.6L20.5 4.5l-7.045 16.824a.5.5 0 0 1-.955-.176z"
      fill="currentColor"
    />
  </svg>
);

// Form submission status types
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage('');
    
    try {
      // Create properly encoded form data for Netlify
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('form-name', 'contact');
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('service', formData.service);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('message', formData.message);
      
      // Submit to Netlify with proper encoding
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formDataToSend.toString()
      });
      
      if (response.ok) {
        setFormStatus('success');
        // Reset form data
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          date: '',
          message: ''
        });
      } else {
        throw new Error(`Form submission failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormStatus('error');
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : 'There was an error sending your message. Please try again or contact me directly.'
      );
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'harypictures7@gmail.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+251945283851',      
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+25198 693 4104',
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Addis Ababa, A.A',
      
    },
    {
      icon: Clock,
      title: 'Hours',
      value: 'Mon-Fri: 3AM-6PM',
      
    }
  ];

  const socialLinks = [
    { icon: Instagram, name: 'Instagram', url: 'https://www.instagram.com/hary_picture7/?igsh=MXFqeDFmeGFxdXRzNQ%3D%3D#', handle: '@hary_picture7' },
    { icon: TelegramIcon, name: 'Telegram', url: 'https://t.me/harygraphic', handle: '@harygraphic' },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
             Let's discuss your photography needs
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-slate-800/50 rounded-3xl p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-white mb-8">Send Me a Message</h2>
              
              <form 
                name="contact"
                method="POST"
                data-netlify="true"
                data-netlify-honeypot="bot-field"
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                {/* Hidden fields required by Netlify */}
                <input type="hidden" name="form-name" value="contact" />
                <p className="hidden">
                  <label>
                    Don't fill this out if you're human: <input name="bot-field" />
                  </label>
                </p>
                
                {/* Noscript fallback for Netlify Forms */}
                <noscript>
                  <p>This form requires JavaScript to be enabled. Please enable JavaScript in your browser.</p>
                </noscript>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-white font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-white font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-white font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="(+251) 9 12 34 56 78"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="service" className="block text-white font-medium mb-2">
                      Service Interested In
                    </label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select a service</option>
                      <option value="wedding">Wedding Photography</option>
                      <option value="portrait">Portrait Session</option>
                      <option value="Street photography">Street photography</option>
                      <option value="Real estate photography">Real estate photography</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="date" className="block text-white font-medium mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-white font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Tell me about your photography needs, vision, and any specific requirements..."
                  />
                </div>

                {/* Success Message */}
                {formStatus === 'success' && (
                  <div className="bg-green-600/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle size={24} className="text-green-400 flex-shrink-0" />
                    <div>
                      <h3 className="text-green-400 font-semibold">Message Sent Successfully!</h3>
                      <p className="text-green-300 text-sm">Thank you for your message. I'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {formStatus === 'error' && (
                  <div className="bg-red-600/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle size={24} className="text-red-400 flex-shrink-0" />
                    <div>
                      <h3 className="text-red-400 font-semibold">Error Sending Message</h3>
                      <p className="text-red-300 text-sm">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                >
                  {formStatus === 'submitting' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-8">Contact Information</h2>
                
                <div className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const isCopyable = info.title === 'Email' || info.title === 'Phone';
                    return (
                      <div
                        key={index}
                        className={`flex items-center p-4 bg-slate-800/50 rounded-2xl hover:bg-slate-800/70 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl group cursor-${isCopyable ? 'pointer' : 'default'}`}
                        onClick={isCopyable ? async () => {
                          await navigator.clipboard.writeText(info.value);
                          setCopiedIndex(index);
                          setTimeout(() => setCopiedIndex(null), 1500);
                        } : undefined}
                      >
                        <div className="bg-blue-600 p-3 rounded-xl mr-4 group-hover:bg-blue-500 transition-colors duration-300">
                          <info.icon size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{info.title}</h3>
                          <p className="text-gray-300">
                            {info.value}
                            {copiedIndex === index && (
                              <span className="ml-2 text-green-400 font-semibold">Copied!</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Follow My Work</h3>
                
                <div className="space-y-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className="flex items-center p-4 bg-slate-800/50 rounded-2xl hover:bg-slate-800/70 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="bg-blue-600 p-3 rounded-xl mr-4 group-hover:bg-blue-500 transition-colors duration-300">
                        <social.icon size={20} className="text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{social.name}</h4>
                        <p className="text-gray-300 text-sm">{social.handle}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Response Promise */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-center">
                <Clock size={32} className="text-white mx-auto mb-4" />
                <h3 className="text-white font-bold text-xl mb-2">Quick Response Guarantee</h3>
                <p className="text-blue-100">I'll respond to your inquiry within 24 hours, usually much sooner!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default Contact;