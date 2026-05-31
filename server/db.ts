import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Import Types
import {
  School,
  User,
  Student,
  Teacher,
  Parent,
  Class,
  Section,
  Subject,
  Attendance,
  Exam,
  Result,
  FeeCategory,
  Invoice,
  Payment,
  Assignment,
  Submission,
  LibraryBook,
  LibraryBorrow,
  TransportVehicle,
  HostelRoom,
  InventoryItem,
  Notice
} from '../src/types';

// Connection State
let isMongoConnected = false;
const MONGODB_URI = process.env.MONGODB_URI || '';

// ----------------------------------------------------
// 1. Mongoose Schemas (Only loaded & initialized if MongoDB is available)
// ----------------------------------------------------
const SchoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true },
  logoUrl: String,
  branding: {
    primaryColor: String,
    secondaryColor: String
  },
  address: String,
  phone: String,
  email: String,
  subscription: {
    plan: String,
    status: String,
    startDate: String,
    endDate: String,
    price: Number
  },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const UserSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  phone: String,
  avatarUrl: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const StudentSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  userId: String,
  admissionNumber: { type: String, required: true, index: true },
  rollNumber: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  classId: String,
  sectionId: String,
  parentId: String,
  address: String,
  phone: String,
  medicalRecords: String,
  documents: [String],
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const TeacherSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  userId: String,
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  qualification: String,
  department: String,
  experienceYears: Number,
  salary: Number,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const ParentSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  userId: String,
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  occupation: String,
  childIds: [String],
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const ClassSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  teacherId: String,
  subjectIds: [String],
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const SectionSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  classId: String,
  name: String,
  roomLimit: Number,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const SubjectSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  name: String,
  code: String,
  type: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const AttendanceSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  targetType: String,
  targetId: { type: String, required: true, index: true },
  status: String,
  notes: String
});

const ExamSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  name: String,
  classId: String,
  subjectId: String,
  maxMarks: Number,
  date: String
});

const ResultSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  examId: String,
  studentId: { type: String, required: true, index: true },
  marksObtained: Number,
  grade: String,
  gpa: Number,
  remarks: String
});

const FeeCategorySchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  name: String,
  amount: Number,
  period: String
});

const InvoiceSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  amount: Number,
  dueDate: String,
  status: String,
  category: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const PaymentSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  invoiceId: String,
  amount: Number,
  paymentMethod: String,
  transactionId: String,
  paymentDate: String
});

const AssignmentSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  classId: String,
  sectionId: String,
  subjectId: String,
  teacherId: String,
  title: String,
  description: String,
  dueDate: String,
  fileUrl: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const LibraryBookSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  title: String,
  author: String,
  isbn: String,
  category: String,
  totalCopies: Number,
  availableCopies: Number
});

const TransportVehicleSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  vehicleNo: String,
  driverName: String,
  driverPhone: String,
  route: String
});

const HostelRoomSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  roomNo: String,
  capacity: Number,
  occupied: Number,
  fee: Number
});

const InventoryItemSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  name: String,
  category: String,
  quantity: Number,
  status: String
});

const NoticeSchema = new mongoose.Schema({
  schoolId: { type: String, required: true, index: true },
  title: String,
  content: String,
  targetRole: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

// Models mapping
let SchoolModel: any;
let UserModel: any;
let StudentModel: any;
let TeacherModel: any;
let ParentModel: any;
let ClassModel: any;
let SectionModel: any;
let SubjectModel: any;
let AttendanceModel: any;
let ExamModel: any;
let ResultModel: any;
let FeeCategoryModel: any;
let InvoiceModel: any;
let PaymentModel: any;
let AssignmentModel: any;
let LibraryBookModel: any;
let TransportVehicleModel: any;
let HostelRoomModel: any;
let InventoryItemModel: any;
let NoticeModel: any;

function initMongooseModels() {
  SchoolModel = mongoose.models.School || mongoose.model('School', SchoolSchema);
  UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
  StudentModel = mongoose.models.Student || mongoose.model('Student', StudentSchema);
  TeacherModel = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
  ParentModel = mongoose.models.Parent || mongoose.model('Parent', ParentSchema);
  ClassModel = mongoose.models.Class || mongoose.model('Class', ClassSchema);
  SectionModel = mongoose.models.Section || mongoose.model('Section', SectionSchema);
  SubjectModel = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
  AttendanceModel = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
  ExamModel = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
  ResultModel = mongoose.models.Result || mongoose.model('Result', ResultSchema);
  FeeCategoryModel = mongoose.models.FeeCategory || mongoose.model('FeeCategory', FeeCategorySchema);
  InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
  PaymentModel = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
  AssignmentModel = mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema);
  LibraryBookModel = mongoose.models.LibraryBook || mongoose.model('LibraryBook', LibraryBookSchema);
  TransportVehicleModel = mongoose.models.TransportVehicle || mongoose.model('TransportVehicle', TransportVehicleSchema);
  HostelRoomModel = mongoose.models.HostelRoom || mongoose.model('HostelRoom', HostelRoomSchema);
  InventoryItemModel = mongoose.models.InventoryItem || mongoose.model('InventoryItem', InventoryItemSchema);
  NoticeModel = mongoose.models.Notice || mongoose.model('Notice', NoticeSchema);
}

// Connect to MongoDB Atlas if connection URI is provided
if (MONGODB_URI && MONGODB_URI !== 'MY_MONGODB_URI' && !MONGODB_URI.includes('GEMINI')) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Successfully connected to MongoDB Atlas!');
      isMongoConnected = true;
      initMongooseModels();
    })
    .catch((err) => {
      console.error('MongoDB Atlas connection error, using local fallback:', err.message);
      isMongoConnected = false;
    });
} else {
  console.log('No MONGODB_URI in environment. Proceeding with robust disk JSON store fallback.');
}


