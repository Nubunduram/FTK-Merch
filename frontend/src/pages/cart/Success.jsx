import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FaArrowRight, FaReceipt } from "react-icons/fa"
import { useCart } from "../../context/CartContext"
import styles from './Success.module.css'

export default function Success() {
  const { clearCart } = useCart()
  const [loading, setLoading] = useState(true)

  useEffect(() => { clearCart() }, [])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={styles.scRoot}>
      {loading ? (
        <div className={styles.scLoader}>
          <div className={styles.scSpinner} />
          <p className={styles.scLoaderText}>Confirmation en cours...</p>
        </div>
      ) : (
        <div className={styles.scCard}>

          <div className={styles.scCheckWrap}>
            <div className={styles.scCheckBg}>
              <svg width="40" height="40" viewBox="0 0 52 52" fill="none">
                <path
                  className={styles.scCheckmark}
                  stroke="#16a34a"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 27l7 7 16-16"
                />
              </svg>
            </div>
          </div>

          <h1 className={styles.scTitle}>Commande confirmée !</h1>
          <p className={styles.scSub}>
            Merci pour votre achat. Vous recevrez un email de confirmation sous peu.
          </p>

          <div className={styles.scDivider} />

          <div className={styles.scActions}>
            <Link to="/orders" className={styles.scBtnPrimary}>
              <FaReceipt size={12} /> Voir mes commandes
            </Link>
            <Link to="/" className={styles.scBtnSecondary}>
              Continuer mes achats <FaArrowRight size={11} />
            </Link>
          </div>

        </div>
      )}
    </div>
  )
}
