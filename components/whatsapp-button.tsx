"use client";

import { siteSettings } from "@/lib/data/settings";

export default function WhatsAppButton() {
  const { whatsappNumber, whatsappDefaultMessage } = siteSettings.contact;
  if (!whatsappNumber) return null;

  const href = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    whatsappDefaultMessage
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Shuddhodhan on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 md:bottom-6 md:right-6"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.99.583 3.844 1.588 5.401L2 22l4.735-1.556A9.953 9.953 0 0 0 12.001 22C17.524 22 22 17.523 22 12S17.524 2 12.001 2zm0 18.077a8.06 8.06 0 0 1-4.113-1.127l-.295-.176-3.058 1.005 1.02-2.981-.192-.306a8.068 8.068 0 0 1-1.245-4.315c0-4.462 3.63-8.09 8.093-8.09 4.462 0 8.09 3.628 8.09 8.09 0 4.463-3.628 8.09-8.09 8.09z" />
      </svg>
    </a>
  );
}
