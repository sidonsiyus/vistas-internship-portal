import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { INITIAL_APPOINTMENTS, INITIAL_AVAILABILITY, MOCK_STUDENTS, INITIAL_ANNOUNCEMENTS } from '../mock/sampleData';
import { generateNextTokenNumber } from '../utils/tokenGenerator';

const AppContext = createContext();
const CHANNEL_NAME = 'VISTAS_REALTIME_QUEUE';

export function AppProvider({ children }) {
  const [availability, setAvailability] = useState(() => {
    try {
      const saved = localStorage.getItem('vistas_availability');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_AVAILABILITY,
          ...parsed,
          workingDays: parsed.workingDays || INITIAL_AVAILABILITY.workingDays,
          dateOverrides: parsed.dateOverrides || INITIAL_AVAILABILITY.dateOverrides
        };
      }
    } catch (e) {}
    return INITIAL_AVAILABILITY;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('vistas_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [students, setStudents] = useState(() => {
    try {
      const saved = localStorage.getItem('vistas_students');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return MOCK_STUDENTS;
  });

  // Announcements & Company Reply Updates State
  const [announcements, setAnnouncements] = useState(() => {
    try {
      const saved = localStorage.getItem('vistas_announcements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ANNOUNCEMENTS;
  });

  // Timestamp of when student last viewed the updates section
  const [lastViewedUpdates, setLastViewedUpdates] = useState(() => {
    return localStorage.getItem('vistas_last_viewed_updates') || '1970-01-01T00:00:00.000Z';
  });

  const markUpdatesAsRead = () => {
    const nowIso = new Date().toISOString();
    setLastViewedUpdates(nowIso);
    localStorage.setItem('vistas_last_viewed_updates', nowIso);
  };

  // Count active announcements created/updated since student's last visit
  const unreadCount = announcements.filter(a => {
    if (!a.isActive) return false;
    const itemTime = a.updatedAt || a.createdAt || '';
    return itemTime > lastViewedUpdates;
  }).length;

  const [activeMeeting, setActiveMeeting] = useState(null);
  const [adminAuth, setAdminAuth] = useState(() => {
    const saved = localStorage.getItem('vistas_admin_auth');
    return saved ? JSON.parse(saved) : { isAuthenticated: false, email: '', name: '' };
  });

  // Tracked token defaults to empty string so user isn't stuck on old token
  const [trackedToken, setTrackedToken] = useState('');

  const [toastNotification, setToastNotification] = useState(null);
  const [usingSupabase, setUsingSupabase] = useState(false);

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
  // Cloud Sync Helpers
  const syncAnnouncementsToSupabase = async (updatedList) => {
    if (!isSupabaseConfigured()) return;
    try {
      // 1. Always persist full announcements state to __SYS_ANNOUNCEMENTS__ in Supabase
      await supabase.from('students').upsert({
        register_number: '__SYS_ANNOUNCEMENTS__',
        name: 'SYSTEM_ANNOUNCEMENTS',
        department: 'SYSTEM',
        year: 'ALL',
        email: 'sys_ann@vistas.internal',
        phone: '',
        private_notes: JSON.stringify(updatedList)
      }, { onConflict: 'register_number' });
    } catch (e) {
      console.warn('Sync announcements error:', e);
    }
  };

  const syncAvailabilityToSupabase = async (updatedAvail) => {
    if (!isSupabaseConfigured()) return;
    try {
      // 1. Update standard columns in availability table
      await supabase.from('availability').update({
        status: updatedAvail.status,
        start_time: updatedAvail.startTime,
        end_time: updatedAvail.endTime,
        slot_duration: updatedAvail.slotDuration,
        break_start_time: updatedAvail.breakStartTime,
        break_end_time: updatedAvail.breakEndTime,
        max_bookings: updatedAvail.maxBookings
      }).eq('id', 1);

      // 2. Persist complete availability state (including workingDays & dateOverrides) to __SYS_AVAILABILITY__
      await supabase.from('students').upsert({
        register_number: '__SYS_AVAILABILITY__',
        name: 'SYSTEM_AVAILABILITY',
        department: 'SYSTEM',
        year: 'ALL',
        email: 'sys_avail@vistas.internal',
        phone: '',
        private_notes: JSON.stringify(updatedAvail)
      }, { onConflict: 'register_number' });
    } catch (e) {
      console.warn('Sync availability error:', e);
    }
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
            completedAt: a.completed_at,
            createdAt: a.created_at || a.appointment_date
          }));
          setAppointments(formatted);
          const active = formatted.find(a => a.status === 'IN_PROGRESS');
          setActiveMeeting(active || null);
        }

        if (availData) {
          setAvailability(prev => ({
            ...prev,
            status: availData.status,
            startTime: availData.start_time,
            endTime: availData.end_time,
            slotDuration: availData.slot_duration,
            breakStartTime: availData.break_start_time,
            breakEndTime: availData.break_end_time,
            maxBookings: availData.max_bookings
          }));
        }

        if (stdData && stdData.length > 0) {
          // Check for cross-device synchronized system records
          const annRecord = stdData.find(s => s.register_number === '__SYS_ANNOUNCEMENTS__');
          if (annRecord && annRecord.private_notes) {
            try {
              const parsedAnn = JSON.parse(annRecord.private_notes);
              if (Array.isArray(parsedAnn)) {
                setAnnouncements(parsedAnn);
                localStorage.setItem('vistas_announcements', JSON.stringify(parsedAnn));
              }
            } catch (e) {}
          }

          const availRecord = stdData.find(s => s.register_number === '__SYS_AVAILABILITY__');
          if (availRecord && availRecord.private_notes) {
            try {
              const parsedAvail = JSON.parse(availRecord.private_notes);
              if (parsedAvail && typeof parsedAvail === 'object') {
                setAvailability(prev => ({
                  ...prev,
                  ...parsedAvail,
                  status: (availData && availData.status) || parsedAvail.status || prev.status
                }));
                localStorage.setItem('vistas_availability', JSON.stringify({ ...parsedAvail }));
              }
            } catch (e) {}
          }

          // Filter out internal system sync records from student list
          const realStudents = stdData
            .filter(s => !s.register_number.startsWith('__SYS_'))
            .map(s => ({
              id: s.id,
              registerNumber: s.register_number,
              name: s.name,
              department: s.department,
              year: s.year,
              email: s.email,
              phone: s.phone,
              historyCount: s.history_count,
              privateNotes: s.private_notes
            }));
          if (realStudents.length > 0) {
            setStudents(realStudents);
          }
        }

        // Try standard announcements table if present
        try {
          const { data: annData } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

          if (annData && annData.length > 0) {
            const formattedAnn = annData.map(a => ({
              id: a.id,
              title: a.title,
              content: a.content,
              type: a.type || 'GENERAL',
              category: a.category || 'Important',
              companyName: a.company_name || '',
              companyLocation: a.company_location || '',
              companyContactEmail: a.company_contact_email || '',
              requestSentDate: a.request_sent_date || '',
              emailReference: a.email_reference || '',
              companyStatus: a.company_status || '',
              replyDate: a.reply_date || '',
              department: a.department || '',
              duration: a.duration || '',
              eligibility: a.eligibility || '',
              deadline: a.deadline || '',
              requiredDocuments: a.required_documents || '',
              actionRequired: a.action_required || '',
              coordinatorNotes: a.coordinator_notes || '',
              applyLink: a.apply_link || '',
              studentsIncluded: Array.isArray(a.students_included) ? a.students_included : [],
              isPinned: Boolean(a.is_pinned),
              isActive: a.is_active !== false,
              createdAt: a.created_at,
              updatedAt: a.updated_at
            }));
            setAnnouncements(formattedAnn);
            localStorage.setItem('vistas_announcements', JSON.stringify(formattedAnn));
          }
        } catch (annErr) {}
      } catch (e) {
        console.warn('Supabase fetch error', e);
      }
    };

    fetchSupabaseState();

    // 🔄 Periodic Polling (every 3s) to guarantee real-time sync across devices
    const pollInterval = setInterval(() => {
      fetchSupabaseState();
    }, 3000);

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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
          fetchSupabaseState();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
          fetchSupabaseState();
        })
        .subscribe();
    }

    // 📡 Cross-tab listener via BroadcastChannel
    let bc;
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data?.action === 'SYNC' && event.data?.payload) {
          if (event.data.payload.appointments) {
            setAppointments(event.data.payload.appointments);
          }
          if (event.data.payload.availability) {
            setAvailability(event.data.payload.availability);
          }
          if (event.data.payload.announcements) {
            setAnnouncements(event.data.payload.announcements);
          }
        }
      };
    } catch (e) {}

    return () => {
      clearInterval(pollInterval);
      if (channel) supabase.removeChannel(channel);
      if (bc) bc.close();
    };
  }, []);

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
    localStorage.setItem('vistas_announcements', JSON.stringify(announcements));
  }, [announcements]);

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
    const nowIso = new Date().toISOString();

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
      isWalkIn: false,
      createdAt: nowIso
    };

    // 1. Optimistic Local State Update (Instant Feedback)
    const updated = [...appointments, newApt];
    setAppointments(updated);
    broadcastChange('SYNC', { appointments: updated });

    // 2. Persist to Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('appointments').insert([{
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
          setAppointments(prev => prev.map(a => a.tokenNumber === tokenNumber ? {
            ...a,
            id: data.id,
            createdAt: data.created_at || nowIso
          } : a));
        }
      } catch (err) {
        console.warn('Supabase booking insert error:', err);
      }
    }

    setTrackedToken(tokenNumber);
    showToast(`Confirmed! Your Token is ${tokenNumber}`, 'success');
    return newApt;
  };

  const addWalkInStudent = async (walkInData) => {
    const tokenNumber = generateNextTokenNumber(appointments);
    const activeWaiting = appointments.filter(a => a.status === 'WAITING' || a.status === 'CALLED');
    let pos = activeWaiting.length + 1;
    if (walkInData.positionChoice === 'PRIORITY') pos = 1;

    const nowIso = new Date().toISOString();
    const todayDate = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
      appointmentDate: todayDate,
      appointmentTime: timeNow,
      isWalkIn: true,
      createdAt: nowIso
    };

    // 1. Optimistic Local State Update
    const updated = [...appointments, newApt];
    setAppointments(updated);
    broadcastChange('SYNC', { appointments: updated });

    // 2. Persist to Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        const { data } = await supabase.from('appointments').insert([{
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
          appointment_date: todayDate,
          appointment_time: timeNow,
          is_walk_in: true
        }]).select('*').single();

        if (data) {
          setAppointments(prev => prev.map(a => a.tokenNumber === tokenNumber ? {
            ...a,
            id: data.id,
            createdAt: data.created_at || nowIso
          } : a));
        }
      } catch (err) {
        console.warn('Supabase walk-in error:', err);
      }
    }

    showToast(`Walk-in added: ${tokenNumber}`, 'success');
  };

  const callStudent = async (appointmentId) => {
    const apt = appointments.find(a => a.id === appointmentId);
    if (!apt) return;

    // 1. Optimistic Local State Update
    const updated = appointments.map(a => a.id === appointmentId ? { ...a, status: 'CALLED' } : a);
    setAppointments(updated);
    try {
      localStorage.setItem('vistas_appointments', JSON.stringify(updated));
    } catch (e) {}
    broadcastChange('SYNC', { appointments: updated });

    // 2. Persist to Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        let q = supabase.from('appointments').update({ status: 'CALLED' });
        if (apt?.tokenNumber) {
          q = q.or(`id.eq.${appointmentId},token_number.eq.${apt.tokenNumber}`);
        } else {
          q = q.eq('id', appointmentId);
        }
        await q;
      } catch (err) {
        console.warn('Supabase call error:', err);
      }
    }

    playAlertSound();
    showToast(`Called Token ${apt.tokenNumber}`, 'info');
  };

  const startMeeting = async (appointmentId) => {
    const now = new Date().toISOString();
    const apt = appointments.find(a => a.id === appointmentId);
    // 1. Optimistic Local State Update
    const updated = appointments.map(a => a.id === appointmentId ? { ...a, status: 'IN_PROGRESS', startedAt: now } : a);
    setAppointments(updated);
    try {
      localStorage.setItem('vistas_appointments', JSON.stringify(updated));
    } catch (e) {}
    const active = updated.find(a => a.id === appointmentId);
    setActiveMeeting(active || null);
    broadcastChange('SYNC', { appointments: updated });

    // 2. Persist to Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        let q = supabase.from('appointments').update({ status: 'IN_PROGRESS', started_at: now });
        if (apt?.tokenNumber) {
          q = q.or(`id.eq.${appointmentId},token_number.eq.${apt.tokenNumber}`);
        } else {
          q = q.eq('id', appointmentId);
        }
        await q;
      } catch (err) {
        console.warn('Supabase start meeting error:', err);
      }
    }

    showToast('Meeting started', 'success');
  };

  const endMeeting = async (appointmentId, notes = '', durationMinutes = 11) => {
    const now = new Date().toISOString();
    const apt = appointments.find(a => a.id === appointmentId);
    // 1. Optimistic Local State Update
    const updated = appointments.map(a => a.id === appointmentId ? { ...a, status: 'COMPLETED', completedAt: now, notes, durationMinutes } : a);
    setAppointments(updated);
    try {
      localStorage.setItem('vistas_appointments', JSON.stringify(updated));
    } catch (e) {}
    setActiveMeeting(null);
    broadcastChange('SYNC', { appointments: updated });

    // 2. Persist to Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        let q = supabase.from('appointments').update({
          status: 'COMPLETED',
          completed_at: now,
          notes: notes || 'Consultation completed.',
          duration_minutes: durationMinutes
        });
        if (apt?.tokenNumber) {
          q = q.or(`id.eq.${appointmentId},token_number.eq.${apt.tokenNumber}`);
        } else {
          q = q.eq('id', appointmentId);
        }
        await q;
      } catch (err) {
        console.warn('Supabase end meeting error:', err);
      }
    }

    showToast('Consultation completed', 'success');
  };

  const markNoShow = async (appointmentId) => {
    const apt = appointments.find(a => a.id === appointmentId);
    // 1. Optimistic Local State Update
    const updated = appointments.map(a => a.id === appointmentId ? { ...a, status: 'NO_SHOW', notes: 'Marked No-Show' } : a);
    setAppointments(updated);
    try {
      localStorage.setItem('vistas_appointments', JSON.stringify(updated));
    } catch (e) {}
    setActiveMeeting(null);
    broadcastChange('SYNC', { appointments: updated });

    // 2. Persist to Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        let q = supabase.from('appointments').update({ status: 'NO_SHOW', notes: 'Marked No-Show' });
        if (apt?.tokenNumber) {
          q = q.or(`id.eq.${appointmentId},token_number.eq.${apt.tokenNumber}`);
        } else {
          q = q.eq('id', appointmentId);
        }
        await q;
      } catch (err) {
        console.warn('Supabase mark no-show error:', err);
      }
    }

    showToast('Marked student No-Show', 'warning');
  };

  const cancelAppointment = async (appointmentId) => {
    const apt = appointments.find(a => a.id === appointmentId);
    // 1. Optimistic Local State Update
    const updated = appointments.map(a => a.id === appointmentId ? { ...a, status: 'CANCELLED' } : a);
    setAppointments(updated);
    try {
      localStorage.setItem('vistas_appointments', JSON.stringify(updated));
    } catch (e) {}
    broadcastChange('SYNC', { appointments: updated });

    // 2. Persist to Supabase Cloud
    if (isSupabaseConfigured()) {
      try {
        let q = supabase.from('appointments').update({ status: 'CANCELLED' });
        if (apt?.tokenNumber) {
          q = q.or(`id.eq.${appointmentId},token_number.eq.${apt.tokenNumber}`);
        } else {
          q = q.eq('id', appointmentId);
        }
        await q;
      } catch (err) {
        console.warn('Supabase cancel appointment error:', err);
      }
    }

    showToast('Appointment cancelled', 'info');
  };

  const updateAvailabilityStatus = async (status) => {
    const updated = { ...availability, status };
    setAvailability(updated);
    try {
      localStorage.setItem('vistas_availability', JSON.stringify(updated));
    } catch (e) {}
    broadcastChange('SYNC', { availability: updated });
    await syncAvailabilityToSupabase(updated);
    showToast(`Availability set to ${status}`, 'info');
  };

  const updateAvailabilityConfig = async (newConfig) => {
    const updated = { ...availability, ...newConfig };
    setAvailability(updated);
    try {
      localStorage.setItem('vistas_availability', JSON.stringify(updated));
    } catch (e) {}
    broadcastChange('SYNC', { availability: updated });
    await syncAvailabilityToSupabase(updated);
    showToast('Availability & Working Days settings saved!', 'success');
  };

  // --- ANNOUNCEMENT & COMPANY UPDATE ACTIONS ---

  const createAnnouncement = async (data) => {
    const id = `ann-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newAnn = {
      id,
      title: data.title || '',
      content: data.content || '',
      type: data.type || 'GENERAL',
      category: data.category || (data.type === 'COMPANY_REPLY' ? 'Company Reply' : 'Important'),
      companyName: data.companyName || '',
      companyLocation: data.companyLocation || '',
      companyContactEmail: data.companyContactEmail || '',
      requestSentDate: data.requestSentDate || '',
      emailReference: data.emailReference || '',
      companyStatus: data.companyStatus || 'REPLY_RECEIVED',
      replyDate: data.replyDate || new Date().toISOString().split('T')[0],
      department: data.department || '',
      duration: data.duration || '',
      eligibility: data.eligibility || '',
      deadline: data.deadline || '',
      requiredDocuments: data.requiredDocuments || '',
      actionRequired: data.actionRequired || '',
      coordinatorNotes: data.coordinatorNotes || '',
      applyLink: data.applyLink || '',
      studentsIncluded: Array.isArray(data.studentsIncluded) ? data.studentsIncluded : [],
      isPinned: Boolean(data.isPinned),
      isActive: data.isActive !== false,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    try {
      localStorage.setItem('vistas_announcements', JSON.stringify(updated));
    } catch (e) {}
    broadcastChange('SYNC', { announcements: updated });
    await syncAnnouncementsToSupabase(updated);

    if (isSupabaseConfigured()) {
      try {
        const { data: dbData } = await supabase.from('announcements').insert([{
          title: newAnn.title,
          content: newAnn.content,
          type: newAnn.type,
          category: newAnn.category,
          company_name: newAnn.companyName,
          company_location: newAnn.companyLocation,
          company_contact_email: newAnn.companyContactEmail,
          request_sent_date: newAnn.requestSentDate || null,
          email_reference: newAnn.emailReference,
          company_status: newAnn.companyStatus,
          reply_date: newAnn.replyDate || null,
          department: newAnn.department,
          duration: newAnn.duration,
          eligibility: newAnn.eligibility,
          deadline: newAnn.deadline || null,
          required_documents: newAnn.requiredDocuments,
          action_required: newAnn.actionRequired,
          coordinator_notes: newAnn.coordinatorNotes,
          apply_link: newAnn.applyLink,
          students_included: newAnn.studentsIncluded,
          is_pinned: newAnn.isPinned,
          is_active: newAnn.isActive
        }]).select('*').single();

        if (dbData) {
          setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, id: dbData.id, createdAt: dbData.created_at } : a));
        }
      } catch (err) {
        console.warn('Supabase create announcement error', err);
      }
    }

    showToast(newAnn.type === 'COMPANY_REPLY' ? 'Company Reply Update published!' : 'Announcement published!', 'success');
    return newAnn;
  };

  const updateAnnouncement = async (id, updatedFields) => {
    const nowIso = new Date().toISOString();
    const updated = announcements.map(a => a.id === id ? { ...a, ...updatedFields, updatedAt: nowIso } : a);
    setAnnouncements(updated);
    try {
      localStorage.setItem('vistas_announcements', JSON.stringify(updated));
    } catch (e) {}
    broadcastChange('SYNC', { announcements: updated });
    await syncAnnouncementsToSupabase(updated);

    if (isSupabaseConfigured()) {
      try {
        const payload = {};
        if (updatedFields.title !== undefined) payload.title = updatedFields.title;
        if (updatedFields.content !== undefined) payload.content = updatedFields.content;
        if (updatedFields.type !== undefined) payload.type = updatedFields.type;
        if (updatedFields.category !== undefined) payload.category = updatedFields.category;
        if (updatedFields.companyName !== undefined) payload.company_name = updatedFields.companyName;
        if (updatedFields.companyLocation !== undefined) payload.company_location = updatedFields.companyLocation;
        if (updatedFields.companyContactEmail !== undefined) payload.company_contact_email = updatedFields.companyContactEmail;
        if (updatedFields.requestSentDate !== undefined) payload.request_sent_date = updatedFields.requestSentDate || null;
        if (updatedFields.emailReference !== undefined) payload.email_reference = updatedFields.emailReference;
        if (updatedFields.companyStatus !== undefined) payload.company_status = updatedFields.companyStatus;
        if (updatedFields.replyDate !== undefined) payload.reply_date = updatedFields.replyDate || null;
        if (updatedFields.department !== undefined) payload.department = updatedFields.department;
        if (updatedFields.duration !== undefined) payload.duration = updatedFields.duration;
        if (updatedFields.eligibility !== undefined) payload.eligibility = updatedFields.eligibility;
        if (updatedFields.deadline !== undefined) payload.deadline = updatedFields.deadline || null;
        if (updatedFields.requiredDocuments !== undefined) payload.required_documents = updatedFields.requiredDocuments;
        if (updatedFields.actionRequired !== undefined) payload.action_required = updatedFields.actionRequired;
        if (updatedFields.coordinatorNotes !== undefined) payload.coordinator_notes = updatedFields.coordinatorNotes;
        if (updatedFields.applyLink !== undefined) payload.apply_link = updatedFields.applyLink;
        if (updatedFields.studentsIncluded !== undefined) payload.students_included = updatedFields.studentsIncluded;
        if (updatedFields.isPinned !== undefined) payload.is_pinned = updatedFields.isPinned;
        if (updatedFields.isActive !== undefined) payload.is_active = updatedFields.isActive;
        payload.updated_at = nowIso;

        await supabase.from('announcements').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Supabase update announcement error', err);
      }
    }

    showToast('Announcement updated successfully', 'success');
  };

  const deleteAnnouncement = async (id) => {
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    try {
      localStorage.setItem('vistas_announcements', JSON.stringify(updated));
    } catch (e) {}
    broadcastChange('SYNC', { announcements: updated });
    await syncAnnouncementsToSupabase(updated);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('announcements').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete announcement error', err);
      }
    }

    showToast('Announcement deleted', 'info');
  };

  const toggleAnnouncementActive = async (id) => {
    const target = announcements.find(a => a.id === id);
    if (!target) return;
    const newStatus = !target.isActive;
    await updateAnnouncement(id, { isActive: newStatus });
    showToast(newStatus ? 'Notice activated & visible to students' : 'Notice deactivated & archived', 'info');
  };

  const toggleAnnouncementPin = async (id) => {
    const target = announcements.find(a => a.id === id);
    if (!target) return;
    const newPin = !target.isPinned;
    await updateAnnouncement(id, { isPinned: newPin });
    showToast(newPin ? 'Notice pinned to top' : 'Notice unpinned', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        availability,
        appointments,
        students,
        announcements,
        unreadCount,
        markUpdatesAsRead,
        activeMeeting,
        adminAuth,
        trackedToken,
        toastNotification,
        usingSupabase,
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
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        toggleAnnouncementActive,
        toggleAnnouncementPin,
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
