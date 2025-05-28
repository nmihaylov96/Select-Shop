import { db } from "./db";
import { storage } from "./storage";

async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database with demo data...");
    
    // The DatabaseStorage will automatically create demo data when instantiated
    // We just need to verify the connection and data
    const categories = await storage.getCategories();
    const products = await storage.getProducts();
    const testimonials = await storage.getTestimonials();
    
    console.log(`✅ Database initialized successfully!`);
    console.log(`📊 Categories: ${categories.length}`);
    console.log(`🛍️ Products: ${products.length}`);
    console.log(`💬 Testimonials: ${testimonials.length}`);
    
    // Check if admin user exists
    const adminUser = await storage.getUserByUsername("admin");
    if (adminUser) {
      console.log(`👨‍💼 Admin user ready: ${adminUser.username}`);
    }
    
    console.log("🎉 Database migration complete!");
    
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase().then(() => {
    process.exit(0);
  });
}

export { initializeDatabase };