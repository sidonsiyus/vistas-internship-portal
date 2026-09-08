import studentsDatabase from '../data/studentsDatabase.json';

export const QUERY_CATEGORIES = [
  { id: 'opportunity', label: 'Internship Opportunity', icon: 'Briefcase', color: 'blue' },
  { id: 'approval', label: 'Internship Approval (NOC)', icon: 'CheckCircle2', color: 'emerald' },
  { id: 'recommendation', label: 'Company Recommendation', icon: 'FileText', color: 'purple' },
  { id: 'documents', label: 'Internship Documents', icon: 'FolderOpen', color: 'amber' },
  { id: 'certificate', label: 'Internship Certificate', icon: 'Award', color: 'cyan' },
  { id: 'training', label: 'Training', icon: 'GraduationCap', color: 'indigo' },
  { id: 'industrial_visit', label: 'Industrial Visit', icon: 'Building2', color: 'rose' },
  { id: 'guidance', label: 'Career Guidance', icon: 'Compass', color: 'orange' },
  { id: 'emergency', label: '🚨 Urgent Emergency Approval', icon: 'AlertTriangle', color: 'rose' },
  { id: 'other', label: 'Other Query', icon: 'HelpCircle', color: 'slate' }
];

export const DEPARTMENTS = [
  'B.Sc Aeronautical Science',
  'B.Sc Aviation',
  'BBA Aviation Management',
  'MBA (Master of Business Admin)',
  'B.Tech Computer Science & Engg',
  'B.Tech Mechanical Engineering',
  'B.Tech Electronics & Comm',
  'B.Sc Logistics & Supply Chain',
  'B.Pharm (Pharmacy)'
];

export const OFFICE_LOCATION = '7th Floor Staff Room, Vels Hi-Tech Campus';

export const INITIAL_AVAILABILITY = {
  status: 'AVAILABLE',
  todayDate: new Date().toISOString().split('T')[0],
  startTime: '15:00',
  endTime: '17:30',
  slotDuration: 15,
  breakStartTime: '16:15',
  breakEndTime: '16:30',
  maxBookings: 25,
  bookingDeadline: '17:00',
  isAcceptingBookings: true
};

export const INITIAL_APPOINTMENTS = [];
export const MOCK_STUDENTS = studentsDatabase;
