import { createContext, useContext, useState, useCallback, useEffect } from "react"

const ConfirmContext = createContext(null)

export function useConfirm() {
  return useContext(ConfirmContext)
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)
  const [visible, setVisible] = useState(false)

  const confirm = useCallback(({ title, message, confirmLabel = "Confirmer", dangerous = false }) => {
    return new Promise((resolve) => {
      setState({ title, message, confirmLabel, dangerous, resolve })
    })
  }, [])

  // Double rAF : 1er frame = élément monté en DOM (opacity:0), 2e frame = transition déclenchée
  useEffect(() => {
    if (!state) return
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true))
    })
    return () => cancelAnimationFrame(raf)
  }, [state])

  const close = (result) => {
    setVisible(false)
    // Attendre la fin de la transition avant de démonter
    setTimeout(() => {
      state.resolve(result)
      setState(null)
    }, 200)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => close(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 10000,
              opacity: visible ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          />

          {/* Modal */}
          <div style={{
            position: "fixed",
            top: "50%", left: "50%",
            zIndex: 10001,
            background: "#fff",
            borderRadius: "16px",
            padding: "28px 28px 24px",
            width: "min(420px, calc(100vw - 32px))",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            fontFamily: "'DM Sans', sans-serif",
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translate(-50%, -50%) scale(1) translateY(0px)"
              : "translate(-50%, -50%) scale(0.95) translateY(12px)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}>
            <p style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.15rem",
              letterSpacing: "0.06em",
              color: state.dangerous ? "#e11d48" : "#111827",
              marginBottom: "10px",
            }}>
              {state.title}
            </p>

            <p style={{
              fontSize: "0.85rem",
              color: "#6b7280",
              lineHeight: 1.6,
              marginBottom: "24px",
              margin: "0 0 24px",
            }}>
              {state.message}
            </p>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => close(false)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.8rem", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.07em",
                  padding: "9px 18px",
                  background: "transparent", color: "#6b7280",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "9px", cursor: "pointer",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#9ca3af"; e.currentTarget.style.color = "#374151" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#6b7280" }}
              >
                Annuler
              </button>

              <button
                onClick={() => close(true)}
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.8rem", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.07em",
                  padding: "9px 18px",
                  background: state.dangerous ? "#e11d48" : "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "9px", cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.85" }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1" }}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </>
      )}
    </ConfirmContext.Provider>
  )
}
