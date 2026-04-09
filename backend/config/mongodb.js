import mongoose from "mongoose";

const connectDB = async () => {
  try {
await mongoose.connect(process.env.MONGODB_URL);   
console.log("DB Connected ");
} catch (error) {
    console.log("MongoDB Connection Failed ");
    console.error(error.message);
  }
};

export default connectDB;