// ----------------------------------------------------
// 2. Local JSON Database Structure
// ----------------------------------------------------
const DB_FILE_PATH = path.join(process.cwd(), 'db.json');

interface LocalDBData {
  schools: School[];
  users: User[];
  students: Student[];
  teachers: Teacher[];
  parents: Parent[];
  classes: Class[];
  sections: Section[];
  subjects: Subject[];
  attendance: Attendance[];
  exams: Exam[];
  results: Result[];
  feeCategories: FeeCategory[];
  invoices: Invoice[];
  payments: Payment[];
  assignments: Assignment[];
  libraryBooks: LibraryBook[];
  transportVehicles: TransportVehicle[];
  hostelRooms: HostelRoom[];
  inventoryItems: InventoryItem[];
  notices: Notice[];
}

// High Quality Initial Seeding Data
const initialDB: LocalDBData = {
  schools: [
    {
      id: 'sc_1',
      name: 'EduSphere Academy (Aero High)',
      subdomain: 'aero',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80',
      branding: {
        primaryColor: '#0ea5e9', // Sky blue
        secondaryColor: '#0f172a' // Slate dark
      },
      address: '77 Summit Ridge Boulevard, Tech Hills',
      phone: '+1 (555) 349-2041',
      email: 'admin@aero.edu.us',
      subscription: {
        plan: 'growth',
        status: 'active',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        price: 149
      },
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: 'sc_2',
      name: 'Horizon International School',
      subdomain: 'horizon',
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
      branding: {
        primaryColor: '#6366f1', // Indigo
        secondaryColor: '#1e1b4b' // deep purple
      },
      address: '102 Ocean View Terrace, Sector-5',
      phone: '+1 (555) 902-1249',
      email: 'contact@horizon.edu.org',
      subscription: {
        plan: 'enterprise',
        status: 'active',
        startDate: '2026-02-15',
        endDate: '2027-02-14',
        price: 399
      },
      createdAt: '2026-02-15T00:00:00Z'
    }
  ],
  users: [
    // Super Admin for SaaS Billing / Control Panel
    {
      id: 'usr_super',
      schoolId: 'system',
      email: 'manish12099@gmail.com', // Match context user email
      name: 'Manish Kumar (SaaS Admin)',
      role: 'super_admin',
      isActive: true,
      phone: '+1 (555) 000-0000',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T00:00:00Z'
    },
    // School 1 (Aero) Admin & Principal
    {
      id: 'usr_aero_admin',
      schoolId: 'sc_1',
      email: 'admin@aero.edu.us',
      name: 'Sarah Jenkins',
      role: 'school_admin',
      isActive: true,
      phone: '+1 (555) 349-2045',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-01-02T09:30:00Z'
    },
    {
      id: 'usr_aero_principal',
      schoolId: 'sc_1',
      email: 'principal@aero.edu.us',
      name: 'Dr. Arthur Vance',
      role: 'principal',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-01-02T09:45:00Z'
    },
    // School 1 Teachers
    {
      id: 'usr_aero_teacher1',
      schoolId: 'sc_1',
      email: 'robert.math@aero.edu.us',
      name: 'Robert Downey',
      role: 'teacher',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-01-03T10:00:00Z'
    },
    {
      id: 'usr_aero_teacher2',
      schoolId: 'sc_1',
      email: 'elena.science@aero.edu.us',
      name: 'Elena Rostova',
      role: 'teacher',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-01-03T11:20:00Z'
    },
    // School 1 Students & Parents
    {
      id: 'usr_aero_student1',
      schoolId: 'sc_1',
      email: 'leo.parker@aero.edu.us',
      name: 'Leo Parker',
      role: 'student',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T12:00:00Z'
    },
    {
      id: 'usr_aero_parent1',
      schoolId: 'sc_1',
      email: 'marcus.parker@gmail.com',
      name: 'Marcus Parker',
      role: 'parent',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T12:05:00Z'
    },
    // School 1 Accountant & Receptionist
    {
      id: 'usr_aero_acc',
      schoolId: 'sc_1',
      email: 'billing@aero.edu.us',
      name: 'Thomas Wayne',
      role: 'accountant',
      isActive: true,
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-01-05T08:30:00Z'
    },
    {
      id: 'usr_aero_rec',
      schoolId: 'sc_1',
      email: 'frontdesk@aero.edu.us',
      name: 'Melissa Stark',
      role: 'receptionist',
      isActive: true,
      createdAt: '2026-01-05T08:45:00Z'
    }
  ],
  students: [
    {
      id: 'st_1',
      schoolId: 'sc_1',
      userId: 'usr_aero_student1',
      admissionNumber: 'ADM-2026-001',
      rollNumber: '10',
      name: 'Leo Parker',
      email: 'leo.parker@aero.edu.us',
      classId: 'cl_10',
      sectionId: 'sec_10a',
      parentId: 'pa_1',
      address: '45 Bluebell Court, Valley Way',
      phone: '+1 (555) 728-1191',
      medicalRecords: 'No allergies. Fully vaccinated.',
      documents: ['Admission_Receipt.pdf', 'Birth_Certificate.pdf'],
      createdAt: '2026-01-10T12:00:00Z'
    }
  ],
  teachers: [
    {
      id: 'tc_1',
      schoolId: 'sc_1',
      userId: 'usr_aero_teacher1',
      name: 'Robert Downey',
      email: 'robert.math@aero.edu.us',
      phone: '+1 (555) 883-2001',
      qualification: 'M.Sc. in Mathematics, Stanford',
      department: 'Science & Mathematics',
      experienceYears: 12,
      salary: 5800,
      createdAt: '2026-01-03T10:00:00Z'
    },
    {
      id: 'tc_2',
      schoolId: 'sc_1',
      userId: 'usr_aero_teacher2',
      name: 'Elena Rostova',
      email: 'elena.science@aero.edu.us',
      phone: '+1 (555) 883-4902',
      qualification: 'Ph.D in Biology, MIT',
      department: 'Science & Mathematics',
      experienceYears: 8,
      salary: 6200,
      createdAt: '2026-01-03T11:20:00Z'
    }
  ],
  parents: [
    {
      id: 'pa_1',
      schoolId: 'sc_1',
      userId: 'usr_aero_parent1',
      name: 'Marcus Parker',
      email: 'marcus.parker@gmail.com',
      phone: '+1 (555) 728-1190',
      occupation: 'Senior Architecture Lead',
      childIds: ['st_1'],
      createdAt: '2026-01-10T12:05:00Z'
    }
  ],
  classes: [
    {
      id: 'cl_10',
      schoolId: 'sc_1',
      name: 'Grade 10',
      teacherId: 'tc_1',
      subjectIds: ['sub_math', 'sub_sci'],
      createdAt: '2026-01-02T00:00:00Z'
    },
    {
      id: 'cl_9',
      schoolId: 'sc_1',
      name: 'Grade 9',
      teacherId: 'tc_2',
      subjectIds: ['sub_math', 'sub_sci', 'sub_eng'],
      createdAt: '2026-01-02T00:00:00Z'
    }
  ],
  sections: [
    {
      id: 'sec_10a',
      schoolId: 'sc_1',
      classId: 'cl_10',
      name: 'A',
      roomLimit: 30,
      createdAt: '2026-01-02T00:00:00Z'
    },
    {
      id: 'sec_9b',
      schoolId: 'sc_1',
      classId: 'cl_9',
      name: 'B',
      roomLimit: 25,
      createdAt: '2026-01-02T00:00:00Z'
    }
  ],
  subjects: [
    {
      id: 'sub_math',
      schoolId: 'sc_1',
      name: 'Calculus and Algebra III',
      code: 'M-101',
      type: 'theory',
      createdAt: '2026-01-02T00:00:00Z'
    },
    {
      id: 'sub_sci',
      schoolId: 'sc_1',
      name: 'Biochemistry Practical Labs',
      code: 'S-202',
      type: 'both',
      createdAt: '2026-01-02T00:00:00Z'
    },
    {
      id: 'sub_eng',
      schoolId: 'sc_1',
      name: 'English Literature',
      code: 'E-303',
      type: 'theory',
      createdAt: '2026-01-02T00:00:00Z'
    }
  ],
  attendance: [
    { id: 'att_1', schoolId: 'sc_1', date: '2026-05-28', targetType: 'student', targetId: 'st_1', status: 'present', notes: 'Arrived on time' },
    { id: 'att_2', schoolId: 'sc_1', date: '2026-05-29', targetType: 'student', targetId: 'st_1', status: 'present' },
    { id: 'att_3', schoolId: 'sc_1', date: '2026-05-30', targetType: 'student', targetId: 'st_1', status: 'late', notes: 'Car breakdown' },
    { id: 'att_4', schoolId: 'sc_1', date: '2026-05-31', targetType: 'student', targetId: 'st_1', status: 'present' },
    // Teacher Attendance
    { id: 'att_t1', schoolId: 'sc_1', date: '2026-05-31', targetType: 'teacher', targetId: 'tc_1', status: 'present' },
    { id: 'att_t2', schoolId: 'sc_1', date: '2026-05-31', targetType: 'teacher', targetId: 'tc_2', status: 'present' }
  ],
  exams: [
    { id: 'ex_1', schoolId: 'sc_1', name: 'Spring Semester Midterms', classId: 'cl_10', subjectId: 'sub_math', maxMarks: 100, date: '2026-04-12' },
    { id: 'ex_2', schoolId: 'sc_1', name: 'Spring Semester Midterms', classId: 'cl_10', subjectId: 'sub_sci', maxMarks: 100, date: '2026-04-14' }
  ],
  results: [
    { id: 'res_1', schoolId: 'sc_1', examId: 'ex_1', studentId: 'st_1', marksObtained: 94, grade: 'A', gpa: 4.0, remarks: 'Outstanding analytical skills.' },
    { id: 'res_2', schoolId: 'sc_1', examId: 'ex_2', studentId: 'st_1', marksObtained: 88, grade: 'B+', gpa: 3.5, remarks: 'Very good in lab experiments.' }
  ],
  feeCategories: [
    { id: 'fc_1', schoolId: 'sc_1', name: 'Tuition Fee (Q2)', amount: 1200, period: 'term' },
    { id: 'fc_2', schoolId: 'sc_1', name: 'School Bus Commuting', amount: 350, period: 'monthly' }
  ],
  invoices: [
    { id: 'inv_1', schoolId: 'sc_1', studentId: 'st_1', amount: 1200, dueDate: '2026-05-15', status: 'paid', category: 'Tuition Fee (Q2)', createdAt: '2026-04-15' },
    { id: 'inv_2', schoolId: 'sc_1', studentId: 'st_1', amount: 350, dueDate: '2026-06-05', status: 'unpaid', category: 'School Bus Commuting', createdAt: '2026-05-05' }
  ],
  payments: [
    { id: 'pay_1', schoolId: 'sc_1', invoiceId: 'inv_1', amount: 1200, paymentMethod: 'Stripe Credit Card', transactionId: 'txn_ST8829910E', paymentDate: '2026-05-10' }
  ],
  assignments: [
    {
      id: 'as_1',
      schoolId: 'sc_1',
      classId: 'cl_10',
      sectionId: 'sec_10a',
      subjectId: 'sub_math',
      teacherId: 'tc_1',
      title: 'Polynomial Functions and Graphing',
      description: 'Solve questions 1 through 15 on Chapter 4. Plot curves manually on coordinate papers for question 8.',
      dueDate: '2026-06-03',
      createdAt: '2026-05-28T09:00:00Z'
    }
  ],
  libraryBooks: [
    { id: 'bk_1', schoolId: 'sc_1', title: 'Introduction to Advanced Quantum Calculus', author: 'Dr. Leonard Susskind', category: 'Mathematics', totalCopies: 5, availableCopies: 4 },
    { id: 'bk_2', schoolId: 'sc_1', title: 'Molecular Biology of the Cell', author: 'Bruce Alberts', category: 'Science', totalCopies: 10, availableCopies: 10 }
  ],
  transportVehicles: [
    { id: 'vh_1', schoolId: 'sc_1', vehicleNo: 'BUS-108A', driverName: 'Richard Harris', driverPhone: '+1 (555) 781-9921', route: 'North-West Valley Circuit' }
  ],
  hostelRooms: [
    { id: 'rm_101', schoolId: 'sc_1', roomNo: 'A-101', capacity: 4, occupied: 2, fee: 400 }
  ],
  inventoryItems: [
    { id: 'itm_1', schoolId: 'sc_1', name: 'Digital Projectors (Sony 4K)', category: 'AV Equipment', quantity: 18, status: 'in_stock' }
  ],
  notices: [
    {
      id: 'nt_1',
      schoolId: 'sc_1',
      title: 'Annual Science Fair & Exhibition 2026',
      content: 'All class projects must be submitted to coordinators Elena Rostova/Arthur Vance by June 12th. Interactive visual units are highly encouraged.',
      targetRole: 'all',
      createdAt: '2026-05-25T14:00:00Z'
    }
  ]
};

