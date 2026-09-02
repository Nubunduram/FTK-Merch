import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../../api/admin";
import { FaBoxOpen, FaClipboardList, FaLayerGroup, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";
import styles from './AdminDashboard.module.css';

const STATUS_CONFIG = {
    pending: { label: "En attente", bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    paid: { label: "Payé", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    shipped: { label: "Expédié", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    delivered: { label: "Livré", bg: "#f0fdfa", color: "#0d9488", border: "#99f6e4" },
    cancelled: { label: "Annulé", bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
};

const ALERT_PAGE_SIZE = 5;

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAllAlerts, setShowAllAlerts] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminStats();
                setStats(data);
            } catch (err) {
                console.error("Erreur stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

    return (
        <>
            <div className={styles.dashRoot}>

                {/* ── Greeting ── */}
                <div className={styles.dashGreeting}>
                    <h1 className={styles.dashGreetingTitle}>{greeting}</h1>
                    <p className={styles.dashGreetingSub}>
                        {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                </div>

                {/* ── Stats principales ── */}
                <div className={styles.dashGridTop}>
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className={styles.dashSkeleton} />)
                    ) : (
                        <>
                            {/* Chiffre d'affaires */}
                            <div className={`${styles.dashStatCard} ${styles.highlight}`}>
                                <p className={styles.dashStatLabel}>Chiffre d'affaires</p>
                                <p className={styles.dashStatValue}>
                                    {(Number(stats?.orders?.total_revenue || 0) / 100).toFixed(2)} €
                                </p>
                                <p className={styles.dashStatSub}>Total des ventes</p>
                            </div>

                            {/* Total commandes */}
                            <div className={styles.dashStatCard}>
                                <p className={styles.dashStatLabel}><FaClipboardList size={11} /> Commandes</p>
                                <p className={styles.dashStatValue}>{stats?.orders?.total_orders || 0}</p>
                                <p className={styles.dashStatSub}>Toutes commandes confondues</p>
                            </div>

                            {/* Produits */}
                            <div className={styles.dashStatCard}>
                                <p className={styles.dashStatLabel}><FaBoxOpen size={11} /> Produits</p>
                                <p className={styles.dashStatValue}>{stats?.products?.total_products || 0}</p>
                                <p className={styles.dashStatSub}>Produits en catalogue</p>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Statuts commandes ── */}
                <div className={styles.dashSectionHeader}>
                    <span className={styles.dashSectionTitle}>Statuts des commandes</span>
                    <div className={styles.dashSectionLine} />
                </div>

                <div className={styles.dashStatusGrid}>
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ height: "80px", borderRadius: "12px", background: "linear-gradient(90deg, #f3f4f6 25%, #eaebec 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", animation: "dash-shimmer 1.4s infinite" }} />
                        ))
                    ) : (
                        Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                            <div
                                key={key}
                                className={styles.dashStatusPill}
                                style={{ background: cfg.bg, borderColor: cfg.border }}
                            >
                                <p className={styles.dashStatusNum} style={{ color: cfg.color }}>
                                    {stats?.orders?.[key] || 0}
                                </p>
                                <p className={styles.dashStatusLabel} style={{ color: cfg.color }}>
                                    {cfg.label}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* ── Raccourcis ── */}
                <div className={styles.dashSectionHeader}>
                    <span className={styles.dashSectionTitle}>Accès rapide</span>
                    <div className={styles.dashSectionLine} />
                </div>

                <div className={styles.dashShortcuts}>
                    <Link to="products" className={styles.dashShortcut}>
                        <div className={styles.dashShortcutLeft}>
                            <div className={styles.dashShortcutIcon}><FaBoxOpen size={16} /></div>
                            <div>
                                <p className={styles.dashShortcutTitle}>Gestion des produits</p>
                                <p className={styles.dashShortcutSub}>Ajouter, modifier, supprimer</p>
                            </div>
                        </div>
                        <FaArrowRight size={13} className={styles.dashShortcutArrow} />
                    </Link>

                    <Link to="orders" className={styles.dashShortcut}>
                        <div className={styles.dashShortcutLeft}>
                            <div className={styles.dashShortcutIcon}><FaClipboardList size={16} /></div>
                            <div>
                                <p className={styles.dashShortcutTitle}>Gestion des commandes</p>
                                <p className={styles.dashShortcutSub}>Suivre et mettre à jour les statuts</p>
                            </div>
                        </div>
                        <FaArrowRight size={13} className={styles.dashShortcutArrow} />
                    </Link>

                    <Link to="categories" className={styles.dashShortcut}>
                        <div className={styles.dashShortcutLeft}>
                            <div className={styles.dashShortcutIcon}><FaLayerGroup size={15} /></div>
                            <div>
                                <p className={styles.dashShortcutTitle}>Gestion des catégories</p>
                                <p className={styles.dashShortcutSub}>Catégories, sous-catégories, ordre</p>
                            </div>
                        </div>
                        <FaArrowRight size={13} className={styles.dashShortcutArrow} />
                    </Link>
                </div>

                {/* ── Alertes stock ── */}
                {!loading && stats?.low_stock?.length > 0 && (
                    <>
                        <div className={styles.dashSectionHeader}>
                            <span className={styles.dashSectionTitle}>Alertes stock</span>
                            <div className={styles.dashSectionLine} />
                        </div>

                        <div className={styles.dashAlertCard}>
                            <div className={styles.dashAlertHeader}>
                                <FaExclamationTriangle size={13} color="#d97706" />
                                <span className={styles.dashAlertHeaderTitle}>Stocks faibles</span>
                                <span className={styles.dashAlertCount}>{stats.low_stock.length} variante{stats.low_stock.length > 1 ? "s" : ""}</span>
                            </div>

                            {(showAllAlerts ? stats.low_stock : stats.low_stock.slice(0, ALERT_PAGE_SIZE)).map(item => (
                                <div key={item.id} className={styles.dashAlertItem}>
                                    <div>
                                        <p className={styles.dashAlertName}>{item.name}</p>
                                        <p className={styles.dashAlertMeta}>{item.color} · {item.size}</p>
                                    </div>
                                    <span className={`${styles.dashAlertStock} ${item.stock === 0 ? styles.zero : styles.low}`}>
                                        {item.stock === 0 ? "Rupture" : `${item.stock} restant${item.stock > 1 ? "s" : ""}`}
                                    </span>
                                </div>
                            ))}
                            {stats.low_stock.length > ALERT_PAGE_SIZE && (
                                <button
                                    className={styles.dashAlertMoreBtn}
                                    onClick={() => setShowAllAlerts(v => !v)}
                                >
                                    {showAllAlerts
                                        ? "Réduire"
                                        : `Voir les ${stats.low_stock.length - ALERT_PAGE_SIZE} autres`}
                                </button>
                            )}
                        </div>
                    </>
                )}

            </div>
        </>
    );
}