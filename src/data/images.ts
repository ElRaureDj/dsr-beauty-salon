// DSR — AI-generated image bank
// Generated via pollinations.ai flux model with Latin natural-luminous editorial prompts.
// First load is slow (~10-30s per unique image) but subsequent loads are CDN-cached.

const P = (prompt: string, w: number, h: number, seed: number) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(
    prompt +
      ', professional editorial photography, natural lighting, warm golden hour, soft shadows, film grain, shallow depth of field, sophisticated minimal background, vogue beauty editorial style, high end magazine quality, no logo, no text, no watermark, no artifacts',
  )}?width=${w}&height=${h}&nologo=true&seed=${seed}&model=flux`;

export const AI_IMG: Record<string, string> = {
  'hero-spring': P(
    'editorial close-up beauty portrait latin woman with olive skin and dark wavy hair, dewy glossy skin, soft pink lips, golden hour backlight, sophisticated',
    800,
    1200,
    101,
  ),
  'hero-evening': P(
    'dramatic editorial portrait latin woman, deep golden lighting, dark hair flowing, sophisticated, terracotta tones, soft chiaroscuro',
    800,
    1200,
    102,
  ),
  'look-month': P(
    'close-up of latin woman hands with sophisticated almond shaped nails, warm nude terracotta polish glossy finish, holding stem of pampas grass, warm natural light, beige linen background',
    800,
    1000,
    201,
  ),
  'story-balayage': P(
    'behind the scenes hair colorist working on long dark wavy hair, foils, warm salon light, hands at work',
    600,
    800,
    301,
  ),
  'story-chrome': P(
    'flat lay of nail art tools and chrome metallic nail polishes in warm gold and bronze, marble surface',
    600,
    800,
    302,
  ),
  'story-morning': P(
    'hands applying serum on cheek of latin woman with glowing skin, morning light, intimate close up',
    600,
    800,
    303,
  ),
  'story-spf': P(
    'hand of latin woman holding sunscreen bottle near soft draped curtain in golden light',
    600,
    800,
    304,
  ),
  'story-cuts': P(
    'editorial portrait latin woman with elegant blunt bob haircut, looking off camera, warm tones',
    600,
    800,
    305,
  ),
  'service-hair': P(
    'editorial portrait latin woman with sleek long dark hair, soft golden light from side, profile view, sophisticated',
    800,
    1000,
    401,
  ),
  'service-nails': P(
    'close-up of elegant manicured almond nails in warm wine burgundy color on olive skin hand resting on cream silk',
    800,
    1000,
    402,
  ),
  'service-facial': P(
    'latin woman receiving facial massage, peaceful expression, gentle hands, warm spa lighting, dewy skin',
    800,
    1000,
    403,
  ),
  'service-balayage': P(
    'editorial portrait latin woman with sun-kissed balayage on dark hair, golden highlights, natural movement, warm background',
    800,
    1000,
    501,
  ),
  'service-gelx': P(
    'close-up perfect almond shaped gel-x nails in warm nude beige color on olive skin, on warm marble',
    800,
    1000,
    502,
  ),
  'service-kobido': P(
    'gua sha facial massage on olive skinned woman, jade tool, calm spa light',
    800,
    1000,
    503,
  ),
  'artisan-isabela': P(
    'professional portrait of latin woman hair colorist in her 30s with warm smile, salon ambient light, dark hair pulled back, neutral linen apron',
    600,
    800,
    601,
  ),
  'artisan-ana': P(
    'professional portrait latin woman master hairstylist in her 40s curly dark hair confident gaze warm light',
    600,
    800,
    602,
  ),
  'artisan-olivia': P(
    'professional portrait latin woman nail artist in her 20s, long dark hair, holding nail brushes, warm window light',
    600,
    800,
    603,
  ),
  'artisan-marta': P(
    'professional portrait of medical aesthetician latin woman in her 30s, light medical coat, calm composed, soft natural light',
    600,
    800,
    604,
  ),
  'artisan-leonor': P(
    'professional portrait latin woman holistic aesthetician in her 30s, serene expression, natural beauty, golden hour',
    600,
    800,
    605,
  ),
  'artisan-celeste': P(
    'professional portrait latin woman nail artist in her 20s, warm smile, dark wavy hair, beige background',
    600,
    800,
    606,
  ),
  'artisan-valentina': P(
    'professional portrait latin woman nail artist with afro curly dark hair, creative warm style, soft window light',
    600,
    800,
    607,
  ),
  'nail-look-1': P(
    'nail art editorial close-up almond nails in glossy warm nude with thin gold chrome line accent, olive skin hand, warm cream background',
    700,
    900,
    701,
  ),
  'nail-look-2': P(
    'editorial nail art close-up long oval nails in deep wine burgundy with subtle pearl accent, latin hand resting on warm beige silk',
    700,
    900,
    702,
  ),
  'nail-look-3': P(
    'editorial close-up sculpted almond nails in warm terracotta cream gradient, gold leaf accent, on olive skin hand',
    700,
    900,
    703,
  ),
  'nail-look-4': P(
    'editorial nail art close-up minimal french tip with warm chocolate brown line on natural nude base, latin woman hand',
    700,
    900,
    704,
  ),
  'nail-look-5': P(
    'nail art editorial close up short almond nails in glossy chrome metallic copper gold, olive skin hand',
    700,
    900,
    705,
  ),
  'nail-look-6': P(
    'editorial nail art close-up sculpted gel-x nails with intricate gold foil pattern on warm nude base, latin hand',
    700,
    900,
    706,
  ),
  'product-serum': P(
    'product photography luxury amber glass serum bottle with gold cap on warm cream marble, soft natural light, minimal shadow',
    800,
    1000,
    801,
  ),
  'product-hair-oil': P(
    'luxury hair oil glass bottle dropper on warm beige stone, soft window light, sophisticated still life',
    800,
    1000,
    802,
  ),
  'product-nail-color': P(
    'luxury nail polish bottle in warm terracotta nude color on cream linen, soft natural light, minimalist',
    800,
    1000,
    803,
  ),
  'product-gua-sha': P(
    'pink rose quartz gua sha tool on cream silk fabric, soft warm light, minimal sophisticated',
    800,
    1000,
    804,
  ),
  'product-mask': P(
    'luxury cream face mask jar with golden lid on warm marble surface, soft daylight',
    800,
    1000,
    805,
  ),
  'product-candle': P(
    'luxury lit candle in beige ceramic vessel on warm wood, soft golden light, sophisticated still life',
    800,
    1000,
    806,
  ),
  'product-cuticle': P(
    'luxury cuticle oil glass bottle on cream stone, warm soft light, minimalist still life',
    800,
    1000,
    807,
  ),
  'product-treatment': P(
    'luxury nail treatment glass bottle clear with gold typography on cream silk, warm soft light',
    800,
    1000,
    808,
  ),
  'onboarding-1': P(
    'cinematic editorial portrait of latin woman with eyes closed receiving treatment, warm golden light, peaceful serene',
    800,
    1200,
    901,
  ),
  'onboarding-2': P(
    'cinematic still of latin woman hand holding cup near window in warm morning light, blurred soft background',
    800,
    1200,
    902,
  ),
  'onboarding-3': P(
    'cinematic salon interior beautiful warm minimal architecture, natural light through linen curtains, sophisticated',
    800,
    1200,
    903,
  ),
};

export const I = (k: string): string => AI_IMG[k] ?? '';

// Hero/category helpers
export const IMG_HERO_SPRING = () => I('hero-spring');
export const IMG_HERO_EVENING = () => I('hero-evening');
export const IMG_LOOK_OF_MONTH = () => I('look-month');

export const IMG_SERVICE = (cat: 'hair' | 'nails' | 'facial'): string => {
  const map = { hair: I('service-hair'), nails: I('service-nails'), facial: I('service-facial') };
  return map[cat] || I('service-hair');
};

export const IMG_SERVICE_DETAIL = (id: string): string => {
  const map: Record<string, string> = {
    'color-balayage': I('service-balayage'),
    'mani-gel': I('service-gelx'),
    'facial-gold': I('service-kobido'),
  };
  return map[id] || I('service-hair');
};

export const IMG_ONBOARDING = (i: number): string =>
  [I('onboarding-1'), I('onboarding-2'), I('onboarding-3')][i] || I('onboarding-1');
