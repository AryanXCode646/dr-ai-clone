import express, { Response, NextFunction } from 'express';
import crypto from 'crypto';
import Appointment, { AppointmentStatus, AppointmentType } from '../models/Appointment';
import User from '../models/User';
import Doctor from '../models/Doctor';
import { authenticate, AuthRequest } from '../middleware/auth';
import { appointmentBookingLimiter } from '../middleware/rateLimiter';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  ConflictError,
} from '../errors/AppError';
import { SEED_DOCTORS } from '../seed/seed';

const router = express.Router();

/**
 * List appointments with server-side authorization and tenant isolation.
 * Patients see only their appointments; doctors see their consults; admins see all.
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.userId;

    let filter: any = {};
    if (userRole === 'patient') {
      filter.patient = userId;
    } else if (userRole === 'doctor') {
      filter.$or = [{ doctorId: userId }, { doctorName: req.user!.name }];
    } // Admins get unrestricted access

    const appointments = await Appointment.find(filter)
      .sort({ scheduledStart: -1 })
      .lean();

    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

/**
 * Book a new appointment with verified server-side identity and concurrency validation.
 */
router.post(
  '/',
  authenticate,
  appointmentBookingLimiter,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { doctorId, date, time, type = 'video', reason } = req.body;

      if (!doctorId) {
        throw new ValidationError('Doctor ID is required.');
      }
      if (!date || !time) {
        throw new ValidationError('Appointment date and time slot are required.');
      }
      if (!reason || typeof reason !== 'string' || !reason.trim()) {
        throw new ValidationError('Reason for consultation is required.');
      }

      // 1. Authoritative patient identity derived exclusively from authenticated server session
      const patient = await User.findById(req.user!.userId);
      if (!patient) {
        throw new NotFoundError('Authenticated patient record could not be resolved.');
      }

      // 2. Validate Doctor identity
      const doctor =
        (await Doctor.findOne({ id: doctorId })) ||
        SEED_DOCTORS.find((d) => d.id === doctorId);

      if (!doctor) {
        throw new NotFoundError(`Doctor with ID '${doctorId}' does not exist.`);
      }

      // 3. Compute scheduling timestamps
      let scheduledStart: Date;
      if (date.toLowerCase() === 'today') {
        scheduledStart = new Date();
      } else if (date.toLowerCase() === 'tomorrow') {
        scheduledStart = new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else {
        const parsed = new Date(date);
        scheduledStart = isNaN(parsed.getTime()) ? new Date() : parsed;
      }

      // Parse time string e.g. "2:30 PM"
      const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const isPM = timeMatch[3].toUpperCase() === 'PM';
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        scheduledStart.setHours(hours, minutes, 0, 0);
      }

      const scheduledEnd = new Date(scheduledStart.getTime() + 30 * 60 * 1000); // 30 min duration

      // 4. Concurrency & Double Booking Prevention
      // Check if an active appointment already exists for this doctor at the exact same start slot
      const conflictingApt = await Appointment.findOne({
        doctorId,
        scheduledStart,
        status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
      });

      if (conflictingApt) {
        throw new ConflictError(
          `Doctor ${doctor.name} already has a confirmed booking at ${time} on ${date}. Please select another time slot.`
        );
      }

      // 5. Generate secure meeting room identifier
      const meetingRoomId = `room-${crypto.randomBytes(8).toString('hex')}`;

      // 6. Create persisted appointment
      const appointment = new Appointment({
        patient: patient._id,
        patientName: patient.name,
        patientEmail: patient.email,
        doctorId: doctor.id,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        doctorImage: doctor.image,
        doctorFee: doctor.fee,
        scheduledStart,
        scheduledEnd,
        dateStr: date,
        timeStr: time,
        type: type as AppointmentType,
        status: 'scheduled',
        reason: reason.trim(),
        meetingRoomId,
      });

      await appointment.save();

      res.status(201).json(appointment);
    } catch (error: any) {
      if (error.code === 11000) {
        return next(
          new ConflictError(
            `Doctor already has a confirmed booking at the requested date and time slot. Please select another time slot.`
          )
        );
      }
      next(error);
    }
  }
);

/**
 * Get appointment by ID with strict ownership verification.
 */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      throw new NotFoundError('Appointment not found.');
    }

    // Ownership check
    const isPatient = appointment.patient.toString() === req.user!.userId;
    const isAssignedDoctor =
      req.user!.role === 'doctor' &&
      (appointment.doctorId === req.user!.userId || appointment.doctorName === req.user!.name);
    const isAdmin = req.user!.role === 'admin';

    if (!isPatient && !isAssignedDoctor && !isAdmin) {
      throw new AuthorizationError('You do not have permission to view this appointment.');
    }

    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

/**
 * Cancel appointment with legal state transition check and audit metadata recording.
 */
router.post('/:id/cancel', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      throw new NotFoundError('Appointment not found.');
    }

    // Ownership check: patient, assigned doctor, or admin
    const isPatient = appointment.patient.toString() === req.user!.userId;
    const isAssignedDoctor =
      req.user!.role === 'doctor' &&
      (appointment.doctorId === req.user!.userId || appointment.doctorName === req.user!.name);
    const isAdmin = req.user!.role === 'admin';

    if (!isPatient && !isAssignedDoctor && !isAdmin) {
      throw new AuthorizationError('You do not have permission to cancel this appointment.');
    }

    // Validate legal state transition
    if (!appointment.canTransitionTo('cancelled')) {
      throw new ValidationError(
        `Cannot cancel appointment with current status '${appointment.status}'. Only scheduled or in-progress appointments can be cancelled.`
      );
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = req.body.reason || 'Cancelled by participant';
    appointment.cancelledBy = req.user!.userId as any;
    appointment.cancelledAt = new Date();

    await appointment.save();

    res.json({
      message: 'Appointment cancelled successfully.',
      appointment,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Transition appointment state (e.g. scheduled -> in_progress -> completed).
 */
router.post(
  '/:id/transition',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { status: targetStatus, notes } = req.body;

      if (!targetStatus) {
        throw new ValidationError('Target status is required.');
      }

      const appointment = await Appointment.findById(req.params.id);
      if (!appointment) {
        throw new NotFoundError('Appointment not found.');
      }

      // Only doctors or admins can advance appointments to in_progress or completed
      if (req.user!.role === 'patient') {
        throw new AuthorizationError('Patients cannot advance appointment clinical states.');
      }

      // Verify doctor ownership: must be the assigned doctor or an admin
      const isAssignedDoctor =
        appointment.doctorId === req.user!.userId || appointment.doctorName === req.user!.name;
      const isAdmin = req.user!.role === 'admin';

      if (!isAssignedDoctor && !isAdmin) {
        throw new AuthorizationError("You do not have permission to modify another doctor's appointment.");
      }

      if (!appointment.canTransitionTo(targetStatus as AppointmentStatus)) {
        throw new ValidationError(
          `Illegal state transition from '${appointment.status}' to '${targetStatus}'.`
        );
      }

      appointment.status = targetStatus as AppointmentStatus;
      if (notes) appointment.notes = notes;
      if (targetStatus === 'completed') {
        appointment.completedAt = new Date();
      }

      await appointment.save();

      res.json({
        message: `Appointment state transitioned to '${targetStatus}'.`,
        appointment,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
