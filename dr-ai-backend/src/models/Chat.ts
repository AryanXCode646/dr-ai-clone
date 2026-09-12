import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface IMessage {
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  metadata?: any;
}

export interface IChat extends Document {
  userId: Types.ObjectId;
  title: string;
  persona?: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
});

const chatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Clinical Consultation',
    },
    persona: {
      type: String,
      default: 'general',
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const Chat: Model<IChat> = mongoose.model<IChat>('Chat', chatSchema);

export default Chat;