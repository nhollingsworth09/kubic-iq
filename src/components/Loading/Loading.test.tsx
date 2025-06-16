import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Loading } from './Loading';

test('renders spinner and default message', () => {
  render(<Loading />);
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

test('renders custom message when provided', () => {
  const message = 'Custom loading message';
  render(<Loading message={message} />);
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  expect(screen.getByText(message)).toBeInTheDocument();
});
