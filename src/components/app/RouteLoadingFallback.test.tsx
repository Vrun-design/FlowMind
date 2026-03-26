import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import { DEFAULT_ROUTE_LOADING_COPY } from './routeLoadingCopy';

describe('RouteLoadingFallback', () => {
  it('renders branded route-loading copy', () => {
    render(<RouteLoadingFallback />);

    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText(DEFAULT_ROUTE_LOADING_COPY.title)).toBeTruthy();
    expect(screen.getByText(DEFAULT_ROUTE_LOADING_COPY.description)).toBeTruthy();
  });

  it('renders custom loading copy when provided', () => {
    render(<RouteLoadingFallback title="Opening docs" description="Loading documentation content." />);

    expect(screen.getByText('Opening docs')).toBeTruthy();
    expect(screen.getByText('Loading documentation content.')).toBeTruthy();
  });
});
