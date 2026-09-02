import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../../api/admin";
import styles from './OrdersAdmin.module.css';

const ORDER_STATUSES = [
  { value: "pending",   label: "En attente" },
  { value: "paid",      label: "Payé" },
  { value: "shipped",   label: "Expédié" },
  { value: "delivered", label: "Livré" },
  { value: "canceled", label: "Annulé" },
];

const STATUS_STYLES = {
  pending:   { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  paid:      { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  shipped:   { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  delivered: { bg: "#f0fdfa", color: "#0d9488", border: "#99f6e4" },
  canceled: { bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
};

const PAGE_SIZE = 15;

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const filteredOrders = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  const pageCount = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filter changes
  const handleFilterChange = (val) => { setFilterStatus(val); setPage(1); };

  // Stats
  const countByStatus = (s) => orders.filter(o => o.status === s).length;

  return (
    <>
      <div className={styles.oadmRoot}>

        {/* ── Header ── */}
        <div className={styles.oadmHeader}>
          <div>
            <h1 className={styles.oadmTitle}>Gestion des commandes</h1>
            <div className={styles.oadmStats}>
              {ORDER_STATUSES.map(s => {
                const style = STATUS_STYLES[s.value] || STATUS_STYLES.pending;
                const count = countByStatus(s.value);
                if (count === 0) return null;
                return (
                  <span
                    key={s.value}
                    className={styles.oadmStat}
                    style={{ background: style.bg, color: style.color, borderColor: style.border }}
                    onClick={() => handleFilterChange(filterStatus === s.value ? "" : s.value)}
                  >
                    {s.label} · {count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className={styles.oadmToolbar}>
          <div className={styles.oadmFilterWrap}>
            <span className={styles.oadmFilterLabel}>Filtrer</span>
            <select
              value={filterStatus}
              onChange={e => handleFilterChange(e.target.value)}
              className={styles.oadmSelect}
            >
              <option value="">Tous les statuts</option>
              {ORDER_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <span className={styles.oadmCount}>
            {filteredOrders.length} commande{filteredOrders.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Table ── */}
        <div className={styles.oadmTableWrap}>
          <table className={styles.oadmTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Adresse</th>
                <th>Total</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i} className={styles.oadmSkeletonRow}>
                    {[80, 100, 180, 60, 110].map((w, j) => (
                      <td key={j}><div className={styles.oadmSkeletonCell} style={{ width: w }} /></td>
                    ))}
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.oadmEmpty}>Aucune commande trouvée.</td>
                </tr>
              ) : (
                pagedOrders.map(order => {
                  const style = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                  return (
                    <tr key={order.id}>
                      <td><span className={styles.oadmId}>#{order.id}</span></td>
                      <td>
                        <span className={styles.oadmDate}>
                          {new Date(order.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </span>
                      </td>
                      <td>
                        <span className={styles.oadmAddress}>
                          {order.street}, {order.postal_code} {order.city}
                        </span>
                      </td>
                      <td>
                        <span className={styles.oadmAmount}>
                          {(order.total_amount_in_cents / 100).toFixed(2)} €
                        </span>
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                          className={styles.oadmStatusSelect}
                          style={{
                            background: style.bg,
                            color: style.color,
                            borderColor: style.border,
                          }}
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {pageCount > 1 && (
            <div className={styles.oadmPagination}>
              <button
                className={styles.oadmPageBtn}
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                ← Précédent
              </button>
              <span className={styles.oadmPageInfo}>Page {page} / {pageCount}</span>
              <button
                className={styles.oadmPageBtn}
                onClick={() => setPage(p => p + 1)}
                disabled={page === pageCount}
              >
                Suivant →
              </button>
            </div>
          )}
        </div>

      </div>
    </>
  );
}