export type UserRole = 
  | 'super_admin'
  | 'school_admin'
  | 'principal'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant'
  | 'receptionist';

export interface Subscription {
  id?: string;
  plan: 'free_trial' | 'growth' | 'enterprise';
  status: 'active' | 'expired' | 'canceled';
  startDate: string;
  endDate: string;
  price: number;
}

export interface School {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
  };
  address: string;
  phone: string;
  email: string;
  subscription: Subscription;
  createdAt?: string;
}

export interface User {
  id: string;
  schoolId: string; // Tenant Isolation
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Student {
  id: string;
  schoolId: string;
  userId: string; // Link to user account
  admissionNumber: string;
  rollNumber: string;
  name: string;
  email: string;
  classId: string;
  sectionId: string;
  parentId?: string; // Link to Parent user/profile
  address: string;
  phone?: string;
  medicalRecords?: string;
  documents?: string[];
  createdAt?: string;
}

export interface Teacher {
  id: string;
  schoolId: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  qualification: string;
  department: string;
  experienceYears: number;
  salary: number;
  createdAt?: string;
}

export interface Parent {
  id: string;
  schoolId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  occupation?: string;
  childIds: string[]; // List of Student IDs
  createdAt?: string;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string; // e.g., "Grade 10"
  teacherId?: string; // Class Teacher
  subjectIds?: string[];
  createdAt?: string;
}

export interface Section {
  id: string;
  schoolId: string;
  classId: string;
  name: string; // e.g., "A", "B"
  roomLimit?: number;
  createdAt?: string;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  type: 'theory' | 'practical' | 'both';
  createdAt?: string;
}

export interface Attendance {
  id: string;
  schoolId: string;
  date: string; // YYYY-MM-DD
  targetType: 'student' | 'teacher';
  targetId: string; // studentId or teacherId
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface Exam {
  id: string;
  schoolId: string;
  name: string; // e.g., "Midterm 2026"
  classId: string;
  subjectId: string;
  maxMarks: number;
  date: string;
}

export interface Result {
  id: string;
  schoolId: string;
  examId: string;
  studentId: string;
  marksObtained: number;
  grade: string;
  gpa: number;
  remarks?: string;
}

export interface FeeCategory {
  id: string;
  schoolId: string;
  name: string; // e.g., "Tuition Fee", "Bus Fee", "Hostel Fee"
  amount: number;
  period: 'monthly' | 'term' | 'yearly' | 'one_time';
}

export interface Invoice {
  id: string;
  schoolId: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue';
  category: string;
  createdAt?: string;
}

export interface Payment {
  id: string;
  schoolId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
}

export interface Assignment {
  id: string;
  schoolId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  description: string;
  dueDate: string;
  fileUrl?: string;
  createdAt?: string;
}

export interface Submission {
  id: string;
  schoolId: string;
  assignmentId: string;
  studentId: string;
  submissionDate: string;
  fileUrl?: string;
  notes?: string;
  grade?: string;
  remarks?: string;
}

export interface LibraryBook {
  id: string;
  schoolId: string;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

export interface LibraryBorrow {
  id: string;
  schoolId: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'borrowed' | 'returned' | 'overdue';
}

export interface TransportVehicle {
  id: string;
  schoolId: string;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  route: string;
}

export interface HostelRoom {
  id: string;
  schoolId: string;
  roomNo: string;
  capacity: number;
  occupied: number;
  fee: number;
}

export interface InventoryItem {
  id: string;
  schoolId: string;
  name: string;
  category: string;
  quantity: number;
  status: 'in_stock' | 'low' | 'out_of_stock';
}

export interface Notice {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  targetRole: 'all' | 'teachers' | 'students' | 'parents';
  createdAt?: string;
}
