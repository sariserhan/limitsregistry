import Image from "next/image";
import type { ComponentProps } from "react";

type BrandIconProps = Omit<ComponentProps<typeof Image>, "src" | "alt"> & {
  alt?: string;
  size?: number;
};

/**
 * The Official Coordinate Monogram Seal for Limits Registry.
 * Renders the exact 1:1 artwork of the institutional seal.
 */
export function BrandIcon({
  className = "brand-mark",
  size = 24,
  alt = "Limits Registry Seal",
  priority = true,
  ...props
}: BrandIconProps) {
  return (
    <Image
      src="/brand-seal.png"
      alt={alt}
      width={size}
      height={size}
      className={className}
      priority={priority}
      {...props}
    />
  );
}
