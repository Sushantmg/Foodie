import { useState, useRef, useEffect } from "react";
import { usePOS } from "../context/POSContext";
import { menuData } from "../data/menuData";
import "./Chatbot.css";

const chatResponses = {
  greetings: [
    "Hello! Welcome to FoodiePOS. How can I help you today?",
    "Hi there! I'm your virtual assistant. Need help with our menu or placing an order?",
  ],
  menu: "Here's what we offer:\n\n🥗 **Appetizers**: Caesar Salad, Bruschetta, Soup of the Day, Buffalo Wings\n🥩 **Main Course**: Grilled Salmon, Ribeye Steak, Chicken Alfredo, Veggie Burger, BBQ Ribs, Mushroom Risotto\n🍰 **Desserts**: Tiramisu, Chocolate Lava Cake, Cheesecake, Ice Cream Sundae\n☕ **Beverages**: Coca-Cola, Fresh Lemonade, Espresso, Iced Tea, Red Wine, Sparkling Water",
  hours: "We're open:\n- Monday-Thursday: 11am - 10pm\n- Friday-Saturday: 11am - 11pm\n- Sunday: 10am - 9pm",
  specials: "Today's Specials:\n🌟 Chef's Special Salmon - $16.99 (Regular $18.99)\n🌟 Family Combo (4 mains + 2 appetizers) - $59.99\n🌟 Happy Hour: 20% off all beverages from 4-6 PM!",
  reservation: "To make a reservation, you can:\n1. Call us at (555) 123-4567\n2. Use our online booking system\n3. Walk-ins are welcome!\n\nNote: Reservations are recommended for parties of 6+",
  allergens: "We cater to dietary needs! Common allergen info:\n🥜 We have nut-free options\n🌾 Gluten-free bread available\n🥛 Dairy-free alternatives\n🌱 Full vegetarian & vegan menu\n\nAlways inform your server about allergies!",
  contact: "Contact Us:\n📞 Phone: (555) 123-4567\n📧 Email: info@foodiepos.com\n📍 Address: 123 Food Street, Tasty Town\n🌐 Website: www.foodiepos.com",
  feedback: "We value your feedback! You can:\n1. Leave a review on our website\n2. Fill out the feedback form on your receipt\n3. Talk to our manager directly\n\nThank you for dining with us!",
};

function getAIResponse(input) {
  const lower = input.toLowerCase();

  if (lower.match(/\b(hi|hello|hey|greetings|good morning|good evening)\b/)) {
    return chatResponses.greetings[Math.floor(Math.random() * chatResponses.greetings.length)];
  }
  if (lower.match(/\b(menu|food|dish|dishes|eat|order)\b/)) {
    return chatResponses.menu;
  }
  if (lower.match(/\b(hour|open|close|time|when)\b/)) {
    return chatResponses.hours;
  }
  if (lower.match(/\b(special|deal|offer|discount|combo)\b/)) {
    return chatResponses.specials;
  }
  if (lower.match(/\b(reserv|book|table|seat)\b/)) {
    return chatResponses.reservation;
  }
  if (lower.match(/\b(allerg|gluten|nut|vegan|vegetarian|dairy|diet)\b/)) {
    return chatResponses.allergens;
  }
  if (lower.match(/\b(contact|phone|email|address|location|where)\b/)) {
    return chatResponses.contact;
  }
  if (lower.match(/\b(feedback|review|complaint|suggest)\b/)) {
    return chatResponses.feedback;
  }
  if (lower.match(/\b(price|cost|how much|expensive|cheap)\b/)) {
    const items = menuData.slice(0, 8).map(
      (i) => `${i.image} ${i.name}: $${i.price.toFixed(2)}`
    );
    return `Here are some of our popular items and prices:\n\n${items.join("\n")}\n\nWould you like to know more about any specific item?`;
  }
  if (lower.match(/\b(popular|best|recommend|favorite|signature)\b/)) {
    return "Our most popular dishes are:\n\n🌟 **Ribeye Steak** - Our signature cut\n🌟 **Grilled Salmon** - Chef's favorite\n🌟 **Tiramisu** - Best dessert in town\n🌟 **Buffalo Wings** - Perfect starter\n\nWould you like to add any of these to your order?";
  }
  if (lower.match(/\b(thank|thanks|thx)\b/)) {
    return "You're welcome! Is there anything else I can help you with? 😊";
  }
  if (lower.match(/\b(bye|goodbye|see you|take care)\b/)) {
    return "Thank you for visiting FoodiePOS! Have a great day! 👋";
  }
  if (lower.match(/\b(help|what can you|options|commands)\b/)) {
    return "I can help you with:\n\n📋 **Menu** - View our full menu\n⏰ **Hours** - Opening & closing times\n🌟 **Specials** - Today's deals\n📞 **Contact** - Our contact info\n🪑 **Reservations** - Book a table\n⚠️ **Allergens** - Dietary information\n💬 **Feedback** - Share your experience\n💰 **Prices** - Item pricing\n⭐ **Popular** - Top recommendations";
  }

  return "I'm not sure I understand. Try asking about:\n- Our menu or prices\n- Opening hours\n- Today's specials\n- Reservations\n- Allergen info\n- Contact details\n\nType 'help' for all options!";
}

export default function Chatbot() {
  const { orders } = usePOS();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to FoodiePOS! 🍽️\nI'm your virtual assistant. How can I help you today?\n\nType 'help' to see what I can do!",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput("");

    setTimeout(() => {
      let response = getAIResponse(userInput);

      if (userInput.toLowerCase().includes("order status") || userInput.toLowerCase().includes("my order")) {
        const activeOrders = orders.filter((o) => o.status === "preparing" || o.status === "ready");
        if (activeOrders.length > 0) {
          const orderList = activeOrders
            .map(
              (o) =>
                `#${o.id.toString().slice(-4)} - ${o.status} (${o.items.length} items, $${o.total.toFixed(2)})`
            )
            .join("\n");
          response = `Here are your active orders:\n\n${orderList}\n\nIs there anything else?`;
        } else {
          response = "You don't have any active orders right now. Would you like to place one?";
        }
      }

      const botMsg = {
        id: Date.now() + 1,
        text: response,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 500);
  };

  const quickActions = [
    { label: "📋 Menu", msg: "Show me the menu" },
    { label: "⏰ Hours", msg: "What are your hours?" },
    { label: "🌟 Specials", msg: "What are today's specials?" },
    { label: "📞 Contact", msg: "How can I contact you?" },
    { label: "⭐ Popular", msg: "What's popular?" },
    { label: "⚠️ Allergens", msg: "Allergen information" },
  ];

  return (
    <div className="chatbot">
      <div className="chatbot-header">
        <div className="chatbot-avatar">🤖</div>
        <div className="chatbot-info">
          <h3>FoodieBot</h3>
          <span className="chatbot-status">Online</span>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === "bot" ? "🤖" : "👤"}
            </div>
            <div className="message-bubble">
              <p style={{ whiteSpace: "pre-line" }}>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-actions">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="quick-btn"
            onClick={() => {
              setInput(action.msg);
              setTimeout(() => {
                const userMsg = {
                  id: Date.now(),
                  text: action.msg,
                  sender: "user",
                };
                setMessages((prev) => [...prev, userMsg]);
                setTimeout(() => {
                  const botMsg = {
                    id: Date.now() + 1,
                    text: getAIResponse(action.msg),
                    sender: "bot",
                  };
                  setMessages((prev) => [...prev, botMsg]);
                }, 500);
                setInput("");
              }, 100);
            }}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="send-btn" onClick={handleSend}>
          ➤
        </button>
      </div>
    </div>
  );
}
