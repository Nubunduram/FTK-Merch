import styles from './Confidentialite.module.css';

const Confidentialite = () => {
  return (
    <>
      <div className={styles.confRoot}>
        <div className={styles.confHero}>
          <div className={styles.confHeroInner}>
            <p className={styles.confHeroLabel}>Vos droits</p>
            <h1 className={styles.confHeroTitle}>Politique de confidentialité</h1>
            <p className={styles.confHeroSub}>Dernière mise à jour : <span className={styles.confPlaceholder}>[DATE_MAJ]</span></p>
          </div>
        </div>

        <div className={styles.confBody}>

          {/* Intro */}
          <div className={styles.confSection}>
            <p className={styles.confSectionTitle}>Introduction</p>
            <div className={styles.confHighlight}>
              Chez FTK Merch, la protection de vos données personnelles est une priorité. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations conformément au Règlement Général sur la Protection des Données (RGPD).
            </div>
            <p className={styles.confP}>Le responsable du traitement est : <span className={styles.confPlaceholder}>[NOM_ENTREPRISE]</span>, dont le siège est situé <span className={styles.confPlaceholder}>[ADRESSE_SIEGE]</span>. Pour toute question : <span className={styles.confPlaceholder}>[EMAIL_DPO_OU_CONTACT]</span>.</p>
          </div>

          {/* Données collectées */}
          <div className={styles.confSection}>
            <p className={styles.confSectionTitle}>Données collectées</p>
            <p className={styles.confP}>Nous collectons uniquement les données nécessaires au fonctionnement de nos services :</p>
            <ul className={styles.confList}>
              <li><strong>Données d'identité :</strong> prénom, nom</li>
              <li><strong>Données de contact :</strong> adresse email</li>
              <li><strong>Données de livraison :</strong> adresse postale</li>
              <li><strong>Données de commande :</strong> historique d'achats, montants</li>
              <li><strong>Données de connexion :</strong> token d'authentification (stocké localement)</li>
            </ul>
            <p className={styles.confP}>Nous ne collectons pas de données bancaires — le paiement est géré par <span className={styles.confPlaceholder}>[NOM_PRESTATAIRE_PAIEMENT]</span> (ex: Stripe).</p>
          </div>

          {/* Finalités */}
          <div className={styles.confSection}>
            <p className={styles.confSectionTitle}>Finalités et bases légales</p>
            <ul className={styles.confList}>
              <li><strong>Exécution du contrat :</strong> gestion des commandes, livraisons, facturation</li>
              <li><strong>Intérêt légitime :</strong> amélioration de nos services, sécurité du site</li>
              <li><strong>Obligation légale :</strong> conservation des données de facturation (10 ans)</li>
              <li><strong>Consentement :</strong> communications marketing (si vous vous y êtes inscrit)</li>
            </ul>
          </div>

          {/* Conservation */}
          <div className={styles.confSection}>
            <p className={styles.confSectionTitle}>Durée de conservation</p>
            <ul className={styles.confList}>
              <li><strong>Données de compte :</strong> durée d'existence du compte + <span className={styles.confPlaceholder}>[DURÉE]</span> après suppression</li>
              <li><strong>Données de commande :</strong> 10 ans (obligation comptable)</li>
              <li><strong>Données de connexion :</strong> <span className={styles.confPlaceholder}>[DURÉE]</span></li>
            </ul>
          </div>

          {/* Vos droits RGPD */}
          <div className={styles.confSection}>
            <p className={styles.confSectionTitle}>Vos droits (RGPD)</p>
            <p className={styles.confP}>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className={styles.confList}>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données (disponible dans votre profil)</li>
              <li><strong>Droit à l'effacement :</strong> supprimer votre compte et vos données (disponible dans votre profil)</li>
              <li><strong>Droit de rectification :</strong> modifier vos informations personnelles (disponible dans votre profil)</li>
              <li><strong>Droit à la portabilité :</strong> exporter vos données au format JSON (disponible dans votre profil)</li>
              <li><strong>Droit d'opposition :</strong> s'opposer à certains traitements</li>
            </ul>
            <p className={styles.confP}>Pour exercer ces droits, rendez-vous dans votre <strong>espace profil → onglet Données & Confidentialité</strong>, ou contactez-nous à <span className={styles.confPlaceholder}>[EMAIL_DPO_OU_CONTACT]</span>.</p>
            <p className={styles.confP}>En cas de réclamation, vous pouvez contacter la <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: "#16a34a" }}>www.cnil.fr</a>.</p>
          </div>

          {/* Sécurité */}
          <div className={styles.confSection}>
            <p className={styles.confSectionTitle}>Sécurité des données</p>
            <p className={styles.confP}>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des mots de passe (bcrypt), communications sécurisées (HTTPS), accès restreint aux données.</p>
          </div>

          {/* Cookies */}
          <div className={styles.confSection}>
            <p className={styles.confSectionTitle}>Cookies</p>
            <p className={styles.confP}>Ce site utilise uniquement des cookies techniques nécessaires au fonctionnement (authentification). Aucun cookie publicitaire ou de tracking tiers n'est utilisé à ce jour.</p>
            <p className={styles.confP}>Si cette politique venait à évoluer, un bandeau de consentement vous en informerait.</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Confidentialite;
