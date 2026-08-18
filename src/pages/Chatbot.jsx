import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { menuData } from "../data/menuData";
import { formatCurrency } from "../utils/helpers";
import "./Chatbot.css";

function getAIResponse(input, context) {
  const { orders, menu, customers, settings } = context;
  const lower = input.toLowerCase();

  if (lower.match(/\b(hi|hello|hey|greetings|good|morning|evening)\b/)) {
    return "Hello! I'm FoodieBot, your restaurant assistant. How can I help you today?\n\nType 'help' to see what I can do!";
  }

  if (lower.match(/\b(help|what can|options|commands)\b/)) {
    return "I can help you with:\n\n📋 **Menu** - View our full menu\n💰 **Prices** - Check item pricing\n⏰ **Hours** - Opening & closing times\n🌟 **Specials** - Today's deals\n📞 **Contact** - Restaurant info\n🪑 **Reservations** - Book a table\n⚠️ **Allergens** - Dietary information\n📊 **Stats** - Today's sales\n💎 **Loyalty** - Customer rewards\n💬 **Feedback** - Share experience\n\nJust type your question!";
  }

  if (lower.match(/\b(menu|food|dish|eat)\b/)) {
    const cats = {};
    menu.forEach((m) => {
      if (!cats[m.category]) cats[m.category] = [];
      cats[m.category].push(m);
    });
    let response = "📋 **Our Menu:**\n\n";
    Object.entries(cats).forEach(([cat, items]) => {
      response += `**${cat}:**\n`;
      items.forEach((i) => { response += `${i.image} ${i.name} - ${formatCurrency(i.price)}\n`; });
      response += "\n";
    });
    return response;
  }

  if (lower.match(/\b(price|cost|how much|expensive|cheap)\b/)) {
    const popular = menu.slice(0, 8).map((i) => `${i.image} ${i.name}: ${formatCurrency(i.price)}`).join("\n");
    return `💰 **Popular Item Prices:**\n\n${popular}\n\nAsk about any specific item for details!`;
  }

  if (lower.match(/\b(hour|open|close|time|when)\b/)) {
    const h = settings.openingHours;
    let response = "⏰ **Opening Hours:**\n\n";
    Object.entries(h).forEach(([day, hours]) => {
      response += `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours.closed ? "Closed" : `${hours.open} - ${hours.close}`}\n`;
    });
    return response;
  }

  if (lower.match(/\b(special|deal|offer|discount|combo)\b/)) {
    return "🌟 **Today's Specials:**\n\n🐟 Grilled Salmon Combo - $16.99 (Save $2!)\n🥩 Family Ribeye Pack (4 servings) - $79.99\n🍹 Happy Hour: 20% off beverages 4-6 PM\n🎂 Birthday? Free dessert with any main course!\n\nAsk for details!";
  }

  if (lower.match(/\b(reserv|book|table|seat)\b/)) {
    return "🪑 **Reservations:**\n\n📞 Call: " + settings.phone + "\n📧 Email: " + settings.email + "\n\nWe recommend reservations for parties of 6+.\nWalk-ins always welcome!\n\nTables 1-20 available.";
  }

  if (lower.match(/\b(allerg|gluten|nut|vegan|vegetarian|dairy|diet)\b/)) {
    return "⚠️ **Dietary Information:**\n\n🥜 Nut-free options available\n🌾 Gluten-free bread & pasta alternatives\n🥛 Dairy-free milk & cheese\n🌱 Full vegetarian & vegan menu\n🚫 Please inform your server of ALL allergies\n\nYour safety is our priority!";
  }

  if (lower.match(/\b(contact|phone|email|address|where|location)\b/)) {
    return `📞 **Contact Us:**\n\nPhone: ${settings.phone}\nEmail: ${settings.email}\nAddress: ${settings.address}\nWebsite: ${settings.website}`;
  }

  if (lower.match(/\b(feedback|review|complaint|suggest|rate)\b/)) {
    return "💬 **We Value Your Feedback!**\n\n1. Leave a review on Google/Yelp\n2. Fill out the feedback form on your receipt\n3. Email us at " + settings.email + "\n4. Talk to our manager\n\nThank you for dining with us!";
  }

  if (lower.match(/\b(popular|best|recommend|favorite|signature|top)\b/)) {
    return "⭐ **Our Signature Dishes:**\n\n🥩 **Ribeye Steak** - Our premium 12oz cut\n🐟 **Grilled Salmon** - Atlantic with lemon butter\n🍝 **Chicken Alfredo** - Creamy & delicious\n🍗 **Buffalo Wings** - Fan favorite starter\n🍰 **Tiramisu** - Best dessert in town\n\nAll highly rated by our customers!";
  }

  if (lower.match(/\b(loyalty|points|reward|member)\b/)) {
    return "💎 **Loyalty Program:**\n\n🥉 Bronze: 0+ points\n🥈 Silver: 100+ points (5% off)\n🥇 Gold: 300+ points (10% off)\n💎 Platinum: 1000+ points (15% off)\n\nEarn " + settings.pointsPerDollar + " point per dollar spent!\nSign up at the counter.";
  }

  if (lower.match(/\b(stats|sale|revenue|today|business)\b/)) {
    const todayOrders = orders.filter((o) => o.createdAt?.startsWith(new Date().toISOString().split("T")[0]));
    const revenue = todayOrders.reduce((s, o) => s + o.total, 0);
    return `📊 **Today's Stats:**\n\n📋 Orders: ${todayOrders.length}\n💰 Revenue: ${formatCurrency(revenue)}\n📈 Avg Order: ${todayOrders.length ? formatCurrency(revenue / todayOrders.length) : "$0.00"}\n⏳ Pending: ${todayOrders.filter((o) => o.status === "preparing").length}\n✅ Completed: ${todayOrders.filter((o) => o.status === "completed").length}`;
  }

  if (lower.match(/\b(who are you|about|what are you|your name)\b/)) {
    return "I'm FoodieBot 🤖, the AI assistant for " + settings.restaurantName + ". I can help with menu info, orders, reservations, and more!";
  }

  if (lower.match(/\b(thank|thanks|thx)\b/)) {
    return "You're welcome! Is there anything else I can help you with? 😊";
  }

  if (lower.match(/\b(bye|goodbye|see you|take care)\b/)) {
    return "Thank you for visiting " + settings.restaurantName + "! Have a wonderful day! 👋";
  }

  if (lower.match(/\b(cancel|refund|problem|issue|wrong)\b/)) {
    return "I'm sorry to hear that. For order issues:\n\n1. Speak with the manager on duty\n2. Call " + settings.phone + "\n3. Email " + settings.email + "\n\nWe'll make it right!";
  }

  return "I'm not sure I understand. Try asking about:\n- Menu & prices\n- Opening hours\n- Specials & deals\n- Reservations\n- Allergens\n- Contact info\n- Today's stats\n- Loyalty program\n\nType 'help' for all options!";
}

