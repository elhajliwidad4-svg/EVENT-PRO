export interface ServiceCategory {
  id: string;
  slug: string;
  name_fr: string;
  name_ar?: string | null;
  description_fr: string;
  cover_image: string;
  display_order: number;
  is_active: number;
}

export interface ServiceItem {
  id: string;
  category_id: string;
  slug: string;
  name_fr: string;
  name_ar?: string | null;
  short_description_fr: string;
  description_fr: string;
  benefits_json: string;
  included_json: string;
  options_json: string;
  cover_image: string;
  starting_price_mad: number | null;
  price_is_example: number;
  is_available: number;
  display_order: number;
}

export interface GalleryImage {
  id: string;
  title: string;
  caption: string;
  category: string;
  image_url: string;
  r2_key?: string | null;
  display_order: number;
  is_featured: number;
}

export interface Testimonial {
  id: string;
  client_name: string;
  event_type: string;
  city: string;
  quote_text: string;
  is_demo: number;
  is_approved: number;
}

export interface CompanySettings {
  id: string;
  company_name: string;
  slogan_fr: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  address: string;
  service_area: string;
  instagram_url: string;
  facebook_url: string;
  currency: string;
  booking_notice_fr: string;
  logo_url?: string | null;
}

export interface CustomerProfile {
  id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  city: string;
  preferred_contact: 'whatsapp' | 'phone' | 'email';
  booking_count?: number;
  created_at: string;
}

export interface BookingServiceRow {
  id: string;
  booking_id: string;
  service_name: string;
  selected_options_json: string;
}

export interface BookingRecord {
  id: string;
  reference_number: string;
  customer_id: string;
  user_id?: string | null;
  event_type: string;
  event_title: string;
  event_date: string;
  preferred_time: string;
  event_location: string;
  venue_preference?: string | null;
  guest_count: number;
  duration_hours: number;
  budget_range: string;
  custom_budget_mad?: number | null;
  preferred_style?: string | null;
  color_theme?: string | null;
  special_requirements?: string | null;
  additional_notes?: string | null;
  status: string;
  assigned_to?: string | null;
  internal_notes?: string | null;
  created_at: string;
  customer?: CustomerProfile | null;
  services?: BookingServiceRow[];
}

export interface QuoteItemRecord {
  id?: string;
  quote_id?: string;
  service_name: string;
  description: string;
  quantity: number;
  unit_price_mad: number;
  line_total_mad: number;
}

export interface QuoteRecord {
  id: string;
  reference_number: string;
  booking_id?: string | null;
  customer_id: string;
  event_type: string;
  event_date?: string | null;
  event_location: string;
  guest_count: number;
  budget_range?: string | null;
  details?: string | null;
  status: string;
  subtotal_mad: number;
  discount_mad: number;
  total_mad: number;
  admin_notes?: string | null;
  valid_until?: string | null;
  created_at: string;
  customer?: CustomerProfile | null;
  items?: QuoteItemRecord[];
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: number;
  admin_reply?: string | null;
  replied_at?: string | null;
  created_at: string;
}

export interface NotificationRecord {
  id: string;
  recipient_role: 'admin' | 'client';
  title: string;
  body: string;
  link_path?: string | null;
  is_read: number;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'client' | 'admin';
  full_name: string;
  phone?: string | null;
}
