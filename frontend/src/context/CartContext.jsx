import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CART_KEY = "ftk_cart";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(
        item =>
          item.product_variants_id === product.product_variants_id &&
          item.color === product.color &&
          item.size === product.size
      );

      if (existing) {
        return prev.map(item =>
          item === existing
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity,
          product_variants_id: product.product_variants_id,
        }
      ];
    });
  };

  const removeFromCart = (product) => {
    setCart(prev =>
      prev.filter(item => !(item.id === product.id && item.color === product.color && item.size === product.size))
    );
  };

  const updateQuantity = (product, quantity) => {
    setCart(prev =>
      prev.map(item =>
        item.id === product.id && item.color === product.color && item.size === product.size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
