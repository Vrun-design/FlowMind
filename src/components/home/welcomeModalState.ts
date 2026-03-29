import { readLocalStorageString } from '@/services/storage/uiLocalStorage';

export const WELCOME_SEEN_STORAGE_KEY = 'hasSeenWelcome_v1';
export const WELCOME_MODAL_ENABLED_STORAGE_KEY = 'openflowkit_show_welcome_modal';

export function shouldShowWelcomeModal(): boolean {
    const welcomeEnabled = readLocalStorageString(WELCOME_MODAL_ENABLED_STORAGE_KEY);
    if (welcomeEnabled === 'false') {
        return false;
    }
    return !readLocalStorageString(WELCOME_SEEN_STORAGE_KEY);
}
