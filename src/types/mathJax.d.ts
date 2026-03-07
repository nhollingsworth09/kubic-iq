declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: (elements: Array<HTMLElement | null>) => Promise<any>;
      [key: string]: any;
    }
  }
}

export {}; // This file needs to be a module
