import { useEffect, useState } from "react";
import {
  getAllProducts,
  updateVariantStock,
  createProduct,
  createVariant,
  deleteProduct,
  updateProductIsFeatured
} from "../../api/admin";
import { getSubCategories } from "../../api/products";
import ProductRow from "../../components/ProductRow";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import styles from './ProductsAdmin.module.css';

export default function ProductsAdmin() {
  const showToast = useToast();
  const confirm = useConfirm();
  const [products, setProducts] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    img_url: "",
    sub_categories_id: "",
    variants: [],
  });

  const handleToggleFeatured = async (productId, isFeatured) => {
    try {
      await updateProductIsFeatured(productId, isFeatured);
      setProducts(prev =>
        prev.map(p => p.id === productId ? { ...p, is_featured: isFeatured } : p)
      );
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  useEffect(() => {
    async function fetchData() {
      const data = await getAllProducts();
      setProducts(data);
      const subs = await getSubCategories();
      setSubCategories(subs);
    }
    fetchData();
  }, []);

  const handleVariantStockChange = async (variantId, newStock) => {
    await updateVariantStock(variantId, newStock);
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        variants: p.variants.map((v) =>
          v.id === variantId ? { ...v, stock: newStock } : v
        ),
      }))
    );
  };

  const handleCreateProduct = async () => {
    if (!newProduct.sub_categories_id) {
      showToast("Veuillez sélectionner une catégorie.", "warning");
      return;
    }

    const productToSend = {
      ...newProduct,
      price_in_cents: Math.round(parseFloat(newProduct.price) * 100),
    };
    delete productToSend.price;

    const created = await createProduct(productToSend);
    created.variants = created.variants || [];
    setProducts((prev) => [...prev, created]);
    setNewProduct({ name: "", description: "", price: "", img_url: "", sub_categories_id: "", variants: [] });
    setShowForm(false);
  };

  const handleAddVariant = async (productId, variant) => {
    const newV = await createVariant(productId, variant);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, variants: [...p.variants, newV] } : p
      )
    );
  };

  const handleDeleteProduct = async (productId) => {
    const ok = await confirm({
      title: "Supprimer ce produit ?",
      message: "Le produit et toutes ses variantes seront définitivement supprimés.",
      confirmLabel: "Supprimer",
      dangerous: true,
    });
    if (!ok) return;
    await deleteProduct(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const totalVariants = products.reduce((sum, p) => sum + (p.variants?.length || 0), 0);
  const lowStockCount = products.reduce((sum, p) =>
    sum + (p.variants?.filter(v => v.stock <= 5).length || 0), 0
  );

  return (
    <>
      <div className={styles.padmRoot}>

        {/* ── Header ── */}
        <div className={styles.padmHeader}>
          <div>
            <h1 className={styles.padmTitle}>Gestion des produits</h1>
            <div className={styles.padmStats} style={{ marginTop: "8px" }}>
              <span className={styles.padmStat}>{products.length} produit{products.length > 1 ? "s" : ""}</span>
              <span className={styles.padmStat}>{totalVariants} variante{totalVariants > 1 ? "s" : ""}</span>
              {lowStockCount > 0 && (
                <span className={`${styles.padmStat} ${styles.warning}`}>⚠ {lowStockCount} stock{lowStockCount > 1 ? "s" : ""} faible{lowStockCount > 1 ? "s" : ""}</span>
              )}
            </div>
          </div>

          <button className={styles.padmBtnNew} onClick={() => setShowForm(!showForm)}>
            <FaPlus size={11} /> Nouveau produit
          </button>
        </div>

        {/* ── Formulaire ── */}
        {showForm && (
          <div className={styles.padmFormWrap}>
            <div className={styles.padmFormTitle}>
              <span>Ajouter un produit</span>
              <button className={styles.padmFormClose} onClick={() => setShowForm(false)}>
                <FaTimes size={14} />
              </button>
            </div>

            <div className={styles.padmFormGrid}>
              <input
                type="text"
                placeholder="Nom du produit"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className={styles.padmInput}
              />
              <input
                type="text"
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className={styles.padmInput}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Prix (€)"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className={styles.padmInput}
              />
              <input
                type="text"
                placeholder="URL de l'image"
                value={newProduct.img_url}
                onChange={(e) => setNewProduct({ ...newProduct, img_url: e.target.value })}
                className={styles.padmInput}
              />
              <select
                value={newProduct.sub_categories_id}
                onChange={(e) => setNewProduct({ ...newProduct, sub_categories_id: Number(e.target.value) })}
                className={styles.padmSelect}
              >
                <option value="">Catégorie</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} / {sub.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.padmFormFooter}>
              <button onClick={handleCreateProduct} className={styles.padmBtnSubmit}>
                <FaPlus size={10} /> Créer le produit
              </button>
              <button
                onClick={() => setShowForm(false)}
                className={styles.padmBtnCancelForm}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ── Table ── */}
        <div className={styles.padmTableWrap}>
          <table className={styles.padmTable}>
            <thead>
              <tr>
                <th>Couleur</th>
                <th>Taille</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.padmEmpty}>
                    Aucun produit pour l'instant.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onVariantStockChange={handleVariantStockChange}
                    onAddVariant={handleAddVariant}
                    onDeleteProduct={handleDeleteProduct}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}