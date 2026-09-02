import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate, useNavigate, useSearchParams, Link } from "react-router-dom";
import styles from './Login.module.css';

export default function Login() {
  const { login, authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  if (authLoading) return null;
  if (user) return <Navigate to={redirectTo} replace />;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate(redirectTo);
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setError(err.message || "Impossible de se connecter");
    }
  };

  return (
    <>
      <div className={styles.loginRoot}>

        {/* ── Panneau gauche ── */}
        <div className={styles.loginVisual}>
          <div className={styles.loginVisualBg} />

          <Link to="/" className={styles.loginVisualLogo}>
            FTK<span className={styles.loginVisualLogoDot} />MERCH
          </Link>

          <div className={styles.loginVisualCenter}>
            <h2 className={styles.loginVisualTitle}>
              Style.<br />
              <span>Qualité.</span><br />
              Caractère.
            </h2>
            <p className={styles.loginVisualDesc}>
              Connectez-vous pour accéder à vos commandes, votre profil et profiter de nos collections exclusives.
            </p>
          </div>

          <div className={styles.loginVisualBottom}>
            <span className={styles.loginVisualBadge}>Collection 2026</span>
            <span className={styles.loginVisualTagline}>Homme · Femme · Enfants</span>
          </div>
        </div>

        {/* ── Formulaire ── */}
        <div className={styles.loginFormSide}>
          <div className={styles.loginFormWrap}>

            <p className={styles.loginFormEyebrow}>Bienvenue</p>
            <h1 className={styles.loginFormTitle}>Connexion</h1>
            <p className={styles.loginFormSub}>Entrez vos identifiants pour continuer.</p>

            <form onSubmit={handleSubmit}>
              <div className={styles.loginField}>
                <label className={styles.loginLabel}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.loginInput}
                  placeholder="vous@email.com"
                />
              </div>

              <div className={styles.loginField}>
                <label className={styles.loginLabel}>Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.loginInput}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className={styles.loginError}>
                  <span>⚠</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className={styles.loginSubmit}
              >
                {authLoading ? "Connexion..." : "Se connecter →"}
              </button>
            </form>

            <div className={styles.loginDivider}>
              <div className={styles.loginDividerLine} />
              <span className={styles.loginDividerText}>ou</span>
              <div className={styles.loginDividerLine} />
            </div>

            <p className={styles.loginSignupLink}>
              Pas encore de compte ?{" "}
              <Link to={redirectTo !== "/" ? `/signup?redirect=${redirectTo}` : "/signup"}>Créer un compte</Link>
            </p>

          </div>
        </div>

      </div>
    </>
  );
}
