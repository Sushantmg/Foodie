import { useState } from "react";
import { useApp } from "../context/AppContext";
import { modifiers } from "../data/menuData";
import { formatCurrency } from "../utils/helpers";
import "./POS.css";

export default function POS() {
  const {
    menu, cart, selectedCategory, searchQuery, dispatch,
    addToCart, removeFromCart, clearCart, getCartTotal, getCartItemCount,
    placeOrder, notify, tableNumber, orderType, customers, settings,
  } = useApp();

  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("fixed");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [showModifiers, setShowModifiers] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [notes, setNotes] = useState("");

  const categories = ["All", "Appetizers", "Main Course", "Desserts", "Beverages"];

  const filteredItems = menu.filter((item) => {
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && item.available;
  });

  const subtotal = getCartTotal();
  const discountAmount = discountType === "percent" ? subtotal * (discount / 100) : discount;
  const taxable = subtotal - discountAmount;
  const tax = taxable * (settings.taxRate / 100);
  const total = taxable + tax;

  const handlePlaceOrder = () => {
    const order = placeOrder(discountAmount, paymentMethod, selectedCustomer || null);
    if (order) {
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderPlaced(false);
        setShowPayment(false);
        setDiscount(0);
        setSelectedCustomer("");
        setNotes("");
        notify(`Order #${order.id.slice(-4).toUpperCase()} placed successfully!`);
      }, 1500);
    }
  };

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
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => dispatch({ type: "SET_SEARCH", payload: e.target.value })}
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

        <div className="pos-items-grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="pos-item" onClick={() => { dispatch({ type: "ADD_TO_CART", payload: item }); }}>
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
            <select value={tableNumber} onChange={(e) => dispatch({ type: "SET_TABLE", payload: Number(e.target.value) })}>
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Table {i + 1}</option>
              ))}
            </select>
          )}
        </div>

        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="pos-empty-cart">
              <span>🛒</span>
              <p>No items yet</p>
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
                    <button onClick={() => removeFromCart(item.id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => dispatch({ type: "ADD_TO_CART", payload: item })}>+</button>
                  </div>
                  <span className="pci-price">{formatCurrency((item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) * item.quantity)}</span>
                  <button className="pci-mod-btn" onClick={() => setShowModifiers(item.id)} title="Add modifier">+</button>
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
              <div className="sum-row">
                <span>Discount</span>
                <span className="discount-val">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="sum-row">
                <span>Tax ({settings.taxRate}%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="sum-row total">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {!showPayment ? (
              <button className="checkout-btn" onClick={() => setShowPayment(true)}>
                Proceed to Payment
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
                    />
                    <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                      <option value="fixed">Fixed</option>
                      <option value="percent">%</option>
                    </select>
                  </div>
                </div>
                <div className="pay-row">
                  <label>Customer:</label>
                  <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
                    <option value="">Walk-in</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.tier})</option>
                    ))}
                  </select>
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
    </div>
  );
}
