-- Migration : suppression de la colonne slug des sous-catégories
-- Le slug n'est pas utilisé pour le routage (contrairement aux catégories).
-- À exécuter une seule fois en base de données.

ALTER TABLE sub_categories DROP COLUMN IF EXISTS slug;
