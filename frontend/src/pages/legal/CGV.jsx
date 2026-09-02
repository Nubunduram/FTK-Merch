import styles from './CGV.module.css';

const CGV = () => {
  return (
    <>
      <div className={styles.cgvRoot}>
        <div className={styles.cgvHero}>
          <div className={styles.cgvHeroInner}>
            <p className={styles.cgvHeroLabel}>Achat en ligne</p>
            <h1 className={styles.cgvHeroTitle}>Conditions générales de vente</h1>
            <p className={styles.cgvHeroSub}>Dernière mise à jour : <span className={styles.cgvPlaceholder}>[DATE_MAJ]</span></p>
          </div>
        </div>

        <div className={styles.cgvBody}>

          <div className={styles.cgvSection}>
            <p className={styles.cgvSectionTitle}><span className={styles.cgvSectionNum}>1</span>Objet</p>
            <p className={styles.cgvP}>Les présentes conditions générales de vente régissent les ventes de produits effectuées par <span className={styles.cgvPlaceholder}>[NOM_ENTREPRISE]</span> (ci-après « le Vendeur ») sur le site <strong>FTK Merch</strong>, auprès de tout consommateur (ci-après « l'Acheteur »).</p>
            <p className={styles.cgvP}>Tout achat effectué sur le site implique l'acceptation sans réserve des présentes CGV.</p>
          </div>

          <div className={styles.cgvSection}>
            <p className={styles.cgvSectionTitle}><span className={styles.cgvSectionNum}>2</span>Produits</p>
            <p className={styles.cgvP}>Les produits proposés sont ceux figurant dans le catalogue en ligne. Chaque produit est présenté avec une description, une photo et un prix TTC.</p>
            <p className={styles.cgvP}>Le Vendeur se réserve le droit de modifier à tout moment l'assortiment de produits. En cas d'indisponibilité d'un produit après commande, l'Acheteur en sera informé dans les meilleurs délais.</p>
          </div>

          <div className={styles.cgvSection}>
            <p className={styles.cgvSectionTitle}><span className={styles.cgvSectionNum}>3</span>Prix</p>
            <p className={styles.cgvP}>Les prix sont indiqués en euros TTC. Le Vendeur se réserve le droit de modifier ses prix à tout moment, étant entendu que le prix figurant au catalogue le jour de la commande sera le seul applicable à l'Acheteur.</p>
          </div>

          <div className={styles.cgvSection}>
            <p className={styles.cgvSectionTitle}><span className={styles.cgvSectionNum}>4</span>Commande</p>
            <p className={styles.cgvP}>La commande est validée par l'Acheteur après vérification du contenu de son panier et confirmation du paiement. Un email de confirmation est envoyé à l'adresse fournie lors de l'inscription.</p>
            <p className={styles.cgvP}>Le Vendeur se réserve le droit d'annuler ou de refuser toute commande en cas de litige existant ou de suspicion de fraude.</p>
          </div>

          <div className={styles.cgvSection}>
            <p className={styles.cgvSectionTitle}><span className={styles.cgvSectionNum}>5</span>Paiement</p>
            <p className={styles.cgvP}>Le paiement est exigible à la commande. Il peut être effectué par les moyens suivants :</p>
            <ul className={styles.cgvList}>
              <li>Carte bancaire (Visa, Mastercard) via <span className={styles.cgvPlaceholder}>[NOM_PRESTATAIRE_PAIEMENT]</span></li>
            </ul>
            <p className={styles.cgvP}>Les données bancaires sont chiffrées et traitées par notre prestataire de paiement sécurisé. Le Vendeur n'a accès à aucune donnée bancaire.</p>
          </div>

          <div className={styles.cgvSection}>
            <p className={styles.cgvSectionTitle}><span className={styles.cgvSectionNum}>6</span>Livraison</p>
            <p className={styles.cgvP}>Les livraisons sont effectuées à l'adresse indiquée lors de la commande, en France métropolitaine.</p>
            <ul className={styles.cgvList}>
              <li>Frais de livraison : <span className={styles.cgvPlaceholder}>[PRIX_LIVRAISON]</span> (offerts dès 60 € d'achat)</li>
              <li>Délai estimé : <span className={styles.cgvPlaceholder}>[DELAI_LIVRAISON]</span> jours ouvrés</li>
            </ul>
            <p className={styles.cgvP}>En cas de retard de livraison, l'Acheteur peut contacter le service client à <span className={styles.cgvPlaceholder}>[EMAIL_CONTACT]</span>.</p>
          </div>

          <div className={styles.cgvSection}>
            <p className={styles.cgvSectionTitle}><span className={styles.cgvSectionNum}>7</span>Droit de rétractation</p>
            <p className={styles.cgvP}>Conformément aux articles L221-18 et suivants du Code de la consommation, l'Acheteur dispose d'un délai de <strong><span className={styles.cgvPlaceholder}>[DELAI_RETRACTATION]</span> jours</strong> à compter de la réception de sa commande pour exercer son droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.</p>
            <p className={styles.cgvP}>Les produits doivent être retournés dans leur état d'origine, non portés, non lavés, avec leurs étiquettes. Les frais de retour sont à la charge de <span className={styles.cgvPlaceholder}>[VENDEUR_OU_ACHETEUR]</span>.</p>
          </div>

          <div className={styles.cgvSection}>
            <p className={styles.cgvSectionTitle}><span className={styles.cgvSectionNum}>8</span>Garanties</p>
            <p className={styles.cgvP}>Tous nos produits bénéficient de la garantie légale de conformité (articles L217-4 et suivants du Code de la consommation) et de la garantie contre les vices cachés (articles 1641 et suivants du Code civil).</p>
          </div>

          <div className={styles.cgvSection}>
            <p className={styles.cgvSectionTitle}><span className={styles.cgvSectionNum}>9</span>Droit applicable</p>
            <p className={styles.cgvP}>Les présentes CGV sont soumises au droit français. En cas de litige, les parties rechercheront une solution amiable avant toute action judiciaire. À défaut, le litige sera soumis aux tribunaux compétents français.</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default CGV;
