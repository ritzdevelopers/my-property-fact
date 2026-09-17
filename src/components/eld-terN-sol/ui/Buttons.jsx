import Image from "next/image";
import { HiOutlineArrowLongRight } from "react-icons/hi2";
import { ASSETS } from "./assets";

/*
  The two button shapes that repeat across the Figma frame.

  PillButton  — Figma 1:90 / 1:186 / 1:295: w-187, bg #8e704c, 1px #f2e5c0
                border, rounded-[50px], py-13. Label is Schibsted Bold 13px
                #f2e5c0, then a 5px gap, then the 24x8 arrow.

  EllipseLink — Figma 1:94 / 1:168: a 121x42 box with the Figma "Ellipse"
                vector pinned left (28.32x42 inside a 45px slot) and the label
                absolutely placed at left-22 / top-13. The label is wider than
                the 121px box and overflows to the right — that is how the
                frame is drawn, so it is reproduced rather than corrected.

  The arrow is react-icons' Heroicons long arrow. Its viewBox is square, so it
  sits inside an 8px-tall / 24px-wide flex box matching the Figma vector's
  footprint; the glyph overflows that box visually but contributes only 8px of
  height, which keeps the button at its exact 42px.
*/

export function ArrowLong({ className = "" }) {
  return (
    <span className={`flex h-[8px] w-[24px] shrink-0 items-center justify-center ${className}`}>
      <HiOutlineArrowLongRight className="size-6 shrink-0" />
    </span>
  );
}

export function PillButton({ children, as: Tag = "button", className = "", ...props }) {
  return (
    <Tag
      className={`group flex w-[187px] shrink-0 flex-col items-center rounded-[50px] border border-eld-cream bg-eld-bronze py-[13px] transition-opacity hover:opacity-90 ${className}`}
      {...props}
    >
      <span className="flex items-center justify-center gap-[5px] text-[13px] leading-[normal] font-bold whitespace-nowrap text-eld-cream">
        {children}
        <ArrowLong className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Tag>
  );
}

export function EllipseLink({
  children,
  as: Tag = "button",
  tone = "bronze",
  className = "",
  ...props
}) {
  const ellipse = tone === "bronze" ? ASSETS.pillEllipseGold : ASSETS.pillEllipseLight;

  return (
    <Tag
      className={`group relative block h-[42px] w-[121px] shrink-0 ${className}`}
      {...props}
    >
      <span className="absolute top-0 left-0 block h-[42px] w-[45px]">
        <Image
          src={ellipse.src}
          alt=""
          width={ellipse.width}
          height={ellipse.height}
          className="block h-[42px] w-[28.3234px]"
        />
      </span>
      <span
        className={`absolute top-[13px] left-[22px] flex items-center justify-center gap-[5px] text-[13px] leading-[normal] font-medium whitespace-nowrap ${
          tone === "bronze" ? "text-eld-bronze" : "text-white"
        }`}
      >
        {children}
        <ArrowLong className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Tag>
  );
}
