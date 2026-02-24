import React, { useState, useEffect } from 'react';
import { Github, Menu, X, ChevronRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { OpenFlowLogo } from '../icons/OpenFlowLogo';
import { LanguageSelector } from '../LanguageSelector';

interface NavbarProps {
  isScrolled: boolean;
  onLaunch: () => void;
}

export function Navbar({ isScrolled, onLaunch }: NavbarProps): React.ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id.replace('#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { name: t('landing.nav.features', 'Features'), href: '#architecture' },
    { name: t('landing.nav.figma', 'Figma'), href: '#figma' },
    { name: t('landing.nav.useCases', 'Use Cases'), href: '#workflows' },
    { name: t('landing.nav.pricing', 'Pricing'), href: '#pricing' },
  ];

  // Dynamic classes for the navbar container (The Pill)
  // When mobile menu is open, we make it solid white and remove border/shadow to blend with the overlay
  const navContainerClasses = isMobileMenuOpen
    ? 'bg-white border-transparent shadow-none ring-0' // Seamless blend
    : isScrolled
      ? 'bg-white/85 backdrop-blur-xl shadow-lg shadow-black/[0.03] border-brand-border/80 ring-1 ring-black/5'
      : 'bg-white/50 backdrop-blur-md border-brand-border/60 shadow-sm shadow-black/[0.02] ring-1 ring-white/50';

  const mobileMenuClasses = isMobileMenuOpen
    ? 'opacity-100 pointer-events-auto translate-y-0'
    : 'opacity-0 pointer-events-none -translate-y-4';

  return (
    <>
      {/* Main Navbar Pill - High Z-index to stay above overlay and content */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex justify-center pt-4 md:pt-6 px-4 transition-all duration-300">
        <nav
          className={`transition-all duration-500 w-full max-w-5xl rounded-full border ${navContainerClasses} py-2.5 px-4 md:px-5 relative flex items-center justify-between`}
        >
          {/* Logo */}
          <div onClick={onLaunch} className="flex items-center gap-2.5 cursor-pointer group select-none min-w-0">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-105 ring-1 ring-white/20 shrink-0">
              <OpenFlowLogo className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-brand-primary font-sans group-hover:opacity-80 transition-opacity whitespace-nowrap">OpenFlowKit</span>
          </div>

          {/* Links - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="text-[13px] font-medium text-brand-secondary hover:text-brand-primary transition-colors relative group tracking-wide"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex">
              <LanguageSelector variant="minimal" />
            </div>

            <div className="hidden md:flex">
              <Button
                variant="secondary"
                size="sm"
                className="h-9 px-4"
                onClick={() => window.open("https://github.com/Vrun-design/FlowMind", "_blank")}
              >
                <Github className="w-4 h-4 mr-2" />
                <span>Github</span>
              </Button>
            </div>

            <div className="hidden md:flex">
              <Button
                size="sm"
                variant="primary"
                className="px-5 text-[13px] h-9 transform hover:-translate-y-0.5 transition-all"
                onClick={onLaunch}
              >
                <span className="mr-1">{t('landing.hero.cta', 'Get Started')}</span>
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-brand-primary hover:bg-black/5 rounded-full transition-colors active:scale-90"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay - z-[55] to sit below navbar but above page content */}
      <div
        className={`fixed inset-0 bg-white z-[55] transition-all duration-500 md:hidden flex flex-col pt-24 px-6 overflow-y-auto ${mobileMenuClasses}`}
      >
        <div className="flex flex-col gap-2">
          {navLinks.map((item, i) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => {
                setIsMobileMenuOpen(false);
                handleNavClick(e, item.href);
              }}
              className="text-3xl font-bold text-brand-primary py-4 border-b border-brand-border/40 flex items-center justify-between group"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {item.name}
              <ChevronRight className="w-6 h-6 opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all text-brand-muted" />
            </a>
          ))}
          <div className="mt-12 space-y-4">
            <Button
              size="lg"
              className="w-full justify-between h-14 text-base shadow-none"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLaunch();
              }}
            >
              <span>{t('landing.hero.cta', 'Get Started')}</span>
              <Sparkles className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full justify-center h-14 text-base bg-gray-50 border-gray-200"
              onClick={() => window.open("https://github.com/Vrun-design/FlowMind", "_blank")}
            >
              <Github className="w-5 h-5 mr-2" />
              {t('landing.nav.viewGithub', 'View on GitHub')}
            </Button>
            <div className="w-full flex justify-center pt-4">
              <LanguageSelector variant="compact" placement="top" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}