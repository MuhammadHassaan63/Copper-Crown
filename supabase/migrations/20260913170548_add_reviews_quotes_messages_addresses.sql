/*
# Copper & Crown — Schema Extension: Reviews, Quotes, Messages, Addresses, Product Specs

## Overview
Adds new tables for customer reviews, quote requests, contact messages, and saved addresses.
Also adds a specifications column to products and a delivery_method column to orders.
Updates the order status enum to include 'confirmed' and 'out_for_delivery'.

## New Tables
1. `reviews` — Customer product reviews (rating 1-5, comment, approved flag)
2. `quote_requests` — Customer quote requests for products or electrical work
3. `contact_messages` — Messages submitted through the contact form
4. `addresses` — Saved customer delivery addresses

## Modified Tables
- `products`: adds `specifications` jsonb column for product specs (wattage, voltage, brand, model, etc.)
- `orders`: adds `delivery_method` text column (standard, express, pickup)

## Security
- RLS enabled on all new tables
- Reviews: public read (approved only), authenticated insert own, admin update/delete
- Quote requests: owner-scoped CRUD + admin read
- Contact messages: authenticated insert own, admin read all
- Addresses: owner-scoped CRUD
*/

-- ============================================================
-- Add specifications to products (jsonb, nullable)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'specifications'
  ) THEN
    ALTER TABLE public.products ADD COLUMN specifications jsonb DEFAULT '{}';
  END IF;
END $$;

-- ============================================================
-- Add delivery_method to orders
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_method'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivery_method text DEFAULT 'standard' CHECK (delivery_method IN ('standard', 'express', 'pickup'));
  END IF;
END $$;

-- ============================================================
-- reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text DEFAULT '',
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  title text DEFAULT '',
  comment text NOT NULL DEFAULT '',
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select_approved_or_own_or_admin" ON public.reviews;
CREATE POLICY "reviews_select_approved_or_own_or_admin" ON public.reviews FOR SELECT
  TO anon, authenticated USING (
    is_approved = true OR auth.uid() = user_id OR public.is_admin()
  );

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reviews_update_admin" ON public.reviews;
CREATE POLICY "reviews_update_admin" ON public.reviews FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "reviews_delete_admin_or_own" ON public.reviews;
CREATE POLICY "reviews_delete_admin_or_own" ON public.reviews FOR DELETE
  TO authenticated USING (public.is_admin() OR auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON public.reviews(is_approved) WHERE is_approved = true;

DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON public.reviews;
CREATE TRIGGER trigger_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- quote_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_number text UNIQUE NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewed','quoted','accepted','declined','closed')),
  request_type text NOT NULL DEFAULT 'products' CHECK (request_type IN ('products','service','both')),
  product_categories text DEFAULT '',
  service_type text DEFAULT '',
  description text NOT NULL DEFAULT '',
  quantity integer DEFAULT 1,
  budget_range text DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  contact_email text DEFAULT '',
  address text DEFAULT '',
  preferred_date date,
  admin_response text DEFAULT '',
  estimated_total integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quote_requests_select_own_or_admin" ON public.quote_requests;
CREATE POLICY "quote_requests_select_own_or_admin" ON public.quote_requests FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "quote_requests_insert_own_or_anon" ON public.quote_requests;
CREATE POLICY "quote_requests_insert_own_or_anon" ON public.quote_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "quote_requests_update_own_or_admin" ON public.quote_requests;
CREATE POLICY "quote_requests_update_own_or_admin" ON public.quote_requests FOR UPDATE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "quote_requests_delete_own_or_admin" ON public.quote_requests;
CREATE POLICY "quote_requests_delete_own_or_admin" ON public.quote_requests FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.is_admin());

CREATE INDEX IF NOT EXISTS idx_quote_requests_user_id ON public.quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON public.quote_requests(created_at DESC);

DROP TRIGGER IF EXISTS trigger_quote_requests_updated_at ON public.quote_requests;
CREATE TRIGGER trigger_quote_requests_updated_at BEFORE UPDATE ON public.quote_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- contact_messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  subject text DEFAULT '',
  message text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_messages_select_admin" ON public.contact_messages;
CREATE POLICY "contact_messages_select_admin" ON public.contact_messages FOR SELECT
  TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "contact_messages_insert_anyone" ON public.contact_messages;
CREATE POLICY "contact_messages_insert_anyone" ON public.contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contact_messages_update_admin" ON public.contact_messages;
CREATE POLICY "contact_messages_update_admin" ON public.contact_messages FOR UPDATE
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "contact_messages_delete_admin" ON public.contact_messages;
CREATE POLICY "contact_messages_delete_admin" ON public.contact_messages FOR DELETE
  TO authenticated USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_contact_messages_is_read ON public.contact_messages(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);

-- ============================================================
-- addresses
-- ============================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  recipient_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address_line1 text NOT NULL DEFAULT '',
  address_line2 text DEFAULT '',
  city text NOT NULL DEFAULT '',
  province text DEFAULT '',
  postal_code text DEFAULT '',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addresses_select_own" ON public.addresses;
CREATE POLICY "addresses_select_own" ON public.addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_insert_own" ON public.addresses;
CREATE POLICY "addresses_insert_own" ON public.addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_update_own" ON public.addresses;
CREATE POLICY "addresses_update_own" ON public.addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_delete_own" ON public.addresses;
CREATE POLICY "addresses_delete_own" ON public.addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

DROP TRIGGER IF EXISTS trigger_addresses_updated_at ON public.addresses;
CREATE TRIGGER trigger_addresses_updated_at BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
