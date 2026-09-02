import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUser, updatePassword, getUserAddresses, createAddress, updateAddress, deleteAddress, deleteMe, exportMe } from "../../api/users";
import { getMe } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { FaUser, FaLock, FaMapMarkerAlt, FaPencilAlt, FaTrash, FaCheck, FaTimes, FaPlus, FaShieldAlt, FaDownload } from "react-icons/fa";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import AuthRequired from "../../components/AuthRequired";
import styles from './Profile.module.css';

const TABS = [
  { id: "profile",   label: "Profil",    icon: FaUser },
  { id: "security",  label: "Sécurité",  icon: FaLock },
  { id: "addresses", label: "Adresses",  icon: FaMapMarkerAlt },
  { id: "rgpd",      label: "Données",   icon: FaShieldAlt },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user: authUser, authLoading, logout } = useAuth();
  const showToast = useToast();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [rgpdLoading, setRgpdLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [editingUser, setEditingUser] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [formUser, setFormUser] = useState({ first_name: "", last_name: "", email: "" });
  const [formPassword, setFormPassword] = useState({ old_password: "", new_password: "" });
  const [formAddress, setFormAddress] = useState({ label: "", street: "", city: "", postal_code: "" });

  useEffect(() => {
    async function fetchData() {
      const me = await getMe();
      setUser(me);
      setFormUser({ first_name: me.first_name, last_name: me.last_name, email: me.email });
      const addr = await getUserAddresses();
      setAddresses(addr);
    }
    fetchData();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  async function handleUpdateUser(e) {
    e.preventDefault();
    await updateUser(formUser);
    const me = await getMe();
    setUser(me);
    setFormUser({ first_name: me.first_name, last_name: me.last_name, email: me.email });
    setEditingUser(false);
    showSuccess("Profil mis à jour !");
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    await updatePassword(formPassword);
    setEditingPassword(false);
    setFormPassword({ old_password: "", new_password: "" });
    showSuccess("Mot de passe mis à jour !");
  }

  async function handleSaveAddress(e) {
    e.preventDefault();
    if (editingAddressId) {
      await updateAddress(editingAddressId, formAddress);
    } else {
      await createAddress(formAddress);
    }
    const addr = await getUserAddresses();
    setAddresses(addr);
    setEditingAddressId(null);
    setShowAddressForm(false);
    setFormAddress({ label: "", street: "", city: "", postal_code: "" });
    showSuccess(editingAddressId ? "Adresse mise à jour !" : "Adresse ajoutée !");
  }

  async function handleDeleteAddress(id) {
    const ok = await confirm({
      title: "Supprimer cette adresse ?",
      message: "Cette adresse sera définitivement supprimée.",
      confirmLabel: "Supprimer",
      dangerous: true,
    });
    if (!ok) return;
    await deleteAddress(id);
    setAddresses(await getUserAddresses());
  }

  async function handleExportData() {
    setRgpdLoading(true);
    try {
      const data = await exportMe();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ftk-merch-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast("Erreur lors de l'export. Veuillez réessayer.", "error");
    } finally {
      setRgpdLoading(false);
    }
  }

  async function handleDeleteAccount() {
    const ok1 = await confirm({
      title: "Supprimer votre compte ?",
      message: "Cette action est irréversible. Toutes vos données (profil, adresses, commandes, avis) seront définitivement supprimées.",
      confirmLabel: "Continuer",
      dangerous: true,
    });
    if (!ok1) return;

    const ok2 = await confirm({
      title: "Dernière confirmation",
      message: "Vous êtes sur le point de supprimer définitivement votre compte. Cette action ne peut pas être annulée.",
      confirmLabel: "Supprimer mon compte",
      dangerous: true,
    });
    if (!ok2) return;
    setRgpdLoading(true);
    try {
      await deleteMe();
      logout();
      navigate("/");
    } catch (err) {
      showToast("Erreur lors de la suppression. Veuillez réessayer.", "error");
      setRgpdLoading(false);
    }
  }

  if (authLoading) return null
  if (!authUser) return <AuthRequired />

  const initials = user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() : "?";

  return (
    <>
      <div className={styles.prfRoot}>
        <div className={styles.prfInner}>

          {/* ── Header ── */}
          <div className={styles.prfHeader}>
            <div className={styles.prfAvatar}>{initials}</div>
            <div>
              <p className={styles.prfHeaderName}>{user?.first_name} {user?.last_name}</p>
              <p className={styles.prfHeaderEmail}>{user?.email}</p>
            </div>
          </div>

          {/* ── Toast ── */}
          {successMsg && (
            <div className={styles.prfToast}>
              <FaCheck size={12} /> {successMsg}
            </div>
          )}

          {/* ── Tabs ── */}
          <div className={styles.prfTabs}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles.prfTab} ${activeTab === tab.id ? styles.active : ""}`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ══════════════════════════════
              TAB — PROFIL
          ══════════════════════════════ */}
          {activeTab === "profile" && (
            <div className={styles.prfCard}>
              <div className={styles.prfCardHeader}>
                <p className={styles.prfCardTitle}>Informations personnelles</p>
                {!editingUser && (
                  <button className={`${styles.prfBtn} ${styles.prfBtnOutline}`} onClick={() => setEditingUser(true)}>
                    <FaPencilAlt size={10} /> Modifier
                  </button>
                )}
              </div>
              <div className={styles.prfCardBody}>
                {!editingUser ? (
                  <>
                    <div className={styles.prfInfoRow}>
                      <span className={styles.prfInfoLabel}>Prénom</span>
                      <span className={styles.prfInfoValue}>{user?.first_name}</span>
                    </div>
                    <div className={styles.prfInfoRow}>
                      <span className={styles.prfInfoLabel}>Nom</span>
                      <span className={styles.prfInfoValue}>{user?.last_name}</span>
                    </div>
                    <div className={styles.prfInfoRow}>
                      <span className={styles.prfInfoLabel}>Email</span>
                      <span className={styles.prfInfoValue}>{user?.email}</span>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleUpdateUser}>
                    <div className={styles.prfField}>
                      <label className={styles.prfInputLabel}>Prénom</label>
                      <input type="text" value={formUser.first_name} onChange={e => setFormUser({ ...formUser, first_name: e.target.value })} className={styles.prfInput} />
                    </div>
                    <div className={styles.prfField}>
                      <label className={styles.prfInputLabel}>Nom</label>
                      <input type="text" value={formUser.last_name} onChange={e => setFormUser({ ...formUser, last_name: e.target.value })} className={styles.prfInput} />
                    </div>
                    <div className={styles.prfField}>
                      <label className={styles.prfInputLabel}>Email</label>
                      <input type="email" value={formUser.email} onChange={e => setFormUser({ ...formUser, email: e.target.value })} className={styles.prfInput} />
                    </div>
                    <div className={styles.prfFormActions}>
                      <button type="submit" className={`${styles.prfBtn} ${styles.prfBtnPrimary}`}><FaCheck size={10} /> Enregistrer</button>
                      <button type="button" className={`${styles.prfBtn} ${styles.prfBtnGhost}`} onClick={() => setEditingUser(false)}><FaTimes size={10} /> Annuler</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              TAB — SÉCURITÉ
          ══════════════════════════════ */}
          {activeTab === "security" && (
            <div className={styles.prfCard}>
              <div className={styles.prfCardHeader}>
                <p className={styles.prfCardTitle}>Mot de passe</p>
              </div>
              <div className={styles.prfCardBody}>
                {!editingPassword ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>••••••••••••</p>
                    <button className={`${styles.prfBtn} ${styles.prfBtnOutline}`} onClick={() => setEditingPassword(true)}>
                      <FaPencilAlt size={10} /> Modifier
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdatePassword}>
                    <div className={styles.prfField}>
                      <label className={styles.prfInputLabel}>Mot de passe actuel</label>
                      <input type="password" placeholder="••••••••" value={formPassword.old_password} onChange={e => setFormPassword({ ...formPassword, old_password: e.target.value })} className={styles.prfInput} />
                    </div>
                    <div className={styles.prfField}>
                      <label className={styles.prfInputLabel}>Nouveau mot de passe</label>
                      <input type="password" placeholder="••••••••" value={formPassword.new_password} onChange={e => setFormPassword({ ...formPassword, new_password: e.target.value })} className={styles.prfInput} />
                    </div>
                    <div className={styles.prfFormActions}>
                      <button type="submit" className={`${styles.prfBtn} ${styles.prfBtnPrimary}`}><FaCheck size={10} /> Mettre à jour</button>
                      <button type="button" className={`${styles.prfBtn} ${styles.prfBtnGhost}`} onClick={() => setEditingPassword(false)}><FaTimes size={10} /> Annuler</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              TAB — ADRESSES
          ══════════════════════════════ */}
          {activeTab === "addresses" && (
            <div className={styles.prfCard}>
              <div className={styles.prfCardHeader}>
                <p className={styles.prfCardTitle}>Mes adresses</p>
                <button
                  className={`${styles.prfBtn} ${styles.prfBtnPrimary}`}
                  onClick={() => {
                    setShowAddressForm(!showAddressForm);
                    setEditingAddressId(null);
                    setFormAddress({ label: "", street: "", city: "", postal_code: "" });
                  }}
                >
                  <FaPlus size={10} /> Ajouter
                </button>
              </div>

              <div className={styles.prfCardBody}>
                {addresses.length === 0 && !showAddressForm && (
                  <p style={{ fontSize: "0.82rem", color: "#9ca3af" }}>Aucune adresse enregistrée.</p>
                )}

                {addresses.map(addr => (
                  <div key={addr.id} className={styles.prfAddrCard}>
                    <div>
                      <p className={styles.prfAddrLabel}>{addr.label}</p>
                      <p className={styles.prfAddrLine}>{addr.street}<br />{addr.postal_code} {addr.city}</p>
                    </div>
                    <div className={styles.prfAddrActions}>
                      <button
                        className={styles.prfAddrIconBtn}
                        onClick={() => {
                          setEditingAddressId(addr.id);
                          setFormAddress(addr);
                          setShowAddressForm(true);
                        }}
                        title="Modifier"
                      >
                        <FaPencilAlt size={11} />
                      </button>
                      <button className={`${styles.prfAddrIconBtn} ${styles.del}`} onClick={() => handleDeleteAddress(addr.id)} title="Supprimer">
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                ))}

                {showAddressForm && (
                  <div className={styles.prfAddrForm}>
                    <p className={styles.prfAddrFormTitle}>
                      {editingAddressId ? "Modifier l'adresse" : "Nouvelle adresse"}
                    </p>
                    <form onSubmit={handleSaveAddress}>
                      <div className={styles.prfField}>
                        <label className={styles.prfInputLabel}>Label</label>
                        <input type="text" placeholder="ex : Maison" value={formAddress.label} onChange={e => setFormAddress({ ...formAddress, label: e.target.value })} className={styles.prfInput} />
                      </div>
                      <div className={styles.prfField}>
                        <label className={styles.prfInputLabel}>Rue</label>
                        <input type="text" placeholder="12 rue des Fleurs" value={formAddress.street} onChange={e => setFormAddress({ ...formAddress, street: e.target.value })} className={styles.prfInput} />
                      </div>
                      <div className={styles.prfAddrGrid}>
                        <div>
                          <label className={styles.prfInputLabel}>Ville</label>
                          <input type="text" placeholder="Paris" value={formAddress.city} onChange={e => setFormAddress({ ...formAddress, city: e.target.value })} className={styles.prfInput} />
                        </div>
                        <div>
                          <label className={styles.prfInputLabel}>Code postal</label>
                          <input type="text" placeholder="75001" value={formAddress.postal_code} onChange={e => setFormAddress({ ...formAddress, postal_code: e.target.value })} className={styles.prfInput} />
                        </div>
                      </div>
                      <div className={styles.prfFormActions}>
                        <button type="submit" className={`${styles.prfBtn} ${styles.prfBtnPrimary}`}>
                          <FaCheck size={10} /> {editingAddressId ? "Mettre à jour" : "Ajouter"}
                        </button>
                        <button
                          type="button"
                          className={`${styles.prfBtn} ${styles.prfBtnGhost}`}
                          onClick={() => { setShowAddressForm(false); setEditingAddressId(null); }}
                        >
                          <FaTimes size={10} /> Annuler
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              TAB — DONNÉES & CONFIDENTIALITÉ
          ══════════════════════════════ */}
          {activeTab === "rgpd" && (
            <div>
              <div className={styles.prfRgpdBlock}>
                <p className={styles.prfRgpdBlockTitle}>Exporter mes données</p>
                <p className={styles.prfRgpdBlockDesc}>
                  Téléchargez une copie de toutes vos données personnelles (profil, adresses, commandes, avis) au format JSON. Droit à la portabilité — Art. 20 RGPD.
                </p>
                <button
                  className={`${styles.prfBtn} ${styles.prfBtnPrimary}`}
                  onClick={handleExportData}
                  disabled={rgpdLoading}
                >
                  <FaDownload size={11} />
                  {rgpdLoading ? "Export en cours..." : "Télécharger mes données"}
                </button>
              </div>

              <div className={styles.prfDangerZone}>
                <p className={styles.prfDangerTitle}>Zone de danger — Supprimer mon compte</p>
                <p className={styles.prfDangerDesc}>
                  Cette action est <strong>irréversible</strong>. Toutes vos données personnelles (profil, adresses, commandes, avis) seront définitivement supprimées conformément au droit à l'effacement — Art. 17 RGPD.
                </p>
                <button
                  className={`${styles.prfBtn} ${styles.prfBtnDelete}`}
                  onClick={handleDeleteAccount}
                  disabled={rgpdLoading}
                >
                  <FaTrash size={11} />
                  Supprimer définitivement mon compte
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
