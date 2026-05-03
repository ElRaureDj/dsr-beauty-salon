// DSR — i18n strings (ES + EN)

export type Lang = 'es' | 'en';

export interface I18nStrings {
  welcome: string;
  welcomeSub: string;
  skipFor: string;
  continue: string;
  getStarted: string;
  enterMaison: string;
  home: string;
  services: string;
  book: string;
  rewards: string;
  boutique: string;
  profile: string;
  nails: string;
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  forYou: string;
  discover: string;
  upcomingApt: string;
  seeAll: string;
  bookNow: string;
  rebook: string;
  yourArtisans: string;
  artisans: string;
  selectService: string;
  selectArtisan: string;
  selectDateTime: string;
  review: string;
  confirm: string;
  confirmed: string;
  duration: string;
  price: string;
  addService: string;
  notes: string;
  notesPlaceholder: string;
  inviteFriend: string;
  waitlist: string;
  waitlistDesc: string;
  today: string;
  tomorrow: string;
  available: string;
  fullyBooked: string;
  points: string;
  member: string;
  tier: { pearl: string; gold: string; noir: string };
  nextTier: string;
  perks: string;
  addToBag: string;
  bag: string;
  checkout: string;
  payWith: string;
  free: string;
  trySomething: string;
  aiPick: string;
  aiPickDesc: string;
  stories: string;
  yourCard: string;
  visits: string;
  spent: string;
  redeem: string;
  history: string;
  upcoming: string;
  past: string;
  lookOfMonth: string;
  nailAtelier: string;
  nailAtelierSub: string;
  season: string;
  book_this: string;
  artist: string;
  technique: string;
  giftCards: string;
  giftCardsSub: string;
  buyGift: string;
  myGifts: string;
  chooseAmount: string;
  customAmount: string;
  chooseDesign: string;
  recipient: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  message: string;
  sendDate: string;
  sendNow: string;
  schedule: string;
  physicalCard: string;
  physicalCardDesc: string;
  digitalDelivery: string;
  via: string;
  balance: string;
  expires: string;
  apply: string;
  applyToBag: string;
  reload: string;
  received: string;
  sent: string;
  purchased: string;
  used: string;
  preview: string;
  emptyBag: string;
  emptyBagSub: string;
  continueShopping: string;
  removeFromBag: string;
  orderConfirmed: string;
  orderConfirmedSub: string;
  orderNumber: string;
  emailReceipt: string;
  backToBoutique: string;
  resetOnboarding: string;
  cartProducts: string;
  cartServices: string;
  cartEmptyServices: string;
  cartEmptyProducts: string;
  cartViewFull: string;
  saveToBag: string;
  updateInBag: string;
  editBooking: string;
  editingBooking: string;
  chooseAvatar: string;
  chooseAvatarSub: string;
  avatarInitials: string;
  avatarUpload: string;
  avatarUploadSoon: string;
  authWelcome: string;
  authWelcomeSub: string;
  continueWithApple: string;
  continueWithGoogle: string;
  continueWithWhatsApp: string;
  authOr: string;
  authEmailLabel: string;
  authPasswordLabel: string;
  authSubmit: string;
  authNoAccount: string;
  authCreateAccount: string;
  authGuest: string;
  authMockNote: string;
  authSigningIn: string;
  variantStandard: string;
  variantPremium: string;
  variantCustom: string;
  variantStandardDesc: string;
  variantCustomDesc: string;
  variantAddons: string;
  variantPickProducts: string;
  adminTitle: string;
  adminSub: string;
  adminProducts: string;
  adminServices: string;
  adminVariants: string;
  adminPremiumLabel: string;
  adminPremiumLabelEnLabel: string;
  adminCompatibles: string;
  adminEnablePremium: string;
  adminEnableCustom: string;
  adminResetAll: string;
  adminOverrides: string;
  adminOpen: string;
  combosTitle: string;
  combosSub: string;
  combosNew: string;
  combosBasePrice: string;
  combosFinalPrice: string;
  combosDiscount: string;
  combosServices: string;
  combosName: string;
  combosDescription: string;
  combosFeatured: string;
  combosDelete: string;
  combosCustomerTitle: string;
  combosCustomerSub: string;
  combosSavePct: string;
  combosBookCombo: string;
  combosResetSeed: string;
  comboApplied: string;
  promoCodePlaceholder: string;
  promoApply: string;
  promoRemove: string;
  promoApplied: string;
  promoInvalid: string;
  promoExpired: string;
  promoExhausted: string;
  promoInactive: string;
  reviews: string;
  reviewsAvg: string;
  salonResponse: string;
  seeAllReviews: string;
  noReviewsYet: string;
  lowStock: string;
  outOfStock: string;
  outOfStockShort: string;
  adminGateAuthTitle: string;
  adminGateAuthSub: string;
  adminGateForbiddenTitle: string;
  adminGateForbiddenSub: string;
  adminGateSignInCta: string;
  adminGateBackHome: string;
  adminLock: string;
  appointmentTitle: string;
  appointmentReschedule: string;
  appointmentCancel: string;
  appointmentCancelled: string;
  appointmentNotFound: string;
  appointmentPastBadge: string;
  appointmentBackHome: string;
  authSendLink: string;
  authSending: string;
  authMagicLinkTitle: string;
  authMagicLinkSub: string;
  authResend: string;
  authComingSoon: string;
  personalInfoTitle: string;
  personalInfoSub: string;
  personalInfoFullNameLabel: string;
  personalInfoDisplayNameLabel: string;
  personalInfoEmailLabel: string;
  personalInfoEmailHint: string;
  personalInfoSave: string;
  personalInfoSaving: string;
  personalInfoSaved: string;
  personalInfoLoginRequired: string;
  personalInfoLoginCta: string;
  addressesTitle: string;
  addressesSub: string;
  addressesEmpty: string;
  addressesAdd: string;
  addressesNew: string;
  addressesEdit: string;
  addressesDelete: string;
  addressesDefault: string;
  addressesSetDefault: string;
  addressFormLabel: string;
  addressFormLabelHint: string;
  addressFormRecipient: string;
  addressFormLine1: string;
  addressFormLine2: string;
  addressFormCity: string;
  addressFormRegion: string;
  addressFormPostalCode: string;
  addressFormCountry: string;
  addressFormPhone: string;
  addressFormSave: string;
  addressLabelHome: string;
  addressLabelOffice: string;
  addressLabelCustom: string;
  addressFormCustomLabel: string;
  addressFormState: string;
  addressFormZip: string;
  addressFormStatePlaceholder: string;
}

