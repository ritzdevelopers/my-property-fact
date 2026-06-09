import { notFound } from "next/navigation";

/** Internal route — middleware rewrites invalid URLs here to render app/not-found.js */
export default function NotFoundTriggerPage() {
  notFound();
}
