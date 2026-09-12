import mongoose, { Document, Model, Schema } from 'mongoose';

export type VerificationStatus = 'verified' | 'pending_verification' | 'demo_provider';

export interface IDoctor extends Document {
  id: string; // Public string identifier e.g. doc-1
  name: string;
  specialty: string;
  title: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  image: string;
  availability: 'Available Now' | 'Today' | 'Tomorrow' | 'In 2 Days';
  languages: string[];
  fee: number;
  education: string;
  hospital: string;
  about: string;
  verificationStatus: VerificationStatus;
  licenseNumber: string;
  isDemo: boolean;
  availableSlots: Array<{
    date: string;
    times: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    specialty: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: true,
    },
    availability: {
      type: String,
      enum: ['Available Now', 'Today', 'Tomorrow', 'In 2 Days'],
      default: 'Today',
      index: true,
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    education: {
      type: String,
      default: '',
    },
    hospital: {
      type: String,
      default: '',
    },
    about: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending_verification', 'demo_provider'],
      default: 'demo_provider',
      index: true,
    },
    licenseNumber: {
      type: String,
      default: 'UNVERIFIED-DEMO',
    },
    isDemo: {
      type: Boolean,
      default: true,
    },
    availableSlots: [
      {
        date: { type: String, required: true },
        times: { type: [String], default: [] },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Doctor: Model<IDoctor> = mongoose.model<IDoctor>('Doctor', doctorSchema);

export default Doctor;
