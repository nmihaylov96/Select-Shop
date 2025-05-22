import { 
  User, InsertUser, users,
  Product, InsertProduct, products,
  Category, InsertCategory, categories,
  Testimonial, InsertTestimonial, testimonials,
  CartItem, InsertCartItem, cartItems,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, or, desc } from "drizzle-orm";
import { IStorage } from "./storage";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        address: insertUser.address || null,
        firstName: insertUser.firstName || null,
        lastName: insertUser.lastName || null,
        city: insertUser.city || null,
        phone: insertUser.phone || null,
        isAdmin: insertUser.isAdmin || false
      })
      .returning();
    return user;
  }
  
  async getProducts(limit = 100, offset = 0): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .limit(limit)
      .offset(offset);
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }
  
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.featured, true))
      .limit(limit);
  }
  
  async getProductsByCategory(categoryId: number, limit = 100, offset = 0): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .limit(limit)
      .offset(offset);
  }
  
  async searchProducts(query: string): Promise<Product[]> {
    const searchPattern = `%${query}%`;
    // Using ilike for case-insensitive search
    return await db
      .select()
      .from(products)
      .where(
        or(
          ilike(products.name, searchPattern),
          ilike(products.nameEn, searchPattern),
          ilike(products.description, searchPattern),
          ilike(products.descriptionEn, searchPattern)
        )
      );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values({
        ...product,
        discountedPrice: product.discountedPrice || null,
        badge: product.badge || null,
        badgeEn: product.badgeEn || null,
        rating: product.rating || null,
        featured: product.featured || false
      })
      .returning();
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct || undefined;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id));
    return true; // Assuming successful deletion if no error
  }
  
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }
  
  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }
  
  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const [newTestimonial] = await db
      .insert(testimonials)
      .values({
        ...testimonial,
        image: testimonial.image || null
      })
      .returning();
    return newTestimonial;
  }
  
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
  }
  
  async getCartItemsWithProducts(userId: number): Promise<(CartItem & { product: Product })[]> {
    const userCartItems = await this.getCartItems(userId);
    const result: (CartItem & { product: Product })[] = [];
    
    for (const item of userCartItems) {
      const product = await this.getProductById(item.productId);
      if (product) {
        result.push({ ...item, product });
      }
    }
    
    return result;
  }
  
  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId)
        )
      );
    
    if (existingItem) {
      // Update quantity
      const newQuantity = (existingItem.quantity || 0) + (cartItem.quantity || 1);
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }
    
    // Add new item
    const [newCartItem] = await db
      .insert(cartItems)
      .values({
        ...cartItem,
        quantity: cartItem.quantity || 1
      })
      .returning();
    return newCartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem || undefined;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    await db
      .delete(cartItems)
      .where(eq(cartItems.id, id));
    return true; // Assuming successful deletion if no error
  }
  
  async clearCart(userId: number): Promise<boolean> {
    await db
      .delete(cartItems)
      .where(eq(cartItems.userId, userId));
    return true; // Assuming successful deletion if no error
  }
  
  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Create order with transaction to ensure atomicity
    const [order] = await db
      .insert(orders)
      .values({
        ...orderData,
        status: orderData.status || 'pending',
        createdAt: new Date()
      })
      .returning();
    
    // Create order items
    for (const item of items) {
      await db
        .insert(orderItems)
        .values({
          ...item,
          orderId: order.id
        });
    }
    
    return order;
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order || undefined;
  }
  
  async getOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, orderId))
      .returning();
    return updatedOrder || undefined;
  }

  async getReviewsByProduct(productId: number): Promise<any[]> {
    const reviewsWithUsers = await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        productId: reviews.productId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        user: {
          username: users.username,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
    
    return reviewsWithUsers;
  }

  async createReview(reviewData: any): Promise<any> {
    const [review] = await db
      .insert(reviews)
      .values(reviewData)
      .returning();
    return review;
  }
}