 
import {
  ArrowUpRight,
  BriefcaseBusiness,
  FolderKanban,
  MessageSquare,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";

const stats = [
  {
    label: "Projects",
    value: "24",
    change: "+12%",
    icon: FolderKanban,
  },
  {
    label: "Services",
    value: "08",
    change: "+2",
    icon: BriefcaseBusiness,
  },
  {
    label: "Skills",
    value: "12",
    change: "+3",
    icon: Wrench,
  },
  {
    label: "Testimonials",
    value: "18",
    change: "+4",
    icon: Star,
  },
];

export default function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/45">
            <Sparkles size={13} />
            Creative workspace
          </div>

          <h2 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Good to see you.
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-black/45 dark:text-white/40">
            Here is what is happening across
            Sumaiya&apos;s portfolio today.
          </p>
        </div>

        <button
          type="button"
          className="group inline-flex w-fit items-center gap-2 rounded-xl bg-[#111] px-5 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-black"
        >
          View portfolio

          <ArrowUpRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="group rounded-[24px] border border-black/[0.07] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/[0.04] dark:border-white/[0.07] dark:bg-[#121212] dark:hover:shadow-black/20"
            >
              <div className="mb-7 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/[0.045] text-black/65 dark:bg-white/[0.06] dark:text-white/65">
                  <Icon size={19} />
                </div>

                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {stat.change}
                </span>
              </div>

              <p className="text-3xl font-semibold tracking-[-0.04em]">
                {stat.value}
              </p>

              <p className="mt-1 text-xs text-black/40 dark:text-white/35">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Recent projects */}
        <section className="rounded-[28px] border border-black/[0.07] bg-white p-6 dark:border-white/[0.07] dark:bg-[#121212]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/35 dark:text-white/35">
                Portfolio
              </p>

              <h3 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                Recent projects
              </h3>
            </div>

            <button
              type="button"
              className="text-xs font-medium text-black/50 hover:text-black dark:text-white/45 dark:hover:text-white"
            >
              View all
            </button>
          </div>

          <div className="space-y-2">
            {[
              "Brand Identity System",
              "Real Estate Campaign",
              "Packaging Design",
              "Social Media Campaign",
            ].map(
              (project, index) => (
                <div
                  key={project}
                  className="flex items-center justify-between rounded-2xl border border-black/[0.06] p-4 transition hover:bg-black/[0.025] dark:border-white/[0.06] dark:hover:bg-white/[0.025]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.045] text-xs font-semibold dark:bg-white/[0.06]">
                      0{index + 1}
                    </div>

                    <div>
                      <p className="text-sm font-medium">
                        {project}
                      </p>

                      <p className="mt-1 text-[11px] text-black/35 dark:text-white/35">
                        Published project
                      </p>
                    </div>
                  </div>

                  <ArrowUpRight
                    size={16}
                    className="text-black/30 dark:text-white/30"
                  />
                </div>
              )
            )}
          </div>
        </section>

        {/* Messages */}
        <section className="rounded-[28px] border border-black/[0.07] bg-[#111] p-6 text-white dark:border-white/[0.07] dark:bg-white/[0.06] dark:text-white">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <MessageSquare size={19} />
              </div>

              <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium">
                05 new
              </span>
            </div>

            <div className="mt-auto pt-12">
              <p className="text-xs uppercase tracking-[0.16em] text-white/40">
                Contact
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">
                New messages
              </h3>

              <p className="mt-3 text-sm leading-6 text-white/45">
                Review new project inquiries
                and client messages.
              </p>

              <button
                type="button"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium"
              >
                Open messages
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom quick actions */}
      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          icon={FolderKanban}
          title="Add project"
          description="Publish a new portfolio project."
        />

        <QuickAction
          icon={Users}
          title="Update profile"
          description="Manage your public profile."
        />

        <QuickAction
          icon={Wrench}
          title="Manage skills"
          description="Update tools and proficiency."
        />
      </section>
    </div>
  );
}

interface QuickActionProps {
  icon: typeof FolderKanban;
  title: string;
  description: string;
}

function QuickAction({
  icon: Icon,
  title,
  description,
}: QuickActionProps) {
  return (
    <button
      type="button"
      className="group flex items-center gap-4 rounded-[22px] border border-black/[0.07] bg-white p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-black/15 hover:shadow-lg dark:border-white/[0.07] dark:bg-[#121212] dark:hover:border-white/15"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/[0.045] dark:bg-white/[0.06]">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs text-black/40 dark:text-white/35">
          {description}
        </p>
      </div>

      <ArrowUpRight
        size={16}
        className="ml-auto text-black/25 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 dark:text-white/25"
      />
    </button>
  );
}
 
