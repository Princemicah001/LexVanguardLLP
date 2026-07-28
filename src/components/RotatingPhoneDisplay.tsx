import { useRotatingPhone } from "@/hooks/useRotatingPhone";

interface RotatingPhoneDisplayProps {
  className?: string;
  showIcon?: boolean;
}

export default function RotatingPhoneDisplay({ className = "", showIcon = false }: RotatingPhoneDisplayProps) {
  const { phone, telHref, index } = useRotatingPhone(20000);

  return (
    <a
      href={telHref}
      key={phone}
      className={`inline-block transition-opacity duration-500 hover:text-yellow-400 ${className}`}
      title="Click to call Lex Vanguard Chambers"
    >
      <span className="animate-in fade-in slide-in-from-bottom-1 duration-500 inline-block">
        {phone}
      </span>
    </a>
  );
}
