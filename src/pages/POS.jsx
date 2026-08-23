import { useState, useEffect, useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { modifiers } from "../data/menuData";
import { formatCurrency } from "../utils/helpers";
import { playOrderPlaced } from "../utils/sounds";
import "./POS.css";

export default function POS() {
  const {
    menu, cart, selectedCategory, searchQuery, dispatch,
    addToCart, removeFromCart, clearCart, getCartTotal, getCartItemCount,
    placeOrder, notify, tableNumber, orderType, customers, settings, tables,
  } = useApp();

  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("fixed");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [showModifiers, setShowModifiers] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [showTables, setShowTables] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const categories = ["All", "Appetizers", "Main Course", "Desserts", "Beverages"];

  const currentTable = tables.find((t) => t.number === tableNumber);
  const isCurrentTableOccupied = orderType === "dine-in" && currentTable?.status === "occupied";

  useEffect(() => {
    if (isCurrentTableOccupied && orderType === "dine-in") {
      const available = tables.find((t) => t.status === "available");
      if (available) {
        dispatch({ type: "SET_TABLE", payload: available.number });
        notify("Table " + tableNumber + " is occupied. Switched to Table " + available.number, "warning");
      } else {
        dispatch({ type: "SET_ORDER_TYPE", payload: "takeaway" });
        notify("All tables occupied. Switched to Takeaway", "warning");
      }
    }
  }, [isCurrentTableOccupied]);

  const filteredItems = menu.filter((item) => {
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && item.available;
  });

  // Compute popular items from order history
  const popularItems = useMemo(() => {
    const counts = {};
    orders.forEach((o) => o.items.forEach((item) => {
      if (!counts[item.id]) counts[item.id] = { item, count: 0 };
      counts[item.id].count += item.quantity;
    }));
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 5).map((c) => c.item);
  }, [orders]);

  // Customer phone lookup
  const handlePhoneSearch = (phone) => {
    setPhoneSearch(phone);
    if (phone.length >= 3) {
      const found = customers.find((c) => c.phone?.includes(phone) || c.name?.toLowerCase().includes(phone.toLowerCase()));
      setFoundCustomer(found || null);
      if (found) {
        setSelectedCustomer(found.id);
        notify(`Found: ${found.name} (${found.tier})`);
      }
    } else {
      setFoundCustomer(null);
      setSelectedCustomer("");
    }
  };

  const subtotal = getCartTotal();
  const discountAmount = discountType === "percent" ? subtotal * (discount / 100) : discount;
  const taxable = subtotal - discountAmount;
  const tax = taxable * (settings.taxRate / 100);
  const total = taxable + tax;

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    if (e.key === "F1") { e.preventDefault(); dispatch({ type: "SET_ACTIVE_TAB", payload: "pos" }); }
    if (e.key === "F2") { e.preventDefault(); dispatch({ type: "SET_ACTIVE_TAB", payload: "orders" }); }
    if (e.key === "F3") { e.preventDefault(); dispatch({ type: "SET_ACTIVE_TAB", payload: "dashboard" }); }
    if (e.key === "F4") { e.preventDefault(); setShowTables(!showTables); }
    if (e.key === "Escape") {
      setShowPayment(false);
      setShowModifiers(null);
      setShowTables(false);
    }
    if (e.ctrlKey && e.key === "Enter" && cart.length > 0) {
      e.preventDefault();
      setShowPayment(true);
    }
  }, [dispatch, showTables, cart.length]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handlePlaceOrder = () => {
    const order = placeOrder(discountAmount, paymentMethod, selectedCustomer || null, orderNotes);
    if (order) {
      // Add notes to the order
      if (orderNotes) {
        dispatch({
          type: "UPDATE_ORDER_STATUS",
          payload: { orderId: order.id, status: "preparing" },
        });
      }
      setOrderPlaced(true);
      playOrderPlaced();
      setTimeout(() => {
        setOrderPlaced(false);
        setShowPayment(false);
        setDiscount(0);
        setSelectedCustomer("");
        setOrderNotes("");
        setPhoneSearch("");
        setFoundCustomer(null);
        notify(`Order #${order.id.slice(-4).toUpperCase()} placed successfully!`);
      }, 1500);
    }
  };

  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const availableTables = tables.filter((t) => t.status === "available").length;

  if (orderPlaced) {
    return (
      <div className="pos-order-success">
        <div className="success-content">
          <span className="success-check">✅</span>
          <h2>Order Placed!</h2>
          <p>Sent to kitchen successfully</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pos">
      <div className="pos-menu">
        <div className="pos-menu-header">
          <div className="pos-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search menu... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
              autoFocus
            />
          </div>
          <div className="pos-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-btn ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => dispatch({ type: "SET_CATEGORY", payload: cat })}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {popularItems.length > 0 && (
          <div className="pos-popular-bar">
            <span className="popular-label">⭐ Popular:</span>
            {popularItems.map((item) => (
              <button key={item.id} className="popular-item-btn" onClick={() => addToCart(item)}>
                {item.image} {item.name}
              </button>
            ))}
          </div>
        )}

        <div className="pos-items-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="pos-item" onClick={() => addToCart(item)}>
              <div className="pos-item-top">
                <span className="pos-item-img">{item.image}</span>
                {item.stock <= settings.lowStockThreshold && (
                  <span className={`stock-badge ${item.stock === 0 ? "out" : "low"}`}>
                    {item.stock === 0 ? "OUT" : `${item.stock} left`}
                  </span>
                )}
              </div>
              <div className="pos-item-info">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <div className="pos-item-bottom">
                  <span className="pos-item-price">{formatCurrency(item.price)}</span>
                  <button className="pos-add-btn" disabled={item.stock === 0}>+</button>
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="pos-no-items">
              <span>🔍</span>
              <p>No items found</p>
            </div>
          )}
        </div>
      </div>

      <div className="pos-cart">
        <div className="pos-cart-header">
          <h3>Current Order</h3>
          {cart.length > 0 && <button className="clear-btn" onClick={clearCart}>Clear</button>}
        </div>

        <div className="pos-cart-config">
          <select value={orderType} onChange={(e) => dispatch({ type: "SET_ORDER_TYPE", payload: e.target.value })}>
            <option value="dine-in">🍽️ Dine-In</option>
            <option value="takeaway">📦 Takeaway</option>
            <option value="delivery">🚗 Delivery</option>
          </select>
          {orderType === "dine-in" && (
            <>
              <select value={tableNumber} onChange={(e) => dispatch({ type: "SET_TABLE", payload: Number(e.target.value) })}>
                {[...Array(20)].map((_, i) => {
                  const table = tables.find((t) => t.number === i + 1);
                  const isOccupied = table?.status === "occupied";
                  return (
                    <option key={i + 1} value={i + 1} disabled={isOccupied}>
                      Table {i + 1} {isOccupied ? "🔴 OCCUPIED" : "🟢 Available"}
                    </option>
                  );
                })}
              </select>
              {isCurrentTableOccupied && (
                <span className="table-occupied-badge">⚠️ Table {tableNumber} is in use</span>
              )}
            </>
          )}
        </div>

        {/* Table Status Mini View */}
        {orderType === "dine-in" && showTables && (
          <div className="pos-tables-mini">
            <div className="ptm-header">
              <span>Table Status</span>
              <button onClick={() => setShowTables(false)}>✕</button>
            </div>
            <div className="ptm-grid">
              {tables.map((table) => (
                <button
                  key={table.number}
                  className={`ptm-table ${table.status} ${table.number === tableNumber ? "selected" : ""}`}
                  onClick={() => {
                    if (table.status === "available") {
                      dispatch({ type: "SET_TABLE", payload: table.number });
                    }
                  }}
                  disabled={table.status === "occupied" && table.number !== tableNumber}
                >
                  <span>{table.number}</span>
                  <span className="ptm-dot" />
                </button>
              ))}
            </div>
            <div className="ptm-legend">
              <span><span className="ptm-dot available" /> Available ({availableTables})</span>
              <span><span className="ptm-dot occupied" /> Occupied ({occupiedTables})</span>
            </div>
          </div>
        )}

        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="pos-empty-cart">
              <span>🛒</span>
              <p>No items yet</p>
              <p className="pos-empty-hint">Click items from the menu to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="pos-cart-item">
                <div className="pci-top">
                  <span className="pci-img">{item.image}</span>
                  <div className="pci-info">
                    <h4>{item.name}</h4>
                    {item.modifiers.length > 0 && (
                      <div className="pci-mods">
                        {item.modifiers.map((m) => (
                          <span key={m.id} className="pci-mod">
                            {m.name} {m.price > 0 ? `+${formatCurrency(m.price)}` : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pci-bottom">
                  <div className="pci-controls">
                    <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={(e) => { e.stopPropagation(); addToCart(item); }}>+</button>
                  </div>
                  <span className="pci-price">{formatCurrency((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity)}</span>
                  <button className="pci-mod-btn" onClick={(e) => { e.stopPropagation(); setShowModifiers(item.id); }} title="Add modifier">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="pos-cart-footer">
            <div className="pos-summary">
              <div className="sum-row">
                <span>Items ({getCartItemCount()})</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="sum-row">
                  <span>Discount</span>
                  <span className="discount-val">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="sum-row">
                <span>Tax ({settings.taxRate}%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="sum-row total">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {isCurrentTableOccupied ? (
              <div className="occupied-warning">
                <span>⚠️ Table {tableNumber} is occupied. Select an available table to place order.</span>
              </div>
            ) : !showPayment ? (
              <button className="checkout-btn" onClick={() => setShowPayment(true)}>
                Proceed to Payment (Ctrl+Enter)
              </button>
            ) : (
              <div className="payment-section">
                <div className="pay-row">
                  <label>Discount:</label>
                  <div className="discount-input">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      min="0"
                      placeholder="0"
                    />
                    <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                      <option value="fixed">$</option>
                      <option value="percent">%</option>
                    </select>
                  </div>
                </div>
                <div className="pay-row">
                  <label>Customer:</label>
                  <div className="customer-lookup">
                    <input
                      type="text"
                      placeholder="Search by name or phone..."
                      value={foundCustomer ? foundCustomer.name : phoneSearch}
                      onChange={(e) => handlePhoneSearch(e.target.value)}
                      className="phone-search-input"
                    />
                    {foundCustomer && (
                      <span className="customer-found-badge">{foundCustomer.tier}</span>
                    )}
                  </div>
                </div>
                <div className="pay-row">
                  <label></label>
                  <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                    <option value="">Walk-in</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
                    ))}
                  </select>
                </div>
                <div className="pay-row">
                  <label>Notes:</label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Special instructions..."
                    className="notes-input"
                  />
                </div>
                <div className="pay-methods">
                  {["cash", "card", "upi"].map((m) => (
                    <button
                      key={m}
                      className={`pay-method ${paymentMethod === m ? "active" : ""}`}
                      onClick={() => setPaymentMethod(m)}
                    >
                      {m === "cash" ? "💵 Cash" : m === "card" ? "💳 Card" : "📱 UPI"}
                    </button>
                  ))}
                </div>
                <button className="pay-btn" onClick={handlePlaceOrder}>
                  Pay {formatCurrency(total)}
                </button>
                <button className="cancel-pay" onClick={() => setShowPayment(false)}>Cancel</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModifiers && (
        <div className="modifiers-overlay" onClick={() => setShowModifiers(null)}>
          <div className="modifiers-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Modifiers</h3>
            <div className="modifiers-list">
              {modifiers.map((mod) => {
                const cartItem = cart.find((c) => c.id === showModifiers);
                const isActive = cartItem?.modifiers.some((m) => m.id === mod.id);
                return (
                  <button
                    key={mod.id}
                    className={`mod-btn ${isActive ? "active" : ""}`}
                    onClick={() => {
                      if (isActive) {
                        dispatch({ type: "REMOVE_MODIFIER", payload: { itemId: showModifiers, modifierId: mod.id } });
                      } else {
                        dispatch({ type: "ADD_MODIFIER", payload: { itemId: showModifiers, modifier: mod } });
                      }
                    }}
                  >
                    <span>{mod.name}</span>
                    <span>{mod.price > 0 ? `+${formatCurrency(mod.price)}` : "Free"}</span>
                  </button>
                );
              })}
            </div>
            <button className="mod-close" onClick={() => setShowModifiers(null)}>Done</button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="pos-shortcuts-hint">
        <span title="F1: POS">F1</span>
        <span title="F2: Orders">F2</span>
        <span title="F3: Dashboard">F3</span>
        <span title="F4: Tables">F4</span>
        <span title="Ctrl+Enter: Checkout">⌘↵</span>
      </div>
    </div>
  );
}
