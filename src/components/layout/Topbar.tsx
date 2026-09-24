 
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
} from "lucide-react";

import { useLocation } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { getAdminUser } from "../../lib/auth";

 
interface TopbarProps {
  onMenuClick: () => void;
}

const pageNames: Record<
  string,
  string
> = {
  "/admin": "Dashboard",
  "/admin/dashboard": "Dashboard",
  "/admin/projects": "Projects",
  "/admin/categories": "Categories",
  "/admin/services": "Services",
  "/admin/skills": "Skills",
  "/admin/experience": "Experience",
  "/admin/testimonials": "Testimonials",
  "/admin/contacts": "Messages",
  "/admin/profile": "Profile",
  "/admin/settings": "Settings",
};

export default function Topbar({
  onMenuClick,
}: TopbarProps) {
  const location = useLocation();

  const {
    theme,
    toggleTheme,
  } = useTheme();

  const user =
    getAdminUser<{
      name?: string;
      email?: string;
    }>();

  const pageTitle =
    pageNames[location.pathname] ||
    "Admin";

  const userName =
    user?.name || "Administrator";

  const userEmail =
    user?.email || "Admin account";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="
        sticky top-0 z-30
        h-[82px]
        border-b border-black/[0.07]
        bg-[#f5f5f3]/90
        backdrop-blur-xl
        dark:border-white/[0.07]
        dark:bg-[#0b0b0b]/90
      "
    >
      <div className="flex h-full items-center justify-between px-5 sm:px-7 lg:px-8">
        {/* =========================
            LEFT
        ========================== */}

        <div className="flex min-w-0 items-center gap-4">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              border border-black/[0.08]
              bg-white
              text-black/60
              transition
              hover:border-black/15
              hover:text-black
              lg:hidden
              dark:border-white/[0.08]
              dark:bg-white/[0.04]
              dark:text-white/60
              dark:hover:border-white/15
              dark:hover:text-white
            "
          >
            <Menu size={19} />
          </button>

          {/* Page title */}
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/35 dark:text-white/30">
              Admin workspace
            </p>

            <h1 className="mt-0.5 truncate text-xl font-semibold tracking-[-0.035em] sm:text-2xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* =========================
            RIGHT
        ========================== */}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <button
            type="button"
            aria-label="Search"
            className="
              hidden h-10 w-10
              items-center justify-center
              rounded-xl
              border border-black/[0.08]
              bg-white
              text-black/50
              transition
              hover:border-black/15
              hover:text-black
              sm:flex
              dark:border-white/[0.08]
              dark:bg-white/[0.04]
              dark:text-white/50
              dark:hover:border-white/15
              dark:hover:text-white
            "
          >
            <Search size={18} />
          </button>

          {/* Theme */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border border-black/[0.08]
              bg-white
              text-black/55
              transition
              hover:border-black/15
              hover:text-black
              dark:border-white/[0.08]
              dark:bg-white/[0.04]
              dark:text-white/55
              dark:hover:border-white/15
              dark:hover:text-white
            "
          >
            {theme === "dark" ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="
              relative
              hidden h-10 w-10
              items-center justify-center
              rounded-xl
              border border-black/[0.08]
              bg-white
              text-black/55
              transition
              hover:border-black/15
              hover:text-black
              sm:flex
              dark:border-white/[0.08]
              dark:bg-white/[0.04]
              dark:text-white/55
              dark:hover:border-white/15
              dark:hover:text-white
            "
          >
            <Bell size={18} />

            {/* Notification dot */}
            <span
              className="
                absolute
                right-2.5
                top-2.5
                h-1.5
                w-1.5
                rounded-full
                bg-red-500
              "
            />
          </button>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-black/[0.08] md:block dark:bg-white/[0.08]" />

          {/* Admin */}
          <div className="flex items-center gap-2.5">
            {/* Name */}
            <div className="hidden text-right md:block">
              <p className="text-xs font-semibold">
                {userName}
              </p>

              <p className="mt-0.5 max-w-[150px] truncate text-[10px] text-black/35 dark:text-white/35">
                {userEmail}
              </p>
            </div>

            {/* Avatar */}
            <div
              className="
                flex h-10 w-10
                shrink-0
                items-center justify-center
                rounded-xl
                bg-[#111]
                text-xs
                font-bold
                text-white
                shadow-sm
                dark:bg-white
                dark:text-black
              "
            >
              {initials || "AD"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
 
