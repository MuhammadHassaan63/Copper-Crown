export type UserRole = 'customer' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export type DeliveryMethod = 'standard' | 'express' | 'pickup';

export type ServiceRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'quoted'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

export type QuoteRequestStatus =
  | 'submitted'
  | 'reviewed'
  | 'quoted'
  | 'accepted'
  | 'declined'
  | 'closed';

export type BookingStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type UrgencyLevel = 'emergency' | 'urgent' | 'normal' | 'flexible';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  company: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  price_cents: number;
  compare_at_cents: number | null;
  stock: number;
  category: string;
  image_url: string;
  gallery_urls: string[];
  is_featured: boolean;
  is_active: boolean;
  weight_grams: number;
  specifications: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description: string | null;
  base_price_cents: number;
  category: string;
  image_url: string;
  is_active: boolean;
  turnaround: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  delivery_method: DeliveryMethod;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
  image_url: string;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  service_id: string | null;
  request_number: string;
  status: ServiceRequestStatus;
  service_name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  preferred_date: string | null;
  urgency: UrgencyLevel;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  service_request_id: string;
  quote_number: string;
  status: QuoteStatus;
  estimated_cost_cents: number;
  labor_cents: number;
  materials_cents: number;
  admin_notes: string;
  customer_notes: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceBooking {
  id: string;
  quote_id: string | null;
  service_request_id: string;
  user_id: string;
  booking_number: string;
  status: BookingStatus;
  scheduled_date: string | null;
  scheduled_time: string;
  assigned_tech: string;
  address: string;
  notes: string;
  final_cost_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuoteRequest {
  id: string;
  user_id: string | null;
  quote_number: string;
  status: QuoteRequestStatus;
  request_type: 'products' | 'service' | 'both';
  product_categories: string;
  service_type: string;
  description: string;
  quantity: number;
  budget_range: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  preferred_date: string | null;
  admin_response: string;
  estimated_total: number;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
