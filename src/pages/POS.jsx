import { useState, useEffect, useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { modifiers } from "../data/menuData";
import { formatCurrency, formatTime } from "../utils/helpers";
import { playOrderPlaced } from "../utils/sounds";
import Modal from "../components/shared/Modal";
import "./POS.css";

function printReceipt() {
  const printContent = document.querySelector(".print-receipt-area");
  if (!printContent) { window.print(); return; }
  const original = document.body.innerHTML;
  document.body.innerHTML = printContent.outerHTML;
  window.print();
  document.body.innerHTML = original;
  window.location.reload();
}

function Receipt({ order, settings, onClose }) {
  return (
    <div className="pos-receipt">
      <div className="print-receipt-area">
        <div className="receipt-paper">
          <div className="receipt-center">
            <span className="receipt-logo">🍽️</span>
            <h3>{settings.restaurantName}</h3>
            <p>{settings.address}</p>
            <p>{settings.phone}</p>
          </div>
          <div className="receipt-divider">{"─".repeat(36)}</div>
          <div className="receipt-row">
            <span>Order #{order.id.slice(-4).toUpperCase()}</span>
            <span>{formatTime(order.createdAt)}</span>
          </div>
          <div className="receipt-row">
            <span>Type:</span>
            <span>{order.type === "dine-in" ? `Dine-In (Table ${order.table})` : order.type}</span>
          </div>
          <div className="receipt-row">
            <span>Staff:</span>
            <span>{order.createdByName}</span>
          </div>
          <div className="receipt-divider">{"─".repeat(36)}</div>
          <div className="receipt-items">
            {order.items.map((item, idx) => (
              <div key={idx} className="receipt-item">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="receipt-divider">{"─".repeat(36)}</div>
          <div className="receipt-row"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="receipt-row"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
          <div className="receipt-row"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
          <div className="receipt-row receipt-total"><span>TOTAL</span><span>{formatCurrency(order.total)}</span></div>
          <div className="receipt-divider">{"─".repeat(36)}</div>
          <div className="receipt-row">
            <span>Payment:</span>
            <span>{order.paymentMethod?.toUpperCase()}</span>
          </div>
          <div className="receipt-center receipt-footer">
            <p>{settings.receiptHeader}</p>
            <p>{settings.receiptFooter}</p>
          </div>
        </div>
      </div>
      <div className="receipt-actions">
        <button className="receipt-print" onClick={printReceipt}>🖨️ Print</button>
        <button className="receipt-close" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

export default function POS() {
  const {
    menu, cart, selectedCategory, searchQuery, dispatch,
    addToCart, removeFromCart, clearCart, getCartTotal, getCartItemCount,
    placeOrder, notify, tableNumber, orderType, customers, settings, tables, orders,
  } = useApp();

  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("fixed");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [showModifiers, setShowModifiers] = useState(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [showTables, setShowTables] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [receiptOrder, setReceiptOrder] = useState(null);

  const categories = ["All", "Appetizers", "Main Course", "Meat", "Dairy", "Desserts", "Beverages"];

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

  // Compute popular item IDs for badge display
  const popularItemIds = useMemo(() => {
    const counts = {};
    orders.forEach((o) => o.items.forEach((item) => {
      if (!counts[item.id]) counts[item.id] = 0;
      counts[item.id] += item.quantity;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
  }, [orders]);

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
    if (e.key === "F5") { e.preventDefault(); dispatch({ type: "SET_ACTIVE_TAB", payload: "kds" }); }
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
      playOrderPlaced();
      setReceiptOrder(order);
      setShowPayment(false);
      setDiscount(0);
      setSelectedCustomer("");
      setOrderNotes("");
      setPhoneSearch("");
      setFoundCustomer(null);
      notify(`Order #${order.id.slice(-4).toUpperCase()} placed successfully!`);
    }
  };

  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const availableTables = tables.filter((t) => t.status === "available").length;

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
                {popularItemIds.includes(item.id) && <span className="bestseller-badge">BESTSELLER</span>}
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
                  <div className="pos-item-actions">
                    <button
                      className="pos-details-btn"
                      onClick={(e) => { e.stopPropagation(); setDetailItem(item); }}
                      title="View details"
                    >
                      👁️
                    </button>
                    <button
                      className="pos-add-btn"
                      onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                      disabled={item.stock === 0}
                    >+</button>
                  </div>
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
        <span title="F5: Kitchen">F5</span>
        <span title="Ctrl+Enter: Checkout">⌘↵</span>
      </div>

      <Modal isOpen={!!detailItem} onClose={() => setDetailItem(null)} title={detailItem?.name || "Item Details"}>
        {detailItem && (
          <div className="item-detail">
            <div className="item-detail-hero">
              <span className="item-detail-img">{detailItem.image}</span>
              <div className="item-detail-head">
                <span className="item-detail-cat">{detailItem.category}</span>
                {popularItemIds.includes(detailItem.id) && <span className="bestseller-badge-static">⭐ BESTSELLER</span>}
              </div>
            </div>
            <div className="item-detail-info">
              <h2>{detailItem.name}</h2>
              <p className="item-detail-desc">{detailItem.description}</p>
              <div className="item-detail-meta">
                <div className="idm-box">
                  <span className="idm-label">Price</span>
                  <span className="idm-val price">{formatCurrency(detailItem.price)}</span>
                </div>
                <div className="idm-box">
                  <span className="idm-label">Cost</span>
                  <span className="idm-val">{formatCurrency(detailItem.cost)}</span>
                </div>
                <div className="idm-box">
                  <span className="idm-label">Prep Time</span>
                  <span className="idm-val">{detailItem.prepTime} min</span>
                </div>
                <div className="idm-box">
                  <span className="idm-label">Profit</span>
                  <span className="idm-val profit">{formatCurrency(detailItem.price - detailItem.cost)}</span>
                </div>
              </div>
              <div className="item-detail-stock">
                <span className={`detail-stock-badge ${detailItem.stock === 0 ? "out" : detailItem.stock <= settings.lowStockThreshold ? "low" : "in"}`}>
                  {detailItem.stock === 0 ? "🔴 Out of Stock" : detailItem.stock <= settings.lowStockThreshold ? `🟡 Only ${detailItem.stock} left` : `🟢 ${detailItem.stock} in stock`}
                </span>
              </div>
              <button
                className="item-detail-add"
                disabled={detailItem.stock === 0}
                onClick={() => { addToCart(detailItem); notify(`${detailItem.name} added to order`, "success"); setDetailItem(null); }}
              >
                + Add to Order
              </button>
            </div>
          </div>
        )}
      </Modal>

      {receiptOrder && (
        <Receipt order={receiptOrder} settings={settings} onClose={() => setReceiptOrder(null)} />
      )}
    </div>
  );
}
