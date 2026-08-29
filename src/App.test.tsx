import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock matchMedia for window theme detection in Jest
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

test('renders Dr.AI brand and primary navigation', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Dr\./i);
  expect(brandElements.length).toBeGreaterThan(0);
});

test('renders main hero headline', () => {
  render(<App />);
  const heroElement = screen.getByText(/Instant Medical AI Diagnosis/i);
  expect(heroElement).toBeInTheDocument();
});