// ----------------------------------------------------
// DB Reader & Writer (Fallback Engine)
// ----------------------------------------------------
export function readLocalDB(): LocalDBData {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      writeLocalDB(initialDB);
      return initialDB;
    }
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('CRITICAL: DB Read error resetting database to initial values:', error);
    return initialDB;
  }
}

export function writeLocalDB(data: LocalDBData) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('DB Write error:', e);
  }
}

// ----------------------------------------------------
// Unified API Methods (Mongoose Mongo / JSON robust fallback)
// ----------------------------------------------------
export async function getSchools(): Promise<School[]> {
  if (isMongoConnected) {
    const list = await SchoolModel.find().lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  }
  return readLocalDB().schools;
}

export async function saveSchool(school: Omit<School, 'id'> & { id?: string }): Promise<School> {
  const currentId = school.id || 'sc_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (school.id) {
      result = await SchoolModel.findByIdAndUpdate(school.id, { ...school }, { new: true }).lean();
    } else {
      result = await SchoolModel.create({ ...school }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.schools.findIndex(s => s.id === school.id);
    const newSchool: School = {
      ...school,
      id: currentId,
      createdAt: school.createdAt || new Date().toISOString()
    } as School;

    if (existingIdx >= 0) {
      db.schools[existingIdx] = newSchool;
    } else {
      db.schools.push(newSchool);
    }
    writeLocalDB(db);
    return newSchool;
  }
}

