import "@testing-library/jest-dom/vitest";

// jsdom thiếu các API trình duyệt mà framer-motion / recharts cần. Polyfill cho test.
class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
const g = globalThis as unknown as Record<string, unknown>;
g.IntersectionObserver = IO;
g.ResizeObserver = RO;
if (!window.matchMedia) {
  g.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });
}
