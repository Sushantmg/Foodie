import { usePOS } from "../context/POSContext";
import { menuData, categories } from "../data/menuData";
import "./MenuGrid.css";

export default function MenuGrid() {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
  } = usePOS();

  const filteredItems = menuData.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  return (
    <div className="menu-grid">
      <div className="menu-header">
        <h2>Menu</h2>
        <div className="menu-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === "All" && "🍽️ "}
            {cat === "Appetizers" && "🥗 "}
            {cat === "Main Course" && "🥩 "}
            {cat === "Desserts" && "🍰 "}
            {cat === "Beverages" && "☕ "}
            {cat}
          </button>
        ))}
      </div>

      <div className="menu-items">
        {filteredItems.map((item) => (
          <div key={item.id} className="menu-item" onClick={() => addToCart(item)}>
            <div className="item-image">{item.image}</div>
            <div className="item-info">
              <h3>{item.name}</h3>
              <p className="item-desc">{item.description}</p>
              <div className="item-bottom">
                <span className="item-price">${item.price.toFixed(2)}</span>
                <button className="add-btn" onClick={(e) => { e.stopPropagation(); addToCart(item); }}>
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
