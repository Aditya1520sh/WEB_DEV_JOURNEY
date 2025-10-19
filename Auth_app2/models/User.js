import mongoose from 'mongoose';

// Define schema for the User model
const UserSchema = new mongoose.Schema(
  {
    google_id: { type: String, unique: true, sparse: true },
    spotify_id: { type: String, unique: true, sparse: true },
    github_id: { type: String, unique: true, sparse: true },
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    picture: { type: String },
    locale: { type: String },
    created_at: { type: Date, default: Date.now },
    last_login: { type: Date, default: Date.now },
  },
  {
    collection: 'users', // explicitly specify the collection name
    timestamps: false,   // since you're using created_at and last_login manually
  }
);

// Create a model based on the schema
const User = mongoose.model('User', UserSchema);

export default User;
