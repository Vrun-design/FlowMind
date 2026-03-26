import React from 'react';
import { ArrowUpRight, Construction, Github, GitPullRequest, Star, Users } from 'lucide-react';
import { GITHUB_REPO_URL, LANDING_CONTRIBUTORS } from './constants';
import { useGithubStars } from './useGithubStars';

export function Testimonials(): React.ReactElement {
  const stars = useGithubStars();
  return (
    <section className="py-32 bg-[#08090A] border-t border-white/5 relative overflow-hidden select-none">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,transparent_70%)] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 mb-6 font-mono text-[10px] uppercase tracking-widest font-bold">
              <Construction className="w-3 h-3" />
              <span>Under Construction</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-4 leading-[0.9]">
              Build in public. <br />
              <span className="font-serif italic font-normal text-white/50">Shape the engine.</span>
            </h2>
            <p className="text-xl text-white/50 leading-relaxed max-w-lg font-medium">
              OpenFlowKit is just getting started. We are building the core engine in the open. Join
              us on Day 1.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-colors"
              rel="noreferrer"
            >
              <Github className="w-4 h-4" />
              Star the Repo
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GitHub Card */}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            className="group relative bg-[#111] rounded-2xl p-8 border border-white/5 hover:border-white/20 transition-all duration-300 overflow-hidden flex flex-col justify-between h-[340px]"
            rel="noreferrer"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[60px] -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-20"></div>

            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                <Github className="w-6 h-6 text-white" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Open Source</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                The core engine is MIT licensed. Read the source, submit PRs, or fork it for your
                internal tools.
              </p>
              <div className="flex items-center gap-3 text-xs font-mono text-white/40">
                <span className="flex items-center gap-1">
                  <GitPullRequest className="w-3 h-3" /> PRs Welcome
                </span>
                {stars !== null && (
                  <>
                    <span className="text-white/20">•</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                      {stars.toLocaleString()} Stars
                    </span>
                  </>
                )}
              </div>
            </div>
          </a>

          {/* Contributors Card */}
          <div className="group relative bg-[#111] rounded-2xl p-8 border border-white/5 hover:border-white/20 transition-all duration-300 overflow-hidden flex flex-col justify-between h-[340px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 rounded-full blur-[60px] -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-20"></div>

            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20 group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-brand-blue" />
              </div>
              <span className="text-[10px] font-mono text-white/30 border border-white/10 px-2 py-1 rounded bg-white/5">
                Contributors
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Community</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Join developers building on OpenFlowKit.
              </p>

              <div className="flex items-center -space-x-3">
                {LANDING_CONTRIBUTORS.map((c) => (
                  <a
                    key={c.login}
                    href={`https://github.com/${c.login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={c.name}
                    className="w-10 h-10 rounded-full border-2 border-[#111] overflow-hidden relative z-0 hover:z-10 transition-transform hover:scale-110 block"
                  >
                    <img
                      src={`https://github.com/${c.login}.png?size=80`}
                      alt={c.name}
                      className="w-full h-full object-cover bg-white/5"
                    />
                  </a>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-[#111] bg-[#222] flex items-center justify-center text-[10px] text-white font-medium z-0">
                  +You
                </div>
              </div>
            </div>
          </div>

          {/* Developer Review Card */}
          <div className="group relative bg-[#111] rounded-2xl p-8 border border-white/5 hover:border-white/20 transition-all duration-300 overflow-hidden flex flex-col justify-between h-[340px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[60px] -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-20"></div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-4 h-4 text-amber-500 fill-amber-500"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[10px] font-mono text-white/30 border border-white/10 px-2 py-1 rounded bg-white/5">
                Feedback
              </span>
            </div>

            <div className="mt-4">
              <p className="text-white/90 text-sm leading-relaxed mb-6 italic">
                &ldquo;The clean interface looks great and dragging and dropping nodes offers a very
                pleasant experience. The attention to detail in the design really makes a
                difference. And the best part is that it is open-source and completely free. Wow!&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10">
                  EA
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">Early Adopter</h4>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">
                    Senior Engineer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
