import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getOrderById } from "../../api/orders"
import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaBox } from "react-icons/fa"
import { getOrderStatus } from "../../utils/orderStatus"
import styles from './Order.module.css'

export default function Order() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id)
        setOrder(data)
      } catch (err) {
        console.error("Erreur lors de la récupération de la commande :", err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  if (loading) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "80px 32px", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
      Chargement de la commande...
    </div>
  )

  if (!order) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", padding: "80px 32px", textAlign: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
      Commande introuvable.
    </div>
  )

  const status = getOrderStatus(order.status)

  return (
    <>
      <div className={styles.ordRoot}>
        <div className={styles.ordInner}>

          {/* ── Back ── */}
          <button className={styles.ordBack} onClick={() => navigate("/orders")}>
            <FaArrowLeft size={10} /> Retour à l'historique
          </button>

          {/* ── Header ── */}
          <div className={styles.ordHeader}>
            <h1 className={styles.ordTitle}>Commande #{order.id}</h1>
            <span
              className={styles.ordStatusBadge}
              style={{ background: status.bg, color: status.color, borderColor: status.border }}
            >
              {status.label}
            </span>
          </div>

          <div className={styles.ordLayout}>

            {/* ── Résumé ── */}
            <div className={styles.ordSummaryCard}>
              <div className={styles.ordCardHeader}>
                <p className={styles.ordCardHeaderTitle}>Résumé</p>
              </div>
              <div className={styles.ordCardBody}>

                <div className={styles.ordInfoRow}>
                  <div className={styles.ordInfoIcon}><FaCalendarAlt size={12} /></div>
                  <div>
                    <p className={styles.ordInfoLabel}>Date</p>
                    <p className={styles.ordInfoValue}>
                      {new Date(order.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                <div className={styles.ordInfoRow}>
                  <div className={styles.ordInfoIcon}><FaMapMarkerAlt size={12} /></div>
                  <div>
                    <p className={styles.ordInfoLabel}>Adresse de livraison</p>
                    <p className={styles.ordInfoValue}>
                      {order.street}<br />
                      {order.postal_code} {order.city}
                    </p>
                  </div>
                </div>

                <div className={styles.ordInfoRow} style={{ marginBottom: 0 }}>
                  <div className={styles.ordInfoIcon}><FaBox size={11} /></div>
                  <div>
                    <p className={styles.ordInfoLabel}>Articles</p>
                    <p className={styles.ordInfoValue}>
                      {order.items?.length || 0} article{order.items?.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className={styles.ordCardDivider} />

                <div className={styles.ordTotalRow} style={{ marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>Sous-total</span>
                  <span style={{ fontSize: "0.82rem", color: "#374151" }}>
                    {((order.total_amount_in_cents - (order.shipping_fee_in_cents || 0)) / 100).toFixed(2)} €
                  </span>
                </div>

                <div className={styles.ordTotalRow} style={{ marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>Livraison</span>
                  {(order.shipping_fee_in_cents || 0) === 0
                    ? <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#16a34a" }}>Offerte</span>
                    : <span style={{ fontSize: "0.82rem", color: "#374151" }}>
                        {(order.shipping_fee_in_cents / 100).toFixed(2)} €
                      </span>
                  }
                </div>

                <div className={styles.ordTotalRow}>
                  <span className={styles.ordTotalLabel}>Total</span>
                  <span className={styles.ordTotalValue}>
                    {(order.total_amount_in_cents / 100).toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>

            {/* ── Articles ── */}
            <div className={styles.ordItemsCard}>
              <div className={styles.ordCardHeader}>
                <p className={styles.ordCardHeaderTitle}>Produits commandés</p>
              </div>

              {(order.items ?? []).map(item => (
                <div key={item.id} className={styles.ordItem}>
                  {item.img_url ? (
                    <img src={item.img_url} alt={item.name} className={styles.ordItemImg} />
                  ) : (
                    <div className={styles.ordItemImgPlaceholder}>
                      <FaBox size={18} />
                    </div>
                  )}

                  <div className={styles.ordItemInfo}>
                    <p className={styles.ordItemName}>{item.name}</p>
                    <p className={styles.ordItemMeta}>{item.color} · {item.size}</p>
                  </div>

                  <div className={styles.ordItemRight}>
                    <p className={styles.ordItemPrice}>{(item.unit_price_in_cents / 100).toFixed(2)} €</p>
                    <p className={styles.ordItemQty}>× {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}