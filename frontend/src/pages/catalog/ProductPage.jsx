import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as AuthContext from "../../context/AuthContext";
import { getProductById } from "../../api/products";
import { useCart } from "../../context/CartContext";
import { sortSizes } from "../../utils/sizes";
import { postReview, deleteReview } from "../../api/reviews";
import { FaArrowLeft, FaShoppingCart, FaTrash, FaUser } from "react-icons/fa";
import { useConfirm } from "../../context/ConfirmContext";
import styles from './ProductPage.module.css';

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = AuthContext.useAuth();
  const { addToCart } = useCart();
  const confirm = useConfirm();

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);
        const variants = data?.variants || [];
        setComments(data?.reviews || []);
        if (variants.length > 0) setSelectedColor(variants[0].color);
        setLoading(false);
      } catch (err) {
        console.error("Erreur produit:", err);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "80px 32px", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
      Chargement du produit...
    </div>
  );

  if (!product) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "80px 32px", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
      Produit introuvable.
    </div>
  );

  const variants = product?.variants || [];
  const availableColors = [...new Set(variants.map(v => v.color))];
  const availableSizes = sortSizes(
    variants.filter(v => v.color === selectedColor).map(v => ({ size: v.size, stock: v.stock })),
    item => item.size
  );
  const hasAlreadyCommented = comments.some(c => c.users_id === user?.id);
  const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize);
  const isOutOfStock = selectedSize && selectedVariant?.stock === 0;

  const handleSelectColor = (color) => {
    setSelectedColor(color);
    setSelectedSize("");
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedVariant) return;
    addToCart({
      product_id: product.id,
      product_variants_id: selectedVariant.id,
      name: product.name,
      color: selectedColor,
      size: selectedSize,
      sku: selectedVariant.sku,
      price: product.price_in_cents / 100,
      img_url: product.img_url,
      quantity: 1
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleSubmitReview = async () => {
    if (!newComment.trim()) return;
    setSubmitError("");
    try {
      const review = await postReview(productId, newComment);
      setComments(prev => [...prev, review]);
      setNewComment("");
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const ok = await confirm({
      title: "Supprimer ce commentaire ?",
      message: "Ce commentaire sera définitivement supprimé.",
      confirmLabel: "Supprimer",
      dangerous: true,
    });
    if (!ok) return;
    await deleteReview(reviewId);
    setComments(prev => prev.filter(c => c.id !== reviewId));
  };

  return (
    <>
      <div className={styles.ppRoot}>

        {/* ── Topbar ── */}
        <div className={styles.ppTopbar}>
          <button className={styles.ppBack} onClick={() => navigate(-1)}>
            <FaArrowLeft size={10} /> Retour
          </button>
        </div>

        {/* ── Main ── */}
        <div className={styles.ppMain}>

          {/* Image */}
          <div className={styles.ppImgWrap}>
            <img src={product.img_url} alt={product.name} className={styles.ppImg} />
          </div>

          {/* Info */}
          <div className={styles.ppInfo}>
            <p className={styles.ppLabel}>FTK Merch</p>
            <h1 className={styles.ppName}>{product.name}</h1>
            <p className={styles.ppPrice}>{(product.price_in_cents / 100).toFixed(2)} €</p>

            {product.description && (
              <p className={styles.ppDesc}>{product.description}</p>
            )}

            {/* Couleurs */}
            <div style={{ marginBottom: "20px" }}>
              <p className={styles.ppOptionLabel}>
                Couleur
                {selectedColor && <span>{selectedColor}</span>}
              </p>
              <div className={styles.ppColors}>
                {availableColors.map(color => {
                  const hex = variants.find(v => v.color === color)?.color_hex;
                  return (
                    <button
                      key={color}
                      onClick={() => handleSelectColor(color)}
                      className={`${styles.ppColorBtn} ${selectedColor === color ? styles.selected : ""}`}
                      style={{ display: "flex", alignItems: "center", gap: "7px" }}
                    >
                      <span style={{
                        width: "12px", height: "12px",
                        borderRadius: "50%",
                        background: hex || color,
                        border: "1.5px solid rgba(0,0,0,0.1)",
                        flexShrink: 0,
                      }} />
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tailles */}
            <div style={{ marginBottom: "28px" }}>
              <p className={styles.ppOptionLabel}>
                Taille
                {selectedSize && <span>{selectedSize}</span>}
              </p>
              <div className={styles.ppSizes}>
                {availableSizes.map(({ size, stock }) => (
                  <button
                    key={size}
                    onClick={() => stock > 0 && setSelectedSize(size)}
                    className={`${styles.ppSizeBtn} ${selectedSize === size ? styles.selected : ""} ${stock === 0 ? styles.out : ""}`}
                    disabled={stock === 0}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || addedToCart}
              className={`${styles.ppAddBtn} ${addedToCart ? styles.done : !selectedSize ? styles.disabled : styles.ready}`}
            >
              <FaShoppingCart size={14} />
              {addedToCart ? "Ajouté au panier ✓" : !selectedSize ? "Sélectionnez une taille" : "Ajouter au panier"}
            </button>

          </div>
        </div>

        {/* ── Reviews ── */}
        <div className={styles.ppReviews}>
          <div className={styles.ppReviewsHeader}>
            <h2 className={styles.ppReviewsTitle}>Commentaires</h2>
            <span className={styles.ppReviewsCount}>{comments.length} avis</span>
          </div>

          {comments.length > 0 ? (
            comments.map(c => (
              <div key={c.id} className={styles.ppReviewItem}>
                <div className={styles.ppReviewLeft}>
                  <div className={styles.ppReviewAvatar}>
                    <FaUser size={13} />
                  </div>
                  <div>
                    <p className={styles.ppReviewAuthor}>{c.first_name}</p>
                    <p className={styles.ppReviewText}>{c.comment}</p>
                  </div>
                </div>
                {(user?.role === "admin" || user?.id === c.users_id) && (
                  <button className={styles.ppReviewDelete} onClick={() => handleDeleteReview(c.id)} title="Supprimer">
                    <FaTrash size={11} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p style={{ fontSize: "0.82rem", color: "#9ca3af", marginBottom: "16px" }}>
              Aucun commentaire pour ce produit.
            </p>
          )}

          {user && !hasAlreadyCommented && (
            <div className={styles.ppReviewForm}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#374151", marginBottom: "10px" }}>
                Laisser un avis
              </p>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Partagez votre expérience..."
                className={styles.ppReviewTextarea}
                rows={3}
              />
              {submitError && (
                <p style={{ fontSize: "0.78rem", color: "#e11d48", marginBottom: "8px" }}>{submitError}</p>
              )}
              <button onClick={handleSubmitReview} className={styles.ppReviewSubmit}>
                Publier
              </button>
            </div>
          )}

          {user && hasAlreadyCommented && (
            <p className={styles.ppReviewNote}>Vous avez déjà laissé un avis sur ce produit.</p>
          )}

          {!user && (
            <p className={styles.ppReviewNote}>
              <Link to="/login">Connectez-vous</Link> pour laisser un commentaire.
            </p>
          )}
        </div>
      </div>
    </>
  );
}