import { Link } from "react-router-dom";
import { FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import styles from './Cancel.module.css';

export default function Cancel() {
  return (
    <>
      <div className={styles.cancelRoot}>
        <div className={styles.cancelCard}>

          <div className={styles.cancelIconWrap}>
            <span className={styles.cancelX}>✕</span>
          </div>

          <h1 className={styles.cancelTitle}>Paiement annulé</h1>
          <p className={styles.cancelSub}>
            Votre transaction a été annulée et aucun montant n'a été débité.<br />
            Vous pouvez réessayer ou continuer vos achats.
          </p>

          <div className={styles.cancelDivider} />

          <div className={styles.cancelActions}>
            <Link to="/cart" className={styles.cancelBtnPrimary}>
              <FaShoppingCart size={13} /> Retourner au panier
            </Link>
            <Link to="/" className={styles.cancelBtnSecondary}>
              <FaArrowLeft size={12} /> Continuer mes achats
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
