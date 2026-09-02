import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { FaCheck, FaExclamationTriangle, FaTimes, FaInfoCircle } from "react-icons/fa"

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

const CONFIG = {
  success: { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d", Icon: FaCheck },
  error:   { bg: "#fff1f2", border: "#fecdd3", color: "#e11d48", Icon: FaExclamationTriangle },
  warning: { bg: "#fffbeb", border: "#fde68a", color: "#d97706", Icon: FaExclamationTriangle },
  info:    { bg: "#f0f9ff", border: "#bae6fd", color: "#0369a1", Icon: FaInfoCircle },
}

function Toast({ id, message, type, onRemove }) {
  const [visible, setVisible] = useState(false)

  // Double rAF : monte en DOM invisible, puis déclenche la transition
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const dismiss = () => {
    setVisible(false)
    setTimeout(() => onRemove(id), 200)
  }

  const { bg, border, color, Icon } = CONFIG[type] || CONFIG.info

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: "12px",
        padding: "12px 14px",
        minWidth: "260px",
        maxWidth: "380px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
        fontFamily: "'DM Sans', sans-serif",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(20px)",
        transition: "opacity 0.22s ease, transform 0.22s ease",
      }}
    >
      <span style={{ color, marginTop: "1px", flexShrink: 0 }}>
        <Icon size={13} />
      </span>
      <p style={{ flex: 1, fontSize: "0.83rem", fontWeight: 500, color, lineHeight: 1.45, margin: 0 }}>
        {message}
      </p>
      <button
        onClick={dismiss}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#9ca3af", padding: "0 0 0 6px", flexShrink: 0,
          lineHeight: 1, marginTop: "1px",
        }}
      >
        <FaTimes size={11} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      // Déclenche le dismiss animé via le composant Toast lui-même n'est plus possible ici,
      // on retire directement après 4s (le toast a eu le temps d'apparaître)
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      <div style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
      }}>
        {toasts.map(({ id, message, type }) => (
          <div key={id} style={{ pointerEvents: "all" }}>
            <Toast id={id} message={message} type={type} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
