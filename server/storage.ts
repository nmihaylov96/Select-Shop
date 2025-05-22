import { 
  User, InsertUser, users,
  Product, InsertProduct, products,
  Category, InsertCategory, categories,
  Testimonial, InsertTestimonial, testimonials,
  CartItem, InsertCartItem, cartItems,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProducts(limit?: number, offset?: number): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getProductsByCategory(categoryId: number, limit?: number, offset?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Testimonial operations
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItemsWithProducts(userId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Order operations
  createOrder(order: InsertOrder, orderItems: InsertOrderItem[]): Promise<Order>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderItemsByOrder(orderId: number): Promise<OrderItem[]>;
  updateOrderStatus(orderId: number, status: string): Promise<Order | undefined>;
  
  // Review operations
  getReviewsByProduct(productId: number): Promise<any[]>;
  createReview(review: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private testimonials: Map<number, Testimonial>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private usersCurrentId: number;
  private productsCurrentId: number;
  private categoriesCurrentId: number;
  private testimonialsCurrentId: number;
  private cartItemsCurrentId: number;
  private ordersCurrentId: number;
  private orderItemsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.testimonials = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.usersCurrentId = 1;
    this.productsCurrentId = 1;
    this.categoriesCurrentId = 1;
    this.testimonialsCurrentId = 1;
    this.cartItemsCurrentId = 1;
    this.ordersCurrentId = 1;
    this.orderItemsCurrentId = 1;
    
    // Initialize with demo data
    this.initializeData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.usersCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product operations
  async getProducts(limit = 100, offset = 0): Promise<Product[]> {
    return Array.from(this.products.values())
      .slice(offset, offset + limit);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.featured)
      .slice(0, limit);
  }

  async getProductsByCategory(categoryId: number, limit = 100, offset = 0): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.categoryId === categoryId)
      .slice(offset, offset + limit);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.nameEn.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.descriptionEn.toLowerCase().includes(searchTerm)
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productsCurrentId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct: Product = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoriesCurrentId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Testimonial operations
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialsCurrentId++;
    const newTestimonial: Testimonial = { ...testimonial, id };
    this.testimonials.set(id, newTestimonial);
    return newTestimonial;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
  }
  
  async getCartItemsWithProducts(userId: number): Promise<(CartItem & { product: Product })[]> {
    const items = await this.getCartItems(userId);
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }
      return { ...item, product };
    });
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if the item already exists in the cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === cartItem.userId && item.productId === cartItem.productId
    );
    
    if (existingItem) {
      // Update quantity
      existingItem.quantity += cartItem.quantity;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }
    
    // Add new item
    const id = this.cartItemsCurrentId++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    
    if (!cartItem) {
      return undefined;
    }
    
    const updatedCartItem: CartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const cartItems = await this.getCartItems(userId);
    
    for (const item of cartItems) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }

  // Order operations
  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Create order
    const orderId = this.ordersCurrentId++;
    const order: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date()
    };
    this.orders.set(orderId, order);
    
    // Create order items
    for (const item of items) {
      const orderItemId = this.orderItemsCurrentId++;
      const orderItem: OrderItem = {
        ...item,
        id: orderItemId,
        orderId
      };
      this.orderItems.set(orderItemId, orderItem);
    }
    
    // Clear cart
    await this.clearCart(orderData.userId);
    
    return order;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Most recent first
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(orderId);
    if (!order) {
      return undefined;
    }
    
    const updatedOrder: Order = { ...order, status };
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }

  // Initialize demo data
  private initializeData() {
    // Create categories
    const categories = [
      {
        id: 1,
        name: "Футбол",
        nameEn: "Football",
        image: "https://images.unsplash.com/photo-1552318965-6e6be7484ada?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        icon: "fa-futbol"
      },
      {
        id: 2,
        name: "Баскетбол",
        nameEn: "Basketball",
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        icon: "fa-basketball-ball"
      },
      {
        id: 3,
        name: "Тенис",
        nameEn: "Tennis",
        image: "https://pixabay.com/get/g35fbbd61b2ad0e37426f23ca7f78ba317172b475afa34e6ee1bad0bf54c03b46effdaac3f05db4df7f6905e6e8d43f1b8cc997cdd91e2ce87c8471068fdcc39d_1280.jpg",
        icon: "fa-table-tennis"
      },
      {
        id: 4,
        name: "Фитнес",
        nameEn: "Fitness",
        image: "https://images.unsplash.com/photo-1591291621164-2c6367723315?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
        icon: "fa-dumbbell"
      }
    ];
    
    categories.forEach(category => {
      this.categories.set(category.id, category);
    });
    this.categoriesCurrentId = categories.length + 1;
    
    // Create products
    const products = [
      {
        id: 1,
        name: "Баскетболни обувки Nike Air Zoom",
        nameEn: "Nike Air Zoom Basketball Shoes",
        description: "Професионални баскетболни обувки с отлична амортизация и сцепление. Идеални за игра на високо ниво.",
        descriptionEn: "Professional basketball shoes with excellent cushioning and grip. Perfect for high-level play.",
        price: 269.99,
        discountedPrice: null,
        categoryId: 2,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=350",
        rating: 4.5,
        reviewCount: 24,
        stock: 15,
        badge: "Нов",
        badgeEn: "New",
        featured: true
      },
      {
        id: 2,
        name: "Футболна топка Adidas Champions League",
        nameEn: "Adidas Champions League Football",
        description: "Официална футболна топка от Шампионската лига. Висококачествени материали и конструкция за перфектна траектория.",
        descriptionEn: "Official Champions League football. High-quality materials and construction for perfect trajectory.",
        price: 84.99,
        discountedPrice: 99.99,
        categoryId: 1,
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=350",
        rating: 5.0,
        reviewCount: 42,
        stock: 20,
        badge: "-15%",
        badgeEn: "-15%",
        featured: true
      },
      {
        id: 3,
        name: "Смарт часовник Garmin Forerunner",
        nameEn: "Garmin Forerunner Smartwatch",
        description: "Спортен часовник с GPS и множество функции за следене на физическата активност. Перфектен за бегачи и триатлонисти.",
        descriptionEn: "Sports watch with GPS and many physical activity tracking features. Perfect for runners and triathletes.",
        price: 399.99,
        discountedPrice: null,
        categoryId: 4,
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=350",
        rating: 4.0,
        reviewCount: 18,
        stock: 8,
        badge: "Нов",
        badgeEn: "New",
        featured: true
      },
      {
        id: 4,
        name: "Тенис ракета Wilson Pro Staff",
        nameEn: "Wilson Pro Staff Tennis Racket",
        description: "Професионална тенис ракета използвана от топ играчи. Перфектен баланс между мощност и контрол.",
        descriptionEn: "Professional tennis racket used by top players. Perfect balance between power and control.",
        price: 189.99,
        discountedPrice: null,
        categoryId: 3,
        image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=350",
        rating: 4.5,
        reviewCount: 36,
        stock: 5,
        badge: "Последни",
        badgeEn: "Last items",
        featured: true
      },
      {
        id: 5,
        name: "Дамски клин за фитнес Under Armour",
        nameEn: "Under Armour Women's Fitness Leggings",
        description: "Висококачествен клин за тренировки от еластична материя. Осигурява свобода на движение и комфорт.",
        descriptionEn: "High-quality workout leggings made of elastic material. Provides freedom of movement and comfort.",
        price: 79.99,
        discountedPrice: 99.99,
        categoryId: 4,
        image: "https://pixabay.com/get/g5de7cd03851f781cfb1a6afbc7434f05f65a3235ffa86b4b6e34fd917ba90be759b771efa7eecaaeb1f2955cb1dbc2aff29e4a8293e7b1e42b65588e7192683d_1280.jpg",
        rating: 5.0,
        reviewCount: 29,
        stock: 12,
        badge: "-20%",
        badgeEn: "-20%",
        featured: true
      },
      {
        id: 6,
        name: "Комплект гири за фитнес",
        nameEn: "Fitness Dumbbells Set",
        description: "Комплект от гири с различно тегло, идеални за домашни тренировки. Издръжлива конструкция и удобна дръжка.",
        descriptionEn: "Set of dumbbells with different weights, ideal for home workouts. Durable construction and comfortable grip.",
        price: 129.99,
        discountedPrice: null,
        categoryId: 4,
        image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=350",
        rating: 4.0,
        reviewCount: 52,
        stock: 8,
        badge: "Хит",
        badgeEn: "Hot",
        featured: true
      },
      {
        id: 7,
        name: "Баскетболна топка Spalding NBA",
        nameEn: "Spalding NBA Basketball",
        description: "Официална баскетболна топка на NBA. Превъзходно сцепление и контрол при дрибъл.",
        descriptionEn: "Official NBA basketball. Superior grip and control when dribbling.",
        price: 89.99,
        discountedPrice: null,
        categoryId: 2,
        image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=350",
        rating: 4.5,
        reviewCount: 48,
        stock: 15,
        badge: "Топ",
        badgeEn: "Top",
        featured: true
      },
      {
        id: 8,
        name: "Ластици за тренировка",
        nameEn: "Resistance Bands",
        description: "Комплект ластици за тренировка с различна сила на съпротивление. Идеални за тонизиране на мускулите.",
        descriptionEn: "Set of resistance bands with different resistance levels. Ideal for muscle toning.",
        price: 44.99,
        discountedPrice: 49.99,
        categoryId: 4,
        image: "https://pixabay.com/get/g6e208366c23fdac7753f1dbf08c73dd26ee08b5002b0ecfeecfd49433250a88119907e256d2b6f20f25173f84ebcb3b806efa5ca1edad342151a91a6993aa4f8_1280.jpg",
        rating: 4.0,
        reviewCount: 22,
        stock: 20,
        badge: "-10%",
        badgeEn: "-10%",
        featured: true
      },
      {
        id: 9,
        name: "Футболни обувки Nike Mercurial",
        nameEn: "Nike Mercurial Football Boots",
        description: "Професионални футболни бутонки използвани от световни звезди. Лека конструкция и отлично сцепление.",
        descriptionEn: "Professional football boots used by world stars. Lightweight construction and excellent grip.",
        price: 219.99,
        discountedPrice: null,
        categoryId: 1,
        image: "https://images.unsplash.com/photo-1511886929837-354d1276c625?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350",
        rating: 4.7,
        reviewCount: 32,
        stock: 10,
        badge: "Топ",
        badgeEn: "Top",
        featured: false
      },
      {
        id: 10,
        name: "Бягаща пътека NordicTrack",
        nameEn: "NordicTrack Treadmill",
        description: "Професионална бягаща пътека за домашна употреба. Множество програми и висока надеждност.",
        descriptionEn: "Professional treadmill for home use. Multiple programs and high reliability.",
        price: 1299.99,
        discountedPrice: 1499.99,
        categoryId: 4,
        image: "https://images.unsplash.com/photo-1570829053985-56e661df1ca2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=350",
        rating: 4.8,
        reviewCount: 15,
        stock: 3,
        badge: "-13%",
        badgeEn: "-13%",
        featured: false
      }
    ];
    
    products.forEach(product => {
      this.products.set(product.id, product);
    });
    this.productsCurrentId = products.length + 1;
    
    // Create testimonials
    const testimonials = [
      {
        id: 1,
        name: "Мария Иванова",
        title: "Футболен треньор",
        content: "Поръчах футболни топки за отбора и бях приятно изненадана от качеството и бързата доставка. Определено ще поръчвам отново!",
        image: "https://pixabay.com/get/g836036904fb127c065329ca8bb4315bdda6adc53bb222c1d1022f4d1fb44fe01a711c391b76326ce5639a7b4142a1bc8bcbe5c4ccb14ddd35ae85c2b75bc2965_1280.jpg"
      },
      {
        id: 2,
        name: "Георги Петров",
        title: "Фитнес инструктор",
        content: "Направих голяма поръчка за фитнес оборудване за залата. Всичко пристигна навреме и в перфектно състояние. Професионално обслужване!",
        image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
      },
      {
        id: 3,
        name: "Иван Димитров",
        title: "Тенисист",
        content: "Тенис ракетите, които поръчах са с отлично качество и на много добра цена. Доставката беше супер бърза - само 2 дни!",
        image: "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
      }
    ];
    
    testimonials.forEach(testimonial => {
      this.testimonials.set(testimonial.id, testimonial);
    });
    this.testimonialsCurrentId = testimonials.length + 1;
    
    // Create an admin user
    this.createUser({
      username: "admin",
      email: "admin@sportzone.bg",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
      address: "",
      city: "",
      phone: ""
    });
  }
}

// Import the DatabaseStorage
import { DatabaseStorage } from "./dbStorage";

// Export an instance of the database storage
export const storage = new DatabaseStorage();
