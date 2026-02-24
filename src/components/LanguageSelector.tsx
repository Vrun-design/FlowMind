import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useFlowStore } from '../store';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: "https://purecatamphetamine.github.io/country-flag-icons/3x2/US.svg" },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: "https://purecatamphetamine.github.io/country-flag-icons/3x2/TR.svg" },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'minimal';
  placement?: 'top' | 'bottom';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'default', placement = 'bottom' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const { setViewSettings } = useFlowStore();

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setViewSettings({ language: languageCode });
    setIsOpen(false);
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  // Compact variant for sidebar
  if (variant === 'compact') {
    return (
      <div className="relative w-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg border border-slate-200 transition-all text-sm font-medium bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
        >
          <div className="flex items-center gap-2">
            <img src={currentLanguage.flag} alt={currentLanguage.name} className="w-6 h-4" />
            <span>{currentLanguage.nativeName}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? (placement === 'top' ? '' : 'rotate-180') : (placement === 'top' ? 'rotate-180' : '')}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className={`absolute left-0 right-0 ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} bg-white/95 backdrop-blur-xl rounded-lg shadow-xl border border-slate-200 ring-1 ring-black/5 p-1 z-50 animate-in fade-in ${placement === 'top' ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'} duration-200`}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    i18n.language === language.code
                      ? 'bg-[var(--brand-primary-50)] text-[var(--brand-primary)]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src={language.flag} alt={language.name} className="w-6 h-4" />
                    <span>{language.nativeName}</span>
                  </div>
                  {i18n.language === language.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Minimal variant - just icon and flag
  if (variant === 'minimal') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all text-sm font-medium bg-transparent text-slate-600 hover:bg-slate-100"
          title="Change Language"
        >
          <img src={currentLanguage.flag} alt={currentLanguage.name} className="w-6 h-4" />
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? (placement === 'top' ? '' : 'rotate-180') : (placement === 'top' ? 'rotate-180' : '')}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className={`absolute right-0 ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} w-40 bg-white/95 backdrop-blur-xl rounded-lg shadow-xl border border-slate-200 ring-1 ring-black/5 p-1 z-50 animate-in fade-in zoom-in-95 duration-200 ${placement === 'top' ? 'origin-bottom-right' : 'origin-top-right'}`}>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    i18n.language === language.code
                      ? 'bg-[var(--brand-primary-50)] text-[var(--brand-primary)]'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img src={language.flag} alt={language.name} className="w-6 h-4" />
                    <span>{language.nativeName}</span>
                  </div>
                  {i18n.language === language.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] border transition-all text-sm font-medium bg-white border-slate-200 text-slate-600 hover:border-slate-300 shadow-sm hover:shadow"
        title="Change Language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? (placement === 'top' ? '' : 'rotate-180') : (placement === 'top' ? 'rotate-180' : '')}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className={`absolute right-0 ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} w-48 bg-white/95 backdrop-blur-xl rounded-[var(--radius-lg)] shadow-2xl border border-white/50 ring-1 ring-black/5 p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-200 ${placement === 'top' ? 'origin-bottom-right' : 'origin-top-right'}`}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  i18n.language === language.code
                    ? 'bg-[var(--brand-primary-50)] text-[var(--brand-primary)]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.nativeName}</span>
                </div>
                {i18n.language === language.code && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