export default function Chatbot() {
  const { orders, menu, customers, settings } = useApp();
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to " + (settings.restaurantName || "FoodiePOS") + "! 🍽️\n\nI'm FoodieBot, your virtual assistant. How can I help you today?\n\nType 'help' to see what I can do!", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text = null) => {
    const msg = text || input;
    if (!msg.trim()) return;

    setMessages((prev) => [...prev, { id: Date.now(), text: msg, sender: "user" }]);
    setInput("");

    setTimeout(() => {
      const response = getAIResponse(msg, { orders, menu, customers, settings });
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: response, sender: "bot" }]);
    }, 400);
  };

  const quickActions = [
    { label: "📋 Menu", msg: "Show me the menu" },
    { label: "⏰ Hours", msg: "What are your hours?" },
    { label: "🌟 Specials", msg: "Today's specials" },
    { label: "📞 Contact", msg: "Contact information" },
    { label: "⭐ Popular", msg: "What's popular?" },
    { label: "📊 Stats", msg: "Today's stats" },
    { label: "💎 Loyalty", msg: "Loyalty program" },
    { label: "⚠️ Allergens", msg: "Allergen information" },
  ];

  return (
    <div className="chatbot-page">
      <div className="chatbot-container">
        <div className="chat-header">
          <div className="chat-avatar">🤖</div>
          <div className="chat-info">
            <h3>FoodieBot</h3>
            <span className="chat-status">🟢 Online</span>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-msg ${msg.sender}`}>
              <div className="msg-avatar">{msg.sender === "bot" ? "🤖" : "👤"}</div>
              <div className="msg-bubble">
                <p style={{ whiteSpace: "pre-line" }}>{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-quick-actions">
          {quickActions.map((action) => (
            <button key={action.label} className="qa-btn" onClick={() => handleSend(action.msg)}>
              {action.label}
            </button>
          ))}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="chat-send" onClick={() => handleSend()}>➤</button>
        </div>
      </div>
    </div>
  );
}
