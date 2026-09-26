 
import {
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Eye,
  FolderKanban,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings2,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { useGetDashboardStatsQuery } from "../../redux/features/dashboard/dashboardApi";

 
const Dashboard = () => {
  const {
    data: stats,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetDashboardStatsQuery();

  // --------------------------------------------------
  // SAFE DATA
  // --------------------------------------------------

  const totalProjects = stats?.projects?.total ?? 0;
  const publishedProjects = stats?.projects?.published ?? 0;
  const featuredProjects = stats?.projects?.featured ?? 0;
  const draftProjects = stats?.projects?.draft ?? 0;

  const totalServices = stats?.services ?? 0;
  const totalSkills = stats?.skills ?? 0;
  const totalExperiences = stats?.experiences ?? 0;
  const totalTestimonials = stats?.testimonials ?? 0;

  const newMessages =
    stats?.contacts?.new ??
    stats?.messages?.new ??
    0;

  const totalMessages =
    stats?.contacts?.total ??
    stats?.messages?.total ??
    0;

  const publishedPercentage =
    totalProjects > 0
      ? Math.round(
          (publishedProjects / totalProjects) * 100
        )
      : 0;

  const featuredPercentage =
    totalProjects > 0
      ? Math.round(
          (featuredProjects / totalProjects) * 100
        )
      : 0;

  // --------------------------------------------------
  // STAT CARDS
  // --------------------------------------------------

  const statCards = [
    {
      label: "Projects",
      value: totalProjects,
      detail: `${publishedProjects} published`,
      icon: FolderKanban,
      iconStyle:
        "bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400",
    },
    {
      label: "Services",
      value: totalServices,
      detail: "Creative services",
      icon: BriefcaseBusiness,
      iconStyle:
        "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400",
    },
    {
      label: "Skills",
      value: totalSkills,
      detail: "Design toolkit",
      icon: Wrench,
      iconStyle:
        "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400",
    },
    {
      label: "Testimonials",
      value: totalTestimonials,
      detail: "Client feedback",
      icon: MessageSquare,
      iconStyle:
        "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400",
    },
  ];

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-7">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/45">
              Admin workspace
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-[-0.055em] text-[#111]  sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-black/55 ">
            Manage your creative portfolio from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="
            inline-flex w-fit items-center gap-2
            rounded-xl
            border border-black/10
            
            px-4 py-2.5
            text-xs font-semibold
            text-black
            shadow-sm
            transition
            hover:border-black/20
            hover:bg-black/[0.02]
            disabled:cursor-not-allowed
            disabled:opacity-50
            dark:border-white/10
            dark:bg-white/[0.05]
         
            dark:hover:border-white/20
            dark:hover:bg-white/[0.08]
          "
        >
          <RefreshCw
            size={14}
            className={isFetching ? "animate-spin" : ""} 
          />

          Refresh
        </button>
      </header>

      {/* =================================================
          ERROR
      ================================================= */}

      {isError && (
        <div
          className="
            flex flex-col gap-3
            rounded-2xl
            border border-red-500/20
            bg-red-500/[0.06]
            p-4
            sm:flex-row sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              Unable to load dashboard data
            </p>

            <p className="mt-1 text-xs text-red-600/70 dark:text-red-400/70">
              Check your backend connection and try again.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="
              inline-flex items-center justify-center
              gap-2 rounded-lg
              bg-red-500 px-3.5 py-2
              text-xs font-semibold text-white
              transition hover:bg-red-600
            "
          >
            <RefreshCw size={13} />
            Try again
          </button>
        </div>
      )}

      {/* =================================================
          WELCOME CARD
      ================================================= */}

      <section
        className="
          relative overflow-hidden
          rounded-[26px]
          border border-black/[0.08]
          bg-white
          px-6 py-7
          shadow-[0_10px_40px_rgba(0,0,0,0.04)]
          sm:px-8 sm:py-8
          dark:border-white/[0.09]
          dark:bg-[#151515]
          dark:shadow-none
        "
      >
        {/* Decorative grid */}

        <div
          className="
            pointer-events-none absolute inset-0
            opacity-[0.35]
            dark:opacity-[0.18]
          "
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)",
            backgroundSize: "38px 38px",
          }}
        />

        <div
          className="
            pointer-events-none absolute
            -right-20 -top-20
            h-64 w-64
            rounded-full
            border border-black/[0.05]
            dark:border-white/[0.07]
          "
        />

        <div
          className="
            pointer-events-none absolute
            -right-10 -top-10
            h-44 w-44
            rounded-full
            border border-black/[0.04]
            dark:border-white/[0.05]
          "
        />

        <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div
              className="
                inline-flex items-center gap-2
                rounded-full
                border border-black/[0.08]
                bg-black/[0.025]
                px-3 py-1.5
                dark:border-white/[0.09]
                dark:bg-white/[0.05]
              "
            >
              <CheckCircle2
                size={13}
                className="text-emerald-500"
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/55 dark:text-white/55">
                Portfolio is connected
              </span>
            </div>

            <h2
              className="
                mt-5
                max-w-xl
                text-3xl font-bold
                leading-[1.05]
                tracking-[-0.06em]
                text-[#111]
                dark:text-white
                sm:text-4xl
              "
            >
              Build, manage &
              <br />
              <span className="text-black/35 dark:text-white/35">
                showcase great work.
              </span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-6 text-black/55 dark:text-white/55">
              Keep projects, services, skills and client
              feedback organized and ready for the public
              portfolio.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <a
              href="/admin/projects/new"
              className="
                inline-flex items-center gap-2
                rounded-xl
                bg-[#111]
                px-4 py-3
                text-xs font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-black
                dark:bg-white
                dark:text-black
                dark:hover:bg-white/90
              "
            >
              <Plus size={15} />
              New Project
            </a>

            <a
              href="/admin/profile"
              className="
                inline-flex items-center gap-2
                rounded-xl
                border border-black/10
                bg-white
                px-4 py-3
                text-xs font-semibold
                text-black
                transition
                hover:border-black/20
                hover:bg-black/[0.025]
                dark:border-white/10
                dark:bg-white/[0.04]
                dark:text-white
                dark:hover:border-white/20
                dark:hover:bg-white/[0.08]
              "
            >
              <Settings2 size={15} />
              Profile
            </a>
          </div>
        </div>
      </section>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section>
        <DashboardSectionHeader
          eyebrow="Overview"
          title="Content summary"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="
                  group relative overflow-hidden
                  rounded-2xl
                  border border-black/[0.08]
                  bg-white
                  p-5
                  shadow-[0_5px_25px_rgba(0,0,0,0.025)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_15px_35px_rgba(0,0,0,0.06)]
                  dark:border-white/[0.08]
                  dark:bg-[#151515]
                  dark:shadow-none
                  dark:hover:border-white/[0.13]
                "
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`
                      flex h-11 w-11
                      items-center justify-center
                      rounded-xl
                      ${stat.iconStyle}
                    `}
                  >
                    <Icon size={19} strokeWidth={1.8} />
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="
                      text-black/20
                      transition-all
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                      group-hover:text-black/50
                      dark:text-white/20
                      dark:group-hover:text-white/50
                    "
                  />
                </div>

                <div className="mt-7">
                  <p className="text-3xl font-bold tracking-[-0.06em] text-[#111] dark:text-white">
                    {String(stat.value).padStart(2, "0")}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#111] dark:text-white">
                    {stat.label}
                  </p>

                  <p className="mt-1 text-xs text-black/45 dark:text-white/45">
                    {stat.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================
          ANALYTICS
      ================================================= */}

      <section>
        <DashboardSectionHeader
          eyebrow="Portfolio health"
          title="Publishing overview"
        />

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          {/* Publishing */}

          <div
            className="
              rounded-2xl
              border border-black/[0.08]
              bg-white
              p-6
              dark:border-white/[0.08]
              dark:bg-[#151515]
            "
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-[#111] dark:text-white">
                  Project visibility
                </h3>

                <p className="mt-1 text-xs text-black/45 dark:text-white/45">
                  How your portfolio projects are currently
                  organized.
                </p>
              </div>

              <div
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-xl
                  bg-emerald-500/10
                  text-emerald-600
                  dark:text-emerald-400
                "
              >
                <Eye size={18} />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-4xl font-bold tracking-[-0.07em] text-[#111] dark:text-white">
                    {publishedPercentage}%
                  </span>

                  <span className="ml-2 text-xs font-medium text-black/40 dark:text-white/40">
                    published
                  </span>
                </div>

                <span className="text-xs font-medium text-black/45 dark:text-white/45">
                  {publishedProjects} of {totalProjects}
                </span>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                <div
                  className="
                    h-full rounded-full
                    bg-[#111]
                    transition-all duration-700
                    dark:bg-white
                  "
                  style={{
                    width: `${publishedPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <MiniStat
                label="Published"
                value={publishedProjects}
                icon={CheckCircle2}
                iconClass="text-emerald-500"
              />

              <MiniStat
                label="Draft"
                value={draftProjects}
                icon={FolderKanban}
                iconClass="text-orange-500"
              />
            </div>
          </div>

          {/* Featured */}

          <div
            className="
              relative overflow-hidden
              rounded-2xl
              border border-black/[0.08]
              bg-[#111]
              p-6
              text-white
              dark:border-white/[0.08]
              dark:bg-white/[0.06]
            "
          >
            <div
              className="
                pointer-events-none absolute
                -right-16 -top-16
                h-48 w-48
                rounded-full
                border border-white/10
              "
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                    Selected work
                  </p>

                  <h3 className="mt-2 text-xl font-bold tracking-[-0.04em]">
                    Featured projects
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Star
                    size={18}
                    className="text-amber-300"
                  />
                </div>
              </div>

              <div className="mt-10">
                <p className="text-5xl font-bold tracking-[-0.07em]">
                  {String(featuredProjects).padStart(2, "0")}
                </p>

                <p className="mt-2 text-xs text-white/50">
                  projects highlighted on your portfolio
                </p>
              </div>

              <div className="mt-7">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-white/45">
                    Share of all projects
                  </span>

                  <span className="font-semibold text-white/75">
                    {featuredPercentage}%
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{
                      width: `${featuredPercentage}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          LOWER GRID
      ================================================= */}

      <section className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
        {/* Quick Actions */}

        <div
          className="
            rounded-2xl
            border border-black/[0.08]
            bg-white
            p-6
            dark:border-white/[0.08]
            dark:bg-[#151515]
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 dark:text-white/40">
                Productivity
              </p>

              <h3 className="mt-1 text-xl font-bold tracking-[-0.045em] text-[#111] dark:text-white">
                Quick actions
              </h3>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <QuickAction
              href="/admin/projects/new"
              icon={Plus}
              title="New project"
              description="Add portfolio work"
            />

            <QuickAction
              href="/admin/services"
              icon={BriefcaseBusiness}
              title="Services"
              description="Manage offerings"
            />

            <QuickAction
              href="/admin/profile"
              icon={Settings2}
              title="Profile"
              description="Update information"
            />
          </div>
        </div>

        {/* Messages */}

        <div
          className="
            rounded-2xl
            border border-black/[0.08]
            bg-white
            p-6
            dark:border-white/[0.08]
            dark:bg-[#151515]
          "
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 dark:text-white/40">
                Communication
              </p>

              <h3 className="mt-1 text-xl font-bold tracking-[-0.045em] text-[#111] dark:text-white">
                Messages
              </h3>
            </div>

            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                bg-blue-500/10
                text-blue-600
                dark:text-blue-400
              "
            >
              <MessageSquare size={18} />
            </div>
          </div>

          <div className="mt-7 flex items-end gap-3">
            <span className="text-5xl font-bold tracking-[-0.07em] text-[#111] dark:text-white">
              {String(newMessages).padStart(2, "0")}
            </span>

            <span className="mb-2 text-xs font-medium text-black/40 dark:text-white/40">
              new messages
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-black/[0.07] pt-5 dark:border-white/[0.08]">
            <div>
              <p className="text-xs text-black/45 dark:text-white/45">
                Total received
              </p>

              <p className="mt-1 text-sm font-bold text-[#111] dark:text-white">
                {totalMessages}
              </p>
            </div>

            <a
              href="/admin/contacts"
              className="
                inline-flex items-center gap-1.5
                text-xs font-bold
                text-[#111]
                transition
                hover:gap-2.5
                dark:text-white
              "
            >
              View all
              <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* =================================================
          WORKSPACE SUMMARY
      ================================================= */}

      <section
        className="
          rounded-2xl
          border border-black/[0.08]
          bg-white
          p-6
          dark:border-white/[0.08]
          dark:bg-[#151515]
        "
      >
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 dark:text-white/40">
            Workspace
          </p>

          <h3 className="text-xl font-bold tracking-[-0.045em] text-[#111] dark:text-white">
            Portfolio ecosystem
          </h3>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <WorkspaceItem
            icon={Award}
            label="Experience"
            value={totalExperiences}
          />

          <WorkspaceItem
            icon={Star}
            label="Testimonials"
            value={totalTestimonials}
          />

          <WorkspaceItem
            icon={Users}
            label="Messages"
            value={totalMessages}
          />

          <WorkspaceItem
            icon={Eye}
            label="Published"
            value={`${publishedPercentage}%`}
          />
        </div>
      </section>
    </div>
  );
};

// ======================================================
// SECTION HEADER
// ======================================================

interface DashboardSectionHeaderProps {
  eyebrow: string;
  title: string;
}

function DashboardSectionHeader({
  eyebrow,
  title,
}: DashboardSectionHeaderProps) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-bold tracking-[-0.045em] text-[#111] dark:text-white">
        {title}
      </h2>
    </div>
  );
}

// ======================================================
// MINI STAT
// ======================================================

interface MiniStatProps {
  label: string;
  value: number;
  icon: typeof CheckCircle2;
  iconClass: string;
}

function MiniStat({
  label,
  value,
  icon: Icon,
  iconClass,
}: MiniStatProps) {
  return (
    <div
      className="
        flex items-center gap-3
        rounded-xl
        bg-black/[0.035]
        px-4 py-3
        dark:bg-white/[0.045]
      "
    >
      <Icon size={17} className={iconClass} />

      <div>
        <p className="text-[11px] text-black/45 dark:text-white/45">
          {label}
        </p>

        <p className="text-sm font-bold text-[#111] dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

// ======================================================
// QUICK ACTION
// ======================================================

interface QuickActionProps {
  href: string;
  icon: typeof Plus;
  title: string;
  description: string;
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: QuickActionProps) {
  return (
    <a
      href={href}
      className="
        group
        rounded-xl
        border border-black/[0.08]
        bg-black/[0.015]
        p-4
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-black/[0.16]
        hover:bg-black/[0.025]
        dark:border-white/[0.08]
        dark:bg-white/[0.025]
        dark:hover:border-white/[0.16]
        dark:hover:bg-white/[0.05]
      "
    >
      <div className="flex items-center justify-between">
        <div
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-lg
            bg-[#111]
            text-white
            dark:bg-white
            dark:text-black
          "
        >
          <Icon size={16} />
        </div>

        <ArrowUpRight
          size={15}
          className="
            text-black/25
            transition-all
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
            group-hover:text-black/60
            dark:text-white/25
            dark:group-hover:text-white/60
          "
        />
      </div>

      <p className="mt-4 text-sm font-bold text-[#111] dark:text-white">
        {title}
      </p>

      <p className="mt-1 text-[11px] text-black/45 dark:text-white/45">
        {description}
      </p>
    </a>
  );
}

// ======================================================
// WORKSPACE ITEM
// ======================================================

interface WorkspaceItemProps {
  icon: typeof Award;
  label: string;
  value: number | string;
}

function WorkspaceItem({
  icon: Icon,
  label,
  value,
}: WorkspaceItemProps) {
  return (
    <div
      className="
        flex items-center gap-3
        rounded-xl
        border border-black/[0.06]
        bg-black/[0.02]
        p-4
        dark:border-white/[0.07]
        dark:bg-white/[0.025]
      "
    >
      <div
        className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-lg
          bg-white
          text-black
          shadow-sm
          dark:bg-white/[0.08]
          dark:text-white
          dark:shadow-none
        "
      >
        <Icon size={16} />
      </div>

      <div>
        <p className="text-[11px] text-black/45 dark:text-white/45">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-bold text-[#111] dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

// ======================================================
// SKELETON
// ======================================================

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1600px] animate-pulse space-y-7">
      {/* Header */}

      <div className="flex items-end justify-between">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded bg-black/[0.07] dark:bg-white/[0.08]" />
          <div className="h-10 w-44 rounded-lg bg-black/[0.07] dark:bg-white/[0.08]" />
          <div className="h-3 w-64 rounded bg-black/[0.05] dark:bg-white/[0.06]" />
        </div>

        <div className="h-10 w-24 rounded-xl bg-black/[0.06] dark:bg-white/[0.07]" />
      </div>

      {/* Hero */}

      <div className="h-[280px] rounded-[26px] bg-black/[0.06] dark:bg-white/[0.06]" />

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[190px] rounded-2xl bg-black/[0.06] dark:bg-white/[0.06]"
          />
        ))}
      </div>

      {/* Analytics */}

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="h-[300px] rounded-2xl bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="h-[300px] rounded-2xl bg-black/[0.06] dark:bg-white/[0.06]" />
      </div>

      {/* Bottom */}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[240px] rounded-2xl bg-black/[0.06] dark:bg-white/[0.06]" />
        <div className="h-[240px] rounded-2xl bg-black/[0.06] dark:bg-white/[0.06]" />
      </div>
    </div>
  );
}

export default Dashboard;
 
