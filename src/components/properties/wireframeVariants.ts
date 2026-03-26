export interface WireframeVariantOption {
  id: string;
  label: string;
  description: string;
}

export const BROWSER_VARIANTS: WireframeVariantOption[] = [
  { id: 'landing', label: 'Landing', description: 'Hero-led marketing page' },
  { id: 'dashboard', label: 'Dashboard', description: 'Dense analytics workspace' },
  { id: 'form', label: 'Form', description: 'Focused data entry flow' },
  { id: 'modal', label: 'Modal', description: 'Dialog over existing content' },
  { id: 'cookie', label: 'Cookie', description: 'Consent banner overlay' },
  { id: 'pricing', label: 'Pricing', description: 'Tier comparison layout' },
  { id: 'analytics', label: 'Analytics', description: 'Operational metrics board' },
  { id: 'settings', label: 'Settings', description: 'Preferences and controls' },
  { id: 'docs', label: 'Docs', description: 'Documentation reader shell' },
  { id: 'checkout', label: 'Checkout', description: 'Order confirmation funnel' },
  { id: 'kanban', label: 'Kanban', description: 'Board-style planning view' },
];

export const MOBILE_VARIANTS: WireframeVariantOption[] = [
  { id: 'login', label: 'Login', description: 'Authentication entry screen' },
  { id: 'social', label: 'Social', description: 'Feed with media cards' },
  { id: 'chat', label: 'Chat', description: 'Conversation thread UI' },
  { id: 'product', label: 'Product', description: 'Commerce detail screen' },
  { id: 'list', label: 'List', description: 'Scrollable content list' },
  { id: 'profile', label: 'Profile', description: 'Identity and activity summary' },
  { id: 'wallet', label: 'Wallet', description: 'Balance and transaction view' },
  { id: 'calendar', label: 'Calendar', description: 'Schedule overview' },
  { id: 'maps', label: 'Maps', description: 'Location and route screen' },
  { id: 'music', label: 'Music', description: 'Player and queue screen' },
  { id: 'fitness', label: 'Fitness', description: 'Progress and activity view' },
];

export function getWireframeVariants(type: string | undefined): WireframeVariantOption[] {
  if (type === 'browser') {
    return BROWSER_VARIANTS;
  }

  return MOBILE_VARIANTS;
}
