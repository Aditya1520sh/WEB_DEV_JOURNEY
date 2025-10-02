import mongoose from 'mongoose';

// Define schema for the User model
const UserSchema = new mongoose.Schema(
  {
    google_id: { type: String, unique: true },
    spotify_id: { type: String, unique: true },
    name: { type: String },
    email: { type: String, unique: true },
    picture: { type: String },
    locale: { type: String },
    created_at: { type: Date, default: Date.now },
    last_login: { type: Date, default: Date.now },
  },
  {
    collection: 'users', // explicitly specify the collection name
    timestamps: false,    // since you're using created_at and last_login manually
  }
);

// Create a model based on the schema
const User = mongoose.model('User', UserSchema);

// Export the User model
export default User;
