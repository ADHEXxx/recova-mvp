/* eslint-disable @next/next/no-img-element */
import type { ComponentProps } from "react";

type ImageProps = Omit<ComponentProps<"img">, "src"> & {
  src: string | { src: string };
  fill?: boolean;
  priority?: boolean;
};

export default function Image({ src, fill, priority, style, alt = "", ...props }: ImageProps) {
  return <img {...props} alt={alt} src={typeof src === "string" ? src : src.src}
    loading={priority ? "eager" : "lazy"}
    style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style} />;
}
