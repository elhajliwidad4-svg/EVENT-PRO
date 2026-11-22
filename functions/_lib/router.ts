import {
  checkRateLimit,
  generateId,
  generateReference,
  hashPassword,
  isSafeImageUrl,
  isValidEmail,
  isValidPhone,
  sanitizeText,
  signToken,
  verifyPassword,
  verifyToken,
  verifyTurnstile,
} from './security.ts';
import type { AuthTokenPayload, Env } from './types.ts';

function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

async function getAuthUser(request: Request, env: Env): Promise<AuthTokenPayload | null> {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  return verifyToken(token, env);
}

async function parseJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function handleApiRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();
  const ip = getClientIp(request);

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  // Media serving from R2
  if (method === 'GET' && path.startsWith('/api/media/')) {
    const key = decodeURIComponent(path.replace('/api/media/', ''));
    if (!key || key.includes('..') || !env.R2_BUCKET) {
      return json({ error: 'Média introuvable' }, 404);
    }
    const obj = await env.R2_BUCKET.get(key);
    if (!obj) {
      return json({ error: 'Média introuvable' }, 404);
    }
    return new Response(obj.body as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': obj.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  if (method === 'GET' && path === '/api/health') {
    return json({ ok: true, timezone: 'Africa/Casablanca', currency: 'MAD' });
  }

  // Public bootstrap data
  if (method === 'GET' && path === '/api/public/bootstrap') {
    const [settings, categoriesRes, servicesRes, galleryRes, testimonialsRes] = await Promise.all([
      env.DB.prepare('SELECT * FROM company_settings WHERE id = ?').bind('default').first(),
      env.DB.prepare('SELECT * FROM service_categories WHERE is_active = 1 ORDER BY display_order ASC').all(),
      env.DB.prepare('SELECT * FROM services WHERE is_available = 1 ORDER BY display_order ASC').all(),
      env.DB.prepare('SELECT * FROM gallery_images ORDER BY display_order ASC').all(),
      env.DB.prepare('SELECT * FROM testimonials WHERE is_approved = 1 ORDER BY created_at DESC').all(),
    ]);

    return json({
      settings: settings || {},
      categories: categoriesRes.results || [],
      services: servicesRes.results || [],
      gallery: galleryRes.results || [],
      testimonials: testimonialsRes.results || [],
    });
  }

  // Public booking submission (always starts as 'Nouvelle demande', never auto-confirmed)
  if (method === 'POST' && path === '/api/public/bookings') {
    if (!checkRateLimit(`booking:${ip}`, 10, 60_000)) {
      return json({ error: 'Trop de demandes. Veuillez patienter une minute.' }, 429);
    }
    const body = await parseJson<Record<string, unknown>>(request);
    if (!body) return json({ error: 'Corps de requête invalide.' }, 400);

    const turnstileOk = await verifyTurnstile(
      typeof body.turnstileToken === 'string' ? body.turnstileToken : undefined,
      ip,
      env
    );
    if (!turnstileOk) {
      return json({ error: 'Vérification anti-spam Turnstile invalide.' }, 400);
    }

    const eventType = sanitizeText(body.event_type, 120);
    const eventTitle = sanitizeText(body.event_title, 180) || eventType;
    const eventDate = sanitizeText(body.event_date, 40);
    const preferredTime = sanitizeText(body.preferred_time, 40);
    const eventLocation = sanitizeText(body.event_location, 180);
    const venuePreference = sanitizeText(body.venue_preference, 180);
    const guestCount = Number(body.guest_count);
    const durationHours = Math.max(1, Math.min(72, Number(body.duration_hours) || 6));
    const budgetRange = sanitizeText(body.budget_range, 120);
    const customBudgetMad =
      body.custom_budget_mad !== undefined && body.custom_budget_mad !== null && body.custom_budget_mad !== ''
        ? Number(body.custom_budget_mad)
        : null;
    const preferredStyle = sanitizeText(body.preferred_style, 120);
    const colorTheme = sanitizeText(body.color_theme, 120);
    const specialRequirements = sanitizeText(body.special_requirements, 1200);
    const additionalNotes = sanitizeText(body.additional_notes, 1500);

    const fullName = sanitizeText(body.full_name, 140);
    const email = sanitizeText(body.email, 180).toLowerCase();
    const phone = sanitizeText(body.phone, 40);
    const whatsapp = sanitizeText(body.whatsapp, 40) || phone;
    const preferredContact = ['whatsapp', 'phone', 'email'].includes(String(body.preferred_contact))
      ? String(body.preferred_contact)
      : 'whatsapp';

    if (!eventType || !eventDate || !eventLocation || !budgetRange || !fullName || !isValidEmail(email) || !isValidPhone(phone)) {
      return json({ error: 'Veuillez renseigner correctement tous les champs obligatoires.' }, 400);
    }
    if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 10000) {
      return json({ error: 'Le nombre d’invités doit être compris entre 1 et 10 000.' }, 400);
    }

    const authUser = await getAuthUser(request, env);
    const now = new Date().toISOString();

    let customer = await env.DB.prepare('SELECT * FROM customers WHERE email = ?').bind(email).first<{ id: string }>();
    let customerId = customer?.id;
    if (!customerId) {
      customerId = generateId('cus');
      await env.DB.prepare(
        'INSERT INTO customers (id, user_id, full_name, email, phone, whatsapp, city, preferred_contact, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(customerId, authUser?.sub || null, fullName, email, phone, whatsapp, 'Casablanca', preferredContact, now, now)
        .run();
    } else {
      await env.DB.prepare(
        'UPDATE customers SET full_name = ?, phone = ?, whatsapp = ?, preferred_contact = ?, updated_at = ? WHERE id = ?'
      )
        .bind(fullName, phone, whatsapp, preferredContact, now, customerId)
        .run();
    }

    const bookingId = generateId('bkg');
    const reference = generateReference('RES');

    await env.DB.prepare(
      'INSERT INTO bookings (id, reference_number, customer_id, user_id, event_type, event_title, event_date, preferred_time, event_location, venue_preference, guest_count, duration_hours, budget_range, custom_budget_mad, preferred_style, color_theme, special_requirements, additional_notes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(
        bookingId,
        reference,
        customerId,
        authUser?.sub || null,
        eventType,
        eventTitle,
        eventDate,
        preferredTime || 'Soirée',
        eventLocation,
        venuePreference,
        guestCount,
        durationHours,
        budgetRange,
        customBudgetMad,
        preferredStyle,
        colorTheme,
        specialRequirements,
        additionalNotes,
        'Nouvelle demande',
        now,
        now
      )
      .run();

    const selectedServices = Array.isArray(body.selected_services) ? body.selected_services : [];
    for (const item of selectedServices.slice(0, 20)) {
      const sObj = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : null;
      const serviceName = sanitizeText(sObj?.service_name ?? item, 140);
      if (!serviceName) continue;
      const options = Array.isArray(sObj?.options)
        ? sObj.options.map((o) => sanitizeText(o, 120)).filter(Boolean)
        : [];
      await env.DB.prepare(
        'INSERT INTO booking_services (id, booking_id, service_name, selected_options_json, created_at) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(generateId('bsv'), bookingId, serviceName, JSON.stringify(options), now)
        .run();
    }

    await env.DB.prepare(
      'INSERT INTO notifications (id, recipient_role, user_id, title, body, link_path, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(
        generateId('not'),
        'admin',
        null,
        `Nouvelle demande de réservation (${reference})`,
        `${fullName} — ${eventType} le ${eventDate} (${guestCount} invités)`,
        '/admin',
        0,
        now
      )
      .run();

    if (authUser?.sub) {
      await env.DB.prepare(
        'INSERT INTO notifications (id, recipient_role, user_id, title, body, link_path, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          generateId('not'),
          'client',
          authUser.sub,
          `Demande reçue (${reference})`,
          'Votre demande a bien été envoyée. Notre équipe vous contactera pour confirmer les détails de votre événement.',
          '/espace-client',
          0,
          now
        )
        .run();
    }

    return json(
      {
        reference_number: reference,
        booking_id: bookingId,
        status: 'Nouvelle demande',
        message:
          'Votre demande a bien été envoyée. Notre équipe vous contactera pour confirmer les détails de votre événement.',
      },
      201
    );
  }

  // Public standalone quote request
  if (method === 'POST' && path === '/api/public/quotes') {
    if (!checkRateLimit(`quote:${ip}`, 10, 60_000)) {
      return json({ error: 'Trop de demandes. Veuillez patienter une minute.' }, 429);
    }
    const body = await parseJson<Record<string, unknown>>(request);
    if (!body) return json({ error: 'Corps de requête invalide.' }, 400);

    const turnstileOk = await verifyTurnstile(
      typeof body.turnstileToken === 'string' ? body.turnstileToken : undefined,
      ip,
      env
    );
    if (!turnstileOk) {
      return json({ error: 'Vérification anti-spam Turnstile invalide.' }, 400);
    }

    const eventType = sanitizeText(body.event_type, 120);
    const eventDate = sanitizeText(body.event_date, 40);
    const eventLocation = sanitizeText(body.event_location, 180);
    const guestCount = Math.max(1, Math.min(10000, Number(body.guest_count) || 50));
    const budgetRange = sanitizeText(body.budget_range, 120);
    const details = sanitizeText(body.details, 2000);
    const fullName = sanitizeText(body.full_name, 140);
    const email = sanitizeText(body.email, 180).toLowerCase();
    const phone = sanitizeText(body.phone, 40);
    const requestedServices = Array.isArray(body.requested_services)
      ? body.requested_services.map((s) => sanitizeText(s, 140)).filter(Boolean)
      : [];

    if (!eventType || !eventLocation || !fullName || !isValidEmail(email) || !isValidPhone(phone)) {
      return json({ error: 'Veuillez remplir tous les champs obligatoires avec des coordonnées valides.' }, 400);
    }

    const authUser = await getAuthUser(request, env);
    const now = new Date().toISOString();

    let customer = await env.DB.prepare('SELECT * FROM customers WHERE email = ?').bind(email).first<{ id: string }>();
    let customerId = customer?.id;
    if (!customerId) {
      customerId = generateId('cus');
      await env.DB.prepare(
        'INSERT INTO customers (id, user_id, full_name, email, phone, whatsapp, city, preferred_contact, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(customerId, authUser?.sub || null, fullName, email, phone, phone, 'Casablanca', 'whatsapp', now, now)
        .run();
    }

    const quoteId = generateId('quo');
    const reference = generateReference('DEV');

    await env.DB.prepare(
      'INSERT INTO quotes (id, reference_number, booking_id, customer_id, user_id, event_type, event_date, event_location, guest_count, budget_range, details, status, subtotal_mad, discount_mad, total_mad, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(
        quoteId,
        reference,
        null,
        customerId,
        authUser?.sub || null,
        eventType,
        eventDate,
        eventLocation,
        guestCount,
        budgetRange || 'À définir',
        details,
        'Nouvelle demande',
        0,
        0,
        0,
        now,
        now
      )
      .run();

    for (const serviceName of requestedServices.slice(0, 20)) {
      await env.DB.prepare(
        'INSERT INTO quote_items (id, quote_id, service_name, description, quantity, unit_price_mad, line_total_mad, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(generateId('qit'), quoteId, serviceName, 'Prestation demandée par le client', 1, 0, 0, now)
        .run();
    }

    await env.DB.prepare(
      'INSERT INTO notifications (id, recipient_role, user_id, title, body, link_path, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(
        generateId('not'),
        'admin',
        null,
        `Nouvelle demande de devis (${reference})`,
        `${fullName} — ${eventType} (${guestCount} pers.)`,
        '/admin',
        0,
        now
      )
      .run();

    return json(
      {
        reference_number: reference,
        quote_id: quoteId,
        status: 'Nouvelle demande',
        message: 'Votre demande de devis personnalisé a bien été enregistrée.',
      },
      201
    );
  }

  // Public contact message
  if (method === 'POST' && path === '/api/public/contact') {
    if (!checkRateLimit(`contact:${ip}`, 10, 60_000)) {
      return json({ error: 'Trop de messages envoyés. Réessayez dans une minute.' }, 429);
    }
    const body = await parseJson<Record<string, unknown>>(request);
    if (!body) return json({ error: 'Corps de requête invalide.' }, 400);

    const turnstileOk = await verifyTurnstile(
      typeof body.turnstileToken === 'string' ? body.turnstileToken : undefined,
      ip,
      env
    );
    if (!turnstileOk) {
      return json({ error: 'Vérification anti-spam invalide.' }, 400);
    }

    const name = sanitizeText(body.name, 140);
    const email = sanitizeText(body.email, 180).toLowerCase();
    const phone = sanitizeText(body.phone, 40);
    const subject = sanitizeText(body.subject, 180);
    const message = sanitizeText(body.message, 3000);

    if (!name || !isValidEmail(email) || !isValidPhone(phone) || !subject || !message) {
      return json({ error: 'Veuillez compléter tous les champs avec des informations valides.' }, 400);
    }

    const now = new Date().toISOString();
    const msgId = generateId('msg');
    await env.DB.prepare(
      'INSERT INTO contact_messages (id, name, email, phone, subject, message, is_read, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(msgId, name, email, phone, subject, message, 0, now, now)
      .run();

    await env.DB.prepare(
      'INSERT INTO notifications (id, recipient_role, user_id, title, body, link_path, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(generateId('not'), 'admin', null, `Nouveau message : ${subject}`, `De ${name} (${phone})`, '/admin', 0, now)
      .run();

    return json({ id: msgId, message: 'Votre message a bien été transmis à notre équipe à Casablanca.' }, 201);
  }

  // Auth: Admin bootstrap status (allows safe first-run admin password setup when env passcode is unset)
  if (method === 'GET' && path === '/api/auth/admin-status') {
    const envConfigured = Boolean(env.ADMIN_BOOTSTRAP_PASSCODE && env.ADMIN_BOOTSTRAP_PASSCODE.trim().length >= 8);
    const existingAdmin = await env.DB.prepare('SELECT id FROM users WHERE role = ?').bind('admin').first();
    return json({
      configured: envConfigured || Boolean(existingAdmin),
      mode: envConfigured ? 'env' : existingAdmin ? 'claimed' : 'unclaimed',
    });
  }

  // Auth: One-time first-run admin setup
  if (method === 'POST' && path === '/api/auth/admin-claim') {
    const envPasscode = env.ADMIN_BOOTSTRAP_PASSCODE?.trim();
    if (envPasscode && envPasscode.length >= 8) {
      return json({ error: 'L’accès administrateur est déjà configuré via les variables serveur.' }, 403);
    }
    const existingAdmin = await env.DB.prepare('SELECT id FROM users WHERE role = ?').bind('admin').first();
    if (existingAdmin) {
      return json({ error: 'Un compte administrateur existe déjà. Connectez-vous.' }, 409);
    }
    const body = await parseJson<Record<string, unknown>>(request);
    const email = sanitizeText(body?.email, 180).toLowerCase() || 'admin@eventpro.ma';
    const password = typeof body?.password === 'string' ? body.password : '';
    const fullName = sanitizeText(body?.full_name, 140) || 'Administrateur EVENT PRO';
    if (!isValidEmail(email) || password.length < 8) {
      return json({ error: 'Email valide et mot de passe d’au moins 8 caractères requis.' }, 400);
    }
    const now = new Date().toISOString();
    const adminId = generateId('adm');
    const hash = await hashPassword(password);
    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(adminId, email, hash, 'admin', fullName, '+212 5 22 00 00 00', 1, now, now)
      .run();
    await env.DB.prepare(
      'INSERT INTO admin_roles (id, user_id, role_name, permissions_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(generateId('rol'), adminId, 'super_admin', '["*"]', now, now)
      .run();
    const token = await signToken({ sub: adminId, email, role: 'admin', name: fullName }, env);
    return json({ token, user: { id: adminId, email, role: 'admin', full_name: fullName } }, 201);
  }

  // Auth: Register client
  if (method === 'POST' && path === '/api/auth/register') {
    if (!checkRateLimit(`reg:${ip}`, 8, 60_000)) {
      return json({ error: 'Trop de tentatives. Réessayez plus tard.' }, 429);
    }
    const body = await parseJson<Record<string, unknown>>(request);
    const fullName = sanitizeText(body?.full_name, 140);
    const email = sanitizeText(body?.email, 180).toLowerCase();
    const phone = sanitizeText(body?.phone, 40);
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!fullName || !isValidEmail(email) || !isValidPhone(phone) || password.length < 8) {
      return json(
        { error: 'Nom complet, email valide, téléphone marocain/international et mot de passe (8+ caractères) requis.' },
        400
      );
    }

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) {
      return json({ error: 'Un compte existe déjà avec cette adresse email.' }, 409);
    }

    const now = new Date().toISOString();
    const userId = generateId('usr');
    const hash = await hashPassword(password);
    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(userId, email, hash, 'client', fullName, phone, 1, now, now)
      .run();

    // Link existing customer profile by email or create one
    const existingCus = await env.DB.prepare('SELECT id FROM customers WHERE email = ?').bind(email).first<{ id: string }>();
    if (existingCus) {
      await env.DB.prepare('UPDATE customers SET user_id = ?, full_name = ?, phone = ?, updated_at = ? WHERE id = ?')
        .bind(userId, fullName, phone, now, existingCus.id)
        .run();
    } else {
      await env.DB.prepare(
        'INSERT INTO customers (id, user_id, full_name, email, phone, whatsapp, city, preferred_contact, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(generateId('cus'), userId, fullName, email, phone, phone, 'Casablanca', 'whatsapp', now, now)
        .run();
    }

    const token = await signToken({ sub: userId, email, role: 'client', name: fullName }, env);
    return json({ token, user: { id: userId, email, role: 'client', full_name: fullName, phone } }, 201);
  }

  // Auth: Login (client or admin)
  if (method === 'POST' && path === '/api/auth/login') {
    if (!checkRateLimit(`login:${ip}`, 12, 60_000)) {
      return json({ error: 'Trop de tentatives de connexion. Patientez une minute.' }, 429);
    }
    const body = await parseJson<Record<string, unknown>>(request);
    const email = sanitizeText(body?.email, 180).toLowerCase();
    const password = typeof body?.password === 'string' ? body.password : '';
    const portal = body?.portal === 'admin' ? 'admin' : 'client';

    if (!password) {
      return json({ error: 'Mot de passe requis.' }, 400);
    }

    // Check env ADMIN_BOOTSTRAP_PASSCODE override when logging into admin
    if (portal === 'admin' && env.ADMIN_BOOTSTRAP_PASSCODE && env.ADMIN_BOOTSTRAP_PASSCODE.trim().length >= 8) {
      if (password === env.ADMIN_BOOTSTRAP_PASSCODE.trim()) {
        const adminId = 'adm_env_master';
        const adminEmail = email || 'admin@eventpro.ma';
        const token = await signToken({ sub: adminId, email: adminEmail, role: 'admin', name: 'Administrateur' }, env);
        return json({
          token,
          user: { id: adminId, email: adminEmail, role: 'admin', full_name: 'Administrateur EVENT PRO' },
        });
      }
    }

    if (!isValidEmail(email)) {
      return json({ error: 'Identifiants invalides.' }, 401);
    }

    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<{
      id: string;
      email: string;
      password_hash: string;
      role: 'client' | 'admin';
      full_name: string;
      phone: string | null;
      is_active: number;
    }>();

    if (!user || !user.is_active) {
      return json({ error: 'Identifiants invalides.' }, 401);
    }
    if (portal === 'admin' && user.role !== 'admin') {
      return json({ error: 'Accès réservé aux administrateurs.' }, 403);
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return json({ error: 'Identifiants invalides.' }, 401);
    }

    const token = await signToken(
      { sub: user.id, email: user.email, role: user.role, name: user.full_name },
      env
    );
    return json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        phone: user.phone,
      },
    });
  }

  // Auth: Password recovery request
  if (method === 'POST' && path === '/api/auth/recover') {
    if (!checkRateLimit(`rec:${ip}`, 5, 60_000)) {
      return json({ error: 'Trop de demandes. Veuillez patienter.' }, 429);
    }
    const body = await parseJson<Record<string, unknown>>(request);
    const email = sanitizeText(body?.email, 180).toLowerCase();
    if (!isValidEmail(email)) {
      return json({ error: 'Adresse email invalide.' }, 400);
    }
    // Always return neutral confirmation to prevent account enumeration
    const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>();
    if (user) {
      const now = new Date().toISOString();
      await env.DB.prepare(
        'INSERT INTO notifications (id, recipient_role, user_id, title, body, link_path, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          generateId('not'),
          'admin',
          null,
          'Demande de réinitialisation mot de passe',
          `Un client (${email}) a demandé une réinitialisation d’accès.`,
          '/admin',
          0,
          now
        )
        .run();
    }
    return json({
      message:
        'Si un compte est associé à cette adresse email, notre équipe ou le service d’authentification vous transmettra les instructions de réinitialisation.',
    });
  }

  // Protected client routes
  if (path.startsWith('/api/client/')) {
    const authUser = await getAuthUser(request, env);
    if (!authUser) {
      return json({ error: 'Authentification requise.' }, 401);
    }

    if (method === 'GET' && path === '/api/client/me') {
      const user = await env.DB.prepare('SELECT id, email, role, full_name, phone, created_at FROM users WHERE id = ?')
        .bind(authUser.sub)
        .first();
      const customer = await env.DB.prepare('SELECT * FROM customers WHERE user_id = ?')
        .bind(authUser.sub)
        .first();
      return json({ user, customer });
    }

    if (method === 'PATCH' && path === '/api/client/me') {
      const body = await parseJson<Record<string, unknown>>(request);
      const fullName = sanitizeText(body?.full_name, 140);
      const phone = sanitizeText(body?.phone, 40);
      const whatsapp = sanitizeText(body?.whatsapp, 40) || phone;
      const preferredContact = ['whatsapp', 'phone', 'email'].includes(String(body?.preferred_contact))
        ? String(body?.preferred_contact)
        : 'whatsapp';

      if (!fullName || !isValidPhone(phone)) {
        return json({ error: 'Nom complet et numéro de téléphone valide requis.' }, 400);
      }
      const now = new Date().toISOString();
      await env.DB.prepare('UPDATE users SET full_name = ?, phone = ?, updated_at = ? WHERE id = ?')
        .bind(fullName, phone, now, authUser.sub)
        .run();
      await env.DB.prepare(
        'UPDATE customers SET full_name = ?, phone = ?, whatsapp = ?, preferred_contact = ?, updated_at = ? WHERE user_id = ?'
      )
        .bind(fullName, phone, whatsapp, preferredContact, now, authUser.sub)
        .run();
      return json({ ok: true, message: 'Profil mis à jour.' });
    }

    if (method === 'GET' && path === '/api/client/bookings') {
      const customer = await env.DB.prepare('SELECT id FROM customers WHERE user_id = ?')
        .bind(authUser.sub)
        .first<{ id: string }>();
      const allBookings = await env.DB.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all<Record<string, unknown>>();
      const mine = (allBookings.results || []).filter(
        (b) => b.user_id === authUser.sub || (customer && b.customer_id === customer.id)
      );
      const servicesRes = await env.DB.prepare('SELECT * FROM booking_services').all<Record<string, unknown>>();
      const byBooking = new Map<string, unknown[]>();
      for (const s of servicesRes.results || []) {
        const bid = String(s.booking_id);
        const list = byBooking.get(bid) || [];
        list.push(s);
        byBooking.set(bid, list);
      }
      return json({
        bookings: mine.map((b) => ({
          ...b,
          services: byBooking.get(String(b.id)) || [],
        })),
      });
    }

    if (method === 'GET' && path === '/api/client/quotes') {
      const customer = await env.DB.prepare('SELECT id FROM customers WHERE user_id = ?')
        .bind(authUser.sub)
        .first<{ id: string }>();
      const allQuotes = await env.DB.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all<Record<string, unknown>>();
      const mine = (allQuotes.results || []).filter(
        (q) => q.user_id === authUser.sub || (customer && q.customer_id === customer.id)
      );
      const itemsRes = await env.DB.prepare('SELECT * FROM quote_items').all<Record<string, unknown>>();
      const byQuote = new Map<string, unknown[]>();
      for (const it of itemsRes.results || []) {
        const qid = String(it.quote_id);
        const list = byQuote.get(qid) || [];
        list.push(it);
        byQuote.set(qid, list);
      }
      return json({
        quotes: mine.map((q) => ({
          ...q,
          items: byQuote.get(String(q.id)) || [],
        })),
      });
    }

    if (method === 'GET' && path === '/api/client/notifications') {
      const res = await env.DB.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC')
        .bind(authUser.sub)
        .all();
      return json({ notifications: res.results || [] });
    }
  }

  // Protected admin routes
  if (path.startsWith('/api/admin/')) {
    const authUser = await getAuthUser(request, env);
    if (!authUser || authUser.role !== 'admin') {
      return json({ error: 'Accès administrateur requis.' }, 403);
    }

    // Overview KPIs
    if (method === 'GET' && path === '/api/admin/overview') {
      const [bookingsRes, quotesRes, customersRes, messagesRes, notificationsRes] = await Promise.all([
        env.DB.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all<Record<string, unknown>>(),
        env.DB.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all<Record<string, unknown>>(),
        env.DB.prepare('SELECT * FROM customers ORDER BY created_at DESC').all<Record<string, unknown>>(),
        env.DB.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all<Record<string, unknown>>(),
        env.DB.prepare('SELECT * FROM notifications WHERE recipient_role = ? ORDER BY created_at DESC')
          .bind('admin')
          .all<Record<string, unknown>>(),
      ]);

      const bookings = bookingsRes.results || [];
      const quotes = quotesRes.results || [];
      const customers = customersRes.results || [];
      const messages = messagesRes.results || [];
      const todayIso = new Date().toISOString().slice(0, 10);

      const newRequests = bookings.filter((b) => b.status === 'Nouvelle demande').length;
      const confirmedEvents = bookings.filter((b) => b.status === 'Confirmé').length;
      const upcomingEvents = bookings.filter(
        (b) => b.status === 'Confirmé' && typeof b.event_date === 'string' && b.event_date >= todayIso
      ).length;
      const pendingQuotes = quotes.filter((q) =>
        ['Nouvelle demande', 'En cours', 'Devis envoyé', 'En attente du client'].includes(String(q.status))
      ).length;

      return json({
        stats: {
          total_bookings: bookings.length,
          new_requests: newRequests,
          pending_quotes: pendingQuotes,
          confirmed_events: confirmedEvents,
          upcoming_events: upcomingEvents,
          total_customers: customers.length,
          unread_messages: messages.filter((m) => !m.is_read).length,
        },
        recent_bookings: bookings.slice(0, 6),
        recent_messages: messages.slice(0, 5),
        notifications: (notificationsRes.results || []).slice(0, 10),
      });
    }

    // Bookings management
    if (method === 'GET' && path === '/api/admin/bookings') {
      const [bookingsRes, customersRes, bServicesRes] = await Promise.all([
        env.DB.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all<Record<string, unknown>>(),
        env.DB.prepare('SELECT * FROM customers').all<Record<string, unknown>>(),
        env.DB.prepare('SELECT * FROM booking_services').all<Record<string, unknown>>(),
      ]);
      const customerMap = new Map((customersRes.results || []).map((c) => [String(c.id), c]));
      const servicesMap = new Map<string, unknown[]>();
      for (const s of bServicesRes.results || []) {
        const bid = String(s.booking_id);
        const arr = servicesMap.get(bid) || [];
        arr.push(s);
        servicesMap.set(bid, arr);
      }
      const enriched = (bookingsRes.results || []).map((b) => ({
        ...b,
        customer: customerMap.get(String(b.customer_id)) || null,
        services: servicesMap.get(String(b.id)) || [],
      }));
      return json({ bookings: enriched });
    }

    if (method === 'GET' && path === '/api/admin/bookings/export') {
      const [bookingsRes, customersRes] = await Promise.all([
        env.DB.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all<Record<string, unknown>>(),
        env.DB.prepare('SELECT * FROM customers').all<Record<string, unknown>>(),
      ]);
      const customerMap = new Map((customersRes.results || []).map((c) => [String(c.id), c]));
      const escapeCsv = (val: unknown) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      const headers = ['Reference', 'Client', 'Email', 'Telephone', 'Type', 'Date', 'Lieu', 'Invites', 'Budget', 'Statut'];
      const rows = (bookingsRes.results || []).map((b) => {
        const c = customerMap.get(String(b.customer_id)) as Record<string, unknown> | undefined;
        return [
          b.reference_number,
          c?.full_name || '',
          c?.email || '',
          c?.phone || '',
          b.event_type,
          b.event_date,
          b.event_location,
          b.guest_count,
          b.budget_range,
          b.status,
        ]
          .map(escapeCsv)
          .join(',');
      });
      const csv = [headers.join(','), ...rows].join('\n');
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="event-pro-reservations.csv"',
        },
      });
    }

    if (method === 'PATCH' && path.startsWith('/api/admin/bookings/')) {
      const id = path.replace('/api/admin/bookings/', '');
      const body = await parseJson<Record<string, unknown>>(request);
      if (!body) return json({ error: 'Données invalides.' }, 400);
      const allowedStatuses = [
        'Nouvelle demande',
        'En cours',
        'Devis envoyé',
        'En attente du client',
        'Confirmé',
        'Refusé',
        'Annulé',
      ];
      const existing = await env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first<Record<string, unknown>>();
      if (!existing) return json({ error: 'Réservation introuvable.' }, 404);

      const status = allowedStatuses.includes(String(body.status)) ? String(body.status) : String(existing.status);
      const internalNotes =
        body.internal_notes !== undefined ? sanitizeText(body.internal_notes, 2000) : String(existing.internal_notes || '');
      const assignedTo =
        body.assigned_to !== undefined ? sanitizeText(body.assigned_to, 120) : String(existing.assigned_to || '');
      const eventDate =
        body.event_date !== undefined ? sanitizeText(body.event_date, 40) : String(existing.event_date || '');
      const now = new Date().toISOString();

      await env.DB.prepare(
        'UPDATE bookings SET status = ?, internal_notes = ?, assigned_to = ?, event_date = ?, updated_at = ? WHERE id = ?'
      )
        .bind(status, internalNotes, assignedTo, eventDate, now, id)
        .run();

      return json({ ok: true });
    }

    // Quotes management
    if (method === 'GET' && path === '/api/admin/quotes') {
      const [quotesRes, customersRes, itemsRes] = await Promise.all([
        env.DB.prepare('SELECT * FROM quotes ORDER BY created_at DESC').all<Record<string, unknown>>(),
        env.DB.prepare('SELECT * FROM customers').all<Record<string, unknown>>(),
        env.DB.prepare('SELECT * FROM quote_items').all<Record<string, unknown>>(),
      ]);
      const customerMap = new Map((customersRes.results || []).map((c) => [String(c.id), c]));
      const itemsMap = new Map<string, unknown[]>();
      for (const it of itemsRes.results || []) {
        const qid = String(it.quote_id);
        const arr = itemsMap.get(qid) || [];
        arr.push(it);
        itemsMap.set(qid, arr);
      }
      return json({
        quotes: (quotesRes.results || []).map((q) => ({
          ...q,
          customer: customerMap.get(String(q.customer_id)) || null,
          items: itemsMap.get(String(q.id)) || [],
        })),
      });
    }

    if (method === 'POST' && path === '/api/admin/quotes') {
      const body = await parseJson<Record<string, unknown>>(request);
      if (!body) return json({ error: 'Données invalides.' }, 400);
      const customerId = sanitizeText(body.customer_id, 80);
      const eventType = sanitizeText(body.event_type, 120);
      const eventDate = sanitizeText(body.event_date, 40);
      const eventLocation = sanitizeText(body.event_location, 180) || 'Casablanca';
      const guestCount = Math.max(1, Number(body.guest_count) || 50);
      const discountMad = Math.max(0, Number(body.discount_mad) || 0);
      const adminNotes = sanitizeText(body.admin_notes, 2000);
      const items = Array.isArray(body.items) ? body.items : [];
      if (!customerId || !eventType) {
        return json({ error: 'Client et type d’événement requis.' }, 400);
      }
      const now = new Date().toISOString();
      const quoteId = generateId('quo');
      const reference = generateReference('DEV');
      let subtotal = 0;
      const preparedItems: Array<{ service_name: string; description: string; quantity: number; unit_price_mad: number; line_total: number }> = [];
      for (const raw of items) {
        const row = raw as Record<string, unknown>;
        const serviceName = sanitizeText(row.service_name, 140);
        if (!serviceName) continue;
        const quantity = Math.max(1, Number(row.quantity) || 1);
        const unitPrice = Math.max(0, Number(row.unit_price_mad) || 0);
        const lineTotal = quantity * unitPrice;
        subtotal += lineTotal;
        preparedItems.push({
          service_name: serviceName,
          description: sanitizeText(row.description, 300),
          quantity,
          unit_price_mad: unitPrice,
          line_total: lineTotal,
        });
      }
      const total = Math.max(0, subtotal - discountMad);

      await env.DB.prepare(
        'INSERT INTO quotes (id, reference_number, booking_id, customer_id, user_id, event_type, event_date, event_location, guest_count, budget_range, details, status, subtotal_mad, discount_mad, total_mad, admin_notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          quoteId,
          reference,
          body.booking_id ? sanitizeText(body.booking_id, 80) : null,
          customerId,
          null,
          eventType,
          eventDate,
          eventLocation,
          guestCount,
          'Devis chiffré',
          sanitizeText(body.details, 1000),
          'En cours',
          subtotal,
          discountMad,
          total,
          adminNotes,
          now,
          now
        )
        .run();

      for (const it of preparedItems) {
        await env.DB.prepare(
          'INSERT INTO quote_items (id, quote_id, service_name, description, quantity, unit_price_mad, line_total_mad, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        )
          .bind(generateId('qit'), quoteId, it.service_name, it.description, it.quantity, it.unit_price_mad, it.line_total, now)
          .run();
      }
      return json({ id: quoteId, reference_number: reference }, 201);
    }

    if (method === 'PATCH' && path.startsWith('/api/admin/quotes/')) {
      const id = path.replace('/api/admin/quotes/', '');
      const body = await parseJson<Record<string, unknown>>(request);
      if (!body) return json({ error: 'Données invalides.' }, 400);
      const existing = await env.DB.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first<Record<string, unknown>>();
      if (!existing) return json({ error: 'Devis introuvable.' }, 404);

      const allowedStatuses = [
        'Nouvelle demande',
        'En cours',
        'Devis envoyé',
        'En attente du client',
        'Accepté',
        'Refusé',
        'Annulé',
      ];
      const status = allowedStatuses.includes(String(body.status)) ? String(body.status) : String(existing.status);
      const discountMad = body.discount_mad !== undefined ? Math.max(0, Number(body.discount_mad) || 0) : Number(existing.discount_mad || 0);
      const adminNotes = body.admin_notes !== undefined ? sanitizeText(body.admin_notes, 2000) : String(existing.admin_notes || '');
      const validUntil = body.valid_until !== undefined ? sanitizeText(body.valid_until, 40) : String(existing.valid_until || '');
      const now = new Date().toISOString();

      let subtotal = Number(existing.subtotal_mad || 0);
      if (Array.isArray(body.items)) {
        await env.DB.prepare('DELETE FROM quote_items WHERE quote_id = ?').bind(id).run();
        subtotal = 0;
        for (const raw of body.items) {
          const row = raw as Record<string, unknown>;
          const serviceName = sanitizeText(row.service_name, 140);
          if (!serviceName) continue;
          const quantity = Math.max(1, Number(row.quantity) || 1);
          const unitPrice = Math.max(0, Number(row.unit_price_mad) || 0);
          const lineTotal = quantity * unitPrice;
          subtotal += lineTotal;
          await env.DB.prepare(
            'INSERT INTO quote_items (id, quote_id, service_name, description, quantity, unit_price_mad, line_total_mad, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(
              generateId('qit'),
              id,
              serviceName,
              sanitizeText(row.description, 300),
              quantity,
              unitPrice,
              lineTotal,
              now
            )
            .run();
        }
      }

      const total = Math.max(0, subtotal - discountMad);
      await env.DB.prepare(
        'UPDATE quotes SET status = ?, subtotal_mad = ?, discount_mad = ?, total_mad = ?, admin_notes = ?, valid_until = ?, updated_at = ? WHERE id = ?'
      )
        .bind(status, subtotal, discountMad, total, adminNotes, validUntil, now, id)
        .run();

      return json({ ok: true, subtotal_mad: subtotal, total_mad: total });
    }

    // Services management
    if (method === 'GET' && path === '/api/admin/services') {
      const [categoriesRes, servicesRes] = await Promise.all([
        env.DB.prepare('SELECT * FROM service_categories ORDER BY display_order ASC').all(),
        env.DB.prepare('SELECT * FROM services ORDER BY display_order ASC').all(),
      ]);
      return json({ categories: categoriesRes.results || [], services: servicesRes.results || [] });
    }

    if (method === 'POST' && path === '/api/admin/services') {
      const body = await parseJson<Record<string, unknown>>(request);
      if (!body) return json({ error: 'Données invalides.' }, 400);
      const nameFr = sanitizeText(body.name_fr, 160);
      const categoryId = sanitizeText(body.category_id, 80);
      const shortDesc = sanitizeText(body.short_description_fr, 320);
      const desc = sanitizeText(body.description_fr, 2000) || shortDesc;
      const coverImage = sanitizeText(body.cover_image, 500) || '/src/assets/images/hero_casablanca_gala_1795343965521.jpg';
      if (!nameFr || !categoryId || !shortDesc || !isSafeImageUrl(coverImage)) {
        return json({ error: 'Nom, catégorie, description et image valide requis.' }, 400);
      }
      const id = generateId('srv');
      const slug = `${nameFr.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${id.slice(-4)}`;
      const now = new Date().toISOString();
      const price =
        body.starting_price_mad !== null && body.starting_price_mad !== undefined && body.starting_price_mad !== ''
          ? Math.max(0, Number(body.starting_price_mad))
          : null;
      await env.DB.prepare(
        'INSERT INTO services (id, category_id, slug, name_fr, short_description_fr, description_fr, benefits_json, included_json, options_json, cover_image, starting_price_mad, price_is_example, is_available, display_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(
          id,
          categoryId,
          slug,
          nameFr,
          shortDesc,
          desc,
          JSON.stringify(Array.isArray(body.benefits) ? body.benefits : []),
          JSON.stringify(Array.isArray(body.included) ? body.included : []),
          JSON.stringify(Array.isArray(body.options) ? body.options : []),
          coverImage,
          price,
          body.price_is_example ? 1 : 0,
          body.is_available === false ? 0 : 1,
          Number(body.display_order) || 99,
          now,
          now
        )
        .run();
      return json({ id }, 201);
    }

    if (method === 'PATCH' && path.startsWith('/api/admin/services/')) {
      const id = path.replace('/api/admin/services/', '');
      const body = await parseJson<Record<string, unknown>>(request);
      const existing = await env.DB.prepare('SELECT * FROM services WHERE id = ?').bind(id).first<Record<string, unknown>>();
      if (!existing || !body) return json({ error: 'Prestation introuvable.' }, 404);
      const now = new Date().toISOString();
      const nameFr = body.name_fr !== undefined ? sanitizeText(body.name_fr, 160) : String(existing.name_fr);
      const shortDesc =
        body.short_description_fr !== undefined
          ? sanitizeText(body.short_description_fr, 320)
          : String(existing.short_description_fr);
      const desc = body.description_fr !== undefined ? sanitizeText(body.description_fr, 2000) : String(existing.description_fr);
      const coverImage =
        body.cover_image !== undefined && isSafeImageUrl(String(body.cover_image))
          ? String(body.cover_image)
          : String(existing.cover_image);
      const startingPrice =
        body.starting_price_mad === '' || body.starting_price_mad === null
          ? null
          : body.starting_price_mad !== undefined
            ? Math.max(0, Number(body.starting_price_mad))
            : existing.starting_price_mad;
      const isAvailable = body.is_available !== undefined ? (body.is_available ? 1 : 0) : Number(existing.is_available);
      const priceIsExample =
        body.price_is_example !== undefined ? (body.price_is_example ? 1 : 0) : Number(existing.price_is_example);

      await env.DB.prepare(
        'UPDATE services SET name_fr = ?, short_description_fr = ?, description_fr = ?, cover_image = ?, starting_price_mad = ?, price_is_example = ?, is_available = ?, updated_at = ? WHERE id = ?'
      )
        .bind(nameFr, shortDesc, desc, coverImage, startingPrice, priceIsExample, isAvailable, now, id)
        .run();
      return json({ ok: true });
    }

    if (method === 'DELETE' && path.startsWith('/api/admin/services/')) {
      const id = path.replace('/api/admin/services/', '');
      await env.DB.prepare('DELETE FROM services WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    // Gallery management + R2 upload
    if (method === 'POST' && path === '/api/admin/upload') {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!(file instanceof File)) {
        return json({ error: 'Aucun fichier image fourni.' }, 400);
      }
      if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) {
        return json({ error: 'Image valide (max 8 Mo) requise.' }, 400);
      }
      const ext = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'jpg';
      const key = `gallery/${Date.now()}-${generateId('img')}.${ext}`;
      if (env.R2_BUCKET) {
        await env.R2_BUCKET.put(key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type },
        });
      }
      return json({ key, url: `/api/media/${encodeURIComponent(key)}` }, 201);
    }

    if (method === 'POST' && path === '/api/admin/gallery') {
      const body = await parseJson<Record<string, unknown>>(request);
      if (!body) return json({ error: 'Données invalides.' }, 400);
      const title = sanitizeText(body.title, 160);
      const caption = sanitizeText(body.caption, 400);
      const category = sanitizeText(body.category, 80) || 'Mariages';
      const imageUrl = sanitizeText(body.image_url, 500);
      if (!title || !isSafeImageUrl(imageUrl)) {
        return json({ error: 'Titre et URL d’image valide requis.' }, 400);
      }
      const id = generateId('gal');
      const now = new Date().toISOString();
      await env.DB.prepare(
        'INSERT INTO gallery_images (id, title, caption, category, image_url, r2_key, display_order, is_featured, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      )
        .bind(id, title, caption, category, imageUrl, sanitizeText(body.r2_key, 200) || null, 1, body.is_featured ? 1 : 0, now, now)
        .run();
      return json({ id }, 201);
    }

    if (method === 'DELETE' && path.startsWith('/api/admin/gallery/')) {
      const id = path.replace('/api/admin/gallery/', '');
      const existing = await env.DB.prepare('SELECT * FROM gallery_images WHERE id = ?').bind(id).first<{ r2_key?: string }>();
      if (existing?.r2_key && env.R2_BUCKET) {
        await env.R2_BUCKET.delete(existing.r2_key);
      }
      await env.DB.prepare('DELETE FROM gallery_images WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    // Customers management
    if (method === 'GET' && path === '/api/admin/customers') {
      const [customersRes, bookingsRes] = await Promise.all([
        env.DB.prepare('SELECT * FROM customers ORDER BY created_at DESC').all<Record<string, unknown>>(),
        env.DB.prepare('SELECT * FROM bookings').all<Record<string, unknown>>(),
      ]);
      const bookingCounts = new Map<string, number>();
      for (const b of bookingsRes.results || []) {
        const cid = String(b.customer_id);
        bookingCounts.set(cid, (bookingCounts.get(cid) || 0) + 1);
      }
      return json({
        customers: (customersRes.results || []).map((c) => ({
          ...c,
          booking_count: bookingCounts.get(String(c.id)) || 0,
        })),
      });
    }

    // Messages management
    if (method === 'GET' && path === '/api/admin/messages') {
      const res = await env.DB.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC').all();
      return json({ messages: res.results || [] });
    }

    if (method === 'PATCH' && path.startsWith('/api/admin/messages/')) {
      const id = path.replace('/api/admin/messages/', '');
      const body = await parseJson<Record<string, unknown>>(request);
      if (!body) return json({ error: 'Données invalides.' }, 400);
      const now = new Date().toISOString();
      if (body.is_read !== undefined) {
        await env.DB.prepare('UPDATE contact_messages SET is_read = ?, updated_at = ? WHERE id = ?')
          .bind(body.is_read ? 1 : 0, now, id)
          .run();
      }
      if (body.admin_reply !== undefined) {
        await env.DB.prepare('UPDATE contact_messages SET admin_reply = ?, replied_at = ?, is_read = 1, updated_at = ? WHERE id = ?')
          .bind(sanitizeText(body.admin_reply, 2000), now, now, id)
          .run();
      }
      return json({ ok: true });
    }

    if (method === 'DELETE' && path.startsWith('/api/admin/messages/')) {
      const id = path.replace('/api/admin/messages/', '');
      await env.DB.prepare('DELETE FROM contact_messages WHERE id = ?').bind(id).run();
      return json({ ok: true });
    }

    // Company settings
    if (method === 'GET' && path === '/api/admin/settings') {
      const settings = await env.DB.prepare('SELECT * FROM company_settings WHERE id = ?').bind('default').first();
      return json({ settings });
    }

    if (method === 'PATCH' && path === '/api/admin/settings') {
      const body = await parseJson<Record<string, unknown>>(request);
      if (!body) return json({ error: 'Données invalides.' }, 400);
      const existing = await env.DB.prepare('SELECT * FROM company_settings WHERE id = ?').bind('default').first<Record<string, unknown>>();
      const now = new Date().toISOString();
      await env.DB.prepare(
        'UPDATE company_settings SET company_name = ?, slogan_fr = ?, phone = ?, whatsapp_number = ?, email = ?, address = ?, service_area = ?, instagram_url = ?, facebook_url = ?, currency = ?, booking_notice_fr = ?, logo_url = ?, updated_at = ? WHERE id = ?'
      )
        .bind(
          sanitizeText(body.company_name ?? existing?.company_name, 120),
          sanitizeText(body.slogan_fr ?? existing?.slogan_fr, 240),
          sanitizeText(body.phone ?? existing?.phone, 60),
          sanitizeText(body.whatsapp_number ?? existing?.whatsapp_number, 60),
          sanitizeText(body.email ?? existing?.email, 180),
          sanitizeText(body.address ?? existing?.address, 240),
          sanitizeText(body.service_area ?? existing?.service_area, 240),
          sanitizeText(body.instagram_url ?? existing?.instagram_url, 240),
          sanitizeText(body.facebook_url ?? existing?.facebook_url, 240),
          sanitizeText(body.currency ?? existing?.currency, 10) || 'MAD',
          sanitizeText(body.booking_notice_fr ?? existing?.booking_notice_fr, 500),
          sanitizeText(body.logo_url ?? existing?.logo_url, 300),
          now,
          'default'
        )
        .run();
      const updated = await env.DB.prepare('SELECT * FROM company_settings WHERE id = ?').bind('default').first();
      return json({ ok: true, settings: updated });
    }
  }

  return json({ error: 'Route API introuvable.' }, 404);
}
