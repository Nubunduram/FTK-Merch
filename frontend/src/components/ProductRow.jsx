import VariantRow from "./VariantRow";
import { useState } from "react";
import { FaTrash, FaStar, FaRegStar, FaPlus, FaTimes } from "react-icons/fa";
import styles from './ProductRow.module.css';

export default function ProductRow({
  product,
  onVariantStockChange,
  onAddVariant,
  onDeleteProduct,
  onToggleFeatured,
}) {
  const [newVariant, setNewVariant] = useState({
    color: "",
    color_hex: "#000000",
    size: "",
    sku: "",
    stock: 0,
  });
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [rerender, setRerender] = useState(0);

  const handleAdd = () => {
    onAddVariant(product.id, newVariant);
    setNewVariant({ color: "", color_hex: "#000000", size: "", sku: "", stock: 0 });
    setShowVariantForm(false);
  };

  const handleDeleteVariant = (variantId) => {
    product.variants = product.variants.filter((v) => v.id !== variantId);
    setRerender((prev) => prev + 1);
  };

  return (
    <>
      {/* ── En-tête produit ── */}
      <tr className={styles.prowHeader}>
        <td colSpan={5}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

            <div className={styles.prowName}>
              <span>{product.name}</span>
              <button
                onClick={() => onToggleFeatured(product.id, !product.is_featured)}
                className={`${styles.prowStarBtn} ${product.is_featured ? styles.featured : ""}`}
                title={product.is_featured ? "Retirer de la une" : "Mettre à la une"}
              >
                {product.is_featured ? <FaStar /> : <FaRegStar />}
              </button>
              {product.is_featured && (
                <span style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  background: "rgba(251,191,36,0.15)",
                  color: "#fbbf24",
                  border: "1px solid rgba(251,191,36,0.3)",
                  borderRadius: "999px",
                  padding: "2px 8px",
                }}>
                  À la une
                </span>
              )}
            </div>

            <div className={styles.prowActions}>
              <button
                onClick={() => onDeleteProduct(product.id)}
                className={styles.prowDeleteBtn}
              >
                <FaTrash size={11} /> Supprimer
              </button>
            </div>
          </div>
        </td>
      </tr>

      {/* ── Variantes ── */}
      {(product.variants || []).map((v) => (
        <VariantRow
          key={v.id}
          variant={v}
          onStockChange={onVariantStockChange}
          onDelete={handleDeleteVariant}
        />
      ))}

      {/* ── Formulaire ajout variante ── */}
      {showVariantForm ? (
        <tr className={styles.prowFormRow}>
          <td>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                type="color"
                value={newVariant.color_hex}
                onChange={(e) => setNewVariant({ ...newVariant, color_hex: e.target.value })}
                onInput={(e) => setNewVariant(prev => ({ ...prev, color_hex: e.target.value }))}
                style={{ width: "32px", height: "32px", border: "none", borderRadius: "6px", cursor: "pointer", padding: "2px" }}
              />
              <input
                type="text"
                placeholder="Nom (ex: Rouge)"
                value={newVariant.color}
                onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                className={styles.prowInput}
                style={{ width: "100px" }}
              />
            </div>
          </td>
          <td>
            <input
              type="text"
              placeholder="Taille"
              value={newVariant.size}
              onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
              className={styles.prowInput}
            />
          </td>
          <td>
            <input
              type="text"
              placeholder="SKU"
              value={newVariant.sku}
              onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
              className={styles.prowInput}
            />
          </td>
          <td>
            <input
              type="number"
              placeholder="Stock"
              value={newVariant.stock}
              onChange={(e) => setNewVariant({ ...newVariant, stock: Number(e.target.value) })}
              className={styles.prowInput}
              style={{ width: "80px" }}
            />
          </td>
          <td>
            <div className={styles.prowFormActions}>
              <button onClick={handleAdd} className={styles.prowConfirmBtn}>
                <FaPlus size={10} /> Ajouter
              </button>
              <button
                onClick={() => {
                  setShowVariantForm(false);
                  setNewVariant({ color: "", color_hex: "#000000", size: "", sku: "", stock: 0 });
                }}
                className={styles.prowCancelBtn}
              >
                <FaTimes size={10} /> Annuler
              </button>
            </div>
          </td>
        </tr>
      ) : (
        <tr className={styles.prowAddRow}>
          <td colSpan={5}>
            <button
              onClick={() => setShowVariantForm(true)}
              className={styles.prowAddBtn}
            >
              <FaPlus size={10} /> Ajouter une variante
            </button>
          </td>
        </tr>
      )}
    </>
  );
}