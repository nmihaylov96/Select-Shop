import { db } from "./db";
import { 
  users, 
  categories, 
  products, 
  testimonials 
} from "@shared/schema";
import * as bcrypt from 'bcryptjs';

async function initializeDatabase() {
  console.log("Initializing database with sample data...");

  // Create initial categories
  const categoriesData = [
    { 
      name: 'Футбол', 
      nameEn: 'Football',
      image: 'https://images.unsplash.com/photo-1553778263-73a83c0d6fa2',
      icon: 'fa-futbol'
    },
    { 
      name: 'Баскетбол', 
      nameEn: 'Basketball',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
      icon: 'fa-basketball-ball'
    },
    { 
      name: 'Тенис', 
      nameEn: 'Tennis',
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0',
      icon: 'fa-table-tennis'
    },
    { 
      name: 'Фитнес', 
      nameEn: 'Fitness',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b',
      icon: 'fa-dumbbell'
    },
  ];

  console.log("Creating categories...");
  await db.insert(categories).values(categoriesData);

  // Get the inserted categories to get their IDs
  const categoryRecords = await db.select().from(categories);
  console.log(`Created ${categoryRecords.length} categories`);

  // Map of category names to IDs
  const categoryMap = new Map();
  categoryRecords.forEach(category => {
    categoryMap.set(category.name, category.id);
  });

  // Create initial products
  const productsData = [
    {
      name: 'Баскетболни обувки Nike Air Jordan XXXVI',
      nameEn: 'Nike Air Jordan XXXVI Basketball Shoes',
      description: 'Баскетболни обувки Nike Air Jordan XXXVI с лека и дишаща конструкция за максимално представяне на игрището.',
      descriptionEn: 'Nike Air Jordan XXXVI Basketball Shoes with lightweight and breathable construction for maximum on-court performance.',
      price: 219.99,
      discountedPrice: 189.99,
      categoryId: categoryMap.get('Баскетбол'),
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      stock: 15,
      badge: 'Нов',
      badgeEn: 'New',
      rating: 4.8,
      featured: true
    },
    {
      name: 'Футболна топка Adidas Champions League',
      nameEn: 'Adidas Champions League Football',
      description: 'Официална футболна топка Adidas Champions League с термично залепена конструкция за отлично докосване и контрол.',
      descriptionEn: 'Official Adidas Champions League football with thermally bonded construction for excellent touch and control.',
      price: 89.99,
      discountedPrice: null,
      categoryId: categoryMap.get('Футбол'),
      image: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd',
      stock: 25,
      badge: null,
      badgeEn: null,
      rating: 4.9,
      featured: true
    },
    {
      name: 'Тенис ракета Wilson Pro Staff RF97',
      nameEn: 'Wilson Pro Staff RF97 Tennis Racket',
      description: 'Тенис ракета Wilson Pro Staff RF97, проектирана с Роджър Федерер за изключителен контрол и прецизност.',
      descriptionEn: 'Wilson Pro Staff RF97 Tennis Racket, designed with Roger Federer for exceptional control and precision.',
      price: 259.99,
      discountedPrice: 229.99,
      categoryId: categoryMap.get('Тенис'),
      image: 'https://images.unsplash.com/photo-1617083934777-ae3cff06b4ab',
      stock: 8,
      badge: 'Разпродажба',
      badgeEn: 'Sale',
      rating: 4.7,
      featured: true
    },
    {
      name: 'Фитнес гривна Fitbit Charge 5',
      nameEn: 'Fitbit Charge 5 Fitness Tracker',
      description: 'Фитнес гривна Fitbit Charge 5 с GPS, непрекъснато следене на сърдечния ритъм и данни за вашето здраве.',
      descriptionEn: 'Fitbit Charge 5 Fitness Tracker with GPS, continuous heart rate monitoring, and health metrics.',
      price: 179.99,
      discountedPrice: 149.99,
      categoryId: categoryMap.get('Фитнес'),
      image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6',
      stock: 20,
      badge: null,
      badgeEn: null,
      rating: 4.6,
      featured: true
    },
    {
      name: 'Футболни обувки Nike Mercurial Vapor',
      nameEn: 'Nike Mercurial Vapor Football Boots',
      description: 'Футболни обувки Nike Mercurial Vapor, проектирани за скорост с иновативна система за сцепление и лека конструкция.',
      descriptionEn: 'Nike Mercurial Vapor Football Boots, designed for speed with innovative traction system and lightweight construction.',
      price: 199.99,
      discountedPrice: null,
      categoryId: categoryMap.get('Футбол'),
      image: 'https://images.unsplash.com/photo-1511886929837-354984b71424',
      stock: 12,
      badge: null,
      badgeEn: null,
      rating: 4.5,
      featured: false
    },
    {
      name: 'Баскетболна топка Spalding NBA',
      nameEn: 'Spalding NBA Basketball',
      description: 'Официална баскетболна топка Spalding NBA с отлично сцепление и дълготрайност за всички нива на игра.',
      descriptionEn: 'Official Spalding NBA Basketball with excellent grip and durability for all levels of play.',
      price: 69.99,
      discountedPrice: 59.99,
      categoryId: categoryMap.get('Баскетбол'),
      image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf',
      stock: 18,
      badge: null,
      badgeEn: null,
      rating: 4.7,
      featured: false
    },
    {
      name: 'Тенис обувки Asics Gel-Resolution 8',
      nameEn: 'Asics Gel-Resolution 8 Tennis Shoes',
      description: 'Тенис обувки Asics Gel-Resolution 8 с DYNAWALL технология за стабилност и FlyteFoam амортисьори за комфорт.',
      descriptionEn: 'Asics Gel-Resolution 8 Tennis Shoes with DYNAWALL technology for stability and FlyteFoam cushioning for comfort.',
      price: 149.99,
      discountedPrice: null,
      categoryId: categoryMap.get('Тенис'),
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa',
      stock: 10,
      badge: null,
      badgeEn: null,
      rating: 4.6,
      featured: false
    },
    {
      name: 'Фитнес постелка Nike',
      nameEn: 'Nike Fitness Mat',
      description: 'Фитнес постелка Nike с нехлъзгаща се повърхност и оптимална плътност за всички видове тренировки.',
      descriptionEn: 'Nike Fitness Mat with non-slip surface and optimal density for all types of workouts.',
      price: 49.99,
      discountedPrice: 39.99,
      categoryId: categoryMap.get('Фитнес'),
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      stock: 22,
      badge: 'Разпродажба',
      badgeEn: 'Sale',
      rating: 4.4,
      featured: false
    },
  ];

  console.log("Creating products...");
  await db.insert(products).values(productsData);
  console.log(`Created ${productsData.length} products`);

  // Create initial testimonials
  const testimonialsData = [
    {
      name: 'Мария Иванова',
      title: 'Футболист',
      content: 'Страхотни продукти за футбол! Купих футболни обувки Nike Mercurial и съм много доволна от качеството и комфорта.',
      image: 'https://randomuser.me/api/portraits/women/11.jpg'
    },
    {
      name: 'Георги Петров',
      title: 'Баскетболист',
      content: 'Баскетболните топки Spalding са най-добрите на пазара! Доставката беше бърза и обслужването отлично.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Александра Димитрова',
      title: 'Фитнес инструктор',
      content: 'Като фитнес инструктор, редовно пазарувам от SportZone. Техните фитнес аксесоари са с високо качество и на добри цени.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
  ];

  console.log("Creating testimonials...");
  await db.insert(testimonials).values(testimonialsData);
  console.log(`Created ${testimonialsData.length} testimonials`);

  // Create test users
  const hashedPassword = await bcrypt.hash('password', 10);
  const usersData = [
    {
      username: 'admin',
      email: 'admin@sportzone.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      address: null,
      city: null,
      phone: null,
      isAdmin: true
    },
    {
      username: 'user',
      email: 'user@example.com',
      password: hashedPassword,
      firstName: 'Regular',
      lastName: 'User',
      address: 'Ul. Ivan Vazov 12',
      city: 'София',
      phone: '+359888123456',
      isAdmin: false
    },
  ];

  console.log("Creating users...");
  await db.insert(users).values(usersData);
  console.log(`Created ${usersData.length} users`);

  console.log("Database initialization completed successfully!");
}

// Run the initialization
initializeDatabase()
  .catch(error => {
    console.error("Error initializing database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });