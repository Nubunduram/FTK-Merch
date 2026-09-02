-- Migration : ajout d'un ordre d'affichage pour les catégories
-- À exécuter une seule fois en base de données.

ALTER TABLE categories ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Initialise les positions selon l'ordre actuel des ids
UPDATE categories SET position = id;
