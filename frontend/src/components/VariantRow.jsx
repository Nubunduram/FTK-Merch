import { useState } from "react";
import { deleteVariant } from "../api/admin";
import { FaTrash, FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";
import styles from './VariantRow.module.css';

export default function VariantRow({ variant, onStockChange, onDelete }) {
  const showToast = useToast();
  const confirm = useConfirm();
  const [stock, setStock] = useState(variant.stock);
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    onStockChange(variant.id, stock);
    setEditing(false);
  };

  const handleCancel = () => {
    setStock(variant.stock);
    setEditing(false);
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Supprimer cette variante ?",
      message: "Cette variante sera définitivement supprimée.",
      confirmLabel: "Supprimer",
      dangerous: true,
    });
    if (!ok) return;
    try {
      await deleteVariant(variant.id);
      onDelete(variant.id);
    } catch (error) {
      showToast(error.message || "Erreur lors de la suppression de la variante.", "error");
    }
  };

  const isLowStock = stock <= 5 && stock > 0;
  const isOutOfStock = stock === 0;

  return (
    <>
      <tr className={`${styles.vrow} ${isOutOfStock ? styles.outStock : isLowStock ? styles.lowStock : ""}`}>

        {/* Couleur */}
        <td>
          <div className={styles.vrowColorCell}>
            <span
              className={styles.vrowColorDot}
              style={{ backgroundColor: variant.color_hex || variant.color }}

            />
            {variant.color}
          </div>
        </td>

        {/* Taille */}
        <td>{variant.size}</td>

        {/* SKU */}
        <td>
          <span className={styles.vrowSku}>{variant.sku}</span>
        </td>

        {/* Stock */}
        <td>
          {editing ? (
            <input
              type="number"
              value={stock}
              min={0}
              onChange={(e) => setStock(Number(e.target.value))}
              className={styles.vrowStockInput}
            />
          ) : (
            <span className={`${styles.vrowStockBadge} ${isOutOfStock ? styles.out : isLowStock ? styles.low : styles.ok}`}>
              {isOutOfStock ? "Rupture" : isLowStock ? `⚠ ${stock}` : stock}
            </span>
          )}
        </td>

        {/* Actions */}
        <td>
          <div className={styles.vrowActions}>
            {editing ? (
              <>
                <button onClick={handleSave} className={`${styles.vrowBtn} ${styles.vrowBtnSave}`}>
                  <FaCheck size={9} /> Sauvegarder
                </button>
                <button onClick={handleCancel} className={`${styles.vrowBtn} ${styles.vrowBtnCancel}`}>
                  <FaTimes size={9} /> Annuler
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className={`${styles.vrowBtn} ${styles.vrowBtnEdit}`}>
                  <FaPencilAlt size={9} /> Modifier
                </button>
                <button onClick={handleDelete} className={`${styles.vrowBtn} ${styles.vrowBtnDelete}`}>
                  <FaTrash size={10} />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
}