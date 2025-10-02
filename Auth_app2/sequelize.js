import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Get the MongoDB URI from environment variables
const DB_URI = process.env.DB_URI;

mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.log('MongoDB connection error:', err));

export default mongoose;
