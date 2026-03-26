import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

describe('Select', () => {
  it('closes when clicking outside', async () => {
    const onChange = vi.fn();

    render(
      <div>
        <Select
          value="production"
          onChange={onChange}
          options={[
            { value: 'production', label: 'Production' },
            { value: 'staging', label: 'Staging' },
          ]}
        />
        <button type="button">Outside</button>
      </div>
    );

    const trigger = screen.getByRole('button', { name: 'Production' });

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() => {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });
  });

  it('renders options when opened and allows selecting one', async () => {
    const onChange = vi.fn();

    render(
      <Select
        value="production"
        onChange={onChange}
        options={[
          { value: 'production', label: 'Production' },
          { value: 'staging', label: 'Staging' },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Production' }));

    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getByRole('button', { name: 'Staging' })).toBeTruthy();

    fireEvent.click(within(listbox).getByRole('button', { name: 'Staging' }));

    expect(onChange).toHaveBeenCalledWith('staging');
  });
});
