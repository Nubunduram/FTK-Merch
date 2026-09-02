import { Outlet, Link, useLocation } from "react-router-dom";
import { FaBoxOpen, FaClipboardList, FaLayerGroup } from "react-icons/fa";
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname.includes(path);

  return (
    <>
      <div className={styles.admLayout}>

        {/* ── Top bar ── */}
        <div className={styles.admTopbar}>
          <div className={styles.admTopbarInner}>
            <div className={styles.admTitle}>
              FTK MERCH
              <span className={styles.admTitleBadge}>Admin</span>
            </div>

            <nav className={styles.admNav}>
              <Link
                to="products"
                className={`${styles.admNavLink} ${isActive("products") ? "active" : ""}`}
              >
                <FaBoxOpen size={13} /> Produits
              </Link>
              <Link
                to="orders"
                className={`${styles.admNavLink} ${isActive("orders") ? "active" : ""}`}
              >
                <FaClipboardList size={13} /> Commandes
              </Link>
              <Link
                to="categories"
                className={`${styles.admNavLink} ${isActive("categories") ? "active" : ""}`}
              >
                <FaLayerGroup size={13} /> Catégories
              </Link>
            </nav>
          </div>
        </div>

        {/* ── Page content ── */}
        <div className={styles.admContent}>
          <Outlet />
        </div>

      </div>
    </>
  );
}
