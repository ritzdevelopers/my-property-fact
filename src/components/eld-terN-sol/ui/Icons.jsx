/*
  UI icon layer — every glyph comes from `react-icons`, matched to the family
  each Figma node name implies:

    Figma node            family    react-icons export
    -------------------   -------   ----------------------
    whatsapp-line         Remix     RiWhatsappLine
    school-2              Remix     RiSchoolLine
    arrow-right           Lucide    LuArrowRight
    chevron-left/-right   Lucide    LuChevronLeft / LuChevronRight
    map-pin               Lucide    LuMapPin
    headset               Lucide    LuHeadset
    check                 Lucide    LuCheck
    plus                  Lucide    LuPlus
    external-link         Lucide    LuExternalLink
    star                  Lucide    LuStar
    airplay               Lucide    LuAirplay
    video                 Lucide    LuVideo
    circle-x              Lucide    LuCircleX

  The 24x8 hairline arrow inside the Figma buttons is Heroicons'
  HiOutlineArrowLongRight, wrapped by `ArrowLong` in ./Buttons.jsx.
*/

import { RiSchoolLine, RiWhatsappLine } from "react-icons/ri";
import {
  LuAirplay,
  LuArrowRight,
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuCircleX,
  LuExternalLink,
  LuHeadset,
  LuMapPin,
  LuMenu,
  LuPlus,
  LuStar,
  LuVideo,
  LuX,
} from "react-icons/lu";

export const ArrowRight = LuArrowRight;
export const ChevronLeft = LuChevronLeft;
export const ChevronRight = LuChevronRight;
export const WhatsApp = RiWhatsappLine;
export const MapPin = LuMapPin;
export const Headset = LuHeadset;
export const Check = LuCheck;
export const Plus = LuPlus;
export const ExternalLink = LuExternalLink;
export const Star = LuStar;
export const Airplay = LuAirplay;
export const Video = LuVideo;
export const School = RiSchoolLine;
export const CircleX = LuCircleX;
export const Menu = LuMenu;
export const Close = LuX;
