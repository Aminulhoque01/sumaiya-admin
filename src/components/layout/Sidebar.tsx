 
import {
  BarChart3,
  BriefcaseBusiness,
  FolderKanban,
  Layers3,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
  Star,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logout } from "../../lib/auth";

 

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const navigation = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Portfolio",
    items: [
      {
        label: "Projects",
        href: "/admin/projects",
        icon: FolderKanban,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Layers3,
      },
      {
        label: "Services",
        href: "/admin/services",
        icon: BriefcaseBusiness,
      },
      {
        label: "Skills",
        href: "/admin/skills",
        icon: Wrench,
      },
      {
        label: "Experience",
        href: "/admin/experience",
        icon: BarChart3,
      },
      {
        label: "Testimonials",
        href: "/admin/testimonials",
        icon: Star,
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        label: "Messages",
        href: "/admin/contacts",
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "Website",
    items: [
      {
        label: "Profile",
        href: "/admin/profile",
        icon: UserRound,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar({
  mobile = false,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();

    toast.success(
      "You have been logged out."
    );

    navigate(
      "/admin/login",
      {
        replace: true,
      }
    );
  };

  return (
    <aside
      className={`
        flex h-full w-[270px] flex-col
        border-r border-black/[0.07]
        bg-white
        dark:border-white/[0.07]
        dark:bg-[#101010]
        ${mobile ? "" : "fixed left-0 top-0 z-40"}
      `}
    >
      {/* Logo */}
      <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-black/[0.07] px-6 dark:border-white/[0.07]">
        <button
          type="button"
          onClick={() =>
            navigate("/admin/dashboard")
          }
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111] text-white transition-transform duration-300 group-hover:rotate-[-5deg] dark:bg-white dark:text-black">
            <Sparkles size={17} />
          </div>

          <div className="text-left">
            <p className="text-sm font-bold tracking-[-0.02em]">
              Sumaiya
            </p>

            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-black/35 dark:text-white/35">
              Admin CMS
            </p>
          </div>
        </button>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-black/40 hover:bg-black/5 hover:text-black dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X size={19} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {navigation.map((group) => (
          <div
            key={group.label}
            className="mb-7 last:mb-0"
          >
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-black/30 dark:text-white/30">
              {group.label}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                        isActive
                          ? "bg-[#111] font-medium text-white shadow-sm dark:bg-white dark:text-black"
                          : "text-black/55 hover:bg-black/[0.045] hover:text-black dark:text-white/50 dark:hover:bg-white/[0.05] dark:hover:text-white",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={17}
                          strokeWidth={
                            isActive
                              ? 2.2
                              : 1.8
                          }
                          className="shrink-0"
                        />

                        <span>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="shrink-0 border-t border-black/[0.07] p-4 dark:border-white/[0.07]">
        <div className="mb-3 rounded-2xl bg-black/[0.035] p-3 dark:bg-white/[0.035]">
          <p className="text-xs font-semibold">
            Creative Workspace
          </p>

          <p className="mt-1 text-[11px] leading-5 text-black/40 dark:text-white/40">
            Manage your portfolio from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-black/50 transition hover:bg-red-500/[0.07] hover:text-red-600 dark:text-white/45 dark:hover:text-red-400"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
 
