import { useState } from "react";
import { usePOS } from "../context/POSContext";
import "./Cart.css";

export default function Cart() {
  const {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    placeOrder,
    tableNumber,
    setTableNumber,
    orderType,
    setOrderType,
  } = usePOS();

  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    const order = placeOrder();
    if (order) {
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderPlaced(false);
        setShowPayment(false);
      }, 2000);
    }
  };

  if (orderPlaced) {
    return (
      <div className="cart order-success">
        <div className="success-content">
          <span className="success-icon">✅</span>
          <h2>Order Placed!</h2>
          <p>Your order has been sent to the kitchen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h2>Current Order</h2>
        {cart.length > 0 && (
          <button className="clear-btn" onClick={clearCart}>
            Clear All
          </button>
        )}
      </div>

      <div className="order-config">
        <div className="config-row">
          <label>Type:</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            <option value="dine-in">🍽️ Dine-In</option>
            <option value="takeaway">📦 Takeaway</option>
            <option value="delivery">🚗 Delivery</option>
          </select>
        </div>
        {orderType === "dine-in" && (
          <div className="config-row">
            <label>Table:</label>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(Number(e.target.value))}
            >
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Table {i + 1}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-icon">🛒</span>
            <p>No items in cart</p>
            <p className="empty-hint">Click items from the menu to add</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">{item.image}</div>
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p>${item.price.toFixed(2)}</p>
              </div>
              <div className="cart-item-controls">
                <button onClick={() => removeFromCart(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>
              <div className="cart-item-total">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-footer">
          <div className="cart-summary">
            <div className="summary-row">
              <span>Items ({getCartItemCount()})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {!showPayment ? (
            <button className="checkout-btn" onClick={() => setShowPayment(true)}>
              Proceed to Payment
            </button>
          ) : (
            <div className="payment-section">
              <h3>Payment Method</h3>
              <div className="payment-methods">
                <button
                  className={`payment-method ${paymentMethod === "cash" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  💵 Cash
                </button>
                <button
                  className={`payment-method ${paymentMethod === "card" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("card")}
                >
                  💳 Card
                </button>
                <button
                  className={`payment-method ${paymentMethod === "upi" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  📱 UPI
                </button>
              </div>
              <button className="pay-btn" onClick={handlePlaceOrder}>
                Pay ${total.toFixed(2)}
              </button>
              <button
                className="cancel-pay-btn"
                onClick={() => setShowPayment(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
