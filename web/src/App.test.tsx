/* @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import App from "./App";
import { beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  const originalGetComputedStyle = window.getComputedStyle;
  Object.defineProperty(window, "getComputedStyle", {
    writable: true,
    value: vi.fn().mockImplementation((element: Element) => originalGetComputedStyle(element)),
  });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("App", () => {
  it("renders reference title", () => {
    render(<App />);
    expect(screen.getByText(/FusionCommerce x OmniRoute Checkout Orchestration/i)).toBeDefined();
  });
});