export async function getUsers(schoolId?: string): Promise<User[]> {
  if (isMongoConnected) {
    const query = schoolId ? { schoolId } : {};
    const list = await UserModel.find(query).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    const db = readLocalDB();
    if (schoolId) {
      return db.users.filter(u => u.schoolId === schoolId || u.role === 'super_admin');
    }
    return db.users;
  }
}

export async function saveUser(user: Omit<User, 'id'> & { id?: string }): Promise<User> {
  const currentId = user.id || 'usr_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (user.id) {
      result = await UserModel.findByIdAndUpdate(user.id, { ...user }, { new: true }).lean();
    } else {
      result = await UserModel.create({ ...user }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.users.findIndex(u => u.id === user.id);
    const newUser: User = {
      ...user,
      id: currentId,
      createdAt: user.createdAt || new Date().toISOString()
    } as User;

    if (existingIdx >= 0) {
      db.users[existingIdx] = newUser;
    } else {
      db.users.push(newUser);
    }
    writeLocalDB(db);
    return newUser;
  }
}

export async function getStudents(schoolId: string): Promise<Student[]> {
  if (isMongoConnected) {
    const list = await StudentModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().students.filter(s => s.schoolId === schoolId);
  }
}

export async function saveStudent(student: Omit<Student, 'id'> & { id?: string }): Promise<Student> {
  const currentId = student.id || 'st_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (student.id) {
      result = await StudentModel.findByIdAndUpdate(student.id, { ...student }, { new: true }).lean();
    } else {
      result = await StudentModel.create({ ...student }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.students.findIndex(s => s.id === student.id);
    const newStudent: Student = {
      ...student,
      id: currentId,
      createdAt: student.createdAt || new Date().toISOString()
    } as Student;

    if (existingIdx >= 0) {
      db.students[existingIdx] = newStudent;
    } else {
      db.students.push(newStudent);
    }
    writeLocalDB(db);
    return newStudent;
  }
}

