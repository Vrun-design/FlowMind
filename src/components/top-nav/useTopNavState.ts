import { useState } from 'react';

interface UseTopNavStateResult {
    isMenuOpen: boolean;
    isSettingsOpen: boolean;
    activeSettingsTab: 'general' | 'shortcuts' | 'ai';
    toggleMenu: () => void;
    closeMenu: () => void;
    openSettings: (tab: 'general' | 'shortcuts' | 'ai') => void;
    closeSettings: () => void;
}

export function useTopNavState(): UseTopNavStateResult {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'shortcuts' | 'ai'>('general');

    function toggleMenu(): void {
        setIsMenuOpen((value) => !value);
    }

    function closeMenu(): void {
        setIsMenuOpen(false);
    }

    function openSettings(tab: 'general' | 'shortcuts' | 'ai'): void {
        setActiveSettingsTab(tab);
        setIsSettingsOpen(true);
        setIsMenuOpen(false);
    }

    function closeSettings(): void {
        setIsSettingsOpen(false);
    }

    return {
        isMenuOpen,
        isSettingsOpen,
        activeSettingsTab,
        toggleMenu,
        closeMenu,
        openSettings,
        closeSettings,
    };
}
