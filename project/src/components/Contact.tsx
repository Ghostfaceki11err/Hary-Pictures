import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Instagram, CheckCircle, AlertCircle, User, MessageSquare, Calendar, Camera, ArrowRight } from 'lucide-react';
import { supabase } from '../admin/supabaseClient';

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

interface FormData {
  name: string;
  contactType: 'email' | 'telegram';
  email: string;
  telegram: string;
  phone: string;
  service: string;
  date: string;
  message: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contactType: 'email',
    email: '',
    telegram: '',
    phone: '',
    service: '',
    date: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [focusedField, setFocusedField] = useState<string>('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [submissionAttempts, setSubmissionAttempts] = useState<number>(0);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<number>(0);
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [mathChallenge, setMathChallenge] = useState<{question: string, answer: number}>({question: '', answer: 0});
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [telegramValidationStatus, setTelegramValidationStatus] = useState<'idle' | 'valid' | 'invalid' | 'checking'>('idle');

  // Refs for form fields
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const telegramRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const serviceRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Security utility functions
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  // Special sanitization for message field to preserve spaces
  const sanitizeMessage = (input: string): string => {
    // Only remove potentially dangerous content, preserve all spaces including leading spaces
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
      // Note: No .trim() to preserve leading/trailing spaces during typing
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };


  const validatePhone = (phone: string): boolean => {
    // Validate Ethiopian phone format: 0[1-9][0-9]{7,8} (matches DB constraint)
    const phoneRegex = /^0[1-9][0-9]{7,8}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name: string): boolean => {
    return name.length >= 2 && name.length <= 100 && /^[a-zA-Z\s\-'\.]+$/.test(name);
  };

  const validateMessage = (message: string): boolean => {
    return message.length > 0 && message.length <= 2000;
  };

  const isRateLimited = (): boolean => {
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    const maxAttempts = 5;
    const timeWindow = 15 * 60 * 1000; // 15 minutes

    if (timeSinceLastSubmission > timeWindow) {
      setSubmissionAttempts(0);
      return false;
    }

    return submissionAttempts >= maxAttempts;
  };

  const generateMathChallenge = (): {question: string, answer: number} => {
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number, question: string;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 20) + 10;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        num1 = 5;
        num2 = 3;
        answer = 8;
        question = '5 + 3';
    }
    
    return { question, answer };
  };

  // Utility functions
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Format as 0XXXXXXXXX for Ethiopian numbers
    if (phoneNumber.length <= 10) {
      // If it starts with 0, keep it as is
      if (phoneNumber.startsWith('0')) {
        return phoneNumber;
      }
      // If it doesn't start with 0, add 0 prefix
      return '0' + phoneNumber;
    }
    
