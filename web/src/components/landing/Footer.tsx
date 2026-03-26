import React from 'react';
import { Github } from 'lucide-react';
import { OpenFlowLogo } from '../icons/OpenFlowLogo';
import { GITHUB_REPO_URL } from './constants';
import { useGithubStars } from './useGithubStars';

interface FooterProps {
  onLaunch: () => void;
}

export function Footer({ onLaunch }: FooterProps): React.ReactElement {
  const stars = useGithubStars();

  return (
    <footer className="bg-white border-t border-brand-border py-12 select-none">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand & Legal */}
          <div className="flex flex-col items-center md:items-start gap-2 md:w-1/3">
            <button
              type="button"
              onClick={onLaunch}
              className="flex items-center gap-2 cursor-pointer group"
              aria-label="Open OpenFlowKit"
            >
              <div className="w-6 h-6 bg-brand-primary rounded flex items-center justify-center text-white shadow-sm transition-transform group-hover:rotate-6">
                <OpenFlowLogo className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-brand-primary text-sm tracking-tight">
                OpenFlowKit
              </span>
            </button>
            <div className="flex items-center gap-2 text-xs text-brand-secondary font-medium mt-1">
              <span>MIT Licensed</span>
              <span className="w-1 h-1 rounded-full bg-brand-secondary/30" />
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>

          {/* Product Hunt Badge */}
          <div className="flex justify-center md:w-1/3">
            <a
              href="https://www.producthunt.com/products/openflowkit?embed=true&utm_source=badge-top-post-topic-badge&utm_medium=badge&utm_campaign=badge-openflowkit"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-90 transition-opacity transform hover:scale-105 duration-300"
            >
              <img
                alt="Product Hunt"
                width="200"
                height="43"
                src="https://api.producthunt.com/widgets/embed-image/v1/top-post-topic-badge.svg?post_id=1081019&theme=light&period=weekly&topic_id=44&t=1772031326630"
                className="h-10 w-auto shadow-sm rounded border border-gray-100"
              />
            </a>
          </div>

          {/* GitHub Stars */}
          <div className="flex items-center justify-center md:justify-end md:w-1/3">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-5 py-2.5 bg-[#24292e] text-white rounded-xl hover:bg-[#2f363d] transition-colors shadow-sm group"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <div className="flex items-center gap-2 border-l border-white/20 pl-3">
                <span className="text-sm font-semibold">Star us</span>
                {stars !== null && (
                  <span className="text-sm font-mono bg-white/10 px-2 py-0.5 rounded font-bold tracking-tight">
                    {stars.toLocaleString()}
                  </span>
                )}
              </div>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
