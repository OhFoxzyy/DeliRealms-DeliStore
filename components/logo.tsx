import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => (
  <Image
    src="/delirealms.svg"
    alt="Delirealms Logo"
    className={cn("size-12", className)}
    width={36}
    height={36}
  />
);

export default Logo;
