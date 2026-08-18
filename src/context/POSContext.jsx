import { createContext, useContext, useState, useCallback } from "react";

const POSContext = createContext();

export function POSProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("pos");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [tableNumber, setTableNumber] = useState(1);
  const [orderType, setOrderType] = useState("dine-in");

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) =>
          c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter((c) => c.id !== itemId);
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const placeOrder = useCallback(() => {
    if (cart.length === 0) return null;
    const order = {
      id: Date.now(),
      items: [...cart],
      total: getCartTotal(),
      table: tableNumber,
      type: orderType,
      status: "preparing",
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    return order;
  }, [cart, tableNumber, orderType, getCartTotal]);

  const updateOrderStatus = useCallback((orderId, status) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }, []);

  return (
    <POSContext.Provider
      value={{
        cart,
        orders,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        tableNumber,
        setTableNumber,
        orderType,
        setOrderType,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartItemCount,
        placeOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) throw new Error("usePOS must be used within POSProvider");
  return context;
}
