import { useEffect, useState } from 'react';
import { GITHUB_REPO_API_URL } from './constants';

let cachedStars: number | null = null;
let starsRequest: Promise<number | null> | null = null;

function fetchGithubStars(): Promise<number | null> {
  if (cachedStars !== null) {
    return Promise.resolve(cachedStars);
  }

  if (starsRequest !== null) {
    return starsRequest;
  }

  starsRequest = fetch(GITHUB_REPO_API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (typeof data.stargazers_count === 'number') {
        cachedStars = data.stargazers_count;
        return cachedStars;
      }

      return null;
    })
    .catch(() => null)
    .finally(() => {
      starsRequest = null;
    });

  return starsRequest;
}

export function useGithubStars(): number | null {
  const [stars, setStars] = useState<number | null>(cachedStars);

  useEffect(() => {
    let isMounted = true;

    fetchGithubStars().then((nextStars) => {
      if (isMounted) {
        setStars(nextStars);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return stars;
}
