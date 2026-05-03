-- DSR Maison — seed inicial
-- Datos exportados desde src/data/* del repo (commit phase2/moving-online).
-- Idempotente: re-correrlo no rompe nada (ON CONFLICT DO NOTHING).
-- Photos guardan slugs de pollinations (resueltos en frontend con I()).

-- =========================================================================
-- CATEGORIES
-- =========================================================================

insert into categories (id, name_es, name_en, tag) values
  ('hair',   'Peluquería', 'Hair',    'I'),
  ('nails',  'Manicura',   'Nails',   'II'),
  ('facial', 'Faciales',   'Facials', 'III')
on conflict (id) do nothing;

-- =========================================================================
-- SERVICES
-- =========================================================================

insert into services (id, cat_id, name_es, name_en, desc_es, desc_en, duration, price, popular) values
  ('cut-signature', 'hair', 'Corte Signature', 'Signature Cut',
    'Diagnóstico capilar, corte a medida y estilo final con secado al aire o brushing.',
    'Hair diagnosis, bespoke cut and finish with air-dry or blowout.',
    75, 95, false),
  ('color-balayage', 'hair', 'Balayage de Autor', 'Couture Balayage',
    'Iluminación a mano alzada para una luz natural, sin raíces visibles, con tratamiento de finalización Olaplex.',
    'Freehand lights for soft, sunlit dimension with Olaplex finishing.',
    180, 240, true),
  ('color-gloss', 'hair', 'Gloss & Brillo', 'Gloss & Shine',
    'Tratamiento de color demi-permanente para profundidad de tono y un brillo de lámina.',
    'Demi-permanent gloss for tonal depth and mirror shine.',
    60, 85, false),
  ('blowout', 'hair', 'Brushing Couture', 'Couture Blowout',
    'Lavado ritual, secado y modelado a la medida del momento.',
    'Ritual wash, dry and shape, tailored to the occasion.',
    45, 55, false),
  ('updo', 'hair', 'Recogido Editorial', 'Editorial Updo',
    'Recogido escultórico para eventos, citas o photoshoots.',
    'Sculptural updo for events, dates and photoshoots.',
    60, 110, false),
  ('mani-classique', 'nails', 'Manicura Classique', 'Classique Manicure',
    'Limado, cutícula, masaje de mano y esmaltado clásico de larga duración.',
    'Shape, cuticle care, hand massage and long-wear lacquer.',
    45, 45, false),
  ('mani-gel', 'nails', 'Manicura Gel-X', 'Gel-X Manicure',
    'Extensiones de gel ultraligeras, esculpidas y selladas. Hasta 3 semanas.',
    'Featherweight gel extensions, sculpted and sealed. Up to 3 weeks.',
    90, 85, true),
  ('mani-acrylic', 'nails', 'Manicura Acrílica', 'Acrylic Manicure',
    'Esculpido en acrílico para máxima resistencia y forma personalizada — almendra, oval o stiletto.',
    'Acrylic sculpting for maximum strength and custom shape — almond, oval or stiletto.',
    105, 95, false),
  ('mani-builder', 'nails', 'Builder Gel', 'Builder Gel',
    'Refuerzo natural sobre tu uña con gel de construcción. Aspecto natural y duradero.',
    'Natural reinforcement over your nail with builder gel. Natural look, long-lasting.',
    75, 75, false),
  ('pedi-spa', 'nails', 'Pedicura Spa', 'Spa Pedicure',
    'Inmersión, exfoliación, mascarilla, masaje de pierna y esmaltado.',
    'Soak, exfoliation, mask, leg massage and lacquer.',
    60, 70, false),
  ('pedi-luxe', 'nails', 'Pedicura Luxe', 'Luxe Pedicure',
    'Ritual extendido — baño de leche, exfoliante de azúcar moreno, mascarilla parafina, masaje 30 min.',
    'Extended ritual — milk soak, brown sugar scrub, paraffin mask, 30-min massage.',
    90, 110, false),
  ('nail-art', 'nails', 'Nail Art a Medida', 'Custom Nail Art',
    'Diseños personalizados — chrome, jelly, pedrería o pintado a mano.',
    'Custom designs — chrome, jelly, gems or hand-painted detail.',
    30, 35, false),
  ('nail-3d', 'nails', 'Esculpido 3D', '3D Sculpting',
    'Detalles esculpidos en relieve — flores, perlas, texturas. Edición de autora.',
    'Raised sculpted details — flowers, pearls, textures. Editor signature.',
    60, 65, false),
  ('mani-japanese', 'nails', 'Manicura Japonesa', 'Japanese Manicure',
    'Tratamiento natural para fortalecer y dar brillo sin esmalte. Para uñas que respiran.',
    'Natural strengthening and shine treatment without polish. Nails that breathe.',
    50, 55, false),
  ('facial-signature', 'facial', 'Facial Signature', 'Signature Facial',
    'Limpieza profunda, exfoliación enzimática, masaje y mascarilla a medida según diagnóstico.',
    'Deep cleanse, enzyme peel, massage and bespoke mask after diagnosis.',
    75, 145, true),
  ('facial-gold', 'facial', 'Ritual de Oro 24K', '24K Gold Ritual',
    'Mascarilla de oro coloidal, gua sha facial y masaje kobido para iluminar y reafirmar.',
    'Colloidal gold mask, gua sha and kobido massage to brighten and lift.',
    90, 220, false),
  ('facial-acne', 'facial', 'Tratamiento Clínico', 'Clinical Treatment',
    'Protocolo intensivo para acné, manchas o sensibilidad — guiado por dermo-asesora.',
    'Intensive protocol for acne, dark spots or sensitivity — guided by dermo-advisor.',
    60, 165, false),
  ('facial-eyes', 'facial', 'Mirada Couture', 'Couture Eye',
    'Tratamiento de contorno, descongestión linfática y patches de colágeno.',
    'Contour treatment, lymphatic drainage and collagen patches.',
    30, 75, false)
on conflict (id) do nothing;

-- =========================================================================
-- ARTISANS
-- =========================================================================

insert into artisans (id, name, role_es, role_en, cats, specialty_es, specialty_en, years, bio_es, bio_en, rating, reviews, photo, avatar, signature_es, signature_en) values
  ('isabela', 'Isabela Reyes', 'Directora de Color', 'Color Director',
    array['hair'], 'Balayage editorial · Color clínico', 'Editorial balayage · Clinical color',
    12,
    'Formada en París y Milán. Su firma: rubios luminosos sin contraste duro y reparaciones de color complejas.',
    'Trained in Paris and Milan. Her signature: luminous blondes without harsh contrast, and complex color corrections.',
    4.97, 412, 'artisan-isabela', '#1a1a1a', null, null),
  ('ana', 'Ana de la Vega', 'Maestra Estilista', 'Master Stylist',
    array['hair'], 'Cortes con movimiento · Texturas curly', 'Movement cuts · Curly textures',
    9,
    'Especialista en cortes que crecen bonito. Curly Method certificada.',
    'Specialist in cuts that grow out beautifully. Curly Method certified.',
    4.95, 308, 'artisan-ana', '#2a1a14', null, null),
  ('olivia', 'Olivia Marchetti', 'Artista de Uñas · Lead', 'Lead Nail Artist',
    array['nails'], 'Gel-X esculpido · Nail art editorial', 'Sculpted Gel-X · Editorial nail art',
    7,
    'Sus uñas viven en Vogue y en bodas íntimas. Detalle obsesivo, manos ágiles.',
    'Her nails live in Vogue and at intimate weddings. Obsessive detail, agile hands.',
    5.0, 521, 'artisan-olivia', '#1a1015',
    'Almond Gel-X con cromados', 'Almond Gel-X with chrome'),
  ('celeste', 'Celeste Aguilar', 'Artista de Uñas', 'Nail Artist',
    array['nails'], 'Pedicuras spa · Acabados cromados', 'Spa pedicures · Chrome finishes',
    6,
    'Pedicuras que se convierten en ritual. Especialista en cromados copper y oro.',
    'Pedicures that become ritual. Specialist in copper and gold chromes.',
    4.93, 198, 'artisan-celeste', '#1a1612',
    'Cromado copper sobre nude', 'Copper chrome on nude'),
  ('valentina', 'Valentina Ríos', 'Artista de Nail Art', 'Nail Art Specialist',
    array['nails'], 'Esculpido 3D · Pintado a mano', '3D sculpting · Hand-painted',
    5,
    'Pinta sobre uñas como otras pintan sobre lienzo. Cada set es una pieza única.',
    'She paints on nails like others paint on canvas. Every set, a unique piece.',
    4.96, 267, 'artisan-valentina', '#231614',
    'Florales 3D · Pedrería', '3D florals · Gems'),
  ('marta', 'Marta Fonseca', 'Esteticista Médica', 'Medical Aesthetician',
    array['facial'], 'Tratamientos clínicos · Anti-edad', 'Clinical treatments · Anti-aging',
    14,
    'Fundadora de la cabina clínica de DSR. Formación dermatológica.',
    'Founder of DSR''s clinical cabin. Dermatology training.',
    4.98, 287, 'artisan-marta', '#1a1a14', null, null),
  ('leonor', 'Leonor Vidal', 'Esteticista Holística', 'Holistic Aesthetician',
    array['facial'], 'Kobido · Gua Sha · Lifting natural', 'Kobido · Gua Sha · Natural lifting',
    8,
    'Manos de seda. Sus rituales son meditación más allá del facial.',
    'Silk hands. Her rituals are meditation beyond a facial.',
    4.99, 366, 'artisan-leonor', '#1a1612', null, null)
on conflict (id) do nothing;

-- =========================================================================
-- PRODUCTS
-- =========================================================================

insert into products (id, name_es, name_en, line, cat_es, cat_en, size, price, desc_es, desc_en, notes_es, notes_en, photo, photos, video, badge_es, badge_en, rating, reviews) values
  ('serum-noir', 'Sérum Noir', 'Sérum Noir', 'DSR Maison',
    'Sérum facial', 'Face serum', '30 ml', 165,
    'Sérum de alta concentración con ácido ferúlico, niacinamida 5% y un complejo de péptidos negros. Restaura, ilumina y reduce los signos visibles de la fatiga. La firma de la casa.',
    'High-concentration serum with ferulic acid, 5% niacinamide and a black peptide complex. Restores, brightens and reduces visible signs of fatigue. The house signature.',
    array['Aplicar 3-4 gotas en piel limpia', 'Mañana y noche', 'Apto para todo tipo de piel'],
    array['Apply 3-4 drops on clean skin', 'Morning and night', 'All skin types'],
    'product-serum',
    array['product-serum', 'story-morning', 'product-mask'],
    'https://videos.pexels.com/video-files/4612075/4612075-hd_1080_1920_25fps.mp4',
    'Más vendido', 'Bestseller', 4.9, 482),
  ('hair-oil', 'Aceite Capilar Or', 'Or Hair Elixir', 'DSR Maison',
    'Aceite capilar', 'Hair oil', '50 ml', 78,
    'Elixir de seis aceites preciosos — argán, marula, camelia, jojoba, monoï y baobab. Repara puntas, controla el frizz y deja un aroma cálido a vainilla y ámbar.',
    'Six precious oils elixir — argan, marula, camellia, jojoba, monoï and baobab. Repairs ends, controls frizz and leaves a warm vanilla-amber scent.',
    array['1-2 gotas en medios y puntas', 'Sobre pelo húmedo o seco', 'Sin parabenos ni sulfatos'],
    array['1-2 drops mid-length to ends', 'On wet or dry hair', 'No parabens or sulfates'],
    'product-hair-oil',
    array['product-hair-oil', 'service-hair'],
    null, null, null, 4.8, 234),
  ('nail-set', 'Set Vernis Trio', 'Vernis Trio Set', 'DSR Maison',
    'Trío de esmaltes', 'Lacquer trio', '3 × 12 ml', 64,
    'Tres esmaltes firma de la casa: Nude Cachemire, Rouge Maison y Noir Velours. Fórmula 12-free, brillo gel sin lámpara.',
    'Three house lacquers: Cachemire Nude, Maison Red, Velvet Noir. 12-free formula, gel-like shine without lamp.',
    array['Larga duración hasta 10 días', 'Vegano y cruelty-free'],
    array['Long-wear up to 10 days', 'Vegan and cruelty-free'],
    'product-nail-color',
    array['product-nail-color', 'nail-look-2'],
    null, 'Edición limitada', 'Limited edition', 4.85, 142),
  ('cuticle-oil', 'Élixir de Cutícula', 'Cuticle Élixir', 'DSR Maison',
    'Cuidado de uñas', 'Nail care', '10 ml', 38,
    'Aceite nutritivo de jojoba, vitamina E y aceite de almendras dulces. Para uñas y cutículas más fuertes y luminosas. Pluma roller-ball.',
    'Nourishing oil of jojoba, vitamin E and sweet almond. For stronger, brighter nails and cuticles. Roller-ball pen.',
    array['Usar 1-2 veces al día', 'Masajear la cutícula', 'Aroma sutil a neroli'],
    array['Use 1-2 times daily', 'Massage into cuticle', 'Subtle neroli scent'],
    'product-cuticle',
    array['product-cuticle', 'service-nails'],
    null, null, null, 4.91, 312),
  ('nail-treatment', 'Base Fortifiante', 'Strengthening Base', 'DSR Maison',
    'Cuidado de uñas', 'Nail care', '12 ml', 42,
    'Base reparadora con queratina vegetal y biotina. Para uñas que se quiebran o se descaman. Resultado en 14 días.',
    'Repair base with plant keratin and biotin. For brittle or peeling nails. Results in 14 days.',
    array['Aplicar dos capas', 'Repetir cada tres días', 'Apto bajo esmalte'],
    array['Apply two coats', 'Reapply every three days', 'Layer under polish'],
    'product-treatment',
    array['product-treatment'],
    null, null, null, 4.88, 178),
  ('gua-sha', 'Gua Sha Obsidiana', 'Obsidian Gua Sha', 'DSR Tools',
    'Herramienta facial', 'Facial tool', '1 pieza', 95,
    'Gua sha tallado en obsidiana negra. Frío natural, lifting muscular y drenaje linfático. Incluye estuche de seda.',
    'Black obsidian carved gua sha. Natural cool, muscle lift and lymphatic drainage. Includes silk pouch.',
    array['Usar con sérum o aceite', 'Esterilizar tras cada uso', 'Piedra única, vetas naturales'],
    array['Use with serum or oil', 'Sterilize after each use', 'Unique stone, natural veining'],
    'product-gua-sha',
    array['product-gua-sha'],
    null, null, null, 4.92, 89),
  ('mask-gold', 'Mascarilla Or 24K', '24K Gold Mask', 'DSR Maison',
    'Mascarilla facial', 'Face mask', '50 ml', 130,
    'La mascarilla del Ritual de Oro, ahora para casa. Oro coloidal, ácido hialurónico y centella asiática.',
    'The Gold Ritual mask, now for home. Colloidal gold, hyaluronic acid and centella.',
    array['Una vez por semana', 'Dejar actuar 15-20 min', 'No requiere aclarado'],
    array['Once a week', 'Leave on 15-20 min', 'No rinse needed'],
    'product-mask',
    array['product-mask'],
    null, null, null, 4.87, 156),
  ('candle', 'Bougie Cuir Blanc', 'Bougie Cuir Blanc', 'DSR Maison',
    'Vela de hogar', 'Home candle', '220 g', 72,
    'La esencia del salón en tu casa. Cuero blanco, papel de iris, ámbar suave. Cera vegetal, mecha de algodón.',
    'The essence of the salon at home. White leather, iris paper, soft amber. Vegetable wax, cotton wick.',
    array['Quema ~50 horas', 'Vaso reutilizable', 'Hecha en Provence'],
    array['~50 hour burn', 'Reusable vessel', 'Made in Provence'],
    'product-candle',
    array['product-candle'],
    null, null, null, 4.95, 73)
on conflict (id) do nothing;

-- =========================================================================
-- COMBOS
-- =========================================================================

insert into combos (id, name_es, name_en, service_ids, discount_pct, description_es, description_en, popular) values
  ('combo-balayage-cut', 'Édition Couture', 'Couture Edition',
    array['color-balayage', 'cut-signature'], 15,
    'Balayage de Autor con corte signature finalizado con brushing. La firma de la casa.',
    'Couture balayage with signature cut finished with a blowout. The house signature.',
    true),
  ('combo-mani-pedi', 'Ritual de Manos & Pies', 'Hands & Feet Ritual',
    array['mani-gel', 'pedi-spa'], 12,
    'Manicura Gel-X y pedicura spa, mismo día.',
    'Gel-X manicure and spa pedicure, same day.',
    false),
  ('combo-or', 'Ritual de Or', 'Or Ritual',
    array['facial-gold', 'mani-classique'], 10,
    'Facial Or 24K acompañado de manicura clásica.',
    '24K Gold facial paired with a classic manicure.',
    true)
on conflict (id) do nothing;

-- =========================================================================
-- NAIL LOOKS
-- =========================================================================

insert into nail_looks (id, img, name_es, name_en, technique_es, technique_en, shade, artisan_id, season_es, season_en, service_id, popular) values
  ('nl-1', 'nail-look-1', 'Or Liquide', 'Or Liquide',
    'Gel-X almond · Cromado oro', 'Gel-X almond · Gold chrome',
    'Nude cachemire + oro líquido', 'olivia', 'Primavera', 'Spring', 'mani-gel', true),
  ('nl-2', 'nail-look-2', 'Vino Velours', 'Velvet Wine',
    'Oval · Brillo gel', 'Oval · Gel shine',
    'Burdeos profundo', 'olivia', 'Otoño', 'Fall', 'mani-gel', false),
  ('nl-3', 'nail-look-3', 'Terracotta Florale', 'Terracotta Florale',
    'Esculpido 3D · Pan de oro', '3D sculpt · Gold leaf',
    'Terracotta + crema', 'valentina', 'Verano', 'Summer', 'nail-3d', true),
  ('nl-4', 'nail-look-4', 'French Cacao', 'Cacao French',
    'French line minimal', 'Minimal french',
    'Nude natural + chocolate', 'olivia', 'Todo el año', 'All year', 'nail-art', false),
  ('nl-5', 'nail-look-5', 'Cuivre Métal', 'Copper Métal',
    'Cromado copper', 'Copper chrome',
    'Cobre metálico', 'celeste', 'Invierno', 'Winter', 'nail-art', false),
  ('nl-6', 'nail-look-6', 'Or Tapisserie', 'Tapestry Gold',
    'Foil de oro detallado', 'Detailed gold foil',
    'Nude + foil de oro', 'valentina', 'Primavera', 'Spring', 'nail-3d', false)
on conflict (id) do nothing;

-- =========================================================================
-- TIERS + PERKS + RULES
-- =========================================================================

insert into tiers (id, name_es, name_en, min_points, max_points, color) values
  ('pearl', 'Perla', 'Pearl',     0,    1500,    '#ECE5D7'),
  ('gold',  'Oro',   'Gold',      1500, 5000,    '#C9A96E'),
  ('noir',  'Noir',  'Noir',      5000, 999999,  '#0A0A0A')
on conflict (id) do nothing;

insert into tier_perks (tier_id, position, perk_es, perk_en) values
  ('pearl', 1, '10% de descuento en tu cumpleaños', '10% off on your birthday'),
  ('pearl', 2, 'Consulta capilar trimestral gratis', 'Free quarterly hair consultation'),
  ('pearl', 3, 'Bienvenida con bebida de cortesía', 'Complimentary welcome drink'),
  ('gold', 1, 'Todo lo de Perla, más:', 'All Pearl, plus:'),
  ('gold', 2, 'Reserva con 14 días de antelación exclusiva', 'Exclusive 14-day advance booking'),
  ('gold', 3, 'Servicio gratis al alcanzar el nivel', 'Free service when you reach this tier'),
  ('gold', 4, 'Atelier privados invitación', 'Invitation to private ateliers'),
  ('noir', 1, 'Todo lo de Oro, más:', 'All Gold, plus:'),
  ('noir', 2, 'Concierge personal 24/7', 'Personal concierge 24/7'),
  ('noir', 3, 'Acceso anticipado a colecciones', 'Early access to collections'),
  ('noir', 4, 'Anfitriona de eventos privados', 'Private events hostess'),
  ('noir', 5, 'Servicio a domicilio incluido', 'In-home service included')
on conflict (tier_id, position) do nothing;

insert into tier_rules (tier_id, threshold_points, multiplier_hair, multiplier_nails, multiplier_facial) values
  ('pearl', 0,    1.00, 1.00, 1.00),
  ('gold',  1500, 1.25, 1.50, 1.25),
  ('noir',  5000, 1.50, 2.00, 1.50)
on conflict (tier_id) do nothing;

-- =========================================================================
-- GIFT CARD DESIGNS
-- =========================================================================

insert into gift_card_designs (id, name_es, name_en, bg, fg, accent, vibe_es, vibe_en) values
  ('noir', 'Noir Couture', 'Noir Couture',
    'linear-gradient(135deg, #0A0908 0%, #1c1814 100%)', '#D4B886', '#D4B886',
    'Atemporal · cualquier ocasión', 'Timeless · any occasion'),
  ('or', 'Or Cachemire', 'Or Cachemire',
    'linear-gradient(135deg, #C9A96E 0%, #8E7141 100%)', '#1a1410', '#1a1410',
    'Cumpleaños · gracias', 'Birthday · thank you'),
  ('creme', 'Crème Marbré', 'Marble Cream',
    'linear-gradient(135deg, #F5F1EA 0%, #E5DCC8 100%)', '#3a2f24', '#8E7141',
    'Madre · amistad', 'Mother · friendship'),
  ('rose', 'Rose Maison', 'Rose Maison',
    'linear-gradient(135deg, #C7836B 0%, #8B4A35 100%)', '#fff', '#fff',
    'Aniversario · romance', 'Anniversary · romance'),
  ('verde', 'Vert Olive', 'Olive Vert',
    'linear-gradient(135deg, #5C6B4A 0%, #364027 100%)', '#F5F1EA', '#D4B886',
    'Para él · neutro', 'For him · neutral'),
  ('fete', 'Fête Dorée', 'Golden Fête',
    'linear-gradient(135deg, #1a1410 0%, #5C3A1F 50%, #D4B886 100%)', '#F5F1EA', '#D4B886',
    'Navidad · fin de año', 'Holidays · year-end')
on conflict (id) do nothing;

-- =========================================================================
-- SERVICE VARIANTS
-- =========================================================================

insert into service_variants (service_id, premium_label_es, premium_label_en, premium_addon_product_ids, custom_compatible_product_ids) values
  ('mani-gel',
    'Con élixir de cutícula al cierre', 'With cuticle élixir finish',
    array['cuticle-oil'],
    array['cuticle-oil', 'nail-set', 'nail-treatment']),
  ('mani-acrylic',
    'Con base fortificante y cutícula', 'With strengthening base and cuticle care',
    array['cuticle-oil', 'nail-treatment'],
    array['cuticle-oil', 'nail-set', 'nail-treatment']),
  ('mani-classique',
    'Con élixir de cutícula al cierre', 'With cuticle élixir finish',
    array['cuticle-oil'],
    array['cuticle-oil', 'nail-set', 'nail-treatment']),
  ('color-balayage',
    'Con elixir capilar Or al final', 'With Or hair elixir finish',
    array['hair-oil'],
    array['hair-oil']),
  ('cut-signature',
    'Con elixir capilar Or', 'With Or hair elixir',
    array['hair-oil'],
    array['hair-oil']),
  ('facial-signature',
    'Con mascarilla Or 24K', 'With 24K Gold mask',
    array['mask-gold'],
    array['serum-noir', 'mask-gold', 'gua-sha']),
  ('facial-gold',
    'Con sérum Noir y mascarilla Or', 'With Sérum Noir and Or mask',
    array['serum-noir', 'mask-gold'],
    array['serum-noir', 'mask-gold', 'gua-sha'])
on conflict (service_id) do nothing;

-- =========================================================================
-- PRODUCT STOCKS (default 12 / lowAt 3 para todos)
-- =========================================================================

insert into product_stocks (product_id, stock, low_stock_at)
select id, 12, 3 from products
on conflict (product_id) do nothing;

-- =========================================================================
-- PROMOS
-- =========================================================================

insert into promos (id, code, type, value, description_es, description_en, valid_until, max_uses, used_count, active) values
  ('promo-newcomer', 'BIENVENIDA', 'pct', 15,
    'Primer servicio para nuevas clientas.', 'First service for new clients.',
    null, 100, 23, true),
  ('promo-spring', 'PRINTEMPS26', 'pct', 10,
    'Édition Printemps · cualquier servicio.', 'Spring Edition · any service.',
    '2026-06-30', 500, 87, true),
  ('promo-friend', 'AMIGA50', 'fixed', 50,
    '−€50 al traer una amiga nueva.', '−€50 when you bring a new friend.',
    null, 50, 8, true)
on conflict (id) do nothing;

-- =========================================================================
-- ARTISAN SCHEDULES (mon-sat 10:00-20:00 para todos)
-- =========================================================================

insert into artisan_schedules (artisan_id, working_days, start_time, end_time)
select
  id,
  '{"mon": true, "tue": true, "wed": true, "thu": true, "fri": true, "sat": true, "sun": false}'::jsonb,
  '10:00'::time,
  '20:00'::time
from artisans
on conflict (artisan_id) do nothing;

-- =========================================================================
-- REVIEWS
-- =========================================================================

insert into reviews (id, customer_name, artisan_id, service_id, rating, comment, date, response, response_date) values
  ('rv-1', 'Camila Vargas', 'isabela', 'color-balayage', 5,
    'Isabela transformó mi pelo. El balayage quedó increíble, exactamente como lo soñaba. Volveré sin duda.',
    '2026-04-18',
    'Camila, mil gracias. Disfrutamos cada minuto. Te esperamos en tu próxima visita.',
    '2026-04-19'),
  ('rv-2', 'Lucía García', 'olivia', 'mani-gel', 5,
    'Las uñas más bonitas que me he hecho. El cromado quedó perfecto. Olivia es una artista.',
    '2026-04-22', null, null),
  ('rv-3', 'María Vargas', 'leonor', 'facial-gold', 4,
    'Excelente facial, muy relajante. Solo extrañé un poco más de tiempo en el masaje kobido. Pero la piel quedó radiante.',
    '2026-04-10',
    'Gracias María. Tomamos nota — la próxima ampliamos el masaje. Un abrazo.',
    '2026-04-11'),
  ('rv-4', 'Antonia Ruiz', 'celeste', 'pedi-luxe', 5,
    'La pedicura luxe es un ritual. Salí flotando. Celeste tiene unas manos prodigiosas.',
    '2026-03-28', null, null),
  ('rv-5', 'Sofía Méndez', 'ana', 'cut-signature', 3,
    'El corte está bien pero esperaba algo más. Quizá fue mi descripción. Volveré para corregirlo.',
    '2026-04-05', null, null)
on conflict (id) do nothing;

-- =========================================================================
-- SALON SETTINGS (single row)
-- =========================================================================

insert into salon_settings (id, name, tagline_es, tagline_en, address, city, phone, email, instagram, whatsapp, hours_open, hours_close, currency, timezone) values
  (1, 'DSR Maison de Beauté',
    'Su belleza, nuestro arte', 'Your beauty, our craft',
    'Calle de Serrano 84', 'Madrid',
    '+34 91 555 0184', 'hola@dsr-maison.com',
    '@dsr.maison', '+34 600 123 456',
    '10:00', '20:00',
    'EUR', 'Europe/Madrid')
on conflict (id) do nothing;
