import { Request, Response } from 'express';
import HostelInfo from '../models/HostelInfo';
import { AuthRequest } from '../middleware/authMiddleware';

export const getHostelInfo = async (req: Request, res: Response) => {
  try {
    let info = await HostelInfo.findOne();

    // If no document exists, seed an initial blank one so the landing page won't fail
    if (!info) {
      info = await HostelInfo.create({
        description: 'KP Youth University Hostel Peshawar is a premium boarding facility.',
        mission: 'To provide high-quality, secure, and academic-friendly accommodation.',
        vision: 'To empower youth by resolving lodging constraints with smart facilities.',
        history: 'Founded in 2020 near Peshawar University Road, accommodating hundreds since inception.',
        rules: [
          'No entry allowed after 10:00 PM without prior permission.',
          'Cleanliness is mandatory. Keep rooms tidy.',
          'Visitors are not permitted in residential wings without registering.'
        ],
        contact: {
          email: 'info@kpyouthhostel.com',
          phone: '+92-91-9216701',
          whatsApp: '+92-300-1234567'
        },
        location: {
          address: 'University Road, Zoo Street, Peshawar, Khyber Pakhtunkhwa',
          googleMapUrl: 'https://maps.google.com/?q=Peshawar+Zoo',
          nearbyUniversities: ['University of Peshawar', 'UET Peshawar', 'Khyber Medical College']
        },
        warden: {
          name: 'Hameed Khan',
          bio: 'Hameed Khan has over 10 years of student administration experience.',
          qualification: 'M.A Educational Leadership',
          experience: '12 Years in Residential Management',
          message: 'Welcome to a clean, safe, and academically supportive student community.',
          image: '/images/warden.jpg'
        },
        md: {
          name: 'Director KP Youth Affairs',
          bio: 'Guiding provincial youth initiatives, student boarding policies, and tourism promotion.',
          vision: 'Digitalized hostels, professional staff, and affordable merit-based opportunities.',
          message: 'Our goal is absolute transparency, smart technology, and premium living comforts.',
          image: '/images/md.jpg'
        },
        gallery: []
      });
    }

    // Hide sensitive credentials for non-admin users
    const infoObj = info.toObject();
    const isUserAdmin = (req as AuthRequest).user?.role === 'Admin';
    if (!isUserAdmin && infoObj.contact) {
      delete infoObj.contact.smtpPass;
      delete infoObj.contact.twilioAuthToken;
    }

    return res.status(200).json({ success: true, hostelInfo: infoObj });
  } catch (error) {
    console.error('[HOSTEL-CONTROLLER] GetInfo Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateHostelInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { description, mission, vision, history, rules, contact, location } = req.body;

    let info = await HostelInfo.findOne();
    if (!info) {
      return res.status(404).json({ success: false, message: 'Hostel information document not found' });
    }

    if (description) info.description = description;
    if (mission) info.mission = mission;
    if (vision) info.vision = vision;
    if (history) info.history = history;
    if (rules) info.rules = rules;

    if (contact) {
      info.contact.email = contact.email || info.contact.email;
      info.contact.phone = contact.phone || info.contact.phone;
      info.contact.whatsApp = contact.whatsApp || info.contact.whatsApp;
    }

    if (location) {
      info.location.address = location.address || info.location.address;
      info.location.googleMapUrl = location.googleMapUrl || info.location.googleMapUrl;
      info.location.nearbyUniversities = location.nearbyUniversities || info.location.nearbyUniversities;
    }

    await info.save();
    return res.status(200).json({ success: true, message: 'Hostel information updated successfully', hostelInfo: info });
  } catch (error) {
    console.error('[HOSTEL-CONTROLLER] UpdateInfo Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateWardenProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, qualification, experience, message, image } = req.body;

    const info = await HostelInfo.findOne();
    if (!info) {
      return res.status(404).json({ success: false, message: 'Hostel information document not found' });
    }

    if (name) info.warden.name = name;
    if (bio) info.warden.bio = bio;
    if (qualification) info.warden.qualification = qualification;
    if (experience) info.warden.experience = experience;
    if (message) info.warden.message = message;
    if (image) info.warden.image = image;

    await info.save();
    return res.status(200).json({ success: true, message: 'Warden profile updated successfully', warden: info.warden });
  } catch (error) {
    console.error('[HOSTEL-CONTROLLER] UpdateWarden Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateMDProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, vision, message, image, contact } = req.body;

    const info = await HostelInfo.findOne();
    if (!info) {
      return res.status(404).json({ success: false, message: 'Hostel information document not found' });
    }

    if (name) info.md.name = name;
    if (bio) info.md.bio = bio;
    if (vision) info.md.vision = vision;
    if (message) info.md.message = message;
    if (image) info.md.image = image;
    if (contact) info.md.contact = contact;

    await info.save();
    return res.status(200).json({ success: true, message: 'Managing Director profile updated successfully', md: info.md });
  } catch (error) {
    console.error('[HOSTEL-CONTROLLER] UpdateMD Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateCredentials = async (req: AuthRequest, res: Response) => {
  try {
    const { smtpHost, smtpPort, smtpUser, smtpPass, twilioSid, twilioAuthToken, twilioWhatsAppNumber } = req.body;

    const info = await HostelInfo.findOne();
    if (!info) {
      return res.status(404).json({ success: false, message: 'Hostel information document not found' });
    }

    if (smtpHost !== undefined) info.contact.smtpHost = smtpHost;
    if (smtpPort !== undefined) info.contact.smtpPort = smtpPort;
    if (smtpUser !== undefined) info.contact.smtpUser = smtpUser;
    if (smtpPass !== undefined) info.contact.smtpPass = smtpPass;
    if (twilioSid !== undefined) info.contact.twilioSid = twilioSid;
    if (twilioAuthToken !== undefined) info.contact.twilioAuthToken = twilioAuthToken;
    if (twilioWhatsAppNumber !== undefined) info.contact.twilioWhatsAppNumber = twilioWhatsAppNumber;

    await info.save();
    return res.status(200).json({ success: true, message: 'Notification settings updated successfully' });
  } catch (error) {
    console.error('[HOSTEL-CONTROLLER] UpdateCreds Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const uploadGalleryMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { url, type, category, caption } = req.body;

    if (!url || !category) {
      return res.status(400).json({ success: false, message: 'URL and Category are required' });
    }

    const info = await HostelInfo.findOne();
    if (!info) {
      return res.status(404).json({ success: false, message: 'Hostel information document not found' });
    }

    info.gallery.push({ url, type: type || 'image', category, caption });
    await info.save();

    return res.status(200).json({ success: true, message: 'Gallery media added successfully', gallery: info.gallery });
  } catch (error) {
    console.error('[HOSTEL-CONTROLLER] AddGallery Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteGalleryMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { mediaId } = req.params;

    const info = await HostelInfo.findOne();
    if (!info) {
      return res.status(404).json({ success: false, message: 'Hostel information document not found' });
    }

    info.gallery = info.gallery.filter(item => (item as any)._id?.toString() !== mediaId);
    await info.save();

    return res.status(200).json({ success: true, message: 'Gallery media removed successfully', gallery: info.gallery });
  } catch (error) {
    console.error('[HOSTEL-CONTROLLER] DeleteGallery Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getCredentials = async (req: AuthRequest, res: Response) => {
  try {
    const info = await HostelInfo.findOne();
    if (!info) {
      return res.status(404).json({ success: false, message: 'Hostel information document not found' });
    }
    return res.status(200).json({
      success: true,
      settings: {
        smtpHost: info.contact.smtpHost || '',
        smtpPort: info.contact.smtpPort || 587,
        smtpUser: info.contact.smtpUser || '',
        smtpPass: info.contact.smtpPass || '',
        twilioSid: info.contact.twilioSid || '',
        twilioAuthToken: info.contact.twilioAuthToken || '',
        twilioWhatsAppNumber: info.contact.twilioWhatsAppNumber || '',
        email: info.contact.email,
        phone: info.contact.phone,
        whatsApp: info.contact.whatsApp,
        address: info.location.address,
        googleMapUrl: info.location.googleMapUrl,
        nearbyUniversities: info.location.nearbyUniversities
      }
    });
  } catch (error) {
    console.error('[HOSTEL-CONTROLLER] GetCreds Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
