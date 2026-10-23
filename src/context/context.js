import { createContext } from "react";

// Kept in its own module so AppContext.jsx only exports components (fast refresh).
export const AppContext = createContext(null);
