import { User } from "../models/User";

export async function seedAdmin(): Promise<void> {
  try {
    const existingAdmin = await User.findOne({ email: "admin@hostel.edu", role: "admin" });
    
    if (!existingAdmin) {
      const admin = new User({
        email: "admin@hostel.edu",
        password: "admin123",
        role: "admin",
        name: "System Administrator",
        mobile: "9999999999",
      });
      await admin.save();
      console.log("Admin user seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding admin:", error);
  }
}
