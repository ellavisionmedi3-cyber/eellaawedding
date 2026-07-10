import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'tamara-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        type?: string;
        amount?: string;
        'inline-type'?: string;
        config?: string;
      }, HTMLElement>;
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'tamara-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
          type?: string;
          amount?: string;
          'inline-type'?: string;
          config?: string;
        }, HTMLElement>;
      }
    }
  }

  interface Window {
    tamaraWidgetConfig?: {
      lang: string;
      country: string;
      publicKey: string;
      style?: {
        fontSize?: string;
        badgeRatio?: number;
      };
    };
    TamaraWidgetV2?: {
      refresh: () => void;
    };
  }
}
