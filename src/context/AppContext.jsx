import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_APPOINTMENTS, INITIAL_AVAILABILITY, MOCK_STUDENTS } from '../mock/sampleData';
import { generateNextTokenNumber } from '../utils/tokenGenerator';
import { sendTokenNotificationPair } from '../utils/notifications';

const AppContext = createContext();
const CHANNEL_NAME = 'VISTAS_REALTIME_QUEUE';

export function AppProvider({ children }) {
  const [availability, setAvailability] = useState(() => {
    const saved = localStorage.getItem('vistas_availability');
    return saved ? JSON.parse(saved) : INITIAL_AVAILABILITY;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('vistas_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('vistas_students');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });

  const [activeMeeting, setActiveMeeting] = useState(null);
  const [adminAuth, setAdminAuth] = useState(() => {
    const saved = localStorage.getItem('vistas_admin_auth');
    return saved ? JSON.parse(saved) : { isAuthenticated: false, email: '', name: '' };
  });

  // Tracked token defaults to empty string so user isn't stuck on old token
  const [trackedToken, setTrackedToken] = useState('');

  const [toastNotification, setToastNotification] = useState(null);
  const [usingSupabase, setUsingSupabase] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('vistas_notification_settings');
    return saved ? JSON.parse(saved) : {
      enableEmail: true,
      enableSms: true,
      emailjsServiceId: '',
      emailjsTemplateId: '',
      emailjsPublicKey: '',
      emailWebhookUrl: '',
      smsWebhookUrl: ''
    };
  });

  useEffect(() => {
    localStorage.setItem('vistas_notification_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  };

  const showToast = (message, type = 'info') => {
    setToastNotification({ message, type, id: Date.now() });
    setTimeout(() => setToastNotification(null), 4000);
  };

  const broadcastChange = (action, payload) => {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ action, payload });
      bc.close();
    } catch (e) {}
  };

  // --- SUPABASE REALTIME & FETCH ---
  useEffect(() => {
    const fetchSupabaseState = async () => {
      if (!isSupabaseConfigured()) return;
      setUsingSupabase(true);

      try {
        const { data: aptData } = await supabase.from('appointments').select('*').order('created_at', { ascending: true });
        const { data: availData } = await supabase.from('availability').select('*').single();
        const { data: stdData } = await supabase.from('students').select('*');

        if (aptData) {
          const formatted = aptData.map(a => ({
            id: a.id,
            tokenNumber: a.token_number,
            studentName: a.student_name,
            registerNumber: a.register_number,
            department: a.department,
            year: a.year,
            phone: a.phone,
            email: a.email,
            category: a.category,
            description: a.description,
            status: a.status,
            queuePosition: a.queue_position,
            appointmentDate: a.appointment_date,
            appointmentTime: a.appointment_time,
            isWalkIn: a.is_walk_in,
            durationMinutes: a.duration_minutes,
            notes: a.notes,
            startedAt: a.started_at,
            completedAt: a.completed_at
          }));
          setAppointments(formatted);
          const active = formatted.find(a => a.status === 'IN_PROGRESS');
          setActiveMeeting(active || null);
        }

        if (availData) {
          setAvailability({
            status: availData.status,
            startTime: availData.start_time,
            endTime: availData.end_time,
            slotDuration: availData.slot_duration,
            breakStartTime: availData.break_start_time,
            breakEndTime: availData.break_end_time,
            maxBookings: availData.max_bookings
          });
        }

        if (stdData) {
          setStudents(stdData.map(s => ({
            id: s.id,
            registerNumber: s.register_number,
            name: s.name,
            department: s.department,
            year: s.year,
            email: s.email,
            phone: s.phone,
            historyCount: s.history_count,
            privateNotes: s.private_notes
          })));
        }
      } catch (e) {
        console.warn('Supabase fetch error', e);
      }
    };

    fetchSupabaseState();

    let channel;
    if (isSupabaseConfigured()) {
      channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, payload => {
          fetchSupabaseState();
          if (payload.new && payload.new.status === 'CALLED') {
            playAlertSound();
            showToast(`🔔 Token ${payload.new.token_number} Called!`, 'warning');
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'availability' }, () => {
          fetchSupabaseState();
        })
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [trackedToken]);

  // Persist Local Storage fallback
  useEffect(() => {
    localStorage.setItem('vistas_availability', JSON.stringify(availability));
  }, [availability]);

  useEffect(() => {
    localStorage.setItem('vistas_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('vistas_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('vistas_admin_auth', JSON.stringify(adminAuth));
  }, [adminAuth]);

  // --- ACTIONS ---

  // Complete Reset: Deletes all appointments & clears token queue
  const resetAllTokens = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }
      setAppointments([]);
      setActiveMeeting(null);
      setTrackedToken('');
      localStorage.removeItem('vistas_tracked_token');
      broadcastChange('SYNC', { appointments: [] });
      showToast('🔥 All tokens & queue sequence successfully reset!', 'warning');
    } catch (e) {
      showToast('Failed to reset tokens', 'warning');
    }
  };

  const loginAdmin = async (emailInput, passcode) => {
    const cleanPasscode = String(passcode || '').trim();
    if (!cleanPasscode) return false;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('passcode', cleanPasscode);

        if (data && data.length > 0) {
          const match = data[0];
          const authObj = { isAuthenticated: true, email: match.email, name: 'Internship Coordinator' };
          setAdminAuth(authObj);
          showToast('⚡ Authenticated via Supabase Cloud Database!', 'success');
          return true;
        }
      } catch (e) {
        console.warn('Supabase admin query error', e);
      }
    }

    if (cleanPasscode === 'vistas2026') {
      const authObj = { isAuthenticated: true, email: 'coordinator@velshitech.edu.in', name: 'Internship Coordinator' };
      setAdminAuth(authObj);
      showToast('Welcome back, Coordinator!', 'success');
      return true;
    }

    return false;
  };

  const logoutAdmin = () => {
    localStorage.removeItem('vistas_admin_auth');
    setAdminAuth({ isAuthenticated: false, email: '', name: '' });
    showToast('Logged out of Admin Desk', 'info');
  };

  const bookAppointment = async (bookingData) => {
    const tokenNumber = generateNextTokenNumber(appointments);
    const activeWaiting = appointments.filter(a => a.status === 'WAITING' || a.status === 'CALLED');
    const queuePosition = activeWaiting.length + 1;

    const newApt = {
      id: `apt-${Date.now()}`,
      tokenNumber,
      studentName: bookingData.name,
      registerNumber: bookingData.registerNumber,
      department: bookingData.department,
      year: bookingData.year,
      phone: bookingData.phone,
      email: bookingData.email,
      category: bookingData.category,
      description: bookingData.description,
      status: 'WAITING',
      queuePosition,
      appointmentDate: bookingData.date,
      appointmentTime: bookingData.timeSlot,
      isWalkIn: false
    };

    if (isSupabaseConfigured()) {
      const { data } = await supabase.from('appointments').insert([{
        token_number: tokenNumber,
        student_name: bookingData.name,
        register_number: bookingData.registerNumber,
        department: bookingData.department,
        year: bookingData.year,
        phone: bookingData.phone,
        email: bookingData.email,
        category: bookingData.category,
        description: bookingData.description,
        status: 'WAITING',
        queue_position: queuePosition,
        appointment_date: bookingData.date,
        appointment_time: bookingData.timeSlot,
        is_walk_in: false
      }]).select('*').single();

      if (data) {
        newApt.id = data.id;
      }
    } else {
      const updated = [...appointments, newApt];
      setAppointments(updated);
      broadcastChange('SYNC', { appointments: updated });
    }

    setTrackedToken(tokenNumber);

    // Auto-dispatch Email & SMS notifications to student
    try {
      if (notificationSettings.enableEmail || notificationSettings.enableSms) {
        sendTokenNotificationPair(newApt, notificationSettings);
        showToast(`📩 Token ${tokenNumber} sent via Email & SMS to ${newApt.email}!`, 'success');
      } else {
        showToast(`Confirmed! Your Token is ${tokenNumber}`, 'success');
      }
    } catch (e) {
      showToast(`Confirmed! Your Token is ${tokenNumber}`, 'success');
    }

    return newApt;
  };

  const addWalkInStudent = async (walkInData) => {
    const tokenNumber = generateNextTokenNumber(appointments);
    const activeWaiting = appointments.filter(a => a.status === 'WAITING' || a.status === 'CALLED');
    let pos = activeWaiting.length + 1;
    if (walkInData.positionChoice === 'PRIORITY') pos = 1;

    if (isSupabaseConfigured()) {
      await supabase.from('appointments').insert([{
        token_number: tokenNumber,
        student_name: walkInData.name,
        register_number: walkInData.registerNumber || 'WALK-IN',
        department: walkInData.department,
        year: walkInData.year || 'N/A',
        phone: 'N/A',
        email: 'N/A',
        category: walkInData.category,
        description: `[WALK-IN] ${walkInData.description || ''}`,
        status: 'WAITING',
        queue_position: pos,
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_walk_in: true
      }]);
    } else {
      const newApt = {
        id: `apt-${Date.now()}`,
        tokenNumber,
        studentName: walkInData.name,
        registerNumber: walkInData.registerNumber || 'WALK-IN',
        department: walkInData.department,
        year: walkInData.year || 'N/A',
        phone: 'N/A',
        email: 'N/A',
        category: walkInData.category,
        description: `[WALK-IN] ${walkInData.description || ''}`,
        status: 'WAITING',
        queuePosition: pos,
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isWalkIn: true
      };
      const updated = [...appointments, newApt];
      setAppointments(updated);
      broadcastChange('SYNC', { appointments: updated });
    }

    showToast(`Walk-in added: ${tokenNumber}`, 'success');
  };

  const callStudent = async (appointmentId) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    if (isSupabaseConfigured()) {
      await supabase.from('appointments').update({ status: 'CALLED' }).eq('id', appointmentId);
    } else {
      const updated = appointments.map(a => a.id === appointmentId ? { ...a, status: 'CALLED' } : a);
      setAppointments(updated);
      broadcastChange('SYNC', { appointments: updated });
    }

    playAlertSound();
    showToast(`Called Token ${apt.tokenNumber}`, 'info');
  };

  const startMeeting = async (appointmentId) => {
    const now = new Date().toISOString();
    if (isSupabaseConfigured()) {
      await supabase.from('appointments').update({ status: 'IN_PROGRESS', started_at: now }).eq('id', appointmentId);
    } else {
      const updated = appointments.map(a => a.id === appointmentId ? { ...a, status: 'IN_PROGRESS', startedAt: now } : a);
      setAppointments(updated);
      const active = updated.find(a => a.id === appointmentId);
      setActiveMeeting(active);
      broadcastChange('SYNC', { appointments: updated });
    }

    showToast('Meeting started', 'success');
  };

  const endMeeting = async (appointmentId, notes = '', durationMinutes = 11) => {
    const now = new Date().toISOString();
    if (isSupabaseConfigured()) {
      await supabase.from('appointments').update({
        status: 'COMPLETED',
        completed_at: now,
        notes: notes || 'Consultation completed.',
        duration_minutes: durationMinutes
      }).eq('id', appointmentId);
    } else {
      const updated = appointments.map(a => a.id === appointmentId ? { ...a, status: 'COMPLETED', completedAt: now, notes, durationMinutes } : a);
      setAppointments(updated);
      setActiveMeeting(null);
      broadcastChange('SYNC', { appointments: updated });
    }

    showToast('Consultation completed', 'success');
  };

  const markNoShow = async (appointmentId) => {
    if (isSupabaseConfigured()) {
      await supabase.from('appointments').update({ status: 'NO_SHOW', notes: 'Marked No-Show' }).eq('id', appointmentId);
    } else {
      const updated = appointments.map(a => a.id === appointmentId ? { ...a, status: 'NO_SHOW' } : a);
      setAppointments(updated);
      setActiveMeeting(null);
      broadcastChange('SYNC', { appointments: updated });
    }

    showToast('Marked student No-Show', 'warning');
  };

  const cancelAppointment = async (appointmentId) => {
    if (isSupabaseConfigured()) {
      await supabase.from('appointments').update({ status: 'CANCELLED' }).eq('id', appointmentId);
    } else {
      const updated = appointments.map(a => a.id === appointmentId ? { ...a, status: 'CANCELLED' } : a);
      setAppointments(updated);
      broadcastChange('SYNC', { appointments: updated });
    }

    showToast('Appointment cancelled', 'info');
  };

  const updateAvailabilityStatus = async (status) => {
    if (isSupabaseConfigured()) {
      await supabase.from('availability').update({ status }).eq('id', 1);
    } else {
      const updated = { ...availability, status };
      setAvailability(updated);
      broadcastChange('SYNC', { availability: updated });
    }
    showToast(`Availability set to ${status}`, 'info');
  };

  const updateAvailabilityConfig = async (newConfig) => {
    if (isSupabaseConfigured()) {
      await supabase.from('availability').update({
        start_time: newConfig.startTime,
        end_time: newConfig.endTime,
        slot_duration: newConfig.slotDuration,
        break_start_time: newConfig.breakStartTime,
        break_end_time: newConfig.breakEndTime,
        max_bookings: newConfig.maxBookings
      }).eq('id', 1);
    } else {
      const updated = { ...availability, ...newConfig };
      setAvailability(updated);
    }
    showToast('Availability settings saved!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        availability,
        appointments,
        students,
        activeMeeting,
        adminAuth,
        trackedToken,
        toastNotification,
        usingSupabase,
        notificationSettings,
        setNotificationSettings,
        setTrackedToken,
        resetAllTokens,
        bookAppointment,
        addWalkInStudent,
        callStudent,
        startMeeting,
        endMeeting,
        markNoShow,
        cancelAppointment,
        updateAvailabilityStatus,
        updateAvailabilityConfig,
        loginAdmin,
        logoutAdmin,
        showToast,
        playAlertSound
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
