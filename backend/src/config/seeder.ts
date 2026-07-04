import bcrypt from 'bcryptjs';
import User from '../models/User';
import Room from '../models/Room';
import Facility from '../models/Facility';
import HostelInfo from '../models/HostelInfo';
import Announcement from '../models/Announcement';
import Fee from '../models/Fee';

export const seedData = async () => {
  try {
    console.log('[SEEDER] Starting database seeding process...');

    // 1. Clear existing collections
    console.log('[SEEDER] Clearing existing collections...');
    await User.deleteMany({});
    await Room.deleteMany({});
    await Facility.deleteMany({});
    await HostelInfo.deleteMany({});
    await Announcement.deleteMany({});
    await Fee.deleteMany({});
    console.log('[SEEDER] Collections cleared.');

    // 2. Hash default passwords
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const studentPasswordHash = await bcrypt.hash('student123', salt);

    // 3. Create Admin User
    console.log('[SEEDER] Creating Warden Admin account...');
    const admin = await User.create({
      name: 'Warden M Noor Wazir',
      email: 'admin@kpyouth.com',
      password: adminPasswordHash,
      role: 'Admin',
      status: 'Active',
      phone: '+92-300-1234567',
      feeStatus: 'Paid'
    });
    console.log('[SEEDER] Admin user created: admin@kpyouth.com / admin123');

    // 4. Create Rooms
    console.log('[SEEDER] Seeding hostel rooms...');
    const roomsData = [
      { roomNumber: '101', floor: 1, capacity: 4, monthlyFee: 9500, status: 'Available' },
      { roomNumber: '102', floor: 1, capacity: 4, monthlyFee: 9500, status: 'Available' },
      { roomNumber: '201', floor: 2, capacity: 2, monthlyFee: 14000, status: 'Available' },
      { roomNumber: '202', floor: 2, capacity: 2, monthlyFee: 14000, status: 'Available' },
      { roomNumber: '301', floor: 3, capacity: 1, monthlyFee: 18000, status: 'Available' }
    ];

    const seededRooms = await Room.insertMany(roomsData);
    console.log(`[SEEDER] Seeded ${seededRooms.length} rooms.`);

    // 5. Create default Student
    console.log('[SEEDER] Creating sample student account...');
    const student = await User.create({
      name: 'Shahid Afridi',
      email: 'student@kpyouth.com',
      password: studentPasswordHash,
      role: 'Student',
      status: 'Active',
      fatherName: 'Sahibzada Afridi',
      cnic: '17301-1234567-9',
      phone: '+92-301-1234567',
      emergencyContact: '+92-302-7654321',
      university: 'University of Peshawar',
      department: 'Computer Science',
      semester: '6th',
      roomNumber: '101',
      admissionDate: new Date('2025-09-01'),
      feeStatus: 'Pending',
      notes: 'Outstanding cricket player'
    });

    // Assign student to room 101
    const room101 = await Room.findOne({ roomNumber: '101' });
    if (room101) {
      room101.residents.push(student._id as any);
      await room101.save();
      console.log('[SEEDER] Assigned student Shahid Afridi to Room 101.');
    }
    console.log('[SEEDER] Student created: student@kpyouth.com / student123');

    // 6. Create Facilities
    console.log('[SEEDER] Seeding facilities...');
    const facilitiesData = [
      { name: 'High Speed WiFi', description: '24/7 uninterrupted fiber internet connection across all rooms and common areas.', icon: 'Wifi', displayOrder: 1 },
      { name: 'Electricity Backup', description: 'Heavy generators and UPS modules installed to handle load-shedding events.', icon: 'Zap', displayOrder: 2 },
      { name: 'CCTV & Security', description: '24/7 active CCTV recording and professional security guards at gates.', icon: 'Shield', displayOrder: 3 },
      { name: 'Dining Hall & Mess', description: 'Hygiene-certified kitchen serving three healthy meals daily to residents.', icon: 'Utensils', displayOrder: 4 },
      { name: 'Laundry Services', description: 'In-house washing machines and ironing services available twice a week.', icon: 'RefreshCw', displayOrder: 5 },
      { name: 'Air Conditioned Library', description: 'Quiet study environment open 24/7 with academic journals and study desks.', icon: 'BookOpen', displayOrder: 6 },
      { name: 'Prayer Area', description: 'Spacious, clean mosque facility inside the hostel building for daily prayers.', icon: 'Heart', displayOrder: 7 },
      { name: 'Water Filtration', description: 'Commercial RO water filtration plants installed on every floor.', icon: 'Droplet', displayOrder: 8 },
      { name: 'Parking Area', description: 'Safe parking spaces for bikes and cars with security surveillance.', icon: 'Car', displayOrder: 9 }
    ];

    const seededFacilities = await Facility.insertMany(facilitiesData);
    console.log(`[SEEDER] Seeded ${seededFacilities.length} facilities.`);

    // 7. Create HostelInfo
    console.log('[SEEDER] Seeding general hostel info...');
    await HostelInfo.create({
      description: 'KP Youth University Hostel Peshawar is a premier boarding facility providing high-quality, secure, and academic-friendly accommodation to students and young professionals. Located on University Road Peshawar near Zoo Street, it is adjacent to top universities.',
      mission: 'To digitalize residential operations and offer a premium, hygienic, and secure boarding environment that supports students in achieving academic excellence.',
      vision: 'To build a state-of-the-art model for youth accommodation that resolves student lodging constraints through advanced features, green energy, and technology.',
      history: 'Founded in 2020 by the Directorate of Youth Affairs KP to support students coming from remote regions (Chitral, Swat, Waziristan, etc.) to study in Peshawar.',
      rules: [
        'Curfew is strictly 10:00 PM. Late entries must be approved by the Warden.',
        'Cleanliness is mandatory. Residents must keep their rooms tidy.',
        'No external visitors are allowed inside room quarters without registering at the reception.',
        'Anti-social behaviors, smoking, or illegal substances are strictly prohibited and result in immediate suspension.'
      ],
      contact: {
        email: 'info@kpyouthhostel.com',
        phone: '+92-91-9216701',
        whatsApp: '+92-300-1234567'
      },
      location: {
        address: 'University Road, Zoo Street, Rahatabad, Peshawar, Khyber Pakhtunkhwa',
        googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.7247738202517!2d71.48003661148107!3d34.0124395723507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d9172bc9776f9d%3A0xc07a514d3f3f1e94!2sPeshawar%20Zoo!5e0!3m2!1sen!2spk!4v1719999999999!5m2!1sen!2spk',
        nearbyUniversities: [
          'University of Peshawar (UoP) - 1.2 km',
          'University of Engineering & Technology (UET) - 1.5 km',
          'Khyber Medical University (KMU) - 2.0 km',
          'Islamia College Peshawar - 1.8 km'
        ]
      },
      warden: {
        name: 'M Noor Wazir',
        bio: 'M Noor Wazir holds a Masters in Public Administration and has overseen student boarding facilities for 12 years. He believes in fostering a disciplined yet caring community environment.',
        qualification: 'Master of Public Administration (Peshawar University)',
        experience: '12 Years in Student Housing Management',
        message: 'Welcome to KP Youth Hostel. Our aim is to provide you a home away from home. Here, we prioritize your safety, hygiene, and study environment above everything else.',
        image: '/images/warden.jpg'
      },
      md: {
        name: 'Hameed Khan',
        bio: 'The Managing Director focuses on implementing government policies for youth development, executing digital transformation in youth hostels, and creating affordable living conditions.',
        vision: 'To build modern, digitized youth hostels across KP, promoting academic success and national integration.',
        message: 'This hostel represents our commitment to the youth of KP. By digitizing fee collections, rooms allocations, and notifications, we ensure complete transparency and convenience.',
        image: '/images/md.jpg'
      },
      gallery: [
        { url: '/images/hostel_dining.jpg', type: 'image', category: 'Dining Hall', caption: 'Students Dining Together — KP Youth Hostel' },
        { url: '/images/hostel_outside.jpg', type: 'image', category: 'Building', caption: 'KP University Youth Hostel — Main Entrance' },
        { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600', type: 'image', category: 'Rooms', caption: 'Premium Quad Share Student Room' },
        { url: 'https://images.unsplash.com/photo-1598900866636-458f430ca483?auto=format&fit=crop&q=80&w=600', type: 'image', category: 'Rooms', caption: 'Double Bed Room with Study Desks' },
        { url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600', type: 'image', category: 'Library', caption: 'Air Conditioned Library and Reading Room' },
        { url: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80&w=600', type: 'image', category: 'Sports Area', caption: 'Indoor Games and Recreation Area' }
      ]
    });
    console.log('[SEEDER] Hostel Info seeded successfully.');

    // 8. Create sample Announcements
    console.log('[SEEDER] Seeding announcements...');
    await Announcement.create([
      {
        title: 'Monthly Fee Submission Deadline',
        content: 'Please submit your hostel boarding fee for the upcoming month by the 5th. Invoices are generated automatically on the 25th.',
        type: 'Fee Notice',
        createdBy: admin._id
      },
      {
        title: 'Generator Maintenance Notice',
        content: 'Electricity backup generator servicing will occur this Sunday, July 5th, between 12:00 PM and 3:00 PM. Temporary UPS load limits will apply.',
        type: 'Maintenance',
        createdBy: admin._id
      }
    ]);
    console.log('[SEEDER] Announcements seeded.');

    // 9. Create a pending Fee for the student
    console.log('[SEEDER] Seeding sample student fee...');
    const monthsList = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentMonthStr = `${monthsList[new Date().getMonth()]} ${new Date().getFullYear()}`;

    await Fee.create({
      student: student._id,
      month: currentMonthStr,
      amount: 9500,
      status: 'Pending',
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10),
      paymentHistory: []
    });
    console.log('[SEEDER] Pending Fee invoice seeded.');

    console.log('[SEEDER] Seeding database completed successfully!');
  } catch (error) {
    console.error('[SEEDER] Error during seeding:', (error as Error).message);
    throw error;
  }
};