export async function deleteStudent(schoolId: string, id: string): Promise<boolean> {
  if (isMongoConnected) {
    await StudentModel.deleteOne({ _id: id, schoolId });
    return true;
  } else {
    const db = readLocalDB();
    db.students = db.students.filter(s => !(s.id === id && s.schoolId === schoolId));
    writeLocalDB(db);
    return true;
  }
}

export async function getTeachers(schoolId: string): Promise<Teacher[]> {
  if (isMongoConnected) {
    const list = await TeacherModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().teachers.filter(t => t.schoolId === schoolId);
  }
}

export async function saveTeacher(teacher: Omit<Teacher, 'id'> & { id?: string }): Promise<Teacher> {
  const currentId = teacher.id || 'tc_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (teacher.id) {
      result = await TeacherModel.findByIdAndUpdate(teacher.id, { ...teacher }, { new: true }).lean();
    } else {
      result = await TeacherModel.create({ ...teacher }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.teachers.findIndex(t => t.id === teacher.id);
    const newTeacher: Teacher = {
      ...teacher,
      id: currentId,
      createdAt: teacher.createdAt || new Date().toISOString()
    } as Teacher;

    if (existingIdx >= 0) {
      db.teachers[existingIdx] = newTeacher;
    } else {
      db.teachers.push(newTeacher);
    }
    writeLocalDB(db);
    return newTeacher;
  }
}

