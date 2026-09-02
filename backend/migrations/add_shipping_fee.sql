-- Migration : ajout des frais de livraison sur les commandes
-- À exécuter une seule fois en base de données

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_fee_in_cents INTEGER NOT NULL DEFAULT 0;
