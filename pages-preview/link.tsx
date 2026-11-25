import type { ComponentProps } from "react";
import { useRouter } from "./navigation";

export default function Link({ href, onClick, ...props }: ComponentProps<"a">) {
  const router = useRouter();
  const internal = href?.startsWith("/") && !href.startsWith("//");

  return (
    <a {...props} href={internal ? `#${href}` : href} onClick={(event) => {
      onClick?.(event);
      if (!internal || !href || event.defaultPrevented || event.button !== 0 || event.metaKey ||
          event.ctrlKey || event.shiftKey || event.altKey || props.target && props.target !== "_self") return;
      event.preventDefault();
      router.push(href);
    }} />
  );
}