export async function getClasses(schoolId: string): Promise<Class[]> {
  if (isMongoConnected) {
    const list = await ClassModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().classes.filter(c => c.schoolId === schoolId);
  }
}

export async function saveClass(cls: Omit<Class, 'id'> & { id?: string }): Promise<Class> {
  const currentId = cls.id || 'cl_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (cls.id) {
      result = await ClassModel.findByIdAndUpdate(cls.id, { ...cls }, { new: true }).lean();
    } else {
      result = await ClassModel.create({ ...cls }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.classes.findIndex(c => c.id === cls.id);
    const newClass: Class = {
      ...cls,
      id: currentId,
      createdAt: cls.createdAt || new Date().toISOString()
    } as Class;

    if (existingIdx >= 0) {
      db.classes[existingIdx] = newClass;
    } else {
      db.classes.push(newClass);
    }
    writeLocalDB(db);
    return newClass;
  }
}

export async function getSections(schoolId: string): Promise<Section[]> {
  if (isMongoConnected) {
    const list = await SectionModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().sections.filter(s => s.schoolId === schoolId);
  }
}

export async function saveSection(sec: Omit<Section, 'id'> & { id?: string }): Promise<Section> {
  const currentId = sec.id || 'sec_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (sec.id) {
      result = await SectionModel.findByIdAndUpdate(sec.id, { ...sec }, { new: true }).lean();
    } else {
      result = await SectionModel.create({ ...sec }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.sections.findIndex(s => s.id === sec.id);
    const newSec: Section = {
      ...sec,
      id: currentId,
      createdAt: sec.createdAt || new Date().toISOString()
    } as Section;

    if (existingIdx >= 0) {
      db.sections[existingIdx] = newSec;
    } else {
      db.sections.push(newSec);
    }
    writeLocalDB(db);
    return newSec;
  }
}

export async function getSubjects(schoolId: string): Promise<Subject[]> {
  if (isMongoConnected) {
    const list = await SubjectModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().subjects.filter(s => s.schoolId === schoolId);
  }
}

export async function saveSubject(sub: Omit<Subject, 'id'> & { id?: string }): Promise<Subject> {
  const currentId = sub.id || 'sub_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (sub.id) {
      result = await SubjectModel.findByIdAndUpdate(sub.id, { ...sub }, { new: true }).lean();
    } else {
      result = await SubjectModel.create({ ...sub }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.subjects.findIndex(s => s.id === sub.id);
    const newSub: Subject = {
      ...sub,
      id: currentId,
      createdAt: sub.createdAt || new Date().toISOString()
    } as Subject;

    if (existingIdx >= 0) {
      db.subjects[existingIdx] = newSub;
    } else {
      db.subjects.push(newSub);
    }
    writeLocalDB(db);
    return newSub;
  }
}

export async function getAttendance(schoolId: string): Promise<Attendance[]> {
  if (isMongoConnected) {
    const list = await AttendanceModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().attendance.filter(a => a.schoolId === schoolId);
  }
}

export async function saveAttendance(att: Omit<Attendance, 'id'> & { id?: string }): Promise<Attendance> {
  const currentId = att.id || 'att_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (att.id) {
      result = await AttendanceModel.findByIdAndUpdate(att.id, { ...att }, { new: true }).lean();
    } else {
      result = await AttendanceModel.create({ ...att }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.attendance.findIndex(a => a.id === att.id);
    const newAtt: Attendance = {
      ...att,
      id: currentId
    } as Attendance;

    if (existingIdx >= 0) {
      db.attendance[existingIdx] = newAtt;
    } else {
      db.attendance.push(newAtt);
    }
    writeLocalDB(db);
    return newAtt;
  }
}

export async function getExams(schoolId: string): Promise<Exam[]> {
  if (isMongoConnected) {
    const list = await ExamModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().exams.filter(e => e.schoolId === schoolId);
  }
}

