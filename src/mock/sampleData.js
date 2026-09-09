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
  isAcceptingBookings: true,
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  dateOverrides: {}
};

export const INITIAL_APPOINTMENTS = [];
export const MOCK_STUDENTS = studentsDatabase;

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    type: 'COMPANY_REPLY',
    category: 'Company Reply',
    title: 'IndiGo Airlines - Airport Operations & Ground Services Internship Reply',
    content: 'IndiGo HR has officially responded to our institutional request and opened 15 slots for Vels students. Review the eligibility requirements below and apply online.',
    companyName: 'IndiGo (InterGlobe Aviation)',
    companyStatus: 'OPPORTUNITY_AVAILABLE',
    replyDate: '2026-09-08',
    department: 'B.Sc Aviation / BBA Aviation Management / B.Sc Aeronautical',
    duration: '3 Months (Stipend Provided)',
    eligibility: 'Min 6.5 CGPA, No active backlogs, II & III Year students',
    deadline: '2026-09-15',
    actionRequired: 'Submit resume and scanned ID card via official link before September 15. Do not book appointment for token—status updates will be published here directly.',
    coordinatorNotes: 'IndiGo HR confirmed they will conduct online screening next week. Please do not visit the desk for NOC until shortlisting notification is posted.',
    applyLink: 'https://careers.goindigo.in',
    isPinned: true,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'ann-2',
    type: 'URGENT',
    category: 'Urgent Notice',
    title: 'Mandatory Institutional NOC Deadline for Summer 2026 Internships',
    content: 'All III Year students with confirmed external internship offer letters must submit verification documents for Dean endorsement by Friday, 5:00 PM to ensure academic attendance credits.',
    companyName: '',
    companyStatus: '',
    replyDate: '2026-09-09',
    department: 'All Departments',
    duration: '',
    eligibility: 'All III Year registered students',
    deadline: '2026-09-12',
    actionRequired: 'Bring 1 hard copy of Offer Letter + NOC Request form to 7th Floor Staff Room or upload online via student portal.',
    coordinatorNotes: 'Strict deadline mandated by academic council. Late submissions cannot be regularized.',
    applyLink: '',
    isPinned: true,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'ann-3',
    type: 'COMPANY_REPLY',
    category: 'Company Reply',
    title: 'Zoho Corporation - Technical QA & Support Internship Response',
    content: 'Zoho Campus Relations team replied regarding summer technical internship opportunities for Computer Science & Engineering students.',
    companyName: 'Zoho Corporation',
    companyStatus: 'REPLY_RECEIVED',
    replyDate: '2026-09-07',
    department: 'B.Tech Computer Science & Engg / B.Tech ECE',
    duration: '6 Months Full-Time',
    eligibility: 'Proficiency in Data Structures, Java or Python, Web Fundamentals',
    deadline: '2026-09-22',
    actionRequired: 'Fill out the Zoho campus registration form. Assessment link will be sent to registered university email IDs.',
    coordinatorNotes: 'Do not book an appointment asking about Zoho test dates. Assessment links are dispatched directly by Zoho recruiting team on Friday.',
    applyLink: 'https://www.zoho.com/careers',
    isPinned: false,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString()
  },
  {
    id: 'ann-4',
    type: 'COMPANY_REPLY',
    category: 'Internship Update',
    title: 'Blue Dart Express - Supply Chain Operations Reply',
    content: 'Blue Dart HR has acknowledged our internship outreach email and is reviewing student candidate resumes.',
    companyName: 'Blue Dart Express Ltd',
    companyStatus: 'INFO_REQUIRED',
    replyDate: '2026-09-06',
    department: 'B.Sc Logistics & Supply Chain',
    duration: '2 Months',
    eligibility: 'Final & Pre-Final Year Logistics students',
    deadline: '2026-09-18',
    actionRequired: 'Ensure resumes follow the standard university format. HR will announce the interview schedule shortly.',
    coordinatorNotes: 'Shortlisted candidates will be notified here directly without needing coordinator appointments.',
    applyLink: '',
    isPinned: false,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

