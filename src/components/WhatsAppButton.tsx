import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppData } from '../lib/api.ts';
import { buildWhatsAppUrl } from '../lib/whatsapp.ts';

interface WhatsAppButtonProps {
  label?: string;
  contextLabel?: string;
  variant?: 'primary' | 'outline' | 'subtle';
  className?: string;
}

export function WhatsAppButton({
  label = 'Contactez-nous sur WhatsApp',
  contextLabel,
  variant = 'outline',
  className = '',
}: WhatsAppButtonProps) {
  const { settings } = useAppData();
  const waUrl = buildWhatsAppUrl(settings.whatsapp_number, contextLabel);

  const baseStyles =
    variant === 'primary'
      ? 'bg-[#1A1917] text-[#FAF8F4] hover:bg-[#33302B]'
      : variant === 'subtle'
        ? 'text-[#1A1917] hover:text-[#8C6F38] underline underline-offset-4'
        : 'border border-[#D5CEC2] bg-white text-[#1A1917] hover:border-[#8C6F38] hover:text-[#8C6F38]';

  if (!waUrl) {
    return (
      <Link
        to="/contact"
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${baseStyles} ${className}`}
      >
        <MessageCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${baseStyles} ${className}`}
    >
      <MessageCircle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      <span>{label}</span>
    </a>
  );
}
