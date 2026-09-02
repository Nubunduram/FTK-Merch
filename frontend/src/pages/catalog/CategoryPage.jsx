import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import { getCategories, getSubCategories, getProductsBySubCategory } from "../../api/products";
import { getSubCategoriesForCategory } from "../../utils/categoryUtils";
import styles from './CategoryPage.module.css';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [catSubCategories, setCatSubCategories] = useState([]);
  const [activeSubCat, setActiveSubCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("asc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, subCats] = await Promise.all([getCategories(), getSubCategories()]);
        setCategories(cats);
        setSubCategories(subCats);
        const foundCategory = cats.find(c => c.slug === categoryName);
        if (foundCategory) setCategory(foundCategory);
      } catch (err) {
        console.error("Erreur de chargement:", err);
      }
    };
    fetchData();
  }, [categoryName]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category || !subCategories.length) return;
      setLoading(true);
      try {
        const subCatsForCategory = getSubCategoriesForCategory(category.id, subCategories);
        setCatSubCategories(subCatsForCategory);
        setActiveSubCat(null);
        const allProducts = [];
        for (const subCat of subCatsForCategory) {
          const prods = await getProductsBySubCategory(subCat.id);
          allProducts.push(...prods.map(p => ({ ...p, _subCatId: subCat.id })));
        }
        setProducts(allProducts);
      } catch (err) {
        console.error("Erreur produits:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, subCategories]);

  const filteredProducts = activeSubCat
    ? products.filter(p => p._subCatId === activeSubCat)
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) =>
    sort === "asc" ? a.price_in_cents - b.price_in_cents : b.price_in_cents - a.price_in_cents
  );

  return (
    <>
      <div className={styles.catRoot}>

        {/* ── Hero ── */}
        <div className={styles.catHero}>
          <div className={styles.catHeroInner}>
            <p className={styles.catHeroLabel}>Collection</p>
            <h1 className={styles.catHeroTitle}>{category?.name || categoryName}</h1>
            {!loading && (
              <p className={styles.catHeroCount}>
                {sortedProducts.length} produit{sortedProducts.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* ── Filtres sous-catégories ── */}
        {!loading && catSubCategories.length > 1 && (
          <div className={styles.catFilters}>
            <div className={styles.catFiltersInner}>
              <button
                className={`${styles.catFilterPill} ${activeSubCat === null ? styles.active : ""}`}
                onClick={() => setActiveSubCat(null)}
              >
                Tout
                <span className={styles.catFilterCount}>{products.length}</span>
              </button>
              {catSubCategories.map(sub => {
                const count = products.filter(p => p._subCatId === sub.id).length;
                return (
                  <button
                    key={sub.id}
                    className={`${styles.catFilterPill} ${activeSubCat === sub.id ? styles.active : ""}`}
                    onClick={() => setActiveSubCat(activeSubCat === sub.id ? null : sub.id)}
                  >
                    {sub.name}
                    <span className={styles.catFilterCount}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Toolbar ── */}
        <div className={styles.catToolbar}>
          <span className={styles.catToolbarLeft}>
            {loading ? "Chargement..." : `${sortedProducts.length} résultat${sortedProducts.length > 1 ? "s" : ""}`}
          </span>

          <div className={styles.catSortWrap}>
            <span className={styles.catSortLabel}>Trier par</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={styles.catSortSelect}
            >
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* ── Grille ── */}
        <div className={styles.catGridWrap}>
          {loading ? (
            <div className={styles.catGrid}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={styles.catSkeleton}>
                  <div className={styles.catSkeletonImg} />
                  <div className={styles.catSkeletonBody}>
                    <div className={styles.catSkeletonLine} style={{ width: "70%" }} />
                    <div className={styles.catSkeletonLine} style={{ width: "40%" }} />
                    <div className={styles.catSkeletonLine} style={{ width: "55%", marginBottom: 0 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className={styles.catGrid}>
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categorySlug={categoryName}
                />
              ))}
            </div>
          ) : (
            <div className={styles.catEmpty}>
              <p className={styles.catEmptyTitle}>Aucun produit trouvé</p>
              <p className={styles.catEmptySub}>Cette collection est vide pour le moment.</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default CategoryPage;