export async function saveExam(exam: Omit<Exam, 'id'> & { id?: string }): Promise<Exam> {
  const currentId = exam.id || 'ex_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (exam.id) {
      result = await ExamModel.findByIdAndUpdate(exam.id, { ...exam }, { new: true }).lean();
    } else {
      result = await ExamModel.create({ ...exam }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.exams.findIndex(e => e.id === exam.id);
    const newExam: Exam = {
      ...exam,
      id: currentId
    } as Exam;

    if (existingIdx >= 0) {
      db.exams[existingIdx] = newExam;
    } else {
      db.exams.push(newExam);
    }
    writeLocalDB(db);
    return newExam;
  }
}

export async function getResults(schoolId: string): Promise<Result[]> {
  if (isMongoConnected) {
    const list = await ResultModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().results.filter(r => r.schoolId === schoolId);
  }
}

export async function saveResult(res: Omit<Result, 'id'> & { id?: string }): Promise<Result> {
  const currentId = res.id || 'res_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (res.id) {
      result = await ResultModel.findByIdAndUpdate(res.id, { ...res }, { new: true }).lean();
    } else {
      result = await ResultModel.create({ ...res }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.results.findIndex(r => r.id === res.id);
    const newRes: Result = {
      ...res,
      id: currentId
    } as Result;

    if (existingIdx >= 0) {
      db.results[existingIdx] = newRes;
    } else {
      db.results.push(newRes);
    }
    writeLocalDB(db);
    return newRes;
  }
}

export async function getInvoices(schoolId: string): Promise<Invoice[]> {
  if (isMongoConnected) {
    const list = await InvoiceModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().invoices.filter(i => i.schoolId === schoolId);
  }
}

export async function saveInvoice(inv: Omit<Invoice, 'id'> & { id?: string }): Promise<Invoice> {
  const currentId = inv.id || 'inv_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (inv.id) {
      result = await InvoiceModel.findByIdAndUpdate(inv.id, { ...inv }, { new: true }).lean();
    } else {
      result = await InvoiceModel.create({ ...inv }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.invoices.findIndex(i => i.id === inv.id);
    const newInv: Invoice = {
      ...inv,
      id: currentId,
      createdAt: inv.createdAt || new Date().toISOString()
    } as Invoice;

    if (existingIdx >= 0) {
      db.invoices[existingIdx] = newInv;
    } else {
      db.invoices.push(newInv);
    }
    writeLocalDB(db);
    return newInv;
  }
}

export async function getPayments(schoolId: string): Promise<Payment[]> {
  if (isMongoConnected) {
    const list = await PaymentModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().payments.filter(p => p.schoolId === schoolId);
  }
}

export async function savePayment(pay: Omit<Payment, 'id'> & { id?: string }): Promise<Payment> {
  const currentId = pay.id || 'pay_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (pay.id) {
      result = await PaymentModel.findByIdAndUpdate(pay.id, { ...pay }, { new: true }).lean();
    } else {
      result = await PaymentModel.create({ ...pay }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.payments.findIndex(p => p.id === pay.id);
    const newPay: Payment = {
      ...pay,
      id: currentId
    } as Payment;

    if (existingIdx >= 0) {
      db.payments[existingIdx] = newPay;
    } else {
      db.payments.push(newPay);
    }
    writeLocalDB(db);
    return newPay;
  }
}

export async function getAssignments(schoolId: string): Promise<Assignment[]> {
  if (isMongoConnected) {
    const list = await AssignmentModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().assignments.filter(a => a.schoolId === schoolId);
  }
}

export async function saveAssignment(as: Omit<Assignment, 'id'> & { id?: string }): Promise<Assignment> {
  const currentId = as.id || 'as_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (as.id) {
      result = await AssignmentModel.findByIdAndUpdate(as.id, { ...as }, { new: true }).lean();
    } else {
      result = await AssignmentModel.create({ ...as }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.assignments.findIndex(a => a.id === as.id);
    const newAs: Assignment = {
      ...as,
      id: currentId,
      createdAt: as.createdAt || new Date().toISOString()
    } as Assignment;

    if (existingIdx >= 0) {
      db.assignments[existingIdx] = newAs;
    } else {
      db.assignments.push(newAs);
    }
    writeLocalDB(db);
    return newAs;
  }
}

export async function getLibraryBooks(schoolId: string): Promise<LibraryBook[]> {
  if (isMongoConnected) {
    const list = await LibraryBookModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().libraryBooks.filter(b => b.schoolId === schoolId);
  }
}

