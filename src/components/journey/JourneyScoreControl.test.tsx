import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { JourneyScoreControl } from './JourneyScoreControl';

describe('JourneyScoreControl', () => {
  it('renders the current score as filled stars', () => {
    render(<JourneyScoreControl score={3} onChange={vi.fn()} />);

    expect(screen.getByLabelText('Set journey score to 3').textContent).toContain('★');
    expect(screen.getByLabelText('Set journey score to 4').textContent).toContain('☆');
  });

  it('emits the selected score when a star is clicked', () => {
    const onChange = vi.fn();
    render(<JourneyScoreControl score={2} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText('Set journey score to 5'));

    expect(onChange).toHaveBeenCalledWith(5);
  });
});
