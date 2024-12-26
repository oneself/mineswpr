import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntroOverlay } from '../IntroOverlay';

describe('IntroOverlay', () => {
  const mockOnStart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Desktop Version', () => {
    beforeEach(() => {
      // Mock desktop environment
      delete (window as any).ontouchstart;
    });

    it('should render desktop instructions', () => {
      render(<IntroOverlay onStart={mockOnStart} />);

      expect(screen.getByText('Left click to flag a mine')).toBeInTheDocument();
      expect(screen.getByText('Right click to reveal a cell')).toBeInTheDocument();
      expect(screen.getByText('Numbers show adjacent mines')).toBeInTheDocument();
      expect(screen.getByText('Flag all mines to win!')).toBeInTheDocument();
    });
  });

  describe('Mobile Version', () => {
    beforeEach(() => {
      // Mock mobile environment
      Object.defineProperty(window, 'ontouchstart', {
        value: {},
        writable: true
      });
    });

    it('should render mobile instructions', () => {
      render(<IntroOverlay onStart={mockOnStart} />);

      expect(screen.getByText('Tap a cell to flag it as a mine')).toBeInTheDocument();
      expect(screen.getByText('Long press a cell to reveal it')).toBeInTheDocument();
      expect(screen.getByText('Numbers show adjacent mines')).toBeInTheDocument();
      expect(screen.getByText('Flag all mines to win!')).toBeInTheDocument();
    });
  });

  it('should call onStart when start button is clicked', () => {
    render(<IntroOverlay onStart={mockOnStart} />);

    fireEvent.click(screen.getByText('Start Game'));
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('should render game objective', () => {
    render(<IntroOverlay onStart={mockOnStart} />);

    expect(screen.getByText('Objective')).toBeInTheDocument();
    expect(screen.getByText(/Find and flag all the mines/)).toBeInTheDocument();
  });

  it('should have correct styling', () => {
    const { container } = render(<IntroOverlay onStart={mockOnStart} />);

    // Check overlay styling
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain('bg-black');
    expect(overlay.className).toContain('bg-opacity-80');
    expect(overlay.className).toContain('fixed');
    expect(overlay.className).toContain('inset-0');

    // Check content styling
    const content = screen.getByRole('dialog');
    expect(content.className).toContain('bg-white');
    expect(content.className).toContain('rounded-lg');
    expect(content.className).toContain('shadow-xl');

    // Check button styling
    const startButton = screen.getByText('Start Game');
    expect(startButton.className).toContain('bg-blue-500');
    expect(startButton.className).toContain('text-white');
  });
}); 