    return phoneNumber;
  };

  const formatTelegramUsername = (value: string) => {
    // Remove @ if user added it manually (since we show it visually)
    const cleanValue = value.startsWith('@') ? value.slice(1) : value;
    
    // Only remove spaces and special characters, keep letters, numbers, underscores
    const sanitizedValue = cleanValue.replace(/[^a-zA-Z0-9_]/g, '');
    
    // Return without @ prefix since it's shown visually
    return sanitizedValue;
  };


  const focusNextField = (currentField: string) => {
    const fieldOrder = ['name', 'email', 'telegram', 'phone', 'service', 'date', 'message'];
    const currentIndex = fieldOrder.indexOf(currentField);
    if (currentIndex < fieldOrder.length - 1) {
      const nextField = fieldOrder[currentIndex + 1];
      const refs = { name: nameRef, email: emailRef, telegram: telegramRef, phone: phoneRef, service: serviceRef, date: dateRef, message: messageRef };
      refs[nextField as keyof typeof refs]?.current?.focus();
    }
  };

  // Generate CSRF token and math challenge on component mount
  useEffect(() => {
    const generateCSRFToken = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };
    setCsrfToken(generateCSRFToken());
    setMathChallenge(generateMathChallenge());
  }, []);

  // Function to get client IP (limited on client-side)
  const getClientIP = async (): Promise<string> => {
    try {
      // Try to get IP from a public service (fallback method)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      console.log('Could not fetch IP address:', error);
      return 'client-side';
    }
  };

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('contactFormDraft', JSON.stringify(formData));
  }, [formData]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('contactFormDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
      } catch (error) {
        console.error('Error loading form draft:', error);
      }
    }
  }, []);


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFormData({
          name: '',
          contactType: 'email',
          email: '',
          telegram: '',
          phone: '',
          service: '',
          date: '',
          message: ''
        });
        setUserAnswer('');
        setMathChallenge(generateMathChallenge());
        localStorage.removeItem('contactFormDraft');
        nameRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Telegram message sending function using Netlify function
  const sendTelegramMessage = async (message: string) => {
    try {
      const response = await fetch("/.netlify/functions/sendTelegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        console.error("Netlify function error:", response.status, response.statusText);
        return;
      }

      const data = await response.json();
      console.log("Telegram function response:", data);
      
      if (data.results) {
        console.log(`Message sent to ${data.results.success.length} chat(s)`);
        if (data.results.failed.length > 0) {
          console.warn(`Failed to send to ${data.results.failed.length} chat(s):`, data.results.failed);
        }
      }
    } catch (error) {
      console.error("Error calling Telegram function:", error);
      // Don't throw error - let form submission continue
    }
  };

  // Enhanced Telegram username validation (matches DB constraint)
  const validateTelegramUsername = (username: string): boolean => {
    if (!username || username.trim() === '') return true; // Optional field
    
    // Remove @ if present
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
    
    // DB constraint: ^[A-Za-z0-9_]{5,32}$ (simplified from original Telegram rules)
    const telegramRegex = /^[A-Za-z0-9_]{5,32}$/;
    return telegramRegex.test(cleanUsername);
  };

  // Debounced validation for real-time feedback
  const debouncedTelegramValidation = useRef<NodeJS.Timeout | null>(null);
  
  const validateTelegramRealTime = (username: string) => {
    if (debouncedTelegramValidation.current) {
      clearTimeout(debouncedTelegramValidation.current);
    }
    
    if (!username || username.trim() === '') {
      setTelegramValidationStatus('idle');
      return;
    }
    
    setTelegramValidationStatus('checking');
    
    debouncedTelegramValidation.current = setTimeout(() => {
      const isValid = validateTelegramUsername(username);
      setTelegramValidationStatus(isValid ? 'valid' : 'invalid');
    }, 500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for different field types
    if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
    } else if (name === 'telegram') {
      const formattedTelegram = formatTelegramUsername(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedTelegram
      }));
      // Real-time validation
      validateTelegramRealTime(formattedTelegram);
    } else if (name === 'message') {
      // Use special sanitization for message to preserve spaces
      const messageValue = sanitizeMessage(value);
      setFormData(prev => ({
        ...prev,
        [name]: messageValue
      }));
    } else {
      // Sanitize other inputs to prevent XSS attacks
      const sanitizedValue = sanitizeInput(value);
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === 'Enter' && fieldName !== 'message') {
      e.preventDefault();
      focusNextField(fieldName);
    } else if (e.key === 'Enter' && fieldName === 'message' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleFieldBlur = () => {
    setFocusedField('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    setErrorMessage('');

    console.log('Form submission started with data:', formData);

    try {
      // Honeypot check - if filled, it's likely a bot
      const formDataObj = new FormData(e.currentTarget);
      const honeypot = formDataObj.get('website');
      if (honeypot && honeypot.toString().trim() !== '') {
        console.log('Bot detected via honeypot');
        setFormStatus('error');
        setErrorMessage('Invalid submission detected.');
        setShowErrorPopup(true);
        return;
      }

      // Rate limiting check
      if (isRateLimited()) {
        setFormStatus('error');
        setErrorMessage('Too many submission attempts. Please wait 15 minutes before trying again.');
        setShowErrorPopup(true);
        return;
      }

      // Comprehensive validation
      if (!validateName(formData.name)) {
        setFormStatus('error');
        setErrorMessage('Please enter a valid name (2-100 characters, letters only).');
        setShowErrorPopup(true);
        return;
      }

      if (formData.contactType === 'email' && !validateEmail(formData.email)) {
        setFormStatus('error');
        setErrorMessage('Please enter a valid email address.');
        setShowErrorPopup(true);
        return;
      }

      // Check if at least one contact method is provided (matches DB constraint)
      const hasEmail = formData.contactType === 'email' && formData.email && formData.email.trim() !== '';
      const hasTelegram = formData.contactType === 'telegram' && formData.telegram && formData.telegram.trim() !== '';
      const hasPhone = formData.phone && formData.phone.trim() !== '';
      
      if (!hasEmail && !hasTelegram && !hasPhone) {
        setFormStatus('error');
        setErrorMessage('Please provide at least one contact method: email, Telegram username, or phone number.');
        setShowErrorPopup(true);
        return;
      }

      if (formData.contactType === 'telegram' && formData.telegram && !validateTelegramUsername(formData.telegram)) {
        setFormStatus('error');
        setErrorMessage('Please enter a valid Telegram username. Must be 5-32 characters and can only contain letters, numbers, and underscores.');
        setShowErrorPopup(true);
        return;
      }

      if (formData.phone && !validatePhone(formData.phone)) {
        setFormStatus('error');
        setErrorMessage('Please enter a valid Ethiopian phone number in format: 0912345678 (0 followed by 1-9, then 7-8 more digits).');
        setShowErrorPopup(true);
        return;
      }

      if (!validateMessage(formData.message)) {
        setFormStatus('error');
        setErrorMessage('Please enter a message (maximum 2000 characters).');
        setShowErrorPopup(true);
        return;
      }

      // Math challenge validation
      const userAnswerNum = parseInt(userAnswer.trim());
      console.log('Math challenge validation:', {
        userAnswer: userAnswer,
        userAnswerNum: userAnswerNum,
        expectedAnswer: mathChallenge.answer,
        question: mathChallenge.question
      });
      
      if (isNaN(userAnswerNum) || userAnswerNum !== mathChallenge.answer) {
        setFormStatus('error');
        setErrorMessage(`Math challenge incorrect. Please solve: ${mathChallenge.question} = ?`);
        setShowErrorPopup(true);
        // Generate new challenge
        setMathChallenge(generateMathChallenge());
        setUserAnswer('');
        return;
      }

      // Get client IP address
      const clientIP = await getClientIP();

      // Sanitize all data before sending (matches DB constraints)
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        email: formData.contactType === 'email' ? sanitizeInput(formData.email) : '',
        telegram_username: formData.contactType === 'telegram' && formData.telegram ? sanitizeInput(formData.telegram) : '',
        phone: sanitizeInput(formData.phone) || '',
        service: sanitizeInput(formData.service),
        date: formData.date,
        message: sanitizeMessage(formData.message).trim(),
        contact_type: formData.contactType,
        ip_address: clientIP,
        user_agent: navigator.userAgent,
        csrf_token: csrfToken
      };

      // Store in Supabase
      const { error } = await supabase
        .from('contact_messages')
        .insert([sanitizedData]);

      if (error) {
        console.error('Supabase error:', error);
        
        // Handle specific database constraint error
        if (error.message.includes('check_telegram_format')) {
          setFormStatus('error');
          setErrorMessage('Please choose Email instead of Telegram if you don\'t have a Telegram username, or provide a valid Telegram username.');
          setShowErrorPopup(true);
          return;
        }
        
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Data successfully stored in Supabase');

      // Prepare modern Telegram message with sanitized data
      const contactInfo = formData.contactType === 'email' 
        ? `✉️ *Email:* ${sanitizedData.email}`
        : `📱 *Telegram:* ${sanitizedData.telegram_username ? `@${sanitizedData.telegram_username}` : 'Not provided'}`;
      
      const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
        } catch {
          return dateString;
        }
      };

      const formatTimestamp = () => {
        const now = new Date();
        return now.toLocaleString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
      };

      const message = `
🆕 *New Contact Form Submission* ────────────
👤 *Name:* ${sanitizedData.name}
${contactInfo}
📞 *Phone:* ${sanitizedData.phone || 'N/A'}

🖼️ *Service:* ${sanitizedData.service || 'N/A'}
📅 *Preferred Date:* ${formatDate(sanitizedData.date)}

💬 *Message:*
${sanitizedData.message}

⏱️ *Submitted:* ${formatTimestamp()}
───────────────────────────────
      `.trim();

      // Send to Telegram
      console.log('Sending Telegram message...');
      await sendTelegramMessage(message);
      console.log('Telegram message sent successfully');

      // Update rate limiting
      setSubmissionAttempts(prev => prev + 1);
      setLastSubmissionTime(Date.now());

      setFormStatus('success');
      setShowSuccessAnimation(true);
      localStorage.removeItem('contactFormDraft');
    setFormData({
      name: '',
        contactType: 'email',
      email: '',
        telegram: '',
      phone: '',
      service: '',
      date: '',
      message: ''
    });
      setUserAnswer('');
      setMathChallenge(generateMathChallenge());
      
      // Hide success animation after 3 seconds
      setTimeout(() => setShowSuccessAnimation(false), 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setFormStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Try again.'
      );
      setShowErrorPopup(true);
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
    <div className="min-h-screen pt-20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce delay-300"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400/30 rounded-full animate-bounce delay-700"></div>
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-cyan-400/30 rounded-full animate-bounce delay-1000"></div>
      <div className="absolute top-60 right-1/3 w-5 h-5 bg-pink-400/30 rounded-full animate-bounce delay-500"></div>

      {/* Hero Section */}
      <section className="relative py-24 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-6 leading-tight">
                Let's Create
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Magic Together
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                Ready to capture your precious moments? Let's discuss your photography vision and bring your dreams to life.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Professional Photography</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300"></div>
                  <span className="text-sm font-medium">Creative Vision</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
                  <span className="text-sm font-medium">Memorable Moments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="pb-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="xl:col-span-2 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 rounded-3xl blur-sm"></div>
              <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-700/50 overflow-hidden">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full px-6 py-3 mb-4">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                    <span className="text-white font-semibold">Send Me a Message</span>
                  </div>
                  <p className="text-gray-400 text-sm">Fill out the form below and I'll get back to you within 24 hours</p>
                </div>
              {/* Success Animation Overlay */}
              {showSuccessAnimation && (
                <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-50">
                  <div className="text-center">
                    <div className="animate-bounce">
                      <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-400 mb-2">Message Sent!</h3>
                    <p className="text-green-300">Thank you for your inquiry</p>
                  </div>
                </div>
              )}

              <h2 className="text-3xl font-bold text-white mb-8">Send Me a Message</h2>
              
              <form 
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                {/* Hidden CSRF Token */}
                <input type="hidden" name="csrf_token" value={csrfToken} />
                
                {/* Honeypot field to catch bots */}
                <div style={{ display: 'none' }}>
                  <label htmlFor="website">Website (leave empty):</label>
                  <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                        focusedField === 'name' ? 'text-blue-400' : 'text-gray-400'
                      }`} />
                    <input
                        ref={nameRef}
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                        onKeyDown={(e) => handleKeyDown(e, 'name')}
                        onFocus={() => handleFieldFocus('name')}
                        onBlur={handleFieldBlur}
                      required
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-white placeholder-transparent focus:outline-none transition-all duration-300 ${
                          focusedField === 'name' 
                            ? 'border-blue-500 bg-slate-700/80 shadow-lg shadow-blue-500/20' 
                            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                        }`}
                      placeholder="Your full name"
                    />
                      <label 
                        htmlFor="name" 
                        className={`absolute left-12 transition-all duration-300 pointer-events-none ${
                          formData.name || focusedField === 'name'
                            ? 'top-1 text-xs text-blue-400 bg-slate-800/50 px-1 rounded'
                            : 'top-2 text-sm text-gray-400'
                        }`}
                      >
                        Full Name *
                      </label>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="relative">
                      {/* Modern Toggle Switch */}
                      <div className="relative bg-slate-700/50 rounded-xl p-0.5 border-2 border-slate-600 hover:border-slate-500 transition-all duration-300">
                        <div className="flex relative">
                          {/* Toggle Background */}
                          <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500 ease-in-out ${
                            formData.contactType === 'email' ? 'w-1/2' : 'w-1/2 translate-x-full'
                          }`} />
                          
                          {/* Email Option */}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, contactType: 'email' }));
                              handleFieldFocus('contactType');
                            }}
                            className={`relative z-10 flex-1 flex items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 ${
                              formData.contactType === 'email' 
                                ? 'text-white font-medium' 
                                : 'text-gray-400 hover:text-gray-300'
                            }`}
                          >
                            <Mail className="w-5 h-5 mr-2" />
                            <span className="text-sm">Email</span>
                          </button>
                          
                          {/* Telegram Option */}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, contactType: 'telegram' }));
                              handleFieldFocus('contactType');
                            }}
                            className={`relative z-10 flex-1 flex items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 ${
                              formData.contactType === 'telegram' 
                                ? 'text-white font-medium' 
                                : 'text-gray-400 hover:text-gray-300'
                            }`}
                          >
                            <TelegramIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm">Telegram</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Selection Indicator */}
                      <div className="mt-1 flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            formData.contactType === 'email' ? 'bg-blue-400' : 'bg-gray-600'
                          }`} />
                          <span>
                            {formData.contactType === 'email' 
                              ? 'We\'ll contact you via email' 
                              : 'We\'ll contact you via Telegram'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Contact Field */}
                <div className="relative group">
                  <div className="relative">
                    {formData.contactType === 'email' ? (
                      <>
                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                          focusedField === 'email' ? 'text-blue-400' : 'text-gray-400'
                        }`} />
                    <input
                          ref={emailRef}
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                          onKeyDown={(e) => handleKeyDown(e, 'email')}
                          onFocus={() => handleFieldFocus('email')}
                          onBlur={handleFieldBlur}
                          required={formData.contactType === 'email'}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-white placeholder-transparent focus:outline-none transition-all duration-300 ${
                            focusedField === 'email' 
                              ? 'border-blue-500 bg-slate-700/80 shadow-lg shadow-blue-500/20' 
                              : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                          }`}
                      placeholder="your@email.com"
                    />
                        <label 
                          htmlFor="email" 
                          className={`absolute left-12 transition-all duration-300 pointer-events-none ${
                            formData.email || focusedField === 'email'
                              ? 'top-1 text-xs text-blue-400 bg-slate-800/50 px-1 rounded'
                              : 'top-2 text-sm text-gray-400'
                          }`}
                        >
                          Email Address *
                        </label>
                      </>
                    ) : (
                      <>
                        <TelegramIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                          focusedField === 'telegram' ? 'text-blue-400' : 'text-gray-400'
                        }`} />
                        <div className="relative">
                          {/* Visible @ prefix */}
                          <span className="absolute left-12 top-1/2 transform -translate-y-1/2 text-white text-lg font-medium pointer-events-none">
                            @
                          </span>
                          <input
                            ref={telegramRef}
                            type="text"
                            id="telegram"
                            name="telegram"
                            value={formData.telegram.startsWith('@') ? formData.telegram.slice(1) : formData.telegram}
                            onChange={handleInputChange}
                            onKeyDown={(e) => handleKeyDown(e, 'telegram')}
                            onFocus={() => handleFieldFocus('telegram')}
                            onBlur={handleFieldBlur}
                            required={false}
                            className={`w-full pl-16 pr-12 py-4 border-2 rounded-xl text-white placeholder-transparent focus:outline-none transition-all duration-300 ${
                              telegramValidationStatus === 'valid' 
                                ? 'border-green-500 bg-slate-700/80 shadow-lg shadow-green-500/20'
                                : telegramValidationStatus === 'invalid'
                                ? 'border-red-500 bg-slate-700/80 shadow-lg shadow-red-500/20'
                                : focusedField === 'telegram' 
                                ? 'border-blue-500 bg-slate-700/80 shadow-lg shadow-blue-500/20' 
                                : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                            }`}
                            placeholder="username"
                          />
                          {/* Validation status icon */}
                          {formData.telegram && telegramValidationStatus !== 'idle' && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {telegramValidationStatus === 'checking' && (
                                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                              )}
                              {telegramValidationStatus === 'valid' && (
                                <CheckCircle className="w-5 h-5 text-green-400" />
                              )}
                              {telegramValidationStatus === 'invalid' && (
                                <AlertCircle className="w-5 h-5 text-red-400" />
                              )}
                            </div>
                          )}
                        </div>
                        <label 
                          htmlFor="telegram" 
                          className={`absolute left-12 transition-all duration-300 pointer-events-none ${
                            formData.telegram || focusedField === 'telegram'
                              ? telegramValidationStatus === 'valid'
                                ? 'top-1 text-xs text-green-400 bg-slate-800/50 px-1 rounded'
                                : telegramValidationStatus === 'invalid'
                                ? 'top-1 text-xs text-red-400 bg-slate-800/50 px-1 rounded'
                                : 'top-1 text-xs text-blue-400 bg-slate-800/50 px-1 rounded'
                              : 'top-2 text-sm text-gray-400'
                          }`}
                        >
                          Telegram Username
                          {formData.telegram && telegramValidationStatus === 'valid' && (
                            <span className="ml-2 text-green-400">✓ Valid</span>
                          )}
                          {formData.telegram && telegramValidationStatus === 'invalid' && (
                            <span className="ml-2 text-red-400">✗ Invalid format</span>
                          )}
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                        focusedField === 'phone' ? 'text-blue-400' : 'text-gray-400'
                      }`} />
                    <input
                        ref={phoneRef}
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                        onKeyDown={(e) => handleKeyDown(e, 'phone')}
                        onFocus={() => handleFieldFocus('phone')}
                        onBlur={handleFieldBlur}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-white placeholder-gray-400 focus:outline-none transition-all duration-300 ${
                          focusedField === 'phone' 
                            ? 'border-blue-500 bg-slate-700/80 shadow-lg shadow-blue-500/20' 
                            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                        }`}
                      placeholder="0912345678"
                    />
                      <label 
                        htmlFor="phone" 
                        className={`absolute left-12 transition-all duration-300 pointer-events-none ${
                          formData.phone || focusedField === 'phone'
                            ? 'top-1 text-xs text-blue-400 bg-slate-800/50 px-1 rounded'
                            : 'top-2 text-sm text-gray-400'
                        }`}
                      >
                        Phone Number
                      </label>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="relative">
                      <Camera className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                        focusedField === 'service' ? 'text-blue-400' : 'text-gray-400'
                      }`} />
                    <select
                        ref={serviceRef}
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                        onKeyDown={(e) => handleKeyDown(e, 'service')}
                        onFocus={() => handleFieldFocus('service')}
                        onBlur={handleFieldBlur}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer ${
                          focusedField === 'service' 
                            ? 'border-blue-500 bg-slate-700/80 shadow-lg shadow-blue-500/20' 
                            : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                        }`}
                    >
                      <option value="">Select a service</option>
                      <option value="wedding">Wedding Photography</option>
                      <option value="portrait">Portrait Session</option>
                      <option value="Street photography">Street photography</option>
                      <option value="Real estate photography">Real estate photography</option>
                      <option value="other">Other</option>
                    </select>
                      <label 
                        htmlFor="service" 
                        className={`absolute left-12 transition-all duration-300 pointer-events-none ${
                          formData.service || focusedField === 'service'
                            ? 'top-1 text-xs text-blue-400 bg-slate-800/50 px-1 rounded'
                            : 'top-2 text-sm text-gray-400'
                        }`}
                      >
                        Service Interested In
                      </label>
                      {/* Custom dropdown arrow */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="relative">
                    <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'date' ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                  <input
                      ref={dateRef}
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                      onKeyDown={(e) => handleKeyDown(e, 'date')}
                      onFocus={() => handleFieldFocus('date')}
                      onBlur={handleFieldBlur}
                      min={new Date().toISOString().split('T')[0]} // Prevent past dates
                      className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl text-white focus:outline-none transition-all duration-300 appearance-none cursor-pointer ${
                        focusedField === 'date' 
                          ? 'border-blue-500 bg-slate-700/80 shadow-lg shadow-blue-500/20' 
                          : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                      }`}
                      style={{
                        colorScheme: 'dark', // Dark theme for date picker
                      }}
                    />
                      <label 
                        htmlFor="date" 
                        className={`absolute left-12 transition-all duration-300 pointer-events-none ${
                          formData.date || focusedField === 'date'
                            ? 'top-1 text-xs text-blue-400 bg-slate-800/50 px-1 rounded'
                            : 'top-2 text-sm text-gray-400'
                        }`}
                      >
                        Preferred Date <span className="text-gray-500">(Optional)</span>
                      </label>
                    {/* Custom calendar icon overlay */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Date helper text */}
                  <div className="mt-2 text-sm text-gray-400">
                    {formData.date ? (
                      <span className="text-green-400">
                        ✓ Selected: {new Date(formData.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    ) : (
                      <span>Choose your preferred date for the service</span>
                    )}
                  </div>
                </div>

                <div className="relative group">
                  <div className="relative">
                    <MessageSquare className={`absolute left-3 top-4 w-5 h-5 transition-colors duration-300 ${
                      focusedField === 'message' ? 'text-blue-400' : 'text-gray-400'
                    }`} />
                  <textarea
                      ref={messageRef}
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                      onKeyDown={(e) => handleKeyDown(e, 'message')}
                      onFocus={() => handleFieldFocus('message')}
                      onBlur={handleFieldBlur}
                    required
                    rows={6}
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-white placeholder-transparent focus:outline-none transition-all duration-300 resize-none ${
                        focusedField === 'message' 
                          ? 'border-blue-500 bg-slate-700/80 shadow-lg shadow-blue-500/20' 
                          : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                      }`}
                    placeholder="Tell me about your photography needs, vision, and any specific requirements..."
                  />
                    <label 
                      htmlFor="message" 
                      className={`absolute left-12 transition-all duration-300 pointer-events-none ${
                        formData.message || focusedField === 'message'
                          ? 'top-1 text-xs text-blue-400 bg-slate-800/50 px-1 rounded'
                          : 'top-2 text-sm text-gray-400'
                      }`}
                    >
                      Message *
                    </label>
                  </div>
                  
                  {/* Character counter */}
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-400">
                      {formData.message.length > 0 && `${formData.message.length} characters`}
                    </span>
                    <span className="text-gray-500">
                      Press Enter to submit, Shift+Enter for new line
                    </span>
                  </div>
                </div>

                {/* Math Challenge */}
                <div className="relative group">
                  <div className="relative">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Security Check *
                        </label>
                        <div className="flex items-center space-x-3">
                          <span className="text-white text-lg font-medium bg-slate-700/50 px-4 py-3 rounded-xl border-2 border-slate-600">
                            {mathChallenge.question} = ?
                          </span>
                          <input
                            type="number"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="w-20 px-3 py-3 border-2 rounded-xl text-white text-center focus:outline-none transition-all duration-300 bg-slate-700/50 border-slate-600 hover:border-slate-500 focus:border-blue-500 focus:bg-slate-700/80"
                            placeholder="?"
                            required
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-400">
                          Please solve this simple math problem to verify you're human
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMathChallenge(generateMathChallenge());
                          setUserAnswer('');
                        }}
                        className="px-3 py-2 text-sm text-gray-400 hover:text-white bg-slate-700/50 hover:bg-slate-600 rounded-lg transition-all duration-300 border border-slate-600 hover:border-slate-500"
                        title="Generate new challenge"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
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

                {/* Error Message - Now handled by popup */}

                <div className="space-y-4">
                  {/* Keyboard shortcuts hint */}
                  <div className="text-center text-sm text-gray-500">
                    <span className="inline-flex items-center gap-4">
                      <span>💡 <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Enter</kbd> to submit</span>
                      <span>💡 <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Esc</kbd> to clear</span>
                    </span>
                </div>

                <button
                  type="submit"
                    disabled={formStatus === 'submitting'}
                    className="group w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed relative overflow-hidden"
                >
                    {/* Button background animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    
                    {formStatus === 'submitting' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                        <Send size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                        <span>Send Message</span>
                        <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight size={16} className="text-white" />
                        </div>
                    </>
                  )}
                </button>
                </div>
              </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-sm"></div>
                <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full px-4 py-2 mb-4">
                      <Phone className="w-5 h-5 text-purple-400" />
                      <span className="text-white font-semibold text-sm">Get In Touch</span>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Contact Information
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    {contactInfo.map((info, index) => {
                      const isCopyable = info.title === 'Email' || info.title === 'Phone';
                      return (
                        <div
                          key={index}
                          className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                            isCopyable 
                              ? 'cursor-pointer hover:scale-105' 
                              : 'cursor-default'
                          }`}
                          onClick={isCopyable ? async () => {
                            await navigator.clipboard.writeText(info.value);
                            setCopiedIndex(index);
                            setTimeout(() => setCopiedIndex(null), 1500);
                          } : undefined}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center p-4 bg-slate-700/30 hover:bg-slate-700/50 transition-colors duration-300">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                              <info.icon size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-semibold text-sm">{info.title}</h3>
                              <p className="text-gray-300 text-sm">
                                {info.value}
                                {copiedIndex === index && (
                                  <span className="ml-2 text-green-400 font-semibold text-xs">✓ Copied!</span>
                                )}
                              </p>
                            </div>
                            {isCopyable && (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-cyan-600/20 to-pink-600/20 rounded-2xl blur-sm"></div>
                <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-600/20 to-pink-600/20 rounded-full px-4 py-2 mb-4">
                      <Camera className="w-5 h-5 text-cyan-400" />
                      <span className="text-white font-semibold text-sm">Follow My Work</span>
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Stay Connected
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center p-4 bg-slate-700/30 hover:bg-slate-700/50 transition-colors duration-300">
                          <div className="bg-gradient-to-br from-cyan-500 to-pink-500 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                            <social.icon size={18} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-sm">{social.name}</h4>
                            <p className="text-gray-300 text-xs">{social.handle}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Response Promise */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl blur-sm"></div>
                <div className="relative bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-500/20 text-center overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-400/10 rounded-full translate-y-8 -translate-x-8"></div>
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4 mx-auto">
                      <Clock size={24} className="text-white" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">Quick Response Guarantee</h3>
                    <p className="text-green-100 text-sm leading-relaxed">
                      I'll respond to your inquiry within 24 hours, usually much sooner!
                    </p>
                    <div className="mt-4 flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowErrorPopup(false)}
          />
          
          {/* Popup Content */}
          <div className="relative bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-red-500/20 transform animate-in zoom-in-95 duration-300">
            {/* Close button */}
            <button
              onClick={() => setShowErrorPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Error Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mx-auto mb-6">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            
            {/* Error Content */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-3">
                {errorMessage.includes('Telegram') ? 'Telegram Username Required' : 'Form Error'}
              </h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {errorMessage}
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowErrorPopup(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                >
                  Got it
                </button>
                {errorMessage.includes('Telegram') && (
                  <button
                    onClick={() => {
                      setFormData(prev => ({ ...prev, contactType: 'email' }));
                      setShowErrorPopup(false);
                      emailRef.current?.focus();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                  >
                    Switch to Email
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Contact;