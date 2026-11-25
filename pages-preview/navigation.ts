import { useSyncExternalStore } from "react";

function subscribe(update: () => void) {
  window.addEventListener("hashchange", update);
  window.addEventListener("popstate", update);
  return () => {
    window.removeEventListener("hashchange", update);
    window.removeEventListener("popstate", update);
  };
}

function snapshot() {
  const hash = window.location.hash.slice(1);
  return hash.startsWith("/") && !hash.startsWith("//") ? hash : "/";
}

export function useLocation() {
  return useSyncExternalStore(subscribe, snapshot, () => "/");
}

export function usePathname() {
  return new URL(useLocation(), window.location.origin).pathname;
}

export function useSearchParams() {
  return new URL(useLocation(), window.location.origin).searchParams;
}

function navigate(href: string, replace = false) {
  if (snapshot() === href) return;
  if (replace) window.history.replaceState(null, "", `#${href}`);
  else window.history.pushState(null, "", `#${href}`);
  window.dispatchEvent(new Event("popstate"));
  window.scrollTo(0, 0);
}

const router = {
  push: (href: string) => navigate(href),
  replace: (href: string) => navigate(href, true),
};

export function useRouter() {
  return router;
}

export class PageNotFound extends Error {}

export function notFound(): never {
  throw new PageNotFound();
}
