import { siteConfig } from "@/eldeco-echoes-of-eden/config/site";
import { PhoneIcon } from "@/eldeco-echoes-of-eden/components/ui/PhoneIcon";
import { WhatsAppIcon } from "@/eldeco-echoes-of-eden/components/ui/WhatsAppIcon";

export function FloatingActionButtons() {
  const { contact } = siteConfig;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 hidden px-4 sm:bottom-6 sm:px-6 lg:block">
      <div className="mx-auto flex max-w-8xl items-end justify-between">
        <a
          href={contact.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex size-14 items-center justify-center rounded-full border-2 border-white bg-white text-[#25D366] shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon className="size-8" />
        </a>

        <a
          href={contact.phoneHref}
          className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-[#1D3B2F] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D3B2F]"
          aria-label={`Call ${contact.phone}`}
        >
          <PhoneIcon className="size-6" />
        </a>
      </div>
    </div>
  );
}
