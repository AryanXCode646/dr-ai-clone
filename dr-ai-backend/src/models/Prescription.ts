import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type PrescriptionStatus = 'draft' | 'issued' | 'revoked';
export type SigningStatus = 'demo_unsigned' | 'digitally_signed';

export interface IMedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  prescriptionId: string; // Cryptographically secure identifier e.g. RX-<hex>
  patient: Types.ObjectId; // References User
  patientName: string;
  patientAge?: string | number;
  patientGender?: string;
  doctor: Types.ObjectId | string; // Doctor ref or ID
  doctorName: string;
  doctorSpecialty: string;
  doctorHospital?: string;
  appointmentRef?: Types.ObjectId;
  diagnosis: string;
  medications: IMedicationItem[];
  advice: string;
  followUp?: string;
  status: PrescriptionStatus;
  signingStatus: SigningStatus;
  signatureMetadata?: {
    signedBy?: string;
    signedAt?: Date;
    certificateFingerprint?: string;
    algorithm?: string;
  };
  revokedAt?: Date;
  revocationReason?: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    prescriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientAge: {
      type: Schema.Types.Mixed,
    },
    patientGender: {
      type: String,
    },
    doctor: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorSpecialty: {
      type: String,
      required: true,
    },
    doctorHospital: {
      type: String,
    },
    appointmentRef: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    diagnosis: {
      type: String,
      required: true,
    },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String },
      },
    ],
    advice: {
      type: String,
      required: true,
    },
    followUp: {
      type: String,
    },
    status: {
      type: String,
      enum: ['draft', 'issued', 'revoked'],
      default: 'issued',
      index: true,
    },
    signingStatus: {
      type: String,
      enum: ['demo_unsigned', 'digitally_signed'],
      default: 'demo_unsigned', // Truthful default: not pretending to have cryptographic certs
      index: true,
    },
    signatureMetadata: {
      signedBy: { type: String },
      signedAt: { type: Date },
      certificateFingerprint: { type: String },
      algorithm: { type: String },
    },
    revokedAt: {
      type: Date,
    },
    revocationReason: {
      type: String,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription: Model<IPrescription> = mongoose.model<IPrescription>('Prescription', prescriptionSchema);

export default Prescription;
