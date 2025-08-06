import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders BurlyCon home page', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const headingElement = screen.getByText(/BurlyCon Sparkle Squad/i);
  expect(headingElement).toBeInTheDocument();
});
