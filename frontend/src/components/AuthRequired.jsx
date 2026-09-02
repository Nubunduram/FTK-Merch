import { Link } from "react-router-dom"
import { FaLock } from "react-icons/fa"
import styles from './AuthRequired.module.css'

export default function AuthRequired() {
  return (
    <div className={styles.arRoot}>
      <div className={styles.arCard}>
        <div className={styles.arIcon}><FaLock size={18} /></div>
        <p className={styles.arTitle}>Accès réservé</p>
        <p className={styles.arSub}>Connectez-vous pour accéder à cette page.</p>
        <div className={styles.arActions}>
          <Link to="/login" className={styles.arBtnPrimary}>Se connecter</Link>
          <Link to="/signup" className={styles.arBtnOutline}>Créer un compte</Link>
        </div>
      </div>
    </div>
  )
}
