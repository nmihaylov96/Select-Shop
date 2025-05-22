import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Category from "@/pages/Category";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import MyOrders from "@/pages/MyOrders";
import Admin from "@/pages/Admin";
import Checkout from "@/pages/Checkout";
import PaymentConfirmation from "@/pages/PaymentConfirmation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import SearchOverlay from "@/components/search/SearchOverlay";
import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/products" component={Products} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/category/:id" component={Category} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      <Route path="/my-orders" component={MyOrders} />
      <Route path="/admin" component={Admin} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment-confirmation" component={PaymentConfirmation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="font-body text-dark bg-light antialiased min-h-screen flex flex-col">
        <Header 
          onCartClick={() => setIsCartOpen(true)} 
          onSearchClick={() => setIsSearchOpen(true)} 
        />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
        <CartSidebar 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)} 
        />
        <SearchOverlay 
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)} 
        />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
