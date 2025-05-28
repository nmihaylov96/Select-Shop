import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import Stripe from "stripe";
import passport from "passport";
import LocalStrategy from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { insertUserSchema, insertCartItemSchema, insertOrderSchema, User, InsertUser } from "@shared/schema";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from './email';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16" as any,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session
  const SessionStore = MemoryStore(session);
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "sportzone-secret",
      resave: false,
      saveUninitialized: false,
      store: new SessionStore({
        checkPeriod: 86400000, // Prune expired entries every 24h
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );
  
  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport
  passport.use(
    new LocalStrategy.Strategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Google OAuth strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with this Google email
      let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (user) {
        // User exists, return them
        return done(null, user);
      } else {
        // User doesn't exist, create new user
        const newUser = await storage.createUser({
          username: profile.emails?.[0]?.value || `google_${profile.id}`,
          email: profile.emails?.[0]?.value || '',
          password: '', // No password for Google users
          firstName: profile.name?.givenName || '',
          lastName: profile.name?.familyName || '',
          address: null,
          city: null,
          phone: null,
          isAdmin: false
        });
        return done(null, newUser);
      }
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && (req.user as User).isAdmin) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  // Reviews API routes - FIXED! 🌟
  app.get("/api/reviews/:productId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await storage.getReviewsByProduct(productId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching reviews: " + error.message });
    }
  });

  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      const validatedData = {
        userId: user.id,
        productId: req.body.productId,
        rating: req.body.rating,
        comment: req.body.comment,
      };
      
      // Check if product exists
      const product = await storage.getProductById(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(500).json({ message: "An error occurred while creating the review: " + error.message });
    }
  });
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate request
      const registerSchema = z.object({
        username: z.string().min(3).max(50),
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      });
      
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validatedData.password, salt);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        isAdmin: false,
        address: "",
        city: "",
        phone: "",
      });
      
      // Filter out the password
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "An error occurred during registration" });
    }
  });
  
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        
        // Filter out the password
        const { password, ...userWithoutPassword } = user;
        
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Filter out the password
    const { password, ...userWithoutPassword } = req.user as User;
    
    res.json(userWithoutPassword);
  });

  // Google OAuth routes
  app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      // Successful authentication, redirect to home
      res.redirect("/");
    }
  );
  
  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching categories" });
    }
  });
  
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching the category" });
    }
  });
  
  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const products = await storage.getProducts(limit, offset);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching products" });
    }
  });
  
  app.get("/api/products/featured", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const products = await storage.getFeaturedProducts(limit);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching featured products" });
    }
  });
  
  app.get("/api/products/category/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const products = await storage.getProductsByCategory(categoryId, limit, offset);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching products by category" });
    }
  });
  
  app.get("/api/products/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: "Query parameter 'q' is required" });
      }
      
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while searching products" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching the product" });
    }
  });
  
  // Testimonials routes
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching testimonials" });
    }
  });
  
  // Stripe Payment Integration
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents for Stripe
        currency: "bgn", // Bulgarian lev
        payment_method_types: ["card"],
        metadata: {
          integration_check: 'accept_a_payment'
        }
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        message: "Error creating payment intent",
        error: error.message
      });
    }
  });
  
  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const cartItems = await storage.getCartItemsWithProducts(user.id);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching cart items" });
    }
  });
  
  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      // Validate request
      const cartItemSchema = insertCartItemSchema.extend({
        productId: z.number(),
        quantity: z.number().min(1),
      });
      
      const validatedData = cartItemSchema.parse({
        ...req.body,
        userId: user.id,
      });
      
      // Check if product exists
      const product = await storage.getProductById(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Add to cart
      const cartItem = await storage.addToCart(validatedData);
      
      // Get the cart item with product
      const cartItemWithProduct = {
        ...cartItem,
        product,
      };
      
      res.status(201).json(cartItemWithProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "An error occurred while adding to cart" });
    }
  });
  
  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as User;
      
      // Validate request
      const schema = z.object({
        quantity: z.number().min(1),
      });
      
      const validatedData = schema.parse(req.body);
      
      // Check if cart item exists
      const cartItems = await storage.getCartItems(user.id);
      const cartItem = cartItems.find(item => item.id === id);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Update cart item
      const updatedCartItem = await storage.updateCartItem(id, validatedData.quantity);
      
      if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get the updated cart item with product
      const product = await storage.getProductById(updatedCartItem.productId);
      const cartItemWithProduct = {
        ...updatedCartItem,
        product,
      };
      
      res.json(cartItemWithProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "An error occurred while updating the cart item" });
    }
  });
  
  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as User;
      
      // Check if cart item exists
      const cartItems = await storage.getCartItems(user.id);
      const cartItem = cartItems.find(item => item.id === id);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Remove cart item
      await storage.removeCartItem(id);
      
      res.json({ message: "Cart item removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while removing the cart item" });
    }
  });
  
  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      // Clear cart
      await storage.clearCart(user.id);
      
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while clearing the cart" });
    }
  });
  
  // Order routes
  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      // Validate request
      const schema = z.object({
        address: z.string().min(5),
        city: z.string().min(2),
        phone: z.string().min(5),
      });
      
      const validatedData = schema.parse(req.body);
      
      // Get cart items
      const cartItems = await storage.getCartItemsWithProducts(user.id);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      const total = cartItems.reduce((acc, item) => {
        const price = item.product.discountedPrice || item.product.price;
        return acc + price * item.quantity;
      }, 0);
      
      // Create order
      const order = await storage.createOrder(
        {
          userId: user.id,
          total,
          status: "pending",
          address: validatedData.address,
          city: validatedData.city,
          phone: validatedData.phone,
        },
        cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.discountedPrice || item.product.price,
          orderId: 0, // This will be set in the storage
        }))
      );
      
      // Clear cart after successful order
      await storage.clearCart(user.id);
      
      // Send order confirmation email
      if (user.email) {
        try {
          await sendOrderConfirmationEmail({
            order,
            orderItems: cartItems.map(item => ({
              id: 0, // Not needed for email
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.discountedPrice || item.product.price,
              product: item.product
            })),
            user
          });
          console.log(`[order] Email confirmation sent for order #${order.id}`);
        } catch (emailError) {
          console.error(`[order] Failed to send email for order #${order.id}:`, emailError);
          // Don't fail the order creation if email fails
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "An error occurred while creating the order" });
    }
  });
  
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const orders = await storage.getOrdersByUser(user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching orders" });
    }
  });
  
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = req.user as User;
      
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if the order belongs to the user or the user is an admin
      if (order.userId !== user.id && !(user as User).isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const orderItems = await storage.getOrderItemsByOrder(id);
      
      res.json({ order, items: orderItems });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while fetching the order" });
    }
  });

  // Update order status (Admin only)
  app.patch("/api/orders/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Get the order before updating to know the old status
      const existingOrder = await storage.getOrderById(orderId);
      
      if (!existingOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const oldStatus = existingOrder.status;
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Send email notification if status changed
      if (oldStatus !== status) {
        try {
          const user = await storage.getUser(updatedOrder.userId);
          if (user && user.email) {
            await sendOrderStatusUpdateEmail(user, updatedOrder, oldStatus, status);
            console.log(`[order] Status update email sent for order #${orderId}: ${oldStatus} -> ${status}`);
          }
        } catch (emailError) {
          console.error(`[order] Failed to send status update email for order #${orderId}:`, emailError);
          // Don't fail the status update if email fails
        }
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "An error occurred while updating order status" });
    }
  });
  
  // Get all orders for admin
  app.get("/api/admin/orders", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      res.status(500).json({ message: "An error occurred while fetching orders" });
    }
  });

  // Admin routes
  app.post("/api/admin/products", isAdmin, async (req, res) => {
    try {
      // Validate request body
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while creating the product" });
    }
  });
  
  app.put("/api/admin/products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.updateProduct(id, req.body);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while updating the product" });
    }
  });
  
  app.delete("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred while deleting the product" });
    }
  });
  
  app.post("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "An error occurred while creating the category" });
    }
  });

  // Test email endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      const testUser = {
        id: 1,
        username: "test",
        email: "nikolaymhaylov1996@gmail.com", // Your verified email
        firstName: "Test",
        lastName: "User",
        password: "",
        address: null,
        city: null,
        phone: null,
        isAdmin: false,
      };

      const testOrder = {
        id: 999,
        userId: 1,
        total: 99.99,
        status: "pending",
        address: "Test Address 123",
        city: "Test City",
        phone: "+359 888 123 456",
        createdAt: new Date(),
      };

      const testOrderItems = [{
        id: 1,
        orderId: 999,
        productId: 1,
        quantity: 1,
        price: 99.99,
        product: {
          id: 1,
          name: "Test Product",
          nameEn: "Test Product",
          description: "Test Description",
          descriptionEn: "Test Description",
          price: 99.99,
          discountedPrice: null,
          categoryId: 1,
          image: "test.jpg",
          rating: null,
          stockQuantity: 10,
          brand: "Test Brand",
          featured: false,
        }
      }];

      const result = await sendOrderConfirmationEmail({
        order: testOrder,
        orderItems: testOrderItems,
        user: testUser
      });

      res.json({ 
        success: result,
        message: result ? "Test email sent successfully!" : "Failed to send test email"
      });
    } catch (error) {
      console.error("Test email error:", error);
      res.status(500).json({ 
        success: false,
        message: "Error sending test email",
        error: error.message
      });
    }
  });
  
  const httpServer = createServer(app);
  
  return httpServer;
}
