"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

const UsersIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
);

const ReceiptIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5l-5-5-5 5V7a2 2 0 012-2h6a2 2 0 012 2v14z"
    />
  </svg>
);

const BarChart3Icon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const UploadIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="m12 1 2.09 6.26L22 9l-6.26 2.09L14 17l-2.09-6.26L4 9l6.26-2.09L12 1z" />
  </svg>
);

const BellIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-5 5-5-5h5V3h0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.73 21a2 2 0 0 1-3.46 0"
    />
  </svg>
);

const GraduationCapIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l9-5-9-5-9 5 9 5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const XIcon = () => (
  <svg
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: BarChart3Icon,
  },
  {
    name: "Students",
    href: "/students",
    icon: UsersIcon,
  },
  {
    name: "Fee Receipts",
    href: "/receipts",
    icon: ReceiptIcon,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3Icon,
  },
  {
    name: "Fee Reminders",
    href: "/fee-reminders",
    icon: BellIcon,
  },
  {
    name: "Import/Export",
    href: "/import-export",
    icon: UploadIcon,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: SettingsIcon,
  },
];

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent btn-animate"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="transition-transform duration-200 ease-in-out">
          {isOpen ? <XIcon /> : <MenuIcon />}
        </div>
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border transform transition-all duration-300 ease-in-out md:translate-x-0 animate-fade-in",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo and Header */}
          <div className="flex items-center gap-3 p-6 border-b border-sidebar-border hover:bg-sidebar-accent/5 transition-colors duration-200">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-sidebar-accent transition-transform duration-200 hover:scale-110">
              <Image
                src="/images/comtech-logo.png"
                alt="Comtech Academy"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">
                Comtech Academy
              </h1>
              <p className="text-sm text-sidebar-foreground/70">CRM System</p>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out sidebar-item-animate group animate-slide-up",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground hover:shadow-sm"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                    {item.name}
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-sidebar-accent-foreground rounded-full animate-bounce-subtle" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border hover:bg-sidebar-accent/5 transition-colors duration-200">
            <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60 group">
              <GraduationCapIcon className="transition-transform duration-200 group-hover:rotate-12" />
              <span>Digital Skills Academy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden animate-fade-in backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
