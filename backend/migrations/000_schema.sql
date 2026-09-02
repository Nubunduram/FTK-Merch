-- Schema initial FTK Merch — idempotent (safe to run on existing DB)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- ENUMs (idempotent)
DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'canceled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'succeeded', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

SET default_tablespace = '';
SET default_table_access_method = heap;

-- Sequences (idempotent)
CREATE SEQUENCE IF NOT EXISTS public.addresses_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS public.categories_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS public.checkout_sessions_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS public.order_items_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS public.orders_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS public.payments_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS public.product_variants_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS public.products_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS public.reviews_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS public.sub_categories_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
CREATE SEQUENCE IF NOT EXISTS public.users_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Tables (idempotent)
CREATE TABLE IF NOT EXISTS public.addresses (
    id integer NOT NULL DEFAULT nextval('public.addresses_id_seq'::regclass),
    created_at timestamp without time zone DEFAULT now(),
    users_id integer,
    label text,
    street text,
    city text,
    postal_code integer
);

CREATE TABLE IF NOT EXISTS public.categories (
    id integer NOT NULL DEFAULT nextval('public.categories_id_seq'::regclass),
    created_at timestamp without time zone DEFAULT now(),
    name text NOT NULL,
    slug text NOT NULL,
    "position" integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.checkout_sessions (
    id integer NOT NULL DEFAULT nextval('public.checkout_sessions_id_seq'::regclass),
    stripe_session_id character varying(255) NOT NULL,
    user_id integer NOT NULL,
    items jsonb NOT NULL,
    address jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id integer NOT NULL DEFAULT nextval('public.order_items_id_seq'::regclass),
    created_at timestamp without time zone DEFAULT now(),
    orders_id integer,
    product_variants_id integer,
    quantity integer NOT NULL,
    unit_price_in_cents integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id integer NOT NULL DEFAULT nextval('public.orders_id_seq'::regclass),
    created_at timestamp without time zone DEFAULT now(),
    users_id integer,
    status public.order_status DEFAULT 'pending'::public.order_status,
    total_amount_in_cents integer NOT NULL,
    street text,
    city text,
    postal_code text,
    shipping_fee_in_cents integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
    id integer NOT NULL DEFAULT nextval('public.payments_id_seq'::regclass),
    created_at timestamp without time zone DEFAULT now(),
    orders_id integer,
    method text,
    status public.payment_status DEFAULT 'pending'::public.payment_status,
    transaction_id text,
    amount_in_cents integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id integer NOT NULL DEFAULT nextval('public.product_variants_id_seq'::regclass),
    created_at timestamp without time zone DEFAULT now(),
    products_id integer,
    color text,
    size text,
    sku text NOT NULL,
    stock integer DEFAULT 0,
    color_hex character varying(7)
);

CREATE TABLE IF NOT EXISTS public.products (
    id integer NOT NULL DEFAULT nextval('public.products_id_seq'::regclass),
    created_at timestamp without time zone DEFAULT now(),
    sub_categories_id integer,
    description text,
    price_in_cents integer NOT NULL,
    img_url text,
    is_featured boolean DEFAULT false,
    name text
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id integer NOT NULL DEFAULT nextval('public.reviews_id_seq'::regclass),
    created_at timestamp without time zone DEFAULT now(),
    users_id integer,
    products_id integer,
    comment text
);

CREATE TABLE IF NOT EXISTS public.sub_categories (
    id integer NOT NULL DEFAULT nextval('public.sub_categories_id_seq'::regclass),
    created_at timestamp without time zone DEFAULT now(),
    name text NOT NULL,
    categories_id integer
);

CREATE TABLE IF NOT EXISTS public.users (
    id integer NOT NULL DEFAULT nextval('public.users_id_seq'::regclass),
    created_at timestamp without time zone DEFAULT now(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role
);

-- Sequence ownership
ALTER SEQUENCE public.addresses_id_seq OWNED BY public.addresses.id;
ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;
ALTER SEQUENCE public.checkout_sessions_id_seq OWNED BY public.checkout_sessions.id;
ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;
ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;
ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;
ALTER SEQUENCE public.product_variants_id_seq OWNED BY public.product_variants.id;
ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;
ALTER SEQUENCE public.sub_categories_id_seq OWNED BY public.sub_categories.id;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

-- Primary keys (idempotent)
DO $$ BEGIN ALTER TABLE ONLY public.addresses ADD CONSTRAINT addresses_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.categories ADD CONSTRAINT categories_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.checkout_sessions ADD CONSTRAINT checkout_sessions_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.checkout_sessions ADD CONSTRAINT checkout_sessions_stripe_session_id_key UNIQUE (stripe_session_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.order_items ADD CONSTRAINT order_items_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.product_variants ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.product_variants ADD CONSTRAINT product_variants_sku_key UNIQUE (sku); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.products ADD CONSTRAINT products_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.reviews ADD CONSTRAINT reviews_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.sub_categories ADD CONSTRAINT sub_categories_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.users ADD CONSTRAINT users_email_key UNIQUE (email); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Foreign keys (idempotent)
DO $$ BEGIN ALTER TABLE ONLY public.addresses ADD CONSTRAINT addresses_users_id_fkey FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.checkout_sessions ADD CONSTRAINT checkout_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.order_items ADD CONSTRAINT order_items_orders_id_fkey FOREIGN KEY (orders_id) REFERENCES public.orders(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.order_items ADD CONSTRAINT order_items_product_variants_id_fkey FOREIGN KEY (product_variants_id) REFERENCES public.product_variants(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_users_id_fkey FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.payments ADD CONSTRAINT payments_orders_id_fkey FOREIGN KEY (orders_id) REFERENCES public.orders(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.product_variants ADD CONSTRAINT product_variants_products_id_fkey FOREIGN KEY (products_id) REFERENCES public.products(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.products ADD CONSTRAINT products_sub_categories_id_fkey FOREIGN KEY (sub_categories_id) REFERENCES public.sub_categories(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.reviews ADD CONSTRAINT reviews_products_id_fkey FOREIGN KEY (products_id) REFERENCES public.products(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.reviews ADD CONSTRAINT reviews_users_id_fkey FOREIGN KEY (users_id) REFERENCES public.users(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE ONLY public.sub_categories ADD CONSTRAINT sub_categories_categories_id_fkey FOREIGN KEY (categories_id) REFERENCES public.categories(id) ON DELETE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
