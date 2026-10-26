export type ActiveNavCandidate = {
  href: string;
  /** When true the item is active only when the pathname equals the href. */
  exact?: boolean;
};

function matches(pathname: string, { href, exact }: ActiveNavCandidate) {
  if (pathname === href) return true;
  return !exact && pathname.startsWith(`${href}/`);
}

/** The most specific (longest) matching href wins, so /viagens/nova does not activate /viagens. */
export function findActiveHref(pathname: string, items: ActiveNavCandidate[]) {
  let active: string | undefined;
  for (const item of items) {
    if (matches(pathname, item) && (active === undefined || item.href.length > active.length)) {
      active = item.href;
    }
  }
  return active;
}
