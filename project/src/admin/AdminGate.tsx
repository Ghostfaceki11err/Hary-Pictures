import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './Login';
import AdminPanel from './AdminPanel';

const AdminGate: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        if (error) {
          console.error('Session check error:', error);
          setIsAuthed(false);
        } else {
          setIsAuthed(!!session);
        }
        setLoading(false);
      } catch (error) {
        console.error('Session check failed:', error);
        if (!isMounted) return;
        setIsAuthed(false);
        setLoading(false);
      }
    }

    checkSession();

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      // Handle different auth events
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        setIsAuthed(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' && session) {
        setIsAuthed(!!session);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthed) {
    return <Login />;
  }

  return <AdminPanel />;
};

export default AdminGate;
