 
import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  FilePlus2,
  Filter,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  FolderKanban,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useDeleteProjectMutation, useGetAllProjectsQuery, type Project } from "../../redux/features/projects/projectApi";

 

export default function Projects() {
  const {
    data: projects = [],
    isLoading,
    isError,
    refetch,
  } = useGetAllProjectsQuery();

  const [deleteProject] =
    useDeleteProjectMutation();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "published" | "draft">("all");

  const [featuredFilter, setFeaturedFilter] =
    useState<"all" | "featured" | "normal">("all");

  const [openMenu, setOpenMenu] =
    useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const searchValue =
        `${project.title} ${
          project.shortDescription || ""
        } ${
          typeof project.category === "object"
            ? project?.category?.name
            : ""
        }`
          .toLowerCase();

      const matchesSearch =
        searchValue.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" &&
          project.isPublished) ||
        (statusFilter === "draft" &&
          !project.isPublished);

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" &&
          project.featured) ||
        (featuredFilter === "normal" &&
          !project.featured);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFeatured
      );
    });
  }, [
    projects,
    search,
    statusFilter,
    featuredFilter,
  ]);

  const handleDelete = async (
    project: Project
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteProject(project._id).unwrap();

      toast.success(
        "Project deleted successfully"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to delete project"
      );
    }
  };

  const getCategoryName = (
    project: Project
  ) => {
    if (
      typeof project.category === "object" &&
      project.category
    ) {
      return project.category.name;
    }

    return "Uncategorized";
  };

  const formatDate = (
    date?: string
  ) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* =========================
          Header
      ========================= */}

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
            <FolderKanban size={14} />
            Portfolio
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#111] dark:text-white sm:text-4xl">
            Projects
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-black/50 dark:text-white/50">
            Manage portfolio projects, publishing
            status, featured work and project content.
          </p>
        </div>

        <Link
          to="/admin/projects/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#111] px-5 text-sm font-medium text-white transition hover:scale-[1.02] dark:bg-white dark:text-black"
        >
          <Plus size={17} />
          New Project
        </Link>
      </section>

      {/* =========================
          Stats
      ========================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Projects"
          value={projects.length}
        />

        <StatCard
          label="Published"
          value={
            projects.filter(
              (project) =>
                project.isPublished
            ).length
          }
        />

        <StatCard
          label="Drafts"
          value={
            projects.filter(
              (project) =>
                !project.isPublished
            ).length
          }
        />

        <StatCard
          label="Featured"
          value={
            projects.filter(
              (project) =>
                project.featured
            ).length
          }
        />
      </div>

      {/* =========================
          Filters
      ========================= */}

      <section className="rounded-3xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#131313] sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Search */}

          <div className="relative w-full xl:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35 dark:text-white/35"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search projects..."
              className="h-11 w-full rounded-2xl border border-black/10 bg-black/[0.025] pl-11 pr-4 text-sm text-[#111] outline-none transition placeholder:text-black/35 focus:border-black/25 dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/30 dark:focus:border-white/25"
            />
          </div>

          {/* Filters */}

          <div className="flex flex-wrap items-center gap-2">
            <Filter
              size={16}
              className="mr-1 text-black/40 dark:text-white/40"
            />

            <FilterButton
              active={statusFilter === "all"}
              onClick={() =>
                setStatusFilter("all")
              }
            >
              All
            </FilterButton>

            <FilterButton
              active={
                statusFilter === "published"
              }
              onClick={() =>
                setStatusFilter("published")
              }
            >
              Published
            </FilterButton>

            <FilterButton
              active={
                statusFilter === "draft"
              }
              onClick={() =>
                setStatusFilter("draft")
              }
            >
              Draft
            </FilterButton>

            <FilterButton
              active={
                featuredFilter === "featured"
              }
              onClick={() =>
                setFeaturedFilter(
                  featuredFilter === "featured"
                    ? "all"
                    : "featured"
                )
              }
            >
              <Star size={13} />
              Featured
            </FilterButton>
          </div>
        </div>
      </section>

      {/* =========================
          Error
      ========================= */}

      {isError && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-sm font-medium text-red-500">
            Failed to load projects.
          </p>

          <button
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-[#111] px-4 py-2 text-xs font-medium text-white dark:bg-white dark:text-black"
          >
            Try Again
          </button>
        </div>
      )}

      {/* =========================
          Loading
      ========================= */}

      {isLoading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl border border-black/10 bg-white dark:border-white/10 dark:bg-[#131313]"
            >
              <div className="aspect-[16/10] animate-pulse bg-black/5 dark:bg-white/5" />

              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-black/5 dark:bg-white/5" />

                <div className="h-4 w-full animate-pulse rounded bg-black/5 dark:bg-white/5" />

                <div className="h-4 w-1/2 animate-pulse rounded bg-black/5 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          Empty
      ========================= */}

      {!isLoading &&
        !isError &&
        filteredProjects.length === 0 && (
          <div className="rounded-3xl border border-dashed border-black/15 bg-white p-12 text-center dark:border-white/15 dark:bg-[#131313]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5">
              <FilePlus2
                size={24}
                className="text-black/50 dark:text-white/50"
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-[#111] dark:text-white">
              No projects found
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/45 dark:text-white/45">
              Try changing your search or filters,
              or create a new portfolio project.
            </p>

            <Link
              to="/admin/projects/new"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#111] px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              <Plus size={16} />
              Create Project
            </Link>
          </div>
        )}

      {/* =========================
          Project Grid
      ========================= */}

      {!isLoading &&
        !isError &&
        filteredProjects.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map(
              (project) => (
                <article
                  key={project._id}
                  className="group overflow-hidden rounded-3xl border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[#131313] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                >
                  {/* Image */}

                  <div className="relative aspect-[16/10] overflow-hidden bg-black/5 dark:bg-white/5">
                    {project.thumbnail?.url ? (
                      <img
                        src={
                          project.thumbnail.url
                        }
                        alt={project.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FolderKanban
                          size={34}
                          className="text-black/20 dark:text-white/20"
                        />
                      </div>
                    )}

                    {/* Gradient */}

                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Status */}

                    <div className="absolute left-4 top-4 flex gap-2">
                      <StatusBadge
                        published={
                          Boolean(
                            project.isPublished
                          )
                        }
                      />

                      {project.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-black backdrop-blur">
                          <Star
                            size={11}
                            fill="currentColor"
                          />
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Menu */}

                    <div className="absolute right-4 top-4">
                      <button
                        onClick={() =>
                          setOpenMenu(
                            openMenu ===
                              project._id
                              ? null
                              : project._id
                          )
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/70"
                      >
                        <MoreHorizontal
                          size={18}
                        />
                      </button>

                      {openMenu ===
                        project._id && (
                        <div className="absolute right-0 top-11 z-20 w-40 overflow-hidden rounded-2xl border border-black/10 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#191919]">
                          <Link
                            to={`/admin/projects/edit/${project._id}`}
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-[#111] hover:bg-black/5 dark:text-white dark:hover:bg-white/5"
                            onClick={() =>
                              setOpenMenu(
                                null
                              )
                            }
                          >
                            <Pencil size={14} />
                            Edit project
                          </Link>

                          <button
                            onClick={() => {
                              setOpenMenu(null);
                              handleDelete(
                                project
                              );
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-red-500 hover:bg-red-500/5"
                          >
                            <Trash2 size={14} />
                            Delete project
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Category */}

                    <div className="absolute bottom-4 left-4 text-xs font-medium text-white/80">
                      {getCategoryName(
                        project
                      )}
                    </div>
                  </div>

                  {/* Content */}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold tracking-tight text-[#111] dark:text-white">
                          {project.title}
                        </h2>

                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-black/45 dark:text-white/45">
                          {
                            project.shortDescription
                          }
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-black/35 dark:text-white/35">
                        #{project.order ?? 0}
                      </span>
                    </div>

                    {/* Bottom */}

                    <div className="mt-5 flex items-center justify-between border-t border-black/8 pt-4 dark:border-white/8">
                      <span className="text-xs text-black/40 dark:text-white/40">
                        {formatDate(
                          project.createdAt
                        )}
                      </span>

                      <div className="flex items-center gap-2">
                        {project.isPublished ? (
                          <Eye
                            size={15}
                            className="text-emerald-500"
                          />
                        ) : (
                          <EyeOff
                            size={15}
                            className="text-black/30 dark:text-white/30"
                          />
                        )}

                        <Link
                          to={`/admin/projects/edit/${project._id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-black/60 transition hover:bg-black hover:text-white dark:border-white/10 dark:text-white/60 dark:hover:bg-white dark:hover:text-black"
                        >
                          <Pencil size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
    </div>
  );
}

/* =========================
   Stat Card
========================= */

interface StatCardProps {
  label: string;
  value: number;
}

function StatCard({
  label,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#131313]">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-black/40 dark:text-white/40">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#111] dark:text-white">
        {value}
      </p>
    </div>
  );
}

/* =========================
   Filter Button
========================= */

interface FilterButtonProps {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

function FilterButton({
  active,
  children,
  onClick,
}: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition ${
        active
          ? "bg-[#111] text-white dark:bg-white dark:text-black"
          : "bg-black/5 text-black/55 hover:bg-black/10 dark:bg-white/5 dark:text-white/55 dark:hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================
   Status Badge
========================= */

function StatusBadge({
  published,
}: {
  published: boolean;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur ${
        published
          ? "bg-emerald-500/90 text-white"
          : "bg-black/65 text-white"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
 
