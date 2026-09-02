import { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaPencilAlt, FaCheck, FaTimes, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import {
  createCategory, updateCategory, deleteCategory,
  createSubCategory, updateSubCategory, deleteSubCategory,
} from "../../api/admin";
import { getSubCategories } from "../../api/products";
import { useCategories } from "../../context/CategoriesContext";
import styles from './CategoriesAdmin.module.css';

const toSlug = (str) =>
  str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

export default function CategoriesAdmin() {
  const showToast = useToast();
  const confirm = useConfirm();
  const { categories, refreshCategories } = useCategories();

  const [subCategories, setSubCategories] = useState([]);

  const [showCatForm, setShowCatForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", slug: "" });
  const [editingCatId, setEditingCatId] = useState(null);
  const [editCat, setEditCat] = useState({ name: "", slug: "" });

  const [showSubForm, setShowSubForm] = useState(false);
  const [newSub, setNewSub] = useState({ name: "", categories_id: "" });
  const [editingSubId, setEditingSubId] = useState(null);
  const [editSub, setEditSub] = useState({ name: "", categories_id: "" });
  const [subCatFilter, setSubCatFilter] = useState(null);

  useEffect(() => { fetchSubs(); }, []);

  const fetchAll = async () => {
    await Promise.all([refreshCategories(), fetchSubs()]);
  };

  const fetchSubs = async () => {
    const subs = await getSubCategories();
    setSubCategories(subs);
  };

  // ── Categories ──
  const handleAddCat = async (e) => {
    e.preventDefault();
    try {
      await createCategory(newCat);
      setNewCat({ name: "", slug: "" });
      setShowCatForm(false);
      await fetchAll();
      showToast("Catégorie ajoutée.", "success");
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleUpdateCat = async (id) => {
    try {
      await updateCategory(id, editCat);
      setEditingCatId(null);
      await fetchAll();
      showToast("Catégorie mise à jour.", "success");
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleMoveCat = async (index, direction) => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= categories.length) return;
    const current = categories[index];
    const swap = categories[swapIndex];
    try {
      await Promise.all([
        updateCategory(current.id, { position: swap.position }),
        updateCategory(swap.id, { position: current.position }),
      ]);
      await fetchAll();
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleDeleteCat = async (id) => {
    const ok = await confirm({
      title: "Supprimer cette catégorie ?",
      message: "Supprimez d'abord ses sous-catégories, sinon l'opération sera bloquée.",
      confirmLabel: "Supprimer",
      dangerous: true,
    });
    if (!ok) return;
    try {
      await deleteCategory(id);
      await fetchAll();
      showToast("Catégorie supprimée.", "success");
    } catch (err) { showToast(err.message, "error"); }
  };

  // ── Sub-categories ──
  const handleAddSub = async (e) => {
    e.preventDefault();
    try {
      await createSubCategory(newSub);
      setNewSub({ name: "", slug: "", categories_id: "" });
      setShowSubForm(false);
      await fetchAll();
      showToast("Sous-catégorie ajoutée.", "success");
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleUpdateSub = async (id) => {
    try {
      await updateSubCategory(id, editSub);
      setEditingSubId(null);
      await fetchAll();
      showToast("Sous-catégorie mise à jour.", "success");
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleDeleteSub = async (id) => {
    const ok = await confirm({
      title: "Supprimer cette sous-catégorie ?",
      message: "Les produits associés devront être réassignés manuellement.",
      confirmLabel: "Supprimer",
      dangerous: true,
    });
    if (!ok) return;
    try {
      await deleteSubCategory(id);
      await fetchAll();
      showToast("Sous-catégorie supprimée.", "success");
    } catch (err) { showToast(err.message, "error"); }
  };

  return (
    <div className={styles.cadmRoot}>

      <div className={styles.cadmHeader}>
        <h1 className={styles.cadmTitle}>Catégories</h1>
        <p className={styles.cadmSub}>
          {categories.length} catégorie{categories.length > 1 ? "s" : ""} · {subCategories.length} sous-catégorie{subCategories.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className={styles.cadmGrid}>

        {/* ══════════════════════
            CATÉGORIES
        ══════════════════════ */}
        <div className={styles.cadmCard}>
          <div className={styles.cadmCardHeader}>
            <p className={styles.cadmCardTitle}>
              Catégories
              <span className={styles.cadmCount}>{categories.length}</span>
            </p>
            <button className={styles.cadmAddBtn} onClick={() => { setShowCatForm(v => !v); setEditingCatId(null); }}>
              <FaPlus size={9} /> Ajouter
            </button>
          </div>

          {showCatForm && (
            <form className={styles.cadmForm} onSubmit={handleAddCat}>
              <div className={styles.cadmFormRow}>
                <input
                  type="text" placeholder="Nom (ex: Homme)" required
                  value={newCat.name}
                  onChange={e => setNewCat({ name: e.target.value, slug: toSlug(e.target.value) })}
                  className={styles.cadmInput}
                />
                <input
                  type="text" placeholder="Slug (auto)"
                  value={newCat.slug}
                  onChange={e => setNewCat({ ...newCat, slug: e.target.value })}
                  className={`${styles.cadmInput} ${styles.cadmInputSlug}`}
                />
              </div>
              <div className={styles.cadmFormActions}>
                <button type="submit" className={`${styles.cadmBtn} ${styles.cadmBtnPrimary}`}>
                  <FaCheck size={9} /> Ajouter
                </button>
                <button type="button" className={`${styles.cadmBtn} ${styles.cadmBtnGhost}`} onClick={() => setShowCatForm(false)}>
                  <FaTimes size={9} /> Annuler
                </button>
              </div>
            </form>
          )}

          <div className={styles.cadmList}>
            {categories.map((cat, index) => (
              <div key={cat.id} className={styles.cadmRow}>
                {editingCatId === cat.id ? (
                  <div className={styles.cadmEditRow}>
                    <input
                      value={editCat.name}
                      onChange={e => setEditCat({ name: e.target.value, slug: toSlug(e.target.value) })}
                      className={styles.cadmInput}
                    />
                    <input
                      value={editCat.slug}
                      onChange={e => setEditCat({ ...editCat, slug: e.target.value })}
                      className={`${styles.cadmInput} ${styles.cadmInputSlug}`}
                    />
                    <div className={styles.cadmRowActions}>
                      <button className={`${styles.cadmBtn} ${styles.cadmBtnSave}`} onClick={() => handleUpdateCat(cat.id)}>
                        <FaCheck size={9} />
                      </button>
                      <button className={`${styles.cadmBtn} ${styles.cadmBtnGhost}`} onClick={() => setEditingCatId(null)}>
                        <FaTimes size={9} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.cadmRowInfo}>
                      <span className={styles.cadmRowName}>{cat.name}</span>
                      <span className={styles.cadmRowSlug}>/{cat.slug}</span>
                    </div>
                    <div className={styles.cadmRowActions}>
                      <button
                        className={`${styles.cadmBtn} ${styles.cadmBtnMove}`}
                        onClick={() => handleMoveCat(index, "up")}
                        disabled={index === 0}
                        title="Monter"
                      >
                        <FaArrowUp size={9} />
                      </button>
                      <button
                        className={`${styles.cadmBtn} ${styles.cadmBtnMove}`}
                        onClick={() => handleMoveCat(index, "down")}
                        disabled={index === categories.length - 1}
                        title="Descendre"
                      >
                        <FaArrowDown size={9} />
                      </button>
                      <button
                        className={`${styles.cadmBtn} ${styles.cadmBtnEdit}`}
                        onClick={() => { setEditingCatId(cat.id); setEditCat({ name: cat.name, slug: cat.slug }); setShowCatForm(false); }}
                      >
                        <FaPencilAlt size={9} />
                      </button>
                      <button className={`${styles.cadmBtn} ${styles.cadmBtnDelete}`} onClick={() => handleDeleteCat(cat.id)}>
                        <FaTrash size={9} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════
            SOUS-CATÉGORIES
        ══════════════════════ */}
        <div className={styles.cadmCard}>
          <div className={styles.cadmCardHeader}>
            <p className={styles.cadmCardTitle}>
              Sous-catégories
              <span className={styles.cadmCount}>
                {subCatFilter ? subCategories.filter(s => s.categories_id === subCatFilter).length : subCategories.length}
              </span>
            </p>
            <button className={styles.cadmAddBtn} onClick={() => { setShowSubForm(v => !v); setEditingSubId(null); }}>
              <FaPlus size={9} /> Ajouter
            </button>
          </div>

          <div className={styles.cadmFilterBar}>
            <button
              className={`${styles.cadmFilterPill} ${subCatFilter === null ? styles.cadmFilterActive : ""}`}
              onClick={() => setSubCatFilter(null)}
            >
              Tout
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.cadmFilterPill} ${subCatFilter === cat.id ? styles.cadmFilterActive : ""}`}
                onClick={() => setSubCatFilter(subCatFilter === cat.id ? null : cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {showSubForm && (
            <form className={styles.cadmForm} onSubmit={handleAddSub}>
              <input
                type="text" placeholder="Nom (ex: T-shirts)" required
                value={newSub.name}
                onChange={e => setNewSub({ ...newSub, name: e.target.value })}
                className={styles.cadmInput}
              />
              <select
                value={newSub.categories_id}
                onChange={e => setNewSub({ ...newSub, categories_id: e.target.value })}
                required
                className={styles.cadmSelect}
              >
                <option value="">— Catégorie parente —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className={styles.cadmFormActions}>
                <button type="submit" className={`${styles.cadmBtn} ${styles.cadmBtnPrimary}`}>
                  <FaCheck size={9} /> Ajouter
                </button>
                <button type="button" className={`${styles.cadmBtn} ${styles.cadmBtnGhost}`} onClick={() => setShowSubForm(false)}>
                  <FaTimes size={9} /> Annuler
                </button>
              </div>
            </form>
          )}

          <div className={styles.cadmList}>
            {(subCatFilter ? subCategories.filter(s => s.categories_id === subCatFilter) : subCategories).map(sub => (
              <div key={sub.id} className={styles.cadmRow}>
                {editingSubId === sub.id ? (
                  <div className={styles.cadmEditRow}>
                    <input
                      value={editSub.name}
                      onChange={e => setEditSub({ ...editSub, name: e.target.value })}
                      className={styles.cadmInput}
                    />
                    <select
                      value={editSub.categories_id}
                      onChange={e => setEditSub({ ...editSub, categories_id: Number(e.target.value) })}
                      className={styles.cadmSelect}
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div className={styles.cadmRowActions}>
                      <button className={`${styles.cadmBtn} ${styles.cadmBtnSave}`} onClick={() => handleUpdateSub(sub.id)}>
                        <FaCheck size={9} />
                      </button>
                      <button className={`${styles.cadmBtn} ${styles.cadmBtnGhost}`} onClick={() => setEditingSubId(null)}>
                        <FaTimes size={9} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.cadmRowInfo}>
                      <span className={styles.cadmRowName}>{sub.name}</span>
                      <span className={styles.cadmParentBadge}>{sub.category_name}</span>
                    </div>
                    <div className={styles.cadmRowActions}>
                      <button
                        className={`${styles.cadmBtn} ${styles.cadmBtnEdit}`}
                        onClick={() => { setEditingSubId(sub.id); setEditSub({ name: sub.name, categories_id: sub.categories_id }); setShowSubForm(false); }}
                      >
                        <FaPencilAlt size={9} />
                      </button>
                      <button className={`${styles.cadmBtn} ${styles.cadmBtnDelete}`} onClick={() => handleDeleteSub(sub.id)}>
                        <FaTrash size={9} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
