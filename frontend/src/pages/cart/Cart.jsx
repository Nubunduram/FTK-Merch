import { useCart } from "../../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { createCheckoutSession } from "../../api/orders";
import { getUserAddresses } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { FaTrash, FaShoppingBag, FaArrowLeft, FaTruck, FaLock } from "react-icons/fa";
import styles from './Cart.module.css';

const SHIPPING_FEE = 5.90;
const FREE_SHIPPING_THRESHOLD = 60;

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    postal_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [stockError, setStockError] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const grandTotal = subtotal + shippingFee;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    if (!user) return;
    const fetchAddresses = async () => {
      try {
        const data = await getUserAddresses();
        setAddresses(data);
      } catch (err) {
        console.error("Erreur chargement adresses :", err);
      }
    };
    fetchAddresses();
  }, [user]);

  useEffect(() => {
    if (selectedAddressId) {
      const addr = addresses.find(a => a.id === selectedAddressId);
      if (addr) setAddressForm(addr);
    } else {
      setAddressForm({ street: "", city: "", postal_code: "" });
    }
  }, [selectedAddressId, addresses]);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login?redirect=/cart");
      return;
    }
    if (cart.length === 0) return;
    const { street, city, postal_code } = addressForm;
    if (!street || !city || !postal_code) {
      setErrorMsg("Veuillez remplir l'adresse de livraison complète.");
      setStockError(null);
      return;
    }
    setErrorMsg(null);
    setStockError(null);
    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product_variants_id: item.product_variants_id,
          quantity: item.quantity,
        })),
        address: { street, city, postal_code }
      };
      const { url } = await createCheckoutSession(orderData);
      // Redirection vers la page de paiement Stripe (externe)
      window.location.href = url;
    } catch (err) {
      if (err.message === "STOCK_ERROR") {
        setStockError(err.stockItems);
      } else {
        console.error("Erreur lors de la commande:", err);
        setErrorMsg("Une erreur est survenue. Veuillez réessayer.");
      }
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.cartRoot}>
        <div className={styles.cartInner}>

          <Link to="/" className={styles.cartBack}>
            <FaArrowLeft size={11} /> Continuer mes achats
          </Link>

          <h1 className={styles.cartTitle}>Mon Panier</h1>

          {cart.length === 0 ? (
            <div className={styles.cartEmpty}>
              <div className={styles.cartEmptyIcon}>
                <FaShoppingBag />
              </div>
              <p className={styles.cartEmptyTitle}>Votre panier est vide</p>
              <p className={styles.cartEmptySub}>Ajoutez des produits pour commencer.</p>
              <Link to="/" className={styles.cartEmptyBtn}>
                <FaArrowLeft size={11} /> Voir la boutique
              </Link>
            </div>
          ) : (
            <>
              <p className={styles.cartCount}>{cart.length} article{cart.length > 1 ? "s" : ""}</p>

              <div className={styles.cartLayout}>

                {/* ── Liste articles ── */}
                <div className={styles.cartItemsCard}>
                  {cart.map(item => (
                    <div key={`${item.product_variants_id}-${item.color}-${item.size}`} className={styles.cartItem}>

                      {item.img_url ? (
                        <img src={item.img_url} alt={item.name} className={styles.cartItemImg} />
                      ) : (
                        <div className={styles.cartItemImgPlaceholder}>
                          <FaShoppingBag size={22} />
                        </div>
                      )}

                      <div className={styles.cartItemInfo}>
                        <p className={styles.cartItemName}>{item.name}</p>
                        <p className={styles.cartItemMeta}>{item.color} · {item.size}</p>
                        <p className={styles.cartItemPrice}>{(item.price * item.quantity).toFixed(2)} €</p>
                      </div>

                      <div className={styles.cartItemActions}>
                        <button
                          className={styles.cartQtyBtn}
                          onClick={() => updateQuantity(item, Math.max(1, item.quantity - 1))}
                        >
                          −
                        </button>
                        <span className={styles.cartQtyVal}>{item.quantity}</span>
                        <button
                          className={styles.cartQtyBtn}
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                        >
                          +
                        </button>

                        <button
                          className={styles.cartRemoveBtn}
                          onClick={() => removeFromCart(item)}
                          title="Supprimer"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Sidebar ── */}
                <div className={styles.cartSidebar}>

                  {/* Adresse */}
                  <div className={styles.cartAddressCard}>
                    <p className={styles.cartSectionTitle}>Adresse de livraison</p>

                    {addresses.length > 0 && (
                      <select
                        value={selectedAddressId || ""}
                        onChange={e => setSelectedAddressId(Number(e.target.value) || null)}
                        className={styles.cartSelect}
                      >
                        <option value="">— Nouvelle adresse —</option>
                        {addresses.map(addr => (
                          <option key={addr.id} value={addr.id}>
                            {addr.label} · {addr.street}, {addr.city}
                          </option>
                        ))}
                      </select>
                    )}

                    <input
                      value={addressForm.street}
                      onChange={e => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="Rue"
                      className={styles.cartInput}
                    />
                    <input
                      value={addressForm.city}
                      onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="Ville"
                      className={styles.cartInput}
                    />
                    <input
                      value={addressForm.postal_code}
                      onChange={e => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                      placeholder="Code postal"
                      className={styles.cartInput}
                      style={{ marginBottom: 0 }}
                    />
                  </div>

                  {/* Résumé + CTA */}
                  <div className={styles.cartSummaryCard}>
                    <p className={styles.cartSectionTitle}>Résumé</p>

                    {cart.map(item => (
                      <div key={item.product_variants_id} className={styles.cartSummaryRow}>
                        <span>{item.name} × {item.quantity}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    ))}

                    <div className={styles.cartSummaryRowShipping}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <FaTruck size={12} /> Livraison
                      </span>
                      {shippingFee === 0
                        ? <span className={styles.cartShippingFreeBadge}>Offerte</span>
                        : <span>{shippingFee.toFixed(2)} €</span>
                      }
                    </div>

                    <div className={styles.cartSummaryTotal}>
                      <span className={styles.cartTotalLabel}>Total</span>
                      <span className={styles.cartTotalPrice}>{grandTotal.toFixed(2)} €</span>
                    </div>

                    {amountToFreeShipping > 0 && (
                      <div className={styles.cartShippingBanner} style={{ marginTop: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaTruck size={12} />
                          Plus que <strong>{amountToFreeShipping.toFixed(2)} €</strong> pour la livraison offerte
                        </div>
                        <div className={styles.cartShippingProgressTrack}>
                          <div
                            className={styles.cartShippingProgressBar}
                            style={{ width: `${freeShippingProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {shippingFee === 0 && (
                      <div className={`${styles.cartShippingBanner} ${styles.free}`} style={{ marginTop: "12px" }}>
                        <FaTruck size={12} style={{ display: "inline", marginRight: "6px" }} />
                        Livraison offerte !
                      </div>
                    )}

                    {errorMsg && (
                      <div className={styles.cartErrorBanner}>{errorMsg}</div>
                    )}

                    {stockError && (
                      <div className={styles.cartStockError} style={{ marginTop: "14px" }}>
                        <p className={styles.cartStockErrorTitle}>
                          Stock insuffisant
                        </p>
                        {stockError.map((item, i) => (
                          <div key={i} className={styles.cartStockErrorItem}>
                            <div>
                              <p className={styles.cartStockErrorName}>{item.name}</p>
                              <p className={styles.cartStockErrorMeta}>{item.color} · {item.size}</p>
                            </div>
                            <span className={styles.cartStockErrorQty}>
                              {item.available === 0
                                ? "Rupture de stock"
                                : `${item.available} disponible${item.available > 1 ? "s" : ""}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!authLoading && !user ? (
                      <div className={styles.cartAuthPrompt}>
                        <div className={styles.cartAuthPromptIcon}><FaLock size={14} /></div>
                        <p className={styles.cartAuthPromptTitle}>Connexion requise</p>
                        <p className={styles.cartAuthPromptSub}>Connectez-vous pour finaliser votre commande.</p>
                        <Link to="/login?redirect=/cart" className={styles.cartAuthBtnPrimary}>Se connecter</Link>
                        <Link to="/signup?redirect=/cart" className={styles.cartAuthBtnOutline}>Créer un compte</Link>
                      </div>
                    ) : (
                      <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className={styles.cartCheckoutBtn}
                      >
                        <FaShoppingBag size={14} />
                        {loading ? "Traitement..." : "Passer la commande"}
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}