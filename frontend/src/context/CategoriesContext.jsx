import { createContext, useContext, useState, useEffect } from "react";
import { getCategories } from "../api/products";

const CategoriesContext = createContext();

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);

  const refreshCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Erreur chargement catégories :", err);
    }
  };

  useEffect(() => { refreshCategories(); }, []);

  return (
    <CategoriesContext.Provider value={{ categories, refreshCategories }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export const useCategories = () => useContext(CategoriesContext);
