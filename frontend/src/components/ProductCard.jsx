import { Link } from "react-router-dom";
import { sortSizes } from "../utils/sizes";
import styles from './ProductCard.module.css';

const ProductCard = ({ product, categorySlug }) => {

  const sizes = sortSizes([...new Set(product.variants?.map(v => v.size) || [])]);
  const colors = [...new Map(
    product.variants?.map(v => [v.color, { name: v.color, hex: v.color_hex }]) || []
  ).values()];
  const hasOutOfStock = sizes.some(size => !product.variants?.some(v => v.size === size && v.stock > 0));
  const allOutOfStock = sizes.every(size => !product.variants?.some(v => v.size === size && v.stock > 0));

  return (
    <>
      <Link
        to={`/category/${categorySlug}/product/${product.id}`}
        className={styles.ftkCard}
      >
        {/* Image */}
        <div className={styles.ftkCardImgWrap}>
          <img
            src={product.img_url}
            alt={product.name}
            className={styles.ftkCardImg}
          />
          {allOutOfStock && (
            <span className={`${styles.ftkCardBadge} ${styles.out}`}>Rupture</span>
          )}
        </div>

        {/* Body */}
        <div className={styles.ftkCardBody}>
          <p className={styles.ftkCardName}>{product.name}</p>
          <p className={styles.ftkCardDesc}>{product.description}</p>
          <p className={styles.ftkCardPrice}>{(product.price_in_cents / 100).toFixed(2)} €</p>

          <div className={styles.ftkCardDivider} />

          {/* Tailles */}
          {sizes.length > 0 && (
            <div style={{ marginBottom: "10px" }}>
              <p className={styles.ftkCardLabel}>Tailles</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {sizes.map(size => {
                  const inStock = product.variants?.some(v => v.size === size && v.stock > 0);
                  return (
                    <span
                      key={size}
                      className={`${styles.ftkSizeChip} ${inStock ? styles.inStock : styles.outStock}`}
                    >
                      {size}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Couleurs + flèche */}
          <div className={styles.ftkCardFooter}>
            {colors.length > 0 && (
              <div>
                <p className={styles.ftkCardLabel}>Couleurs</p>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {colors.map(({ name, hex }) => (
                    <span
                      key={name}
                      className={styles.ftkColorDot}
                      style={{ backgroundColor: hex }}
                      title={name}
                    />
                  ))}
                </div>
              </div>
            )}

            <span className={styles.ftkCardArrow}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </>
  );
};

export default ProductCard;