export type I18nKey = keyof I18nStrings;

export const I18N: Record<Lang, I18nStrings> = {
  es: {
    welcome: 'Bienvenida',
    welcomeSub: 'Su belleza, nuestro arte.',
    skipFor: 'Saltar',
    continue: 'Continuar',
    getStarted: 'Comenzar',
    enterMaison: 'Entrar a la Maison',
    home: 'Inicio',
    services: 'Servicios',
    book: 'Reservar',
    rewards: 'Recompensas',
    boutique: 'Boutique',
    profile: 'Perfil',
    nails: 'Uñas',
    goodMorning: 'Buenos días',
    goodAfternoon: 'Buenas tardes',
    goodEvening: 'Buenas noches',
    forYou: 'Para ti',
    discover: 'Descubrir',
    upcomingApt: 'Próxima cita',
    seeAll: 'Ver todo',
    bookNow: 'Reservar',
    rebook: 'Repetir',
    yourArtisans: 'Tus artistas',
    artisans: 'Artistas',
    selectService: 'Selecciona el servicio',
    selectArtisan: 'Selecciona la artista',
    selectDateTime: 'Fecha y hora',
    review: 'Revisar',
    confirm: 'Confirmar',
    confirmed: 'Confirmado',
    duration: 'Duración',
    price: 'Precio',
    addService: 'Añadir servicio',
    notes: 'Notas para la artista',
    notesPlaceholder: 'Alergias, preferencias, inspiración...',
    inviteFriend: 'Invitar amiga',
    waitlist: 'Lista de espera',
    waitlistDesc: 'Te avisamos si se libera algo antes',
    today: 'Hoy',
    tomorrow: 'Mañana',
    available: 'Disponible',
    fullyBooked: 'Completo',
    points: 'puntos',
    member: 'Miembro',
    tier: { pearl: 'Perla', gold: 'Oro', noir: 'Noir' },
    nextTier: 'al siguiente nivel',
    perks: 'Beneficios',
    addToBag: 'Añadir a la bolsa',
    bag: 'Bolsa',
    checkout: 'Pagar',
    payWith: 'Pagar con',
    free: 'Gratis',
    trySomething: 'Probar virtualmente',
    aiPick: 'Recomendado para ti',
    aiPickDesc: 'Basado en tu pelo, piel y citas anteriores',
    stories: 'Cápsulas',
    yourCard: 'Tu tarjeta',
    visits: 'visitas',
    spent: 'gastado',
    redeem: 'Canjear',
    history: 'Historial',
    upcoming: 'Próximas',
    past: 'Pasadas',
    lookOfMonth: 'Look del mes',
    nailAtelier: 'Atelier de Uñas',
    nailAtelierSub: 'Looks editoriales · curados por temporada',
    season: 'Temporada',
    book_this: 'Reservar este look',
    artist: 'Artista',
    technique: 'Técnica',
    giftCards: 'Gift Cards',
    giftCardsSub: 'El regalo más esperado.',
    buyGift: 'Comprar gift card',
    myGifts: 'Mis gift cards',
    chooseAmount: 'Elige el monto',
    customAmount: 'Monto personalizado',
    chooseDesign: 'Elige el diseño',
    recipient: 'Para',
    recipientName: 'Nombre',
    recipientEmail: 'Email o teléfono',
    senderName: 'De parte de',
    message: 'Mensaje',
    sendDate: 'Fecha de envío',
    sendNow: 'Enviar ahora',
    schedule: 'Programar',
    physicalCard: 'Tarjeta física a domicilio',
    physicalCardDesc: 'Sobre de lino y caja firma · 7 días',
    digitalDelivery: 'Entrega digital',
    via: 'Vía',
    balance: 'Saldo',
    expires: 'Vence',
    apply: 'Aplicar',
    applyToBag: 'Aplicar a la bolsa',
    reload: 'Recargar saldo',
    received: 'Recibidas',
    sent: 'Enviadas',
    purchased: 'Compradas',
    used: 'Usadas',
    preview: 'Vista previa',
    emptyBag: 'Tu bolsa espera',
    emptyBagSub: 'Aún no has añadido nada. Descubre la boutique.',
    continueShopping: 'Explorar boutique',
    removeFromBag: 'Quitar de la bolsa',
    orderConfirmed: 'Pedido confirmado',
    orderConfirmedSub: 'Te hemos enviado los detalles a tu correo. Llegará en 2–4 días.',
    orderNumber: 'Pedido',
    emailReceipt: 'Recibo enviado a tu correo',
    backToBoutique: 'Volver a la boutique',
    resetOnboarding: 'Ver bienvenida de nuevo',
    cartProducts: 'Productos',
    cartServices: 'Servicios',
    cartEmptyServices: 'Aún no has guardado un ritual',
    cartEmptyProducts: 'Aún no has añadido productos',
    cartViewFull: 'Ver bolsa completa',
    saveToBag: 'Guardar en bolsa',
    updateInBag: 'Actualizar en bolsa',
    editBooking: 'Editar cita',
    editingBooking: 'Editando cita guardada',
    chooseAvatar: 'Tu avatar',
    chooseAvatarSub: 'Una selección curada por la casa.',
    avatarInitials: 'Iniciales',
    avatarUpload: 'Subir foto',
    avatarUploadSoon: 'Disponible próximamente',
    authWelcome: 'Entra a la Maison',
    authWelcomeSub: 'Tu próxima experiencia te espera.',
    continueWithApple: 'Continuar con Apple',
    continueWithGoogle: 'Continuar con Google',
    continueWithWhatsApp: 'Continuar con WhatsApp',
    authOr: 'o',
    authEmailLabel: 'Correo',
    authPasswordLabel: 'Contraseña',
    authSubmit: 'Entrar',
    authNoAccount: '¿Aún no tienes cuenta?',
    authCreateAccount: 'Crear una',
    authGuest: 'Continuar como invitada',
    authMockNote: 'Demo · sin backend real',
    authSigningIn: 'Entrando...',
    variantStandard: 'Estándar',
    variantPremium: 'Premium',
    variantCustom: 'Personalizado',
    variantStandardDesc: 'El ritual base de la casa.',
    variantCustomDesc: 'Combina los productos que prefieras.',
    variantAddons: 'Incluye',
    variantPickProducts: 'Elige tus productos',
    adminTitle: 'Administración',
    adminSub: 'Gestiona productos, servicios y variantes.',
    adminProducts: 'Productos',
    adminServices: 'Servicios',
    adminVariants: 'Variantes',
    adminPremiumLabel: 'Caption Premium (ES)',
    adminPremiumLabelEnLabel: 'Caption Premium (EN)',
    adminCompatibles: 'Productos compatibles',
    adminEnablePremium: 'Activar Premium',
    adminEnableCustom: 'Activar Personalizado',
    adminResetAll: 'Restaurar todo',
    adminOverrides: 'overrides activos',
    adminOpen: 'Modo administrador',
    combosTitle: 'Combos',
    combosSub: 'Paquetes predefinidos con descuento sobre el precio base.',
    combosNew: 'Nuevo combo',
    combosBasePrice: 'Precio base',
    combosFinalPrice: 'Precio final',
    combosDiscount: 'Descuento',
    combosServices: 'Servicios incluidos',
    combosName: 'Nombre',
    combosDescription: 'Descripción',
    combosFeatured: 'Destacado',
    combosDelete: 'Eliminar combo',
    combosCustomerTitle: 'Paquetes',
    combosCustomerSub: 'Curados por la casa',
    combosSavePct: 'ahorra',
    combosBookCombo: 'Reservar este combo',
    combosResetSeed: 'Restaurar combos iniciales',
    comboApplied: 'Combo aplicado',
    promoCodePlaceholder: 'Código de cupón',
    promoApply: 'Aplicar',
    promoRemove: 'Quitar',
    promoApplied: 'Cupón aplicado',
    promoInvalid: 'Código no válido',
    promoExpired: 'Cupón expirado',
    promoExhausted: 'Cupón agotado',
    promoInactive: 'Cupón inactivo',
    reviews: 'Reseñas',
    reviewsAvg: 'Promedio',
    salonResponse: 'Respuesta del salón',
    seeAllReviews: 'Ver todas',
    noReviewsYet: 'Aún sin reseñas',
    lowStock: 'Quedan {n} unidades',
    outOfStock: 'Agotado',
    outOfStockShort: 'No disponible',
    adminGateAuthTitle: 'Inicia sesión',
    adminGateAuthSub: 'Este panel está reservado al equipo del salón. Inicia sesión para acceder al catálogo, citas y operación.',
    adminGateForbiddenTitle: 'Sin permisos',
    adminGateForbiddenSub: 'Tu cuenta no tiene rol de administrador. Si tu equipo te dio acceso, pide que te activen el rol.',
    adminGateSignInCta: 'Iniciar sesión',
    adminGateBackHome: 'Volver al inicio',
    adminLock: 'Cerrar panel',
    appointmentTitle: 'Tu cita',
    appointmentReschedule: 'Reagendar',
    appointmentCancel: 'Cancelar cita',
    appointmentCancelled: 'Cita cancelada',
    appointmentNotFound: 'Cita no encontrada',
    appointmentPastBadge: 'Pasada',
    appointmentBackHome: 'Volver al inicio',
    authSendLink: 'Enviar enlace de acceso',
    authSending: 'Enviando...',
    authMagicLinkTitle: 'Te enviamos un enlace',
    authMagicLinkSub: 'Revisa tu inbox en {email}. Toca el enlace para entrar.',
    authResend: 'Enviar de nuevo',
    authComingSoon: 'Próximamente',
    personalInfoTitle: 'Información personal',
    personalInfoSub: 'Edita tu nombre y cómo te llamamos en la maison.',
    personalInfoFullNameLabel: 'Nombre completo',
    personalInfoDisplayNameLabel: 'Cómo te llamamos',
    personalInfoEmailLabel: 'Email',
    personalInfoEmailHint: 'Es tu identificador de acceso. Para cambiarlo, contacta al salón.',
    personalInfoSave: 'Guardar cambios',
    personalInfoSaving: 'Guardando…',
    personalInfoSaved: 'Cambios guardados',
    personalInfoLoginRequired: 'Inicia sesión para editar tu perfil.',
    personalInfoLoginCta: 'Iniciar sesión',
    addressesTitle: 'Direcciones de envío',
    addressesSub: 'Para envíos de productos de la boutique.',
    addressesEmpty: 'Aún no tienes direcciones guardadas.',
    addressesAdd: 'Agregar dirección',
    addressesNew: 'Nueva dirección',
    addressesEdit: 'Editar',
    addressesDelete: 'Eliminar',
    addressesDefault: 'Predeterminada',
    addressesSetDefault: 'Marcar como predeterminada',
    addressFormLabel: 'Etiqueta',
    addressFormLabelHint: 'Casa, oficina, etc.',
    addressFormRecipient: 'Destinatario',
    addressFormLine1: 'Calle y número',
    addressFormLine2: 'Piso, departamento (opcional)',
    addressFormCity: 'Ciudad',
    addressFormRegion: 'Provincia / Región',
    addressFormPostalCode: 'Código postal',
    addressFormCountry: 'País',
    addressFormPhone: 'Teléfono',
    addressFormSave: 'Guardar dirección',
    addressLabelHome: 'Casa',
    addressLabelOffice: 'Oficina',
    addressLabelCustom: 'Personalizada',
    addressFormCustomLabel: 'Etiqueta personalizada',
    addressFormState: 'Estado',
    addressFormZip: 'ZIP',
    addressFormStatePlaceholder: 'Selecciona un estado',
  },
  en: {
    welcome: 'Welcome',
    welcomeSub: 'Your beauty, our craft.',
    skipFor: 'Skip',
    continue: 'Continue',
    getStarted: 'Get started',
    enterMaison: 'Enter the Maison',
    home: 'Home',
    services: 'Services',
    book: 'Book',
    rewards: 'Rewards',
    boutique: 'Boutique',
    profile: 'Profile',
    nails: 'Nails',
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    forYou: 'For you',
    discover: 'Discover',
    upcomingApt: 'Upcoming',
    seeAll: 'See all',
    bookNow: 'Book',
    rebook: 'Rebook',
    yourArtisans: 'Your artisans',
    artisans: 'Artisans',
    selectService: 'Select service',
    selectArtisan: 'Select artisan',
    selectDateTime: 'Date & time',
    review: 'Review',
    confirm: 'Confirm',
    confirmed: 'Confirmed',
    duration: 'Duration',
    price: 'Price',
    addService: 'Add service',
    notes: 'Notes for artisan',
    notesPlaceholder: 'Allergies, preferences, inspiration...',
    inviteFriend: 'Invite a friend',
    waitlist: 'Waitlist',
    waitlistDesc: "We'll text if something opens up sooner",
    today: 'Today',
    tomorrow: 'Tomorrow',
    available: 'Available',
    fullyBooked: 'Fully booked',
    points: 'points',
    member: 'Member',
    tier: { pearl: 'Pearl', gold: 'Gold', noir: 'Noir' },
    nextTier: 'to next tier',
    perks: 'Perks',
    addToBag: 'Add to bag',
    bag: 'Bag',
    checkout: 'Checkout',
    payWith: 'Pay with',
    free: 'Free',
    trySomething: 'Try on virtually',
    aiPick: 'Picked for you',
    aiPickDesc: 'Based on your hair, skin, and past visits',
    stories: 'Capsules',
    yourCard: 'Your card',
    visits: 'visits',
    spent: 'spent',
    redeem: 'Redeem',
    history: 'History',
    upcoming: 'Upcoming',
    past: 'Past',
    lookOfMonth: 'Look of the month',
    nailAtelier: 'Nail Atelier',
    nailAtelierSub: 'Editorial looks · curated by season',
    season: 'Season',
    book_this: 'Book this look',
    artist: 'Artist',
    technique: 'Technique',
    giftCards: 'Gift Cards',
    giftCardsSub: 'The most anticipated gift.',
    buyGift: 'Buy a gift card',
    myGifts: 'My gift cards',
    chooseAmount: 'Choose amount',
    customAmount: 'Custom amount',
    chooseDesign: 'Choose design',
    recipient: 'To',
    recipientName: 'Name',
    recipientEmail: 'Email or phone',
    senderName: 'From',
    message: 'Message',
    sendDate: 'Delivery date',
    sendNow: 'Send now',
    schedule: 'Schedule',
    physicalCard: 'Physical card to home',
    physicalCardDesc: 'Linen envelope & signature box · 7 days',
    digitalDelivery: 'Digital delivery',
    via: 'Via',
    balance: 'Balance',
    expires: 'Expires',
    apply: 'Apply',
    applyToBag: 'Apply to bag',
    reload: 'Reload balance',
    received: 'Received',
    sent: 'Sent',
    purchased: 'Purchased',
    used: 'Used',
    preview: 'Preview',
    emptyBag: 'Your bag awaits',
    emptyBagSub: "You haven't added anything yet. Step into the boutique.",
    continueShopping: 'Explore the boutique',
    removeFromBag: 'Remove from bag',
    orderConfirmed: 'Order confirmed',
    orderConfirmedSub: "We've sent the details to your email. Arrives in 2–4 days.",
    orderNumber: 'Order',
    emailReceipt: 'Receipt sent to your email',
    backToBoutique: 'Back to the boutique',
    resetOnboarding: 'Replay welcome',
    cartProducts: 'Products',
    cartServices: 'Services',
    cartEmptyServices: 'No saved ritual yet',
    cartEmptyProducts: 'No products yet',
    cartViewFull: 'View full bag',
    saveToBag: 'Save to bag',
    updateInBag: 'Update in bag',
    editBooking: 'Edit booking',
    editingBooking: 'Editing saved booking',
    chooseAvatar: 'Your avatar',
    chooseAvatarSub: 'A house-curated selection.',
    avatarInitials: 'Initials',
    avatarUpload: 'Upload photo',
    avatarUploadSoon: 'Coming soon',
    authWelcome: 'Enter the Maison',
    authWelcomeSub: 'Your next experience awaits.',
    continueWithApple: 'Continue with Apple',
    continueWithGoogle: 'Continue with Google',
    continueWithWhatsApp: 'Continue with WhatsApp',
    authOr: 'or',
    authEmailLabel: 'Email',
    authPasswordLabel: 'Password',
    authSubmit: 'Sign in',
    authNoAccount: "Don't have an account?",
    authCreateAccount: 'Create one',
    authGuest: 'Continue as guest',
    authMockNote: 'Demo · no real backend',
    authSigningIn: 'Signing in...',
    variantStandard: 'Standard',
    variantPremium: 'Premium',
    variantCustom: 'Custom',
    variantStandardDesc: 'The house signature ritual.',
    variantCustomDesc: 'Combine the products you prefer.',
    variantAddons: 'Includes',
    variantPickProducts: 'Choose your products',
    adminTitle: 'Administration',
    adminSub: 'Manage products, services and variants.',
    adminProducts: 'Products',
    adminServices: 'Services',
    adminVariants: 'Variants',
    adminPremiumLabel: 'Premium caption (ES)',
    adminPremiumLabelEnLabel: 'Premium caption (EN)',
    adminCompatibles: 'Compatible products',
    adminEnablePremium: 'Enable Premium',
    adminEnableCustom: 'Enable Custom',
    adminResetAll: 'Reset all',
    adminOverrides: 'active overrides',
    adminOpen: 'Admin mode',
    combosTitle: 'Bundles',
    combosSub: 'Predefined packages with discount over base price.',
    combosNew: 'New bundle',
    combosBasePrice: 'Base price',
    combosFinalPrice: 'Final price',
    combosDiscount: 'Discount',
    combosServices: 'Included services',
    combosName: 'Name',
    combosDescription: 'Description',
    combosFeatured: 'Featured',
    combosDelete: 'Delete bundle',
    combosCustomerTitle: 'Bundles',
    combosCustomerSub: 'Curated by the house',
    combosSavePct: 'save',
    combosBookCombo: 'Book this bundle',
    combosResetSeed: 'Reset to initial bundles',
    comboApplied: 'Bundle applied',
    promoCodePlaceholder: 'Promo code',
    promoApply: 'Apply',
    promoRemove: 'Remove',
    promoApplied: 'Code applied',
    promoInvalid: 'Invalid code',
    promoExpired: 'Code expired',
    promoExhausted: 'Code redeemed out',
    promoInactive: 'Code inactive',
    reviews: 'Reviews',
    reviewsAvg: 'Average',
    salonResponse: 'Salon response',
    seeAllReviews: 'See all',
    noReviewsYet: 'No reviews yet',
    lowStock: 'Only {n} left',
    outOfStock: 'Out of stock',
    outOfStockShort: 'Unavailable',
    adminGateAuthTitle: 'Sign in',
    adminGateAuthSub: "This panel is for the salon team only. Sign in to manage catalog, appointments and operations.",
    adminGateForbiddenTitle: 'No access',
    adminGateForbiddenSub: 'Your account does not have admin role. If your team gave you access, ask them to enable it.',
    adminGateSignInCta: 'Sign in',
    adminGateBackHome: 'Back to app',
    adminLock: 'Lock panel',
    appointmentTitle: 'Your appointment',
    appointmentReschedule: 'Reschedule',
    appointmentCancel: 'Cancel appointment',
    appointmentCancelled: 'Appointment cancelled',
    appointmentNotFound: 'Appointment not found',
    appointmentPastBadge: 'Past',
    appointmentBackHome: 'Back to home',
    authSendLink: 'Send sign-in link',
    authSending: 'Sending...',
    authMagicLinkTitle: 'We sent you a link',
    authMagicLinkSub: 'Check your inbox at {email}. Tap the link to sign in.',
    authResend: 'Resend',
    authComingSoon: 'Coming soon',
    personalInfoTitle: 'Personal info',
    personalInfoSub: 'Edit your name and how we address you at the maison.',
    personalInfoFullNameLabel: 'Full name',
    personalInfoDisplayNameLabel: 'How we call you',
    personalInfoEmailLabel: 'Email',
    personalInfoEmailHint: "It's your sign-in identifier. To change it, contact the salon.",
    personalInfoSave: 'Save changes',
    personalInfoSaving: 'Saving…',
    personalInfoSaved: 'Changes saved',
    personalInfoLoginRequired: 'Sign in to edit your profile.',
    personalInfoLoginCta: 'Sign in',
    addressesTitle: 'Shipping addresses',
    addressesSub: 'For boutique product deliveries.',
    addressesEmpty: 'No addresses saved yet.',
    addressesAdd: 'Add address',
    addressesNew: 'New address',
    addressesEdit: 'Edit',
    addressesDelete: 'Delete',
    addressesDefault: 'Default',
    addressesSetDefault: 'Set as default',
    addressFormLabel: 'Label',
    addressFormLabelHint: 'Home, office, etc.',
    addressFormRecipient: 'Recipient',
    addressFormLine1: 'Street and number',
    addressFormLine2: 'Floor, apartment (optional)',
    addressFormCity: 'City',
    addressFormRegion: 'State / Region',
    addressFormPostalCode: 'Postal code',
    addressFormCountry: 'Country',
    addressFormPhone: 'Phone',
    addressFormSave: 'Save address',
    addressLabelHome: 'Home',
    addressLabelOffice: 'Office',
    addressLabelCustom: 'Custom',
    addressFormCustomLabel: 'Custom label',
    addressFormState: 'State',
    addressFormZip: 'ZIP',
    addressFormStatePlaceholder: 'Select a state',
  },
};
