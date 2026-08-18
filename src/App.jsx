import { POSProvider, usePOS } from "./context/POSContext";
import Header from "./components/Header";
import MenuGrid from "./components/MenuGrid";
import Cart from "./components/Cart";
import Orders from "./components/Orders";
import Dashboard from "./components/Dashboard";
import Chatbot from "./components/Chatbot";
import "./App.css";

function POSLayout() {
  const { activeTab } = usePOS();

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {activeTab === "pos" && (
          <>
            <MenuGrid />
            <Cart />
          </>
        )}
        {activeTab === "orders" && <Orders />}
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "chatbot" && <Chatbot />}
      </main>
    </div>
  );
}

function App() {
  return (
    <POSProvider>
      <POSLayout />
    </POSProvider>
  );
}

export default App;
