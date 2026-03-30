import { describe, it, expect } from 'vitest';
import { parseGitHubUrl, prioritizeGitHubFiles } from './githubFetcher';

describe('parseGitHubUrl', () => {
  it('parses full GitHub URL', () => {
    const result = parseGitHubUrl('https://github.com/user/repo');
    expect(result).toEqual({ owner: 'user', repo: 'repo', branch: 'main' });
  });

  it('parses GitHub URL with trailing slash', () => {
    const result = parseGitHubUrl('https://github.com/user/repo/');
    expect(result).toEqual({ owner: 'user', repo: 'repo', branch: 'main' });
  });

  it('parses GitHub URL with branch', () => {
    const result = parseGitHubUrl('https://github.com/user/repo/tree/develop');
    expect(result).toEqual({ owner: 'user', repo: 'repo', branch: 'develop' });
  });

  it('parses shorthand owner/repo', () => {
    const result = parseGitHubUrl('user/repo');
    expect(result).toEqual({ owner: 'user', repo: 'repo', branch: 'main' });
  });

  it('strips .git suffix', () => {
    const result = parseGitHubUrl('https://github.com/user/repo.git');
    expect(result).toEqual({ owner: 'user', repo: 'repo', branch: 'main' });
  });

  it('returns null for invalid URLs', () => {
    expect(parseGitHubUrl('https://gitlab.com/user/repo')).toBeNull();
    expect(parseGitHubUrl('not a url')).toBeNull();
    expect(parseGitHubUrl('')).toBeNull();
  });
});

describe('prioritizeGitHubFiles', () => {
  it('keeps config and infra files while ranking architectural entry points first', () => {
    const prioritized = prioritizeGitHubFiles([
      'src/utils/helpers.ts',
      'src/api/routes.ts',
      'src/services/authService.ts',
      'src/index.ts',
      'src/models/user.ts',
      'package.json',
      'docker-compose.yml',
      'infra/main.tf',
      'README.md',
    ]);

    expect(prioritized.slice(0, 4)).toEqual(
      expect.arrayContaining(['package.json', 'docker-compose.yml', 'infra/main.tf', 'src/index.ts'])
    );
    expect(prioritized).toContain('src/api/routes.ts');
    expect(prioritized).toContain('src/services/authService.ts');
    expect(prioritized).not.toContain('README.md');
  });
});
