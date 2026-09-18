import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eldeco Echoes of Eden | Sector 22D",
  description: "Premium 3 BHK homes at Eldeco Echoes of Eden on the Yamuna Expressway.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <Script
          id="spotify-ads-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w, d){
                var id='spdt-capture', n='script';
                if (!d.getElementById(id)) {
                  w.spdt = w.spdt || function() {
                    (w.spdt.q = w.spdt.q || []).push(arguments);
                  };
                  var e = d.createElement(n); e.id = id; e.async=1;
                  e.src = 'https://pixel.byspotify.com/ping.min.js';
                  var s = d.getElementsByTagName(n)[0];
                  s.parentNode.insertBefore(e, s);
                }
                w.spdt('conf', { key: '534241ed97624828ac8decf3ea10a044' });
                w.spdt('view');
              })(window, document);
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
