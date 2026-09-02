import styles from './MentionsLegales.module.css';

const MentionsLegales = () => {
  return (
    <>
      <div className={styles.legalRoot}>
        <div className={styles.legalHero}>
          <div className={styles.legalHeroInner}>
            <p className={styles.legalHeroLabel}>Informations légales</p>
            <h1 className={styles.legalHeroTitle}>Mentions légales</h1>
            <p className={styles.legalHeroSub}>Dernière mise à jour : <span className={styles.legalPlaceholder}>[DATE_MAJ]</span></p>
          </div>
        </div>

        <div className={styles.legalBody}>

          {/* Éditeur */}
          <div className={styles.legalSection}>
            <p className={styles.legalSectionTitle}>Éditeur du site</p>
            <div className={styles.legalRow}><span className={styles.legalRowLabel}>Raison sociale</span><span><span className={styles.legalPlaceholder}>[NOM_ENTREPRISE]</span></span></div>
            <div className={styles.legalRow}><span className={styles.legalRowLabel}>Forme juridique</span><span><span className={styles.legalPlaceholder}>[FORME_JURIDIQUE]</span> au capital de <span className={styles.legalPlaceholder}>[CAPITAL_SOCIAL]</span> €</span></div>
            <div className={styles.legalRow}><span className={styles.legalRowLabel}>Siège social</span><span><span className={styles.legalPlaceholder}>[ADRESSE_SIEGE]</span></span></div>
            <div className={styles.legalRow}><span className={styles.legalRowLabel}>N° RCS / SIREN</span><span><span className={styles.legalPlaceholder}>[NUMERO_RCS]</span></span></div>
            <div className={styles.legalRow}><span className={styles.legalRowLabel}>N° TVA intracommunautaire</span><span><span className={styles.legalPlaceholder}>[NUMERO_TVA]</span></span></div>
            <div className={styles.legalRow}><span className={styles.legalRowLabel}>Directeur de publication</span><span><span className={styles.legalPlaceholder}>[NOM_DIRECTEUR]</span></span></div>
            <div className={styles.legalRow}><span className={styles.legalRowLabel}>Email de contact</span><span><span className={styles.legalPlaceholder}>[EMAIL_CONTACT]</span></span></div>
          </div>

          {/* Hébergeur */}
          <div className={styles.legalSection}>
            <p className={styles.legalSectionTitle}>Hébergeur</p>
            <div className={styles.legalRow}><span className={styles.legalRowLabel}>Société</span><span><span className={styles.legalPlaceholder}>[NOM_HÉBERGEUR]</span></span></div>
            <div className={styles.legalRow}><span className={styles.legalRowLabel}>Adresse</span><span><span className={styles.legalPlaceholder}>[ADRESSE_HÉBERGEUR]</span></span></div>
            <div className={styles.legalRow}><span className={styles.legalRowLabel}>Site web</span><span><span className={styles.legalPlaceholder}>[SITE_HÉBERGEUR]</span></span></div>
          </div>

          {/* Propriété intellectuelle */}
          <div className={styles.legalSection}>
            <p className={styles.legalSectionTitle}>Propriété intellectuelle</p>
            <p className={styles.legalP}>L'ensemble des éléments constituant le site <strong>FTK Merch</strong> (textes, images, graphismes, logo, icônes, sons, logiciels…) est la propriété exclusive de <span className={styles.legalPlaceholder}>[NOM_ENTREPRISE]</span>, à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.</p>
            <p className={styles.legalP}>Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de <span className={styles.legalPlaceholder}>[NOM_ENTREPRISE]</span>.</p>
          </div>

          {/* Responsabilité */}
          <div className={styles.legalSection}>
            <p className={styles.legalSectionTitle}>Limitation de responsabilité</p>
            <p className={styles.legalP}><span className={styles.legalPlaceholder}>[NOM_ENTREPRISE]</span> ne pourra être tenu responsable des dommages directs et indirects causés au matériel de l'utilisateur lors de l'accès au site, résultant soit de l'utilisation d'un matériel ne répondant pas aux spécifications techniques, soit de l'apparition d'un bug ou d'une incompatibilité.</p>
            <p className={styles.legalP}><span className={styles.legalPlaceholder}>[NOM_ENTREPRISE]</span> ne pourra également être tenu responsable des dommages indirects consécutifs à l'utilisation du site.</p>
          </div>

          {/* Droit applicable */}
          <div className={styles.legalSection}>
            <p className={styles.legalSectionTitle}>Droit applicable et juridiction</p>
            <p className={styles.legalP}>Tout litige en relation avec l'utilisation du site <strong>FTK Merch</strong> est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux compétents.</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default MentionsLegales;