export async function saveLibraryBook(book: Omit<LibraryBook, 'id'> & { id?: string }): Promise<LibraryBook> {
  const currentId = book.id || 'bk_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (book.id) {
      result = await LibraryBookModel.findByIdAndUpdate(book.id, { ...book }, { new: true }).lean();
    } else {
      result = await LibraryBookModel.create({ ...book }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.libraryBooks.findIndex(b => b.id === book.id);
    const newBook: LibraryBook = {
      ...book,
      id: currentId
    } as LibraryBook;

    if (existingIdx >= 0) {
      db.libraryBooks[existingIdx] = newBook;
    } else {
      db.libraryBooks.push(newBook);
    }
    writeLocalDB(db);
    return newBook;
  }
}

export async function getTransportVehicles(schoolId: string): Promise<TransportVehicle[]> {
  if (isMongoConnected) {
    const list = await TransportVehicleModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().transportVehicles.filter(v => v.schoolId === schoolId);
  }
}

export async function saveTransportVehicle(v: Omit<TransportVehicle, 'id'> & { id?: string }): Promise<TransportVehicle> {
  const currentId = v.id || 'vh_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (v.id) {
      result = await TransportVehicleModel.findByIdAndUpdate(v.id, { ...v }, { new: true }).lean();
    } else {
      result = await TransportVehicleModel.create({ ...v }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.transportVehicles.findIndex(item => item.id === v.id);
    const newV: TransportVehicle = {
      ...v,
      id: currentId
    } as TransportVehicle;

    if (existingIdx >= 0) {
      db.transportVehicles[existingIdx] = newV;
    } else {
      db.transportVehicles.push(newV);
    }
    writeLocalDB(db);
    return newV;
  }
}

export async function getHostelRooms(schoolId: string): Promise<HostelRoom[]> {
  if (isMongoConnected) {
    const list = await HostelRoomModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().hostelRooms.filter(r => r.schoolId === schoolId);
  }
}

export async function saveHostelRoom(r: Omit<HostelRoom, 'id'> & { id?: string }): Promise<HostelRoom> {
  const currentId = r.id || 'rm_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (r.id) {
      result = await HostelRoomModel.findByIdAndUpdate(r.id, { ...r }, { new: true }).lean();
    } else {
      result = await HostelRoomModel.create({ ...r }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.hostelRooms.findIndex(item => item.id === r.id);
    const newR: HostelRoom = {
      ...r,
      id: currentId
    } as HostelRoom;

    if (existingIdx >= 0) {
      db.hostelRooms[existingIdx] = newR;
    } else {
      db.hostelRooms.push(newR);
    }
    writeLocalDB(db);
    return newR;
  }
}

export async function getInventoryItems(schoolId: string): Promise<InventoryItem[]> {
  if (isMongoConnected) {
    const list = await InventoryItemModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().inventoryItems.filter(i => i.schoolId === schoolId);
  }
}

export async function saveInventoryItem(item: Omit<InventoryItem, 'id'> & { id?: string }): Promise<InventoryItem> {
  const currentId = item.id || 'itm_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (item.id) {
      result = await InventoryItemModel.findByIdAndUpdate(item.id, { ...item }, { new: true }).lean();
    } else {
      result = await InventoryItemModel.create({ ...item }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.inventoryItems.findIndex(i => i.id === item.id);
    const newI: InventoryItem = {
      ...item,
      id: currentId
    } as InventoryItem;

    if (existingIdx >= 0) {
      db.inventoryItems[existingIdx] = newI;
    } else {
      db.inventoryItems.push(newI);
    }
    writeLocalDB(db);
    return newI;
  }
}

export async function getNotices(schoolId: string): Promise<Notice[]> {
  if (isMongoConnected) {
    const list = await NoticeModel.find({ schoolId }).lean();
    return list.map((item: any) => ({ ...item, id: item._id.toString() }));
  } else {
    return readLocalDB().notices.filter(n => n.schoolId === schoolId);
  }
}

export async function saveNotice(notice: Omit<Notice, 'id'> & { id?: string }): Promise<Notice> {
  const currentId = notice.id || 'nt_' + Date.now();
  if (isMongoConnected) {
    let result;
    if (notice.id) {
      result = await NoticeModel.findByIdAndUpdate(notice.id, { ...notice }, { new: true }).lean();
    } else {
      result = await NoticeModel.create({ ...notice }).then((doc: any) => doc.toObject());
    }
    return { ...result, id: result._id.toString() };
  } else {
    const db = readLocalDB();
    const existingIdx = db.notices.findIndex(n => n.id === notice.id);
    const newNotice: Notice = {
      ...notice,
      id: currentId,
      createdAt: notice.createdAt || new Date().toISOString()
    } as Notice;

    if (existingIdx >= 0) {
      db.notices[existingIdx] = newNotice;
    } else {
      db.notices.push(newNotice);
    }
    writeLocalDB(db);
    return newNotice;
  }
}
