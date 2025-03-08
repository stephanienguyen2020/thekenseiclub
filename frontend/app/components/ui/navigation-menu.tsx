import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// Define the menu item type
export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface NavigationMenuProps {
  items: NavItem[];
}

export function NavigationMenu({ items }: NavigationMenuProps) {
  return (
    <nav className="relative z-10 flex max-w-max flex-1 items-center justify-center">
      <ul className="group flex flex-1 list-none items-center justify-center space-x-1">
        {items.map((item) => (
          <li key={item.label}>
            <NavigationMenuItem item={item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface NavigationMenuItemProps {
  item: NavItem;
}

export function NavigationMenuItem({ item }: NavigationMenuItemProps) {
  const { label, href, icon: Icon } = item;

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
      )}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {label}
    </Link>
  );
}

// Add global style for glow effect
const globalStyles = `
  .hover\\:glow:hover {
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  }
`;

// Export the global styles
export { globalStyles };
