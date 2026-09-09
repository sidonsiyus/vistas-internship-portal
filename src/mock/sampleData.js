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
    title: 'XYZ Aviation Services - Airport Operations Internship Response',
    content: 'XYZ Aviation Services HR has replied approving internship opportunities specifically for the students included in our initial university request. Please review the student list and instructions below.',
    companyName: 'XYZ Aviation Services',
    companyLocation: 'Chennai Airport Terminal 2',
    companyContactEmail: 'hr.training@xyzaviation.com',
    requestSentDate: '2026-08-28',
    emailReference: 'VELS/INT/2026/XYZ-042',
    companyStatus: 'INTERNSHIP_APPROVED',
    replyDate: '2026-09-08',
    department: 'B.Sc Aeronautical Science / B.Sc Aviation',
    duration: '1 Month (Full-Time)',
    eligibility: 'Listed students in original institutional request',
    deadline: '2026-09-14',
    requiredDocuments: 'College ID Card, 2 Passport Photos, Signed Indemnity Bond',
    actionRequired: 'All approved students must report to staff room on Thursday at 3:30 PM with indemnity form for final NOC dispatch.',
    coordinatorNotes: 'Important: This opportunity applies strictly to the 3 students listed below whose profiles were submitted in the August request. Other students do not need to book appointments for this.',
    applyLink: '',
    studentsIncluded: [
      {
        name: 'John Smith',
        registerNumber: '12345',
        department: 'B.Sc Aeronautical Science',
        year: 'II Year',
        section: 'A',
        contact: '9840123456'
      },
      {
        name: 'Aravind Swaminathan',
        registerNumber: '12346',
        department: 'B.Sc Aeronautical Science',
        year: 'II Year',
        section: 'A',
        contact: '9840234567'
      },
      {
        name: 'Divya Bharathi K',
        registerNumber: '12347',
        department: 'B.Sc Aviation',
        year: 'III Year',
        section: 'B',
        contact: '9840345678'
      }
    ],
    isPinned: true,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
  },
  {
    id: 'ann-2',
    type: 'URGENT',
    category: 'Urgent Notice',
    title: 'Mandatory Institutional NOC Deadline for Summer 2026 Internships',
    content: 'All III Year students with confirmed external internship offer letters must submit verification documents for Dean endorsement by Friday, 5:00 PM to ensure academic attendance credits.',
    companyName: '',
    companyLocation: '',
    companyContactEmail: '',
    requestSentDate: '',
    emailReference: '',
    companyStatus: '',
    replyDate: '2026-09-09',
    department: 'All Departments',
    duration: '',
    eligibility: 'All III Year registered students',
    deadline: '2026-09-12',
    requiredDocuments: 'Original Offer Letter + NOC Application Form',
    actionRequired: 'Bring 1 hard copy of Offer Letter + NOC Request form to 7th Floor Staff Room or upload online via student portal.',
    coordinatorNotes: 'Strict deadline mandated by academic council. Late submissions cannot be regularized.',
    applyLink: '',
    studentsIncluded: [],
    isPinned: true,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'ann-3',
    type: 'COMPANY_REPLY',
    category: 'Company Reply',
    title: 'Zoho Corporation - Technical QA & Support Internship Response',
    content: 'Zoho campus relations team replied regarding the summer internship inquiry submitted for selected Computer Science candidates.',
    companyName: 'Zoho Corporation',
    companyLocation: 'Guduvanchery Campus, Chennai',
    companyContactEmail: 'campus.relations@zohocorp.com',
    requestSentDate: '2026-08-30',
    emailReference: 'VELS/CSE/2026/ZOHO-019',
    companyStatus: 'PENDING_STUDENT_ACTION',
    replyDate: '2026-09-07',
    department: 'B.Tech Computer Science & Engg',
    duration: '6 Months Full-Time',
    eligibility: 'Listed student candidates in university email',
    deadline: '2026-09-18',
    requiredDocuments: 'GitHub Profile Link, Updated Technical Resume',
    actionRequired: 'Listed students must fill out the assessment confirmation link sent to their institutional emails before Friday.',
    coordinatorNotes: 'Do not book coordinator appointments asking about the assessment link; test invitations are dispatched directly by Zoho recruiting team.',
    applyLink: 'https://www.zoho.com/careers',
    studentsIncluded: [
      {
        name: 'Manoj Kumar V',
        registerNumber: '23102204',
        department: 'B.Tech Computer Science & Engg',
        year: 'III Year',
        section: 'A',
        contact: '9789123450'
      },
      {
        name: 'Pooja Sundaram',
        registerNumber: '23102219',
        department: 'B.Tech Computer Science & Engg',
        year: 'III Year',
        section: 'B',
        contact: '9789123451'
      }
    ],
    isPinned: false,
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

