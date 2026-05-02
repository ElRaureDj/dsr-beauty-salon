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
  },
};
