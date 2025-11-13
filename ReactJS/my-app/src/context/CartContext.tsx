import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  productImage?: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  stock: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('shoppingCart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const itemId = `${item.productId}-${item.size}-${item.color}`;
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === itemId);
      
      if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = Math.min(existingItem.quantity + item.quantity, item.stock);
        return prevItems.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...item, id: itemId }];
      }
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const maxQuantity = Math.min(quantity, item.stock);
          return { ...item, quantity: maxQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
