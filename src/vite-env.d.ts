/// <reference types="vite/client" />

declare global {
  interface Window {
    electronAPI?: {
      loadUrl?: (url: string, tabId?: string) => void;
      onNavigate?: (cb: (data: { tabId?: string; url: string }) => void) =>
        | (() => void)
        | void;
      onTitle?: (cb: (data: { tabId?: string; title: string }) => void) =>
        | (() => void)
        | void;
      onNewWindow?: (cb: (data: { url: string }) => void) =>
        | (() => void)
        | void;
    };
  }
}

export {};
