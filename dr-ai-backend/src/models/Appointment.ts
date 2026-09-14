import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type AppointmentType = 'video' | 'audio' | 'in-person';

export interface IAppointment extends Document {
  patient: Types.ObjectId; // References User
  patientName: string;
  patientEmail: string;
  doctorId: string; // References Doctor id
  doctorName: string;
  doctorSpecialty: string;
  doctorImage?: string;
  doctorFee?: number;
  scheduledStart: Date;
  scheduledEnd: Date;
  dateStr: string; // E.g. "2026-09-15" or "Today"
  timeStr: string; // E.g. "2:30 PM"
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  meetingRoomId: string;
  notes?: string;
  prescriptionRef?: Types.ObjectId;
  cancellationReason?: string;
  cancelledBy?: Types.ObjectId;
  cancelledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  canTransitionTo(nextStatus: AppointmentStatus): boolean;
}

// Legal State Transitions Map
export const LEGAL_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [], // Terminal
  cancelled: [], // Terminal
};

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    doctorSpecialty: {
      type: String,
      required: true,
    },
    doctorImage: {
      type: String,
      default: '',
    },
    doctorFee: {
      type: Number,
      default: 0,
    },
    scheduledStart: {
      type: Date,
      required: true,
      index: true,
    },
    scheduledEnd: {
      type: Date,
      required: true,
    },
    dateStr: {
      type: String,
      required: true,
    },
    timeStr: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['video', 'audio', 'in-person'],
      default: 'video',
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },
    meetingRoomId: {
      type: String,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      maxlength: 2000,
    },
    prescriptionRef: {
      type: Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    cancellationReason: {
      type: String,
      maxlength: 500,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Method to validate legal state transitions
appointmentSchema.methods.canTransitionTo = function (nextStatus: AppointmentStatus): boolean {
  const currentStatus = this.status as AppointmentStatus;
  const allowed = LEGAL_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
};

// Compound unique index ensuring no two active appointments exist for the same doctor at the same start time.
// Cancelled or completed appointments release the slot for rebooking.
appointmentSchema.index(
  { doctorId: 1, scheduledStart: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
    },
  }
);

const Appointment: Model<IAppointment> = mongoose.model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
