import { createContext, useContext, useReducer, useEffect } from "react";
import { storage, generateId } from "../utils/helpers";
import { defaultUsers } from "../data/users";
import { menuData } from "../data/menuData";
import { defaultCustomers } from "../data/customers";
import { defaultSettings } from "../data/settings";

const AppContext = createContext();

const initialState = {
  currentUser: storage.get("currentUser"),
  users: storage.get("users", defaultUsers),
  menu: storage.get("menu", menuData),
  cart: [],
  orders: storage.get("orders", []),
  customers: storage.get("customers", defaultCustomers),
  settings: storage.get("settings", defaultSettings),
  tables: storage.get("tables", Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    status: "available",
    orderId: null,
  }))),
  activeTab: "pos",
  selectedCategory: "All",
  searchQuery: "",
  tableNumber: 1,
  orderType: "dine-in",
  notification: null,
  darkMode: storage.get("darkMode", false),
};

function appReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { ...state, currentUser: action.payload };

    case "LOGOUT":
      return { ...state, currentUser: null, cart: [], activeTab: "pos" };

    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };

    case "SET_CATEGORY":
      return { ...state, selectedCategory: action.payload };

    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload };

    case "SET_TABLE":
      return { ...state, tableNumber: action.payload };

    case "SET_ORDER_TYPE":
      return { ...state, orderType: action.payload };

    // Cart
    case "ADD_TO_CART": {
      const item = action.payload;
      const existing = state.cart.find((c) => c.id === item.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((c) =>
            c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
          ),
        };
      }
      return { ...state, cart: [...state.cart, { ...item, quantity: 1, modifiers: [] }] };
    }

    case "REMOVE_FROM_CART": {
      const existing = state.cart.find((c) => c.id === action.payload);
      if (existing && existing.quantity > 1) {
        return {
          ...state,
          cart: state.cart.map((c) =>
            c.id === action.payload ? { ...c, quantity: c.quantity - 1 } : c
          ),
        };
      }
      return { ...state, cart: state.cart.filter((c) => c.id !== action.payload) };
    }

    case "ADD_MODIFIER": {
      const { itemId, modifier } = action.payload;
      return {
        ...state,
        cart: state.cart.map((c) =>
          c.id === itemId
            ? { ...c, modifiers: [...c.modifiers, modifier] }
            : c
        ),
      };
    }

    case "REMOVE_MODIFIER": {
      const { itemId, modifierId } = action.payload;
      return {
        ...state,
        cart: state.cart.map((c) =>
          c.id === itemId
            ? { ...c, modifiers: c.modifiers.filter((m) => m.id !== modifierId) }
            : c
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, cart: [] };

    case "APPLY_DISCOUNT":
      return { ...state, cartDiscount: action.payload };

    // Orders
    case "PLACE_ORDER": {
      const order = action.payload;
      const newTables = state.tables.map((t) =>
        t.number === state.tableNumber && state.orderType === "dine-in"
          ? { ...t, status: "occupied", orderId: order.id }
          : t
      );
      return {
        ...state,
        orders: [order, ...state.orders],
        cart: [],
        tables: newTables,
        cartDiscount: null,
      };
    }

    case "UPDATE_ORDER_STATUS": {
      const { orderId, status } = action.payload;
      const updatedOrders = state.orders.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      let newTables = state.tables;
      if (status === "completed" || status === "cancelled") {
        const completedOrder = state.orders.find((o) => o.id === orderId);
        if (completedOrder) {
          newTables = state.tables.map((t) =>
            t.orderId === orderId
              ? { ...t, status: "available", orderId: null }
              : t
          );
        }
      }
      return { ...state, orders: updatedOrders, tables: newTables };
    }

    // Users
    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] };

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
      };

    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
      };

    // Menu
    case "UPDATE_MENU_ITEM":
      return {
        ...state,
        menu: state.menu.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      };

    case "ADD_MENU_ITEM":
      return { ...state, menu: [...state.menu, action.payload] };

    case "DELETE_MENU_ITEM":
      return { ...state, menu: state.menu.filter((m) => m.id !== action.payload) };

    // Customers
    case "ADD_CUSTOMER":
      return { ...state, customers: [...state.customers, action.payload] };

    case "UPDATE_CUSTOMER":
      return {
        ...state,
        customers: state.customers.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case "DELETE_CUSTOMER":
      return {
        ...state,
        customers: state.customers.filter((c) => c.id !== action.payload),
      };

    // Settings
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };

    // Notification
    case "SHOW_NOTIFICATION":
      return { ...state, notification: action.payload };

    case "CLEAR_NOTIFICATION":
      return { ...state, notification: null };

    // Dark mode
    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist state changes
  useEffect(() => {
    storage.set("currentUser", state.currentUser);
  }, [state.currentUser]);

  useEffect(() => {
    storage.set("users", state.users);
  }, [state.users]);

  useEffect(() => {
    storage.set("menu", state.menu);
  }, [state.menu]);

  useEffect(() => {
    storage.set("orders", state.orders);
  }, [state.orders]);

  useEffect(() => {
    storage.set("customers", state.customers);
  }, [state.customers]);

  useEffect(() => {
    storage.set("settings", state.settings);
  }, [state.settings]);

  useEffect(() => {
    storage.set("tables", state.tables);
  }, [state.tables]);

  useEffect(() => {
    storage.set("darkMode", state.darkMode);
    document.body.classList.toggle("dark", state.darkMode);
  }, [state.darkMode]);

  // Auto-clear notifications
  useEffect(() => {
    if (state.notification) {
      const timer = setTimeout(() => dispatch({ type: "CLEAR_NOTIFICATION" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [state.notification]);

  const login = (email, password) => {
    const user = state.users.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      dispatch({ type: "LOGIN", payload: user });
      return { success: true, user };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const logout = () => dispatch({ type: "LOGOUT" });

  const clearCart = () => dispatch({ type: "CLEAR_CART" });

  const addToCart = (item) => dispatch({ type: "ADD_TO_CART", payload: item });

  const removeFromCart = (itemId) => dispatch({ type: "REMOVE_FROM_CART", payload: itemId });

  const notify = (message, type = "success") => {
    dispatch({ type: "SHOW_NOTIFICATION", payload: { message, type } });
  };

  const getCartTotal = () => {
    const subtotal = state.cart.reduce(
      (sum, item) => sum + item.price * item.quantity, 0
    );
    const modifiersTotal = state.cart.reduce(
      (sum, item) => sum + item.modifiers.reduce((ms, m) => ms + m.price, 0) * item.quantity, 0
    );
    return subtotal + modifiersTotal;
  };

  const getCartItemCount = () => {
    return state.cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const placeOrder = (discount = 0, paymentMethod = "cash", customerId = null, notes = "") => {
    if (state.cart.length === 0) return null;

    // Block ordering on occupied tables
    if (state.orderType === "dine-in") {
      const table = state.tables.find((t) => t.number === state.tableNumber);
      if (table && table.status === "occupied") {
        return null;
      }
    }
    const subtotal = getCartTotal();
    const discountAmount = discount;
    const taxable = subtotal - discountAmount;
    const tax = taxable * (state.settings.taxRate / 100);
    const total = taxable + tax;

    const order = {
      id: generateId(),
      items: state.cart.map((item) => ({
        ...item,
        modifierTotal: item.modifiers.reduce((ms, m) => ms + m.price, 0),
      })),
      subtotal,
      discount: discountAmount,
      tax,
      total,
      table: state.tableNumber,
      type: state.orderType,
      status: "preparing",
      paymentMethod,
      customerId,
      notes,
      createdBy: state.currentUser?.id,
      createdByName: state.currentUser?.name,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: "PLACE_ORDER", payload: order });

    // Update stock
    state.cart.forEach((item) => {
      const menuItem = state.menu.find((m) => m.id === item.id);
      if (menuItem) {
        dispatch({
          type: "UPDATE_MENU_ITEM",
          payload: { ...menuItem, stock: Math.max(0, menuItem.stock - item.quantity) },
        });
      }
    });

    // Update loyalty points
    if (customerId && state.settings.enableLoyalty) {
      const customer = state.customers.find((c) => c.id === customerId);
      if (customer) {
        const points = Math.floor(total * state.settings.pointsPerDollar);
        let tier = "bronze";
        const totalPoints = customer.loyaltyPoints + points;
        if (totalPoints >= 1000) tier = "platinum";
        else if (totalPoints >= 300) tier = "gold";
        else if (totalPoints >= 100) tier = "silver";

        dispatch({
          type: "UPDATE_CUSTOMER",
          payload: {
            ...customer,
            loyaltyPoints: totalPoints,
            totalSpent: customer.totalSpent + total,
            visits: customer.visits + 1,
            tier,
          },
        });
      }
    }

    return order;
  };

  const value = {
    ...state,
    dispatch,
    login,
    logout,
    clearCart,
    addToCart,
    removeFromCart,
    notify,
    getCartTotal,
    getCartItemCount,
    placeOrder,
    isAdmin: state.currentUser?.role === "admin",
    isManager: state.currentUser?.role === "manager" || state.currentUser?.role === "admin",
    isStaff: state.currentUser?.role === "staff",
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
