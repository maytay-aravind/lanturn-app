/**
 * Seed script — populates the Firestore EMULATOR with demo data.
 * Run with:  npm run seed   (after `firebase emulators:start`)
 *
 * Creates:
 *  - 1 admin user
 *  - 2 employers (with company profiles)
 *  - 3 students (with profiles)
 *  - several active jobs
 *  - a few applications + notifications
 */
import { db, FieldValue, auth } from '#firebase';
import { ROLES, USER_STATUS, JOB_STATUS, JOB_TYPE, EXPERIENCE_LEVEL } from '#config';

const DEMO = {
  admin: { uid: 'demo-admin', email: 'admin@lanturn.dev', displayName: 'Admin', role: ROLES.ADMIN },
  employers: [
    {
      uid: 'demo-emp-1', email: 'hr@acme.dev', displayName: 'Acme HR', role: ROLES.EMPLOYER,
      company: { companyName: 'Acme Technologies', industry: 'Software', description: 'We build developer tools.', location: { city: 'Bengaluru', state: 'Karnataka', country: 'India' }, hrContact: { name: 'Acme HR', email: 'hr@acme.dev' } },
    },
    {
      uid: 'demo-emp-2', email: 'careers@globex.dev', displayName: 'Globex HR', role: ROLES.EMPLOYER,
      company: { companyName: 'Globex Corp', industry: 'FinTech', description: 'FinTech for the next generation.', location: { city: 'Hyderabad', state: 'Telangana', country: 'India' }, hrContact: { name: 'Globex HR', email: 'careers@globex.dev' } },
    },
  ],
  students: [
    {
      uid: 'demo-stu-1', email: 'asha@lanturn.dev', displayName: 'Asha Rao', role: ROLES.STUDENT,
      profile: {
        personal: { name: 'Asha Rao', phone: '+9199999', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
        academic: { college: 'XYZ Institute', degree: 'B.E.', branch: 'CSE', graduationYear: 2026, cgpa: 8.7 },
        professional: { skills: ['react', 'node', 'firebase', 'typescript'], projects: [], experience: [], certifications: [] },
        social: { github: 'asha', linkedin: 'asha-rao' },
      },
    },
    {
      uid: 'demo-stu-2', email: 'rahul@lanturn.dev', displayName: 'Rahul Verma', role: ROLES.STUDENT,
      profile: {
        personal: { name: 'Rahul Verma', city: 'Pune', state: 'Maharashtra', country: 'India' },
        academic: { college: 'ABC College', degree: 'B.Tech', branch: 'IT', graduationYear: 2025, cgpa: 9.1 },
        professional: { skills: ['python', 'django', 'postgres'], projects: [], experience: [], certifications: [] },
      },
    },
    {
      uid: 'demo-stu-3', email: 'neha@lanturn.dev', displayName: 'Neha Singh', role: ROLES.STUDENT,
      profile: {
        personal: { name: 'Neha Singh', city: 'Delhi', country: 'India' },
        academic: { college: 'DEF University', degree: 'B.E.', branch: 'ECE', graduationYear: 2026, cgpa: 8.2 },
        professional: { skills: ['java', 'spring', 'aws'], projects: [], experience: [], certifications: [] },
      },
    },
  ],
};

const JOBS = [
  {
    jobId: 'job_demo_1', employerId: 'demo-emp-1', companyName: 'Acme Technologies',
    title: 'Frontend Engineer', jobType: JOB_TYPE.FULL_TIME, industry: 'Software', experienceLevel: EXPERIENCE_LEVEL.JUNIOR,
    description: 'Build delightful UIs with React and TypeScript.', requirements: ['2+ years React', 'Solid TS', 'Eye for UX'],
    requiredSkills: ['react', 'typescript', 'css'], location: { city: 'Bengaluru', country: 'India', remote: true },
    salary: { min: 800000, max: 1200000, currency: 'INR', period: 'yearly' }, openings: 2, status: JOB_STATUS.ACTIVE,
  },
  {
    jobId: 'job_demo_2', employerId: 'demo-emp-1', companyName: 'Acme Technologies',
    title: 'Backend Intern', jobType: JOB_TYPE.INTERNSHIP, industry: 'Software', experienceLevel: EXPERIENCE_LEVEL.ENTRY,
    description: 'Help build Node.js services.', requirements: ['Node.js basics', 'REST', 'Databases'],
    requiredSkills: ['node', 'express', 'sql'], location: { city: 'Bengaluru', country: 'India', remote: false },
    openings: 3, status: JOB_STATUS.ACTIVE,
  },
  {
    jobId: 'job_demo_3', employerId: 'demo-emp-2', companyName: 'Globex Corp',
    title: 'Full-Stack Developer', jobType: JOB_TYPE.FULL_TIME, industry: 'FinTech', experienceLevel: EXPERIENCE_LEVEL.MID,
    description: 'Own features end-to-end across React + Node.', requirements: ['3+ years full-stack', 'Cloud basics'],
    requiredSkills: ['react', 'node', 'aws'], location: { city: 'Hyderabad', country: 'India', remote: true },
    openings: 1, status: JOB_STATUS.ACTIVE,
  },
];

async function clearCollections() {
  const collections = ['users', 'students', 'employers', 'jobs', 'applications', 'notifications', 'chat_threads', 'chat_messages', 'analytics_events', 'platform_config'];
  for (const name of collections) {
    const snaps = await db.collection(name).get();
    const batch = db.batch();
    snaps.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  console.log('🧹 Cleared existing collections');
}

async function seedUsers() {
  const all = [DEMO.admin, ...DEMO.employers, ...DEMO.students];
  for (const u of all) {
    await db.collection('users').doc(u.uid).set({
      uid: u.uid, email: u.email, displayName: u.displayName, photoURL: '', authProvider: 'google.com',
      role: u.role, profileComplete: u.role !== ROLES.ADMIN, status: USER_STATUS.ACTIVE,
      createdAt: new Date(), updatedAt: new Date(),
    });

    // Create emulator Auth users so verifyIdToken works with dev tokens
    try {
      await auth.createUser({ uid: u.uid, email: u.email, displayName: u.displayName });
    } catch (e) {
      // ignore "already exists"
    }
  }
  console.log(`👥 Seeded ${all.length} users`);

  for (const e of DEMO.employers) {
    await db.collection('employers').doc(e.uid).set({
      uid: e.uid, ...e.company, verified: false, createdAt: new Date(), updatedAt: new Date(),
    });
  }

  for (const s of DEMO.students) {
    const skills = s.profile.professional.skills.map((x) => x.toLowerCase());
    await db.collection('students').doc(s.uid).set({
      uid: s.uid,
      ...s.profile,
      searchableSkills: skills,
      graduationYear: s.profile.academic.graduationYear,
      resumeText: 'Sample resume text for ' + s.profile.personal.name + '. Skills: ' + skills.join(', ') + '.',
      createdAt: new Date(), updatedAt: new Date(),
    });
  }
  console.log('🎓 Seeded employer + student profiles');
}

async function seedJobs() {
  for (const j of JOBS) {
    await db.collection('jobs').doc(j.jobId).set({
      ...j,
      requiredSkills: j.requiredSkills.map((s) => s.toLowerCase()),
      applicationCount: 0,
      createdAt: new Date(), updatedAt: new Date(),
    });
  }
  console.log(`💼 Seeded ${JOBS.length} jobs`);
}

async function seedApplications() {
  const apps = [
    { id: 'demo-stu-1_job_demo_1', studentId: 'demo-stu-1', jobId: 'job_demo_1', employerId: 'demo-emp-1', jobTitle: 'Frontend Engineer', studentName: 'Asha Rao', skillsSnapshot: ['react', 'typescript'], status: 'submitted' },
    { id: 'demo-stu-2_job_demo_2', studentId: 'demo-stu-2', jobId: 'job_demo_2', employerId: 'demo-emp-1', jobTitle: 'Backend Intern', studentName: 'Rahul Verma', skillsSnapshot: ['node'], status: 'shortlisted' },
    { id: 'demo-stu-3_job_demo_3', studentId: 'demo-stu-3', jobId: 'job_demo_3', employerId: 'demo-emp-2', jobTitle: 'Full-Stack Developer', studentName: 'Neha Singh', skillsSnapshot: ['java'], status: 'submitted' },
  ];
  for (const a of apps) {
    await db.collection('applications').doc(a.id).set({
      ...a,
      resumeUrl: '', coverLetter: '', resumeTextSnapshot: '',
      statusHistory: [{ status: a.status, at: new Date().toISOString() }],
      createdAt: new Date(), updatedAt: new Date(),
    });
  }
  console.log(`📨 Seeded ${apps.length} applications`);
}

async function seedNotifications() {
  const notifs = [
    { userId: 'demo-emp-1', type: 'application_received', title: 'New application', body: 'Asha Rao applied to "Frontend Engineer"', read: false, channel: 'inapp', createdAt: new Date() },
    { userId: 'demo-stu-2', type: 'application_status', title: 'Application update', body: 'Your application for "Backend Intern" was shortlisted', read: false, channel: 'both', emailStatus: 'sent', createdAt: new Date() },
  ];
  for (const n of notifs) {
    await db.collection('notifications').add(n);
  }
  console.log(`🔔 Seeded ${notifs.length} notifications`);
}

async function main() {
  console.log('🌱 Seeding LanTURN dev data into Firestore emulator...');
  await clearCollections();
  await seedUsers();
  await seedJobs();
  await seedApplications();
  await seedNotifications();
  console.log('✅ Seed complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
