import Image from "next/image";
import { cn } from "@/lib/utils";

export function HomefyLogo({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: { box: "h-9 w-9", img: 36 },
    md: { box: "h-10 w-10", img: 40 },
    lg: { box: "h-12 w-12", img: 48 },
  } as const;

  const { box, img } = sizes[size];

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-white",
        box,
        className
      )}
    >
      <Image
        src="/icons/icon-512.png"
        alt="Homefy"
        width={img}
        height={img}
        className="h-full w-full object-contain p-0.5"
        priority
      />
    </div>
  );
}
