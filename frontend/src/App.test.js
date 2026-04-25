import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders app navigation inside router context', () => {
  render(
    <MemoryRouter initialEntries={['/resources']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: /resources/i })).toBeInTheDocument();
});
