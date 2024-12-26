import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  const mockOnClose = jest.fn();
  const mockOnRestart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <Modal
        isOpen={false}
        title="Test Title"
        message="Test Message"
        onClose={mockOnClose}
        onRestart={mockOnRestart}
      />
    );

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Message')).not.toBeInTheDocument();
  });

  it('should render title and message when isOpen is true', () => {
    render(
      <Modal
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onClose={mockOnClose}
        onRestart={mockOnRestart}
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <Modal
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onClose={mockOnClose}
        onRestart={mockOnRestart}
      />
    );

    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onRestart when restart button is clicked', () => {
    render(
      <Modal
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onClose={mockOnClose}
        onRestart={mockOnRestart}
      />
    );

    fireEvent.click(screen.getByText('Play Again'));
    expect(mockOnRestart).toHaveBeenCalledTimes(1);
  });

  it('should not render restart button when onRestart is not provided', () => {
    render(
      <Modal
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Play Again')).not.toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    const { container } = render(
      <Modal
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onClose={mockOnClose}
        onRestart={mockOnRestart}
      />
    );

    // Check overlay styling
    const overlay = container.firstChild as HTMLElement;
    expect(overlay.className).toContain('bg-black');
    expect(overlay.className).toContain('bg-opacity-50');
    expect(overlay.className).toContain('fixed');
    expect(overlay.className).toContain('inset-0');

    // Check modal content styling
    const modalContent = screen.getByRole('dialog');
    expect(modalContent.className).toContain('bg-white');
    expect(modalContent.className).toContain('rounded-lg');
    expect(modalContent.className).toContain('shadow-xl');
  });

  it('should render buttons with correct styling', () => {
    render(
      <Modal
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onClose={mockOnClose}
        onRestart={mockOnRestart}
      />
    );

    const playAgainButton = screen.getByText('Play Again');
    expect(playAgainButton.className).toContain('bg-blue-500');
    expect(playAgainButton.className).toContain('text-white');

    const closeButton = screen.getByText('Close');
    expect(closeButton.className).toContain('border');
    expect(closeButton.className).toContain('border-gray-300');
  });
}); 