"use client";
import Script from "next/script";

export default function ThirdPartyScripts() {
    const GA_MEASUREMENT_ID = 'G-QCFJENDW3M';
    const FACEBOOK_PIXEL_ID = '994098169297958';
    const GOOGLE_TAG_MANAGER_ID = 'GTM-WL4BBZM8';
    return (
        <>
            {/* Start of google tag manager script  */}
            <Script id="google-tag-manager" strategy="lazyOnload">
                {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER_ID}');
          `}
            </Script>
            {/* End Google Tag Manager */}

            {/* Meta Pixel Script - lazyOnload loads after everything else */}
            <Script id="facebook-pixel" strategy="lazyOnload">
                {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FACEBOOK_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
            </Script>
            {/* End Meta Pixel Script */}

            {/* Load Google Analytics script */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="lazyOnload"
            />
            {/* Initialize GA */}
            <Script id="google-analytics" strategy="lazyOnload">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_MEASUREMENT_ID}');
                `}
            </Script>
            {/* End Google Analytics */}
        </>
    )
}