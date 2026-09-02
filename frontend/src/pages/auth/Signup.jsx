import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from './Signup.module.css';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { signupAndLogin, authLoading, user } = useAuth();

  if (authLoading) return null;
  if (user) return <Navigate to={redirectTo} replace />;

  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      await signupAndLogin(first_name, last_name, email, password);
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.suRoot}>

        {/* ── Panneau gauche ── */}
        <div className={styles.suVisual}>
          <div className={styles.suVisualBg} />

          <Link to="/" className={styles.suVisualLogo}>
            FTK<span className={styles.suVisualLogoDot} />MERCH
          </Link>

          <div className={styles.suVisualCenter}>
            <h2 className={styles.suVisualTitle}>
              Rejoins<br />
              <span>la tribu.</span>
            </h2>
            <div className={styles.suVisualPerks}>
              <div className={styles.suVisualPerk}>
                <span className={styles.suVisualPerkDot} />
                Accès à votre historique de commandes
              </div>
              <div className={styles.suVisualPerk}>
                <span className={styles.suVisualPerkDot} />
                Adresses sauvegardées pour un checkout rapide
              </div>
              <div className={styles.suVisualPerk}>
                <span className={styles.suVisualPerkDot} />
                Nouvelles collections en avant-première
              </div>
            </div>
          </div>

          <div className={styles.suVisualBottom}>
            <span className={styles.suVisualBadge}>Inscription gratuite</span>
            <span className={styles.suVisualTagline}>En quelques secondes</span>
          </div>
        </div>

        {/* ── Formulaire ── */}
        <div className={styles.suFormSide}>
          <div className={styles.suFormWrap}>

            <p className={styles.suFormEyebrow}>Nouveau compte</p>
            <h1 className={styles.suFormTitle}>Inscription</h1>
            <p className={styles.suFormSub}>Créez votre compte pour commencer.</p>

            <form onSubmit={handleSubmit}>

              {/* Prénom + Nom sur la même ligne */}
              <div className={styles.suRow}>
                <div>
                  <label className={styles.suLabel}>Prénom</label>
                  <input
                    type="text"
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={styles.suInput}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className={styles.suLabel}>Nom</label>
                  <input
                    type="text"
                    value={last_name}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={styles.suInput}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className={styles.suField}>
                <label className={styles.suLabel}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={styles.suInput}
                  placeholder="vous@email.com"
                />
              </div>

              <div className={styles.suField}>
                <label className={styles.suLabel}>Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={styles.suInput}
                  placeholder="••••••••"
                />
              </div>

              <div className={styles.suField}>
                <label className={styles.suLabel}>Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={styles.suInput}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className={styles.suError}>
                  <span>⚠</span> {error}
                </div>
              )}

              <button type="submit" disabled={loading} className={styles.suSubmit}>
                {loading ? "Inscription..." : "Créer mon compte →"}
              </button>
            </form>

            <div className={styles.suDivider}>
              <div className={styles.suDividerLine} />
              <span className={styles.suDividerText}>ou</span>
              <div className={styles.suDividerLine} />
            </div>

            <p className={styles.suLoginLink}>
              Déjà un compte ?{" "}
              <Link to={redirectTo !== "/" ? `/login?redirect=${redirectTo}` : "/login"}>Se connecter</Link>
            </p>

          </div>
        </div>

      </div>
    </>
  );
};

export default Signup;
