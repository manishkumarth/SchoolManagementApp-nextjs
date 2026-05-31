import express from 'express';
import * as db from './db';

const router = express.Router();

// Middleware to parse body
router.use(express.json());

// ----------------------------------------------------
// 1. Auth & Registry Routines
// ----------------------------------------------------
router.post('/auth/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email requirement omitted.' });
    }

    // Check super admin matching context user or DB seeded email
    const allUsers = await db.getUsers();
    const matchedUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser) {
      return res.status(401).json({ error: 'Account not recognized. Please sign up or contact admin.' });
    }

    return res.json({ user: matchedUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Self-Onboard Wizard for Schools
router.post('/auth/register-school', async (req, res) => {
  try {
    const { schoolName, subdomain, email, name, address, phone } = req.body;
    if (!schoolName || !subdomain || !email || !name) {
      return res.status(400).json({ error: 'Missing mandatory onboarding fields.' });
    }

    // Register School
    const createdSchool = await db.saveSchool({
      name: schoolName,
      subdomain: subdomain.toLowerCase(),
      address: address || 'SaaS Onboarded Campus Area',
      phone: phone || '+1 (555) 700-1100',
      email: email,
      branding: {
        primaryColor: '#0ea5e9',
        secondaryColor: '#0f172a'
      },
      subscription: {
        plan: 'free_trial',
        status: 'active',
        startDate: new Date().toISOString().substring(0, 10),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 30 Day Trial
        price: 0
      },
      createdAt: new Date().toISOString()
    });

    // Create First School Owner User
    const ownerUser = await db.saveUser({
      schoolId: createdSchool.id,
      email: email.toLowerCase(),
      name: name,
      role: 'school_admin',
      isActive: true,
      phone: phone,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    });

    // Create 1 Default Class & Section so Setup Wizard succeeds cleanly
    const cl = await db.saveClass({
      schoolId: createdSchool.id,
      name: 'Primary Grade A',
      subjectIds: []
    });

    await db.saveSection({
      schoolId: createdSchool.id,
      classId: cl.id,
      name: 'Room 1',
      roomLimit: 25
    });

    return res.status(201).json({ school: createdSchool, user: ownerUser });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// 2. Super Admin SaaS Route Controls
// ----------------------------------------------------
router.get('/super/analytics', async (req, res) => {
  try {
    const schools = await db.getSchools();
    const users = await db.getUsers();

    const activeSchools = schools.filter(s => s.subscription.status === 'active');
    const totalRev = schools.reduce((accum, curr) => accum + (curr.subscription.status === 'active' ? curr.subscription.price : 0), 0);
    const plansCount = {
      free_trial: schools.filter(s => s.subscription.plan === 'free_trial').length,
      growth: schools.filter(s => s.subscription.plan === 'growth').length,
      enterprise: schools.filter(s => s.subscription.plan === 'enterprise').length
    };

    return res.json({
      totalSchools: schools.length,
      activeSubscriptions: activeSchools.length,
      monthlyRevenue: totalRev,
      schoolsList: schools,
      plansDistribution: plansCount,
      usersCount: users.length
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/super/invoice-payment', async (req, res) => {
  try {
    const { schoolId, plan } = req.body;
    const schools = await db.getSchools();
    const found = schools.find(s => s.id === schoolId);
    if (!found) return res.status(404).json({ error: 'School not recorded.' });

    const priceMap = { free_trial: 0, growth: 149, enterprise: 399 };
    const price = priceMap[plan as keyof typeof priceMap] || 0;

    found.subscription = {
      plan,
      status: 'active',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
      price
    };

    await db.saveSchool(found);
    return res.json({ message: 'Subscribed successfully', school: found });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// 3. School Tenant Config & Profile Branding
// ----------------------------------------------------
router.get('/schools/:id', async (req, res) => {
  try {
    const list = await db.getSchools();
    const found = list.find(s => s.id === req.params.id);
    if (!found) return res.status(404).json({ error: 'Campus data not found.' });
    return res.json(found);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/schools/:id/branding', async (req, res) => {
  try {
    const list = await db.getSchools();
    const found = list.find(s => s.id === req.params.id);
    if (!found) return res.status(404).json({ error: 'Campus data not found.' });

    const { primaryColor, secondaryColor, name, phone, address, logoUrl } = req.body;
    if (primaryColor) {
      found.branding = {
        primaryColor,
        secondaryColor: secondaryColor || '#0f172a'
      };
    }
    if (name) found.name = name;
    if (phone) found.phone = phone;
    if (address) found.address = address;
    if (logoUrl) found.logoUrl = logoUrl;

    const updated = await db.saveSchool(found);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// 4. Student Management Endpoints
// ----------------------------------------------------
router.get('/students', async (req, res) => {
  try {
    const { schoolId } = req.query;
    if (!schoolId) return res.status(400).json({ error: 'schoolId parameter requested.' });
    const students = await db.getStudents(schoolId as string);
    return res.json(students);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/students', async (req, res) => {
  try {
    const { schoolId, name, email, admissionNumber, rollNumber, classId, sectionId, address, medicalRecords } = req.body;
    if (!schoolId || !name || !email || !admissionNumber) {
      return res.status(400).json({ error: 'Missing mandatory student details.' });
    }

    // Auto-create companion User Account
    const createdUser = await db.saveUser({
      schoolId,
      email: email.toLowerCase(),
      name,
      role: 'student',
      isActive: true,
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`
    });

    const student = await db.saveStudent({
      schoolId,
      userId: createdUser.id,
      admissionNumber,
      rollNumber: rollNumber || '1',
      name,
      email: email.toLowerCase(),
      classId: classId || '',
      sectionId: sectionId || '',
      address: address || '',
      medicalRecords: medicalRecords || 'None logged.'
    });

    return res.status(201).json(student);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
    const { schoolId } = req.query;
    if (!schoolId) return res.status(400).json({ error: 'schoolId required.' });
    await db.deleteStudent(schoolId as string, req.params.id);
    return res.json({ success: true, message: 'Student removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// 5. Teacher Management Endpoints
// ----------------------------------------------------
router.get('/teachers', async (req, res) => {
  try {
    const { schoolId } = req.query;
    if (!schoolId) return res.status(400).json({ error: 'schoolId required.' });
    const teachers = await db.getTeachers(schoolId as string);
    return res.json(teachers);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/teachers', async (req, res) => {
  try {
    const { schoolId, name, email, qualification, department, experienceYears, salary, phone } = req.body;
    if (!schoolId || !name || !email) {
      return res.status(400).json({ error: 'Missing teacher parameters.' });
    }

    const createdUser = await db.saveUser({
      schoolId,
      email: email.toLowerCase(),
      name,
      role: 'teacher',
      isActive: true,
      phone,
      avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(name)}`
    });

    const teacher = await db.saveTeacher({
      schoolId,
      userId: createdUser.id,
      name,
      email: email.toLowerCase(),
      phone,
      qualification: qualification || 'B.Ed',
      department: department || 'General Studies',
      experienceYears: Number(experienceYears || 0),
      salary: Number(salary || 3000)
    });

    return res.status(201).json(teacher);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// 6. Academic Setup API (Classes, Sections, Subjects)
// ----------------------------------------------------
router.get('/classes', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const items = await db.getClasses((schoolId || '') as string);
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/classes', async (req, res) => {
  try {
    const created = await db.saveClass(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/sections', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const items = await db.getSections((schoolId || '') as string);
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/sections', async (req, res) => {
  try {
    const created = await db.saveSection(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/subjects', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const items = await db.getSubjects((schoolId || '') as string);
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/subjects', async (req, res) => {
  try {
    const created = await db.saveSubject(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// 7. Attendance Log API
// ----------------------------------------------------
router.get('/attendance', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const list = await db.getAttendance((schoolId || '') as string);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/attendance', async (req, res) => {
  try {
    const updated = await db.saveAttendance(req.body);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// 8. Exam Boards & Grading
// ----------------------------------------------------
router.get('/exams', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const list = await db.getExams((schoolId || '') as string);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/exams', async (req, res) => {
  try {
    const created = await db.saveExam(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/results', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const list = await db.getResults((schoolId || '') as string);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/results', async (req, res) => {
  try {
    const created = await db.saveResult(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// 9. Accounting Controllers (Invoices / Online Stripe Billing simulation)
// ----------------------------------------------------
router.get('/invoices', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const list = await db.getInvoices((schoolId || '') as string);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/invoices', async (req, res) => {
  try {
    const created = await db.saveInvoice(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Pay Invoice via Simulated Gateway
router.post('/invoices/:id/pay', async (req, res) => {
  try {
    const { schoolId, paymentMethod } = req.body;
    const list = await db.getInvoices(schoolId);
    const invoice = list.find(i => i.id === req.params.id);

    if (!invoice) return res.status(404).json({ error: 'Invoice not identified.' });
    if (invoice.status === 'paid') return res.status(400).json({ error: 'Invoice is already settled.' });

    invoice.status = 'paid';
    await db.saveInvoice(invoice);

    const payReceipt = await db.savePayment({
      schoolId,
      invoiceId: invoice.id,
      amount: invoice.amount,
      paymentMethod: paymentMethod || 'Client Portal Card Payment',
      transactionId: 'txn_' + Math.random().toString(36).substring(2,10).toUpperCase(),
      paymentDate: new Date().toISOString().substring(0, 10)
    });

    return res.json({ payment: payReceipt, invoice });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/payments', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const list = await db.getPayments((schoolId || '') as string);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


// ----------------------------------------------------
// 10. Operations (Assignments, Library, Hostel, Transport, Assets)
// ----------------------------------------------------
router.get('/assignments', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const list = await db.getAssignments((schoolId || '') as string);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/assignments', async (req, res) => {
  try {
    const created = await db.saveAssignment(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/library', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const list = await db.getLibraryBooks((schoolId || '') as string);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/library', async (req, res) => {
  try {
    const created = await db.saveLibraryBook(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/transport', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const list = await db.getTransportVehicles((schoolId || '') as string);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/transport', async (req, res) => {
  try {
    const created = await db.saveTransportVehicle(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/hostel', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const list = await db.getHostelRooms((schoolId || '') as string);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/hostel', async (req, res) => {
  try {
    const created = await db.saveHostelRoom(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/inventory', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const list = await db.getInventoryItems((schoolId || '') as string);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/inventory', async (req, res) => {
  try {
    const created = await db.saveInventoryItem(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/notices', async (req, res) => {
  try {
    const { schoolId } = req.query;
    const list = await db.getNotices((schoolId || '') as string);
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/notices', async (req, res) => {
  try {
    const created = await db.saveNotice(req.body);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
