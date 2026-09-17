import { Headset } from "./ui/Icons";

/*
  1:118 floating-query-tab — bg #7b624a, px-10 py-20, gap 12,
  rounded on the left only (12px), drop-shadow -4px 4px 6px rgba(0,0,0,.15).
  A 20px headset over the -90deg "Query Now" label (Schibsted Bold 12px).

  Figma pins this absolutely because a static frame cannot express `fixed`;
  rendered as a fixed side tab, which is what the name and rotation describe.
*/

export default function FloatingQueryTab() {
  return (
    <>
      <a
        href="#callback"
        data-open-popup
        className="fixed top-1/2 right-0 z-40 hidden -translate-y-1/2 flex-col items-center justify-center gap-[12px] rounded-tl-[12px] rounded-bl-[12px] bg-[#7b624a] px-[10px] py-[20px] drop-shadow-[-4px_4px_6px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-90 lg:flex"
      >
        <Headset className="size-[20px] shrink-0 text-white" />
        <span className="flex h-[73px] w-[18px] items-center justify-center">
          <span className="block -rotate-90 text-[12px] leading-[normal] font-bold whitespace-nowrap text-white">
            Query Now
          </span>
        </span>
      </a>

      <a
        href="#callback"
        data-open-popup
        className="fixed right-4 bottom-4 z-40 flex items-center justify-center gap-2 rounded-full border border-white/25 bg-[#7b624a] px-5 py-3 text-white shadow-[0_8px_24px_rgba(0,0,0,0.24)] transition-[opacity,transform] hover:-translate-y-0.5 hover:opacity-90 lg:hidden"
      >
        <Headset className="size-[18px] shrink-0" />
        <span className="text-[12px] font-bold whitespace-nowrap uppercase">Enquire Now</span>
      </a>
    </>
  );
}
