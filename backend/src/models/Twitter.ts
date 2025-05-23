import mongoose, { Schema, Document } from 'mongoose';

export interface ITwitter extends Document {
  accessToken: string;
  accessSecret: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

const TwitterSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  accessSecret: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

TwitterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ITwitter>('Twitter', TwitterSchema);
