export function getOrderStatus(status) {
  switch (status) {
    case "pending":   return { label: "En attente", bg: "#fffbeb", color: "#d97706", border: "#fde68a" }
    case "paid":      return { label: "Payé",       bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" }
    case "shipped":   return { label: "Expédié",    bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" }
    case "delivered": return { label: "Livré",      bg: "#f0fdfa", color: "#0d9488", border: "#99f6e4" }
    case "canceled":  return { label: "Annulé",     bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" }
    default:          return { label: status,       bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" }
  }
}
