import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { getFeaturedProducts, getCategories, getSubCategories } from "../api/products";
import { getCategorySlugFromSubCategory } from "../utils/categoryUtils";
import styles from './Home.module.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData, subCategoriesData] = await Promise.all([
          getFeaturedProducts(),
          getCategories(),
          getSubCategories()
        ]);
        setFeaturedProducts(productsData);
        setCategories(categoriesData);
        setSubCategories(subCategoriesData);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div className={styles.hRoot}>

        {/* ── Hero ── */}
        <div className={styles.hHero}>
          <div className={styles.hInner}>
            <div className={styles.hHeroTop}>
              <p className={styles.hHeroTag}>
                <span className={styles.hHeroTagDot} />
                Nouvelle saison
              </p>
              <p className={styles.hHeroNavHint}>Collection 2026</p>
            </div>

            <div className={styles.hHeroMain}>
              <h1 className={styles.hHeroDisplay}>
                Exprime<br />
                <em>ton style.</em>
              </h1>

              <div className={styles.hHeroRight}>
                <p className={styles.hHeroDesc}>
                  Des vêtements pensés pour ceux qui osent s'affirmer. Qualité premium, style unique.
                </p>
                {categories[0] && (
                  <Link to={`/category/${categories[0].slug}`} className={styles.hHeroCta}>
                    Voir la boutique <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:"inline-block",verticalAlign:"middle",marginLeft:"4px"}}><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Ticker ── */}
        <div className={styles.hTicker}>
          <div className={styles.hTickerInner}>
            {[...Array(2)].map((_, i) => (
              <span key={i} style={{ display: "inline-flex" }}>
                <span className={styles.hTickerItem}>Livraison offerte dès 60€</span>
                <span className={styles.hTickerItem}>Nouveautés disponibles</span>
                <span className={styles.hTickerItem}>Collections exclusives</span>
                <span className={styles.hTickerItem}>Qualité premium</span>
                <span className={styles.hTickerItem}>Homme · Femme · Enfants</span>
                <span className={styles.hTickerItem}>FTK Merch Shop</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Catégories ── */}
        {categories.length > 0 && (
          <div className={styles.hCats}>
            <div className={styles.hInner}>
              <div className={styles.hCatsHeader}>
                <h2 className={styles.hSectionTitle}>Collections</h2>
                <div className={styles.hSectionLine} />
              </div>
              <div className={styles.hCatsStrip}>
                {categories.map(cat => (
                  <Link key={cat.id} to={`/category/${cat.slug}`} className={styles.hCatPill}>
                    <span className={styles.hCatPillName}>{cat.name}</span>
                    <span className={styles.hCatPillArrow}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Produits à la une ── */}
        <div className={styles.hFeatured}>
          <div className={styles.hInner}>
            <div className={styles.hFeaturedHeader}>
              <div className={styles.hFeaturedHeaderLeft}>
                <h2 className={styles.hSectionTitle}>À la une</h2>
                <div className={styles.hSectionLine} />
              </div>
              {!loading && featuredProducts.length > 0 && (
                <span className={styles.hFeaturedCount}>{featuredProducts.length} produit{featuredProducts.length > 1 ? "s" : ""}</span>
              )}
            </div>

            <div className={styles.hProductsGrid}>
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className={styles.hSkeleton}>
                    <div className={styles.hSkeletonImg} />
                    <div className={styles.hSkeletonBody}>
                      <div className={styles.hSkeletonLine} style={{ width: "65%" }} />
                      <div className={styles.hSkeletonLine} style={{ width: "40%" }} />
                      <div className={styles.hSkeletonLine} style={{ width: "50%", marginBottom: 0 }} />
                    </div>
                  </div>
                ))
              ) : error ? (
                <p style={{ gridColumn: "1/-1", color: "#9ca3af", fontSize: "0.875rem" }}>{error}</p>
              ) : featuredProducts.length === 0 ? (
                <p style={{ gridColumn: "1/-1", color: "#9ca3af", fontSize: "0.875rem" }}>
                  Aucun produit à la une pour l'instant.
                </p>
              ) : (
                featuredProducts.map(product => {
                  const catSlug = getCategorySlugFromSubCategory(
                    product.sub_categories_id,
                    subCategories,
                    categories
                  );
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categorySlug={catSlug}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Banner ── */}
        <div className={styles.hInner}>
          <div className={styles.hBanner}>
            <div className={styles.hBannerText}>
              <p className={styles.hBannerTitle}>Livraison offerte dès 60 €</p>
              <p className={styles.hBannerSub}>Sur toutes vos commandes en France métropolitaine.</p>
            </div>
            <Link
              to={categories[0] ? `/category/${categories[0].slug}` : "/"}
              className={styles.hBannerBtn}
            >
              En profiter <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:"inline-block",verticalAlign:"middle",marginLeft:"4px"}}><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>

      </div>
    </>
  );
};

export default Home;