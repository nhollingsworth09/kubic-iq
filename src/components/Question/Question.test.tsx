import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Question } from './Question';
import '@testing-library/jest-dom';

const mockQuestion = {
  id: '1',
  text: 'What is 2 + 2?',
  options: [
    { id: 'a', text: '3' },
    { id: 'b', text: '4' },
    { id: 'c', text: '5' },
    { id: 'd', text: '6' }
  ],
  correctAnswer: 'b',
  explanation: 'Two plus two equals four.',
  difficulty: 0.5
};

const setup = (props = {}) => {
  const defaultProps = {
    question: mockQuestion,
    onAnswer: jest.fn(),
    isLoading: false,
    ...props
  };

  const user = userEvent.setup();
  return {
    user,
    onAnswer: defaultProps.onAnswer,
    ...render(<Question {...defaultProps} />)
  };
};

describe('Question', () => {
  it('renders loading state', () => {
    setup({ isLoading: true });
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  describe('when loaded', () => {
    it('renders question text', () => {
      setup();
      expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
    });

    it('renders all question options', () => {
      setup();
      mockQuestion.options.forEach(option => {
        expect(screen.getByText(option.text)).toBeInTheDocument();
      });
    });

    it('handles option selection', async () => {
      const { user, onAnswer } = setup();
      const firstOption = screen.getByText(mockQuestion.options[0].text);
      
      await user.click(firstOption);
      
      expect(onAnswer).toHaveBeenCalledWith(mockQuestion.options[0].id);
    });

    it('shows explanation after answering', async () => {
      const { user } = setup();
      const firstOption = screen.getByText(mockQuestion.options[0].text);
      
      await user.click(firstOption);
      
      expect(screen.getByText(mockQuestion.explanation)).toBeInTheDocument();
    });
  });
});
