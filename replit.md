# SportZone E-commerce Platform

## Overview

SportZone is a full-stack e-commerce application that offers sports equipment and gear. The application is built with a React frontend and an Express backend, using Drizzle ORM for database operations. It features user authentication, product browsing, shopping cart functionality, checkout process, and an admin panel for product management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework**: React with TypeScript
- **UI Components**: Uses shadcn/ui component library (based on Radix UI primitives)
- **Styling**: TailwindCSS with custom theme configuration
- **State Management**: 
  - React Context API for auth and cart state
  - TanStack React Query for data fetching and server state management
- **Routing**: Uses Wouter for lightweight client-side routing

### Backend

- **Server**: Express.js with TypeScript
- **API Design**: RESTful API structure with clearly defined endpoints
- **Authentication**: Session-based authentication with Passport.js
- **Session Storage**: In-memory session store (memorystore)

### Database

- **ORM**: Drizzle ORM
- **Schema Design**: Structured for e-commerce with users, products, categories, cart items, orders
- **Validation**: Uses Zod with drizzle-zod for schema validation

### File Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── context/       # React context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and constants
│   │   ├── pages/         # Page components
│   │   └── main.tsx       # Entry point
├── server/                # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data access layer
│   └── vite.ts            # Development server setup
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database schema definitions
```

## Key Components

### Authentication System

- Uses Passport.js with a local username/password strategy
- Session-based authentication with HTTP-only cookies
- User registration, login, and profile management functionality
- Role-based authorization (admin vs regular user)

### Product Catalog

- Hierarchical categorization of products
- Product search and filtering capabilities
- Product detail views with image galleries and detailed descriptions
- Featured products and promotional sections

### Shopping Cart

- Real-time cart management (add, update, remove items)
- Cart persistence between sessions for logged-in users
- Cart summary with product details and totals

### Checkout System

- Multi-step checkout process
- Order history tracking
- Multiple payment method options

### Admin Panel

- Product and inventory management
- Order management and fulfillment
- User management

## Data Flow

1. **User Authentication Flow**:
   - User submits login credentials
   - Server validates credentials and creates a session
   - Session ID stored in HTTP-only cookie
   - Client uses React Query to fetch protected resources using the session cookie

2. **Product Browsing Flow**:
   - Client fetches categories and featured products on homepage
   - User can navigate to category pages or search for products
   - Product details loaded on demand when a user selects a product

3. **Cart Management Flow**:
   - User adds items to cart, which sends requests to the server API
   - Cart state is managed through React Context and synced with the server
   - Cart items are persisted in the database for logged-in users

4. **Checkout Flow**:
   - User proceeds to checkout from the cart
   - Shipping and payment information collection
   - Order creation and confirmation
   - Inventory update

## External Dependencies

### Frontend Dependencies
- **@radix-ui/react-*****: UI component primitives
- **@tanstack/react-query**: Data fetching and server state management
- **@hookform/resolvers**: Form validation with React Hook Form
- **wouter**: Lightweight client-side routing
- **clsx & tailwind-merge**: Utility-first styling tools

### Backend Dependencies
- **express**: Web server framework
- **passport & passport-local**: Authentication middleware
- **bcryptjs**: Password hashing
- **express-session & memorystore**: Session management
- **drizzle-orm**: TypeScript ORM
- **zod**: Schema validation

## Deployment Strategy

The application is configured for deployment through Replit with:

1. **Build Process**:
   - Vite builds the React frontend into static assets
   - The Express server is bundled using esbuild

2. **Runtime Configuration**:
   - Production mode uses the built static assets
   - Development mode uses Vite's development server with HMR

3. **Database Connection**:
   - Configured to connect to PostgreSQL database
   - Environment variables control database connection parameters

4. **Scaling Considerations**:
   - Deployment target is set to "autoscale" in Replit configuration
   - HTTP requests are served at port 5000 internally, mapped to port 80 externally

## Development Workflow

1. **Local Development**:
   - `npm run dev` starts both the frontend dev server and backend
   - Changes to React components are hot-reloaded
   - Backend changes require server restart

2. **Database Migrations**:
   - `npm run db:push` applies schema changes to the database
   - Drizzle ORM handles schema migrations

3. **Production Build**:
   - `npm run build` creates optimized builds of both frontend and backend
   - `npm run start` runs the application in production mode