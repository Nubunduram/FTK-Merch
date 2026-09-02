import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenu, HiX, HiShoppingCart } from "react-icons/hi";
import { FaReceipt, FaUser, FaCog } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCategories } from "../context/CategoriesContext";
import styles from './Header.module.css';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { categories } = useCategories();
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const location = useLocation();

  const cartItemCount = cart
    ? cart.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  const isActive = (path) => location.pathname === path;
  const isActiveSub = (path) => location.pathname.startsWith(path);
  const isActiveCategory = (slug) => {
    const path = location.pathname;
    return path === `/category/${slug}` || path.startsWith(`/category/${slug}/`);
  };

  // ✅ Track scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Track si on est mobile — ferme le menu si on passe en desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fermer le drawer au changement de route
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);


  return (
    <>
      <header className={`${styles.ftkHeader} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.ftkTopbar} />

        <div className={styles.ftkInner}>

          {/* ── Logo ── */}
          <Link to="/" className={styles.ftkLogo} style={{ marginRight: "2.5rem" }}>
            FTK<span className={styles.ftkLogoDot} />MERCH
          </Link>

          {/* ── Desktop Nav ── */}
          {!isMobile && (
            <nav style={{ display: "flex", alignItems: "center", gap: "2rem", flex: 1 }}>
              <Link to="/" className={`${styles.ftkNavLink} ${isActive("/") ? styles.ftkActive : ""}`}>
                Accueil
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className={`${styles.ftkNavLink} ${isActiveCategory(cat.slug) ? styles.ftkActive : ""}`}
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          )}

          {/* ── Desktop Actions ── */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "2.5rem" }}>
              {user && (
                <Link
                  to="/profile"
                  className={`${styles.ftkIconBtn} ${isActive("/profile") ? styles.ftkActive : ""}`}
                  title="Mon profil"
                >
                  <FaUser size={15} />
                </Link>
              )}

              {user && (
                <Link
                  to="/orders"
                  className={`${styles.ftkIconBtn} ${isActiveSub("/order") ? styles.ftkActive : ""}`}
                  title="Mes commandes"
                >
                  <FaReceipt size={15} />
                </Link>
              )}

              <Link
                to="/cart"
                className={`${styles.ftkIconBtn} ${isActive("/cart") ? styles.ftkActive : ""}`}
                title="Panier"
              >
                <HiShoppingCart size={18} />
                {cartItemCount > 0 && (
                  <span className={styles.ftkCartBadge}>
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </Link>

              <div style={{ marginLeft: "8px" }}>
                {!user ? (
                  <Link to="/login" className={styles.ftkBtnLogin}>
                    Connexion
                  </Link>
                ) : (
                  <button onClick={logout} className={styles.ftkBtnLogout}>
                    Déconnexion
                  </button>
                )}
              </div>

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className={`${styles.ftkIconBtn} ${isActiveSub("/admin") ? styles.ftkActive : ""}`}
                  style={{ marginLeft: "4px" }}
                  title="Administration"
                >
                  <FaCog size={15} />
                </Link>
              )}
            </div>
          )}

          {/* ── Mobile : panier + toggle ── */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Link
                to="/cart"
                className={`${styles.ftkIconBtn} ${isActive("/cart") ? styles.ftkActive : ""}`}
              >
                <HiShoppingCart size={18} />
                {cartItemCount > 0 && (
                  <span className={styles.ftkCartBadge}>
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
              </Link>

              <button
                className={styles.ftkIconBtn}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu"
              >
                {isOpen ? <HiX size={20} /> : <HiMenu size={20} />}
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile Drawer — rendu uniquement si mobile ET ouvert ── */}
        {isMobile && isOpen && (
          <div className={styles.ftkDrawer}>

            <Link
              to="/"
              className={`${styles.ftkMobileLink} ${isActive("/") ? styles.ftkActive : ""}`}
            >
              {isActive("/") && <span className={styles.ftkPip} />}
              Accueil
            </Link>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`${styles.ftkMobileLink} capitalize ${isActiveCategory(cat.slug) ? styles.ftkActive : ""}`}
              >
                {isActiveCategory(cat.slug) && <span className={styles.ftkPip} />}
                {cat.name}
              </Link>
            ))}

            <div className={styles.ftkDivider} />

            {user && (
              <Link
                to="/profile"
                className={`${styles.ftkMobileLink} ${isActive("/profile") ? styles.ftkActive : ""}`}
              >
                <FaUser size={13} /> Mon profil
              </Link>
            )}

            {user && (
              <Link
                to="/orders"
                className={`${styles.ftkMobileLink} ${isActiveSub("/order") ? styles.ftkActive : ""}`}
              >
                <FaReceipt size={13} /> Mes commandes
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin"
                className={`${styles.ftkMobileLink} ${isActiveSub("/admin") ? styles.ftkActive : ""}`}
              >
                <FaCog size={13} /> Administration
              </Link>
            )}

            <div className={styles.ftkDivider} />

            <div style={{ paddingTop: "4px" }}>
              {!user ? (
                <Link to="/login" className={styles.ftkBtnLogin} style={{ display: "block", textAlign: "center" }}>
                  Connexion
                </Link>
              ) : (
                <button
                  className={styles.ftkBtnLogout}
                  style={{ width: "100%", textAlign: "center" }}
                  onClick={logout}
                >
                  Déconnexion
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
