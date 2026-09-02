import { Link } from "react-router-dom";
import { FaInstagram, FaTwitter, FaTiktok, FaYoutube } from "react-icons/fa";
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <footer className={styles.ftkFooter}>
        <div className={styles.ftkFooterBar} />

        <div className={styles.ftkContainer}>
          <div className={styles.ftkGrid}>

            {/* ── Brand ── */}
            <div>
              <Link to="/" className={styles.ftkFooterLogo}>
                FTK<span className={styles.ftkFooterLogoDot} />MERCH
              </Link>
              <p className={styles.ftkFooterTagline}>Collection exclusive</p>
              <p className={styles.ftkFooterDesc}>
                Des vêtements pensés pour ceux qui osent s'affirmer. Qualité premium, style unique.
              </p>
              <div className={styles.ftkSocialRow}>
                <a href="#" className={styles.ftkSocial} aria-label="Instagram"><FaInstagram size={15} /></a>
                <a href="#" className={styles.ftkSocial} aria-label="TikTok"><FaTiktok size={14} /></a>
                <a href="#" className={styles.ftkSocial} aria-label="Twitter"><FaTwitter size={14} /></a>
                <a href="#" className={styles.ftkSocial} aria-label="YouTube"><FaYoutube size={15} /></a>
              </div>
            </div>

            {/* ── Boutique ── */}
            <div>
              <p className={styles.ftkFooterHeading}>Boutique</p>
              <Link to="/" className={styles.ftkFooterLink}>Accueil</Link>
              <Link to="/category/homme" className={styles.ftkFooterLink}>Homme</Link>
              <Link to="/category/femme" className={styles.ftkFooterLink}>Femme</Link>
              <Link to="/category/enfants" className={styles.ftkFooterLink}>Enfants</Link>
            </div>

            {/* ── Mon compte ── */}
            <div>
              <p className={styles.ftkFooterHeading}>Mon compte</p>
              <Link to="/profile" className={styles.ftkFooterLink}>Mon profil</Link>
              <Link to="/orders" className={styles.ftkFooterLink}>Mes commandes</Link>
              <Link to="/cart" className={styles.ftkFooterLink}>Mon panier</Link>
              <Link to="/login" className={styles.ftkFooterLink}>Connexion</Link>
            </div>

            {/* ── Infos ── */}
            <div>
              <p className={styles.ftkFooterHeading}>Informations</p>
              <Link to="/mentions-legales" className={styles.ftkFooterLink}>Mentions légales</Link>
              <a href="mailto:[EMAIL_CONTACT]" className={styles.ftkFooterLink}>Contact</a>

              <div style={{ marginTop: "1.5rem" }}>
                <span className={styles.ftkBadge}>
                  <span className={styles.ftkBadgeDot} />
                  Livraison offerte dès 60€
                </span>
              </div>
            </div>
          </div>

          <hr className={styles.ftkFooterHr} />

          <div className={styles.ftkFooterBottom}>
            <span>© {year} FTK Merch — Tous droits réservés.</span>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <Link to="/confidentialite" className={styles.ftkFooterLink} style={{ marginBottom: 0 }}>Confidentialité</Link>
              <Link to="/cgv" className={styles.ftkFooterLink} style={{ marginBottom: 0 }}>CGV</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
