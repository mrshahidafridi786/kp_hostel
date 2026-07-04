import { Request, Response } from 'express';
import Facility from '../models/Facility';
import { AuthRequest } from '../middleware/authMiddleware';

export const createFacility = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, icon, displayOrder } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Name and description are required' });
    }

    const newFacility = await Facility.create({
      name,
      description,
      icon: icon || 'Info',
      displayOrder: displayOrder || 0
    });

    return res.status(201).json({
      success: true,
      message: 'Facility created successfully',
      facility: newFacility
    });
  } catch (error) {
    console.error('[FACILITY-CONTROLLER] Create Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getFacilities = async (req: Request, res: Response) => {
  try {
    const facilities = await Facility.find().sort({ displayOrder: 1 });
    return res.status(200).json({ success: true, facilities });
  } catch (error) {
    console.error('[FACILITY-CONTROLLER] GetList Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateFacility = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon, displayOrder } = req.body;

    const facility = await Facility.findById(id);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    if (name) facility.name = name;
    if (description) facility.description = description;
    if (icon) facility.icon = icon;
    if (displayOrder !== undefined) facility.displayOrder = displayOrder;

    await facility.save();

    return res.status(200).json({
      success: true,
      message: 'Facility updated successfully',
      facility
    });
  } catch (error) {
    console.error('[FACILITY-CONTROLLER] Update Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteFacility = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const facility = await Facility.findById(id);
    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    await Facility.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Facility deleted successfully' });
  } catch (error) {
    console.error('[FACILITY-CONTROLLER] Delete Error:', (error as Error).message);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
