import React from 'react';
import { Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OpenFlowLogo } from '../icons/OpenFlowLogo';

interface FooterProps {
  onLaunch: () => void;
}

export function Footer({ onLaunch }: FooterProps): React.ReactElement {
  const { t } = useTranslation();
  return (
    <footer className="bg-white border-t border-brand-border py-12 select-none">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">

        <div onClick={onLaunch} className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-6 h-6 bg-brand-primary rounded flex items-center justify-center text-white shadow-sm transition-transform group-hover:rotate-6">
            <OpenFlowLogo className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-brand-primary text-sm tracking-tight">OpenFlowKit</span>
          <span className="text-brand-border mx-2">/</span>
          <span className="text-brand-secondary text-xs font-medium">{t('footer.mitLicensed')}</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://www.producthunt.com/products/openflowkit?embed=true&utm_source=badge-top-post-topic-badge&utm_medium=badge&utm_campaign=badge-openflowkit"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block hover:opacity-90 transition-opacity"
          >
            <img
              alt="Product Hunt"
              width="180"
              height="39"
              src="https://api.producthunt.com/widgets/embed-image/v1/top-post-topic-badge.svg?post_id=1081019&theme=light&period=weekly&topic_id=44&t=1772031326630"
              className="h-8 w-auto"
            />
          </a>
          <a href="https://github.com/Vrun-design/openflowkit" target="_blank" rel="noreferrer" className="text-brand-secondary hover:text-brand-primary transition-colors group" aria-label="GitHub">
            <Github className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </a>
        </div>

      </div>
    </footer>
  );
}