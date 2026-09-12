import express, { Response, NextFunction } from 'express';
import crypto from 'crypto';
import Prescription from '../models/Prescription';
import Appointment from '../models/Appointment';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '../errors/AppError';

const router = express.Router();

/**
 * List prescriptions for the authenticated user (patient sees own; doctors see issued).
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    let filter: any = {};
    if (userRole === 'patient') {
      filter.patient = userId;
    } else if (userRole === 'doctor') {
      filter.doctor = userId;
    } // Admin gets all

    const prescriptions = await Prescription.find(filter)
      .sort({ issuedAt: -1 })
      .lean();

    res.json(prescriptions);
  } catch (error) {
    next(error);
  }
});

/**
 * Issue a prescription (Doctors & Admins only).
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role === 'patient') {
      throw new AuthorizationError('Patients are not authorized to issue prescriptions.');
    }

    const {
      patientId,
      patientName,
      patientAge,
      patientGender,
      doctorName,
      doctorSpecialty,
      doctorHospital,
      appointmentId,
      diagnosis,
      medications,
      advice,
      followUp,
    } = req.body;

    if (!patientId || !patientName || !diagnosis || !medications || !Array.isArray(medications)) {
      throw new ValidationError('Patient identity, diagnosis, and medication list are required.');
    }

    if (medications.length === 0) {
      throw new ValidationError('Prescription must include at least one medication item.');
    }

    // Generate cryptographically secure random Rx ID (e.g. RX-A8B9-C0D1)
    const secureHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const prescriptionId = `RX-${secureHex.slice(0, 4)}-${secureHex.slice(4)}`;

    const prescription = new Prescription({
      prescriptionId,
      patient: patientId,
      patientName,
      patientAge,
      patientGender,
      doctor: req.user!.userId,
      doctorName: doctorName || req.user!.name || 'Attending Physician',
      doctorSpecialty: doctorSpecialty || 'General Telehealth',
      doctorHospital: doctorHospital || 'Dr.AI Telehealth Network',
      appointmentRef: appointmentId,
      diagnosis,
      medications,
      advice,
      followUp,
      status: 'issued',
      signingStatus: 'demo_unsigned', // Truthful status: No cryptographic doctor certificate
      issuedAt: new Date(),
    });

    await prescription.save();

    // If appointment ID was linked, attach prescription ref to appointment
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        prescriptionRef: prescription._id,
      });
    }

    res.status(201).json(prescription);
  } catch (error) {
    next(error);
  }
});

/**
 * Get prescription by ID or secure Rx ID with ownership check.
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { prescriptionId: req.params.id };

    const prescription = await Prescription.findOne(query);
    if (!prescription) {
      throw new NotFoundError('Prescription record not found.');
    }

    // Ownership check
    const isPatient = prescription.patient.toString() === req.user!.userId;
    const isDoctor = prescription.doctor.toString() === req.user!.userId;
    const isAdmin = req.user!.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      throw new AuthorizationError('You do not have permission to view this prescription.');
    }

    res.json(prescription);
  } catch (error) {
    next(error);
  }
});

export default router;
