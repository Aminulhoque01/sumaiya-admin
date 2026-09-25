import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Layers3,
  Loader2,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { toast } from "sonner";
import { useCreateExperienceMutation, useDeleteExperienceMutation, useGetAllExperiencesQuery, useUpdateExperienceMutation, type Experience } from "../../redux/features/experience/experienceApi";

 

interface ExperienceForm {
  company: string;
  position: string;
  employmentType: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  responsibilities: string[];
  technologies: string[];
  order: string;
  isActive: boolean;
}

const emptyForm: ExperienceForm = {
  company: "",
  position: "",
  employmentType: "",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
  responsibilities: [""],
  technologies: [""],
  order: "0",
  isActive: true,
};

const getErrorMessage = (
  error: unknown
) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error
  ) {
    const data = (
      error as {
        data?: {
          message?: string;
        };
      }
    ).data;

    return (
      data?.message ||
      "Something went wrong"
    );
  }

  return "Something went wrong";
};

const formatDate = (
  value?: string
) => {
  if (!value) return "Present";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      year: "numeric",
    }
  ).format(date);
};

const getDuration = (
  start?: string,
  end?: string,
  isCurrent?: boolean
) => {
  if (!start) return "";

  const startDate = new Date(start);

  const endDate =
    isCurrent || !end
      ? new Date()
      : new Date(end);

  if (
    Number.isNaN(
      startDate.getTime()
    ) ||
    Number.isNaN(
      endDate.getTime()
    )
  ) {
    return "";
  }

  let months =
    (endDate.getFullYear() -
      startDate.getFullYear()) *
      12 +
    (endDate.getMonth() -
      startDate.getMonth());

  months = Math.max(0, months);

  const years = Math.floor(
    months / 12
  );

  const remainingMonths =
    months % 12;

  if (years === 0) {
    return `${remainingMonths} ${
      remainingMonths === 1
        ? "month"
        : "months"
    }`;
  }

  if (remainingMonths === 0) {
    return `${years} ${
      years === 1
        ? "year"
        : "years"
    }`;
  }

  return `${years}y ${remainingMonths}m`;
};

export default function Experience() {
  const {
    data: experiences = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllExperiencesQuery();

  const [createExperience, { isLoading: creating }] =
    useCreateExperienceMutation();

  const [updateExperience, { isLoading: updating }] =
    useUpdateExperienceMutation();

  const [deleteExperience, { isLoading: deleting }] =
    useDeleteExperienceMutation();

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "all" | "active" | "inactive"
    >("all");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [editingExperience, setEditingExperience] =
    useState<Experience | null>(null);

  const [deletingExperience, setDeletingExperience] =
    useState<Experience | null>(null);

  const [form, setForm] =
    useState<ExperienceForm>(
      emptyForm
    );

  const filteredExperiences =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return experiences
        .filter((experience) => {
          const matchesSearch =
            !query ||
            experience.company
              .toLowerCase()
              .includes(query) ||
            experience.position
              .toLowerCase()
              .includes(query) ||
            experience.employmentType
              ?.toLowerCase()
              .includes(query) ||
            experience.location
              ?.toLowerCase()
              .includes(query) ||
            experience.technologies.some(
              (technology) =>
                technology
                  .toLowerCase()
                  .includes(query)
            );

          const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active"
              ? experience.isActive
              : !experience.isActive);

          return (
            matchesSearch &&
            matchesStatus
          );
        })
        .sort(
          (a, b) =>
            (a.order ?? 0) -
            (b.order ?? 0)
        );
    }, [
      experiences,
      search,
      statusFilter,
    ]);

  const stats = useMemo(() => {
    const total =
      experiences.length;

    const active =
      experiences.filter(
        (item) => item.isActive
      ).length;

    const current =
      experiences.filter(
        (item) => item.isCurrent
      ).length;

    const inactive =
      total - active;

    return {
      total,
      active,
      current,
      inactive,
    };
  }, [experiences]);

  const openCreateModal = () => {
    setEditingExperience(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (
    experience: Experience
  ) => {
    setEditingExperience(
      experience
    );

    setForm({
      company:
        experience.company || "",
      position:
        experience.position || "",
      employmentType:
        experience.employmentType ||
        "",
      location:
        experience.location || "",
      startDate: experience.startDate
        ? experience.startDate.slice(
            0,
            10
          )
        : "",
      endDate: experience.endDate
        ? experience.endDate.slice(
            0,
            10
          )
        : "",
      isCurrent:
        experience.isCurrent,
      description:
        experience.description ||
        "",
      responsibilities:
        experience.responsibilities
          ?.length
          ? [
              ...experience.responsibilities,
            ]
          : [""],
      technologies:
        experience.technologies
          ?.length
          ? [
              ...experience.technologies,
            ]
          : [""],
      order: String(
        experience.order ?? 0
      ),
      isActive:
        experience.isActive,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    if (creating || updating) return;

    setModalOpen(false);
    setEditingExperience(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!form.company.trim()) {
      toast.error(
        "Company name is required"
      );
      return;
    }

    if (!form.position.trim()) {
      toast.error(
        "Position is required"
      );
      return;
    }

    if (!form.startDate) {
      toast.error(
        "Start date is required"
      );
      return;
    }

    const responsibilities =
      form.responsibilities
        .map((item) => item.trim())
        .filter(Boolean);

    const technologies =
      form.technologies
        .map((item) => item.trim())
        .filter(Boolean);

    const payload = {
      company:
        form.company.trim(),
      position:
        form.position.trim(),
      employmentType:
        form.employmentType.trim() ||
        undefined,
      location:
        form.location.trim() ||
        undefined,
      startDate:
        form.startDate,
      endDate:
        form.isCurrent ||
        !form.endDate
          ? undefined
          : form.endDate,
      isCurrent:
        form.isCurrent,
      description:
        form.description.trim() ||
        undefined,
      responsibilities,
      technologies,
      order:
        Number(form.order) || 0,
      isActive:
        form.isActive,
    };

    try {
      if (editingExperience) {
        await updateExperience({
          id: editingExperience._id,
          body: payload,
        }).unwrap();

        toast.success(
          "Experience updated successfully"
        );
      } else {
        await createExperience(
          payload
        ).unwrap();

        toast.success(
          "Experience created successfully"
        );
      }

      closeModal();
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingExperience) return;

    try {
      await deleteExperience(
        deletingExperience._id
      ).unwrap();

      toast.success(
        "Experience deleted successfully"
      );

      setDeleteOpen(false);
      setDeletingExperience(null);
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    }
  };

  const toggleStatus = async (
    experience: Experience
  ) => {
    try {
      await updateExperience({
        id: experience._id,
        body: {
          isActive:
            !experience.isActive,
        },
      }).unwrap();

      toast.success(
        experience.isActive
          ? "Experience hidden"
          : "Experience activated"
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    }
  };

  return (
    <div className="min-h-full bg-slate-50/80 p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">
        {/* ======================================
            Header
        ====================================== */}

        <section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <BriefcaseBusiness
                    size={17}
                  />
                </div>

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Professional Journey
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Experience Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Manage professional roles,
                responsibilities,
                technologies and career
                history.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <Plus size={18} />
              Add Experience
            </button>
          </div>
        </section>

        {/* ======================================
            Stats
        ====================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Layers3 size={19} />}
            label="Total"
            value={stats.total}
            description="Career records"
          />

          <StatCard
            icon={<Check size={19} />}
            label="Active"
            value={stats.active}
            description="Visible publicly"
          />

          <StatCard
            icon={<Clock3 size={19} />}
            label="Current"
            value={stats.current}
            description="Current positions"
          />

          <StatCard
            icon={<BriefcaseBusiness size={19} />}
            label="Inactive"
            value={stats.inactive}
            description="Hidden records"
          />
        </section>

        {/* ======================================
            Toolbar
        ====================================== */}

        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-lg">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search company, position, location..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-slate-950 dark:focus:border-white/30"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "all"
                      | "active"
                      | "inactive"
                  )
                }
                className="h-12 min-w-[170px] appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm font-semibold outline-none dark:border-white/10 dark:bg-slate-950"
              >
                <option value="all">
                  All status
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </section>

        {/* ======================================
            List
        ====================================== */}

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState
            onRetry={refetch}
          />
        ) : filteredExperiences.length ===
          0 ? (
          <EmptyState
            hasFilters={
              Boolean(search) ||
              statusFilter !== "all"
            }
            onCreate={openCreateModal}
          />
        ) : (
          <section className="relative">
            {isFetching && (
              <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                <Loader2
                  size={13}
                  className="animate-spin"
                />
                Updating
              </div>
            )}

            <div className="space-y-5">
              {filteredExperiences.map(
                (experience, index) => (
                  <ExperienceCard
                    key={
                      experience._id
                    }
                    experience={
                      experience
                    }
                    index={index}
                    onEdit={() =>
                      openEditModal(
                        experience
                      )
                    }
                    onDelete={() => {
                      setDeletingExperience(
                        experience
                      );
                      setDeleteOpen(
                        true
                      );
                    }}
                    onToggle={() =>
                      toggleStatus(
                        experience
                      )
                    }
                  />
                )
              )}
            </div>
          </section>
        )}
      </div>

      {/* Modal */}

      {modalOpen && (
        <ExperienceModal
          editing={
            editingExperience
          }
          form={form}
          setForm={setForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
          loading={
            creating || updating
          }
        />
      )}

      {/* Delete */}

      {deleteOpen &&
        deletingExperience && (
          <DeleteModal
            experience={
              deletingExperience
            }
            onClose={() => {
              if (deleting) return;

              setDeleteOpen(false);
              setDeletingExperience(
                null
              );
            }}
            onConfirm={
              handleDelete
            }
            loading={deleting}
          />
        )}
    </div>
  );
}

/* =====================================================
   Stat Card
===================================================== */

function StatCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white">
          {icon}
        </div>

        <Sparkles
          size={15}
          className="text-slate-300 transition group-hover:text-slate-500 dark:text-slate-700"
        />
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   Experience Card
===================================================== */

function ExperienceCard({
  experience,
  index,
  onEdit,
  onDelete,
  onToggle,
}: {
  experience: Experience;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-white/10 dark:bg-slate-900 sm:p-6 lg:p-7">
      <div className="absolute left-0 top-0 h-full w-1 bg-slate-900 dark:bg-white" />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Timeline */}

        <div className="hidden shrink-0 lg:flex lg:w-16 lg:flex-col lg:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white">
            <BriefcaseBusiness
              size={21}
            />
          </div>

          <div className="mt-3 h-full w-px bg-gradient-to-b from-slate-300 to-transparent dark:from-white/20" />
        </div>

        {/* Main */}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:bg-white/10 dark:text-slate-300">
                  #{String(
                    index + 1
                  ).padStart(2, "0")}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                    experience.isCurrent
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                  }`}
                >
                  {experience.isCurrent
                    ? "Current"
                    : "Previous"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                    experience.isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400"
                      : "bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                  }`}
                >
                  {experience.isActive
                    ? "Published"
                    : "Hidden"}
                </span>
              </div>

              <h2 className="mt-4 text-xl font-black tracking-tight sm:text-2xl">
                {experience.position}
              </h2>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness
                    size={14}
                  />
                  {experience.company}
                </span>

                {experience.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin
                      size={14}
                    />
                    {experience.location}
                  </span>
                )}

                {experience.employmentType && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3
                      size={14}
                    />
                    {
                      experience.employmentType
                    }
                  </span>
                )}
              </div>
            </div>

            {/* Date */}

            <div className="shrink-0 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <CalendarDays
                  size={14}
                />

                <span>
                  {formatDate(
                    experience.startDate
                  )}{" "}
                  —{" "}
                  {experience.isCurrent
                    ? "Present"
                    : formatDate(
                        experience.endDate
                      )}
                </span>
              </div>

              <p className="mt-1 text-xs font-bold text-slate-400">
                {getDuration(
                  experience.startDate,
                  experience.endDate,
                  experience.isCurrent
                )}
              </p>
            </div>
          </div>

          {/* Description */}

          {experience.description && (
            <p className="mt-6 max-w-4xl text-sm leading-7 text-slate-500 dark:text-slate-400">
              {experience.description}
            </p>
          )}

          {/* Responsibilities */}

          {experience
            .responsibilities
            ?.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                Responsibilities
              </p>

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {experience.responsibilities.map(
                  (
                    responsibility,
                    responsibilityIndex
                  ) => (
                    <div
                      key={`${experience._id}-responsibility-${responsibilityIndex}`}
                      className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-3 text-xs font-medium leading-5 text-slate-600 dark:bg-white/[0.03] dark:text-slate-300"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />

                      <span>
                        {
                          responsibility
                        }
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Technologies */}

          {experience.technologies
            ?.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                Technologies
              </p>

              <div className="flex flex-wrap gap-2">
                {experience.technologies.map(
                  (
                    technology,
                    technologyIndex
                  ) => (
                    <span
                      key={`${experience._id}-technology-${technologyIndex}`}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                      {technology}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {/* Actions */}

          <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5 dark:border-white/10">
            <button
              type="button"
              onClick={onToggle}
              className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold ${
                experience.isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  experience.isActive
                    ? "bg-emerald-500"
                    : "bg-slate-400"
                }`}
              />

              {experience.isActive
                ? "Published"
                : "Hidden"}
            </button>

            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <Edit3 size={14} />
                Edit
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-100 px-3 text-xs font-bold text-red-500 transition hover:bg-red-50 dark:border-red-400/10 dark:hover:bg-red-400/10"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =====================================================
   Modal
===================================================== */

function ExperienceModal({
  editing,
  form,
  setForm,
  onClose,
  onSubmit,
  loading,
}: {
  editing: Experience | null;
  form: ExperienceForm;
  setForm: React.Dispatch<
    React.SetStateAction<ExperienceForm>
  >;
  onClose: () => void;
  onSubmit: (
    event: FormEvent
  ) => void;
  loading: boolean;
}) {
  const updateField = <
    K extends keyof ExperienceForm
  >(
    field: K,
    value: ExperienceForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateArrayItem = (
    field:
      | "responsibilities"
      | "technologies",
    index: number,
    value: string
  ) => {
    setForm((prev) => {
      const next = [
        ...prev[field],
      ];

      next[index] = value;

      return {
        ...prev,
        [field]: next,
      };
    });
  };

  const addArrayItem = (
    field:
      | "responsibilities"
      | "technologies"
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        "",
      ],
    }));
  };

  const removeArrayItem = (
    field:
      | "responsibilities"
      | "technologies",
    index: number
  ) => {
    setForm((prev) => {
      const next = prev[field].filter(
        (_, itemIndex) =>
          itemIndex !== index
      );

      return {
        ...prev,
        [field]:
          next.length > 0
            ? next
            : [""],
      };
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-white/10 sm:px-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              {editing
                ? "Edit experience"
                : "New experience"}
            </p>

            <h2 className="mt-1 text-xl font-black">
              {editing
                ? "Update Experience"
                : "Add Experience"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}

        <form
          onSubmit={onSubmit}
          className="overflow-y-auto p-6 sm:p-7"
        >
          {/* Basic Information */}

          <div>
            <SectionTitle>
              Basic Information
            </SectionTitle>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Company"
                required
              >
                <input
                  value={form.company}
                  onChange={(e) =>
                    updateField(
                      "company",
                      e.target.value
                    )
                  }
                  placeholder="Company name"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-[#181818] dark:text-white dark:caret-white dark:placeholder:text-white/30 dark:focus:border-white/30 dark:focus:bg-[#181818] dark:focus:text-white dark:focus:ring-white/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-white/5 dark:disabled:text-white/30"
                />
              </Field>

              <Field
                label="Position"
                required
              >
                <input
                  value={form.position}
                  onChange={(e) =>
                    updateField(
                      "position",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Senior Graphic Designer"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-[#181818] dark:text-white dark:caret-white dark:placeholder:text-white/30 dark:focus:border-white/30 dark:focus:bg-[#181818] dark:focus:text-white dark:focus:ring-white/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-white/5 dark:disabled:text-white/30"
                />
              </Field>

              <Field label="Employment Type">
                <input
                  value={
                    form.employmentType
                  }
                  onChange={(e) =>
                    updateField(
                      "employmentType",
                      e.target.value
                    )
                  }
                  placeholder="Full-time / Freelance / Contract"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-[#181818] dark:text-white dark:caret-white dark:placeholder:text-white/30 dark:focus:border-white/30 dark:focus:bg-[#181818] dark:focus:text-white dark:focus:ring-white/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-white/5 dark:disabled:text-white/30"
                />
              </Field>

              <Field label="Location">
                <input
                  value={form.location}
                  onChange={(e) =>
                    updateField(
                      "location",
                      e.target.value
                    )
                  }
                  placeholder="Dhaka, Bangladesh"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-[#181818] dark:text-white dark:caret-white dark:placeholder:text-white/30 dark:focus:border-white/30 dark:focus:bg-[#181818] dark:focus:text-white dark:focus:ring-white/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-white/5 dark:disabled:text-white/30"
                />
              </Field>
            </div>
          </div>

          {/* Timeline */}

          <div className="mt-8">
            <SectionTitle>
              Timeline
            </SectionTitle>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Start Date"
                required
              >
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    updateField(
                      "startDate",
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-[#181818] dark:text-white dark:caret-white dark:placeholder:text-white/30 dark:focus:border-white/30 dark:focus:bg-[#181818] dark:focus:text-white dark:focus:ring-white/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-white/5 dark:disabled:text-white/30"
                />
              </Field>

              <Field label="End Date">
                <input
                  type="date"
                  value={form.endDate}
                  disabled={form.isCurrent}
                  onChange={(e) =>
                    updateField(
                      "endDate",
                      e.target.value
                    )
                  }
                  className="input disabled:cursor-not-allowed disabled:opacity-50"
                />
              </Field>
            </div>

            <button
              type="button"
              onClick={() =>
                updateField(
                  "isCurrent",
                  !form.isCurrent
                )
              }
              className={`mt-5 flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                form.isCurrent
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/10"
                  : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]"
              }`}
            >
              <div>
                <p className="text-sm font-bold">
                  Current position
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Mark this experience as
                  the current role.
                </p>
              </div>

              <div
                className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
                  form.isCurrent
                    ? "bg-emerald-500"
                    : "bg-slate-300 dark:bg-white/20"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${
                    form.isCurrent
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Description */}

          <div className="mt-8">
            <SectionTitle>
              Description
            </SectionTitle>

            <textarea
              value={form.description}
              onChange={(e) =>
                updateField(
                  "description",
                  e.target.value
                )
              }
              rows={5}
              placeholder="Write a short professional description..."
              className=" w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-normal leading-6 text-black caret-black outline-none transition placeholder:text-black/35 focus:border-black/30 focus:bg-white focus:text-black focus:ring-0 dark:border-white/10 dark:bg-[#181818] dark:text-white dark:caret-white dark:placeholder:text-white/30 dark:focus:border-white/30 dark:focus:bg-[#181818] dark:focus:text-white"
            />
          </div>

          {/* Responsibilities */}

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle>
                Responsibilities
              </SectionTitle>

              <button
                type="button"
                onClick={() =>
                  addArrayItem(
                    "responsibilities"
                  )
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <Plus size={14} />
                Add item
              </button>
            </div>

            <div className="space-y-3">
              {form.responsibilities.map(
                (
                  responsibility,
                  index
                ) => (
                  <div
                    key={index}
                    className="flex gap-2"
                  >
                    <input
                      value={
                        responsibility
                      }
                      onChange={(e) =>
                        updateArrayItem(
                          "responsibilities",
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`Responsibility ${
                        index + 1
                      }`}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-[#181818] dark:text-white dark:caret-white dark:placeholder:text-white/30 dark:focus:border-white/30 dark:focus:bg-[#181818] dark:focus:text-white dark:focus:ring-white/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-white/5 dark:disabled:text-white/30"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeArrayItem(
                          "responsibilities",
                          index
                        )
                      }
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-100 text-red-500 hover:bg-red-50 dark:border-red-400/10 dark:hover:bg-red-400/10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Technologies */}

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle>
                Technologies
              </SectionTitle>

              <button
                type="button"
                onClick={() =>
                  addArrayItem(
                    "technologies"
                  )
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <Plus size={14} />
                Add technology
              </button>
            </div>

            <div className="space-y-3">
              {form.technologies.map(
                (
                  technology,
                  index
                ) => (
                  <div
                    key={index}
                    className="flex gap-2"
                  >
                    <input
                      value={technology}
                      onChange={(e) =>
                        updateArrayItem(
                          "technologies",
                          index,
                          e.target.value
                        )
                      }
                      placeholder={`Technology ${
                        index + 1
                      }`}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-[#181818] dark:text-white dark:caret-white dark:placeholder:text-white/30 dark:focus:border-white/30 dark:focus:bg-[#181818] dark:focus:text-white dark:focus:ring-white/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-white/5 dark:disabled:text-white/30"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeArrayItem(
                          "technologies",
                          index
                        )
                      }
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-red-100 text-red-500 hover:bg-red-50 dark:border-red-400/10 dark:hover:bg-red-400/10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Settings */}

          <div className="mt-8">
            <SectionTitle>
              Settings
            </SectionTitle>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Display Order">
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    updateField(
                      "order",
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 caret-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:text-slate-900 focus:ring-2 focus:ring-slate-900/10 dark:border-white/10 dark:bg-[#181818] dark:text-white dark:caret-white dark:placeholder:text-white/30 dark:focus:border-white/30 dark:focus:bg-[#181818] dark:focus:text-white dark:focus:ring-white/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-white/5 dark:disabled:text-white/30"
                />
              </Field>

              <Field label="Visibility">
                <button
                  type="button"
                  onClick={() =>
                    updateField(
                      "isActive",
                      !form.isActive
                    )
                  }
                  className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm font-bold ${
                    form.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400"
                      : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5"
                  }`}
                >
                  <span>
                    {form.isActive
                      ? "Published"
                      : "Hidden"}
                  </span>

                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      form.isActive
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />
                </button>
              </Field>
            </div>
          </div>

          {/* Actions */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {loading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  {editing
                    ? "Update Experience"
                    : "Create Experience"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================================================
   Section Title
===================================================== */

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-4 text-xs font-black uppercase tracking-[0.17em] text-slate-400">
      {children}
    </h3>
  );
}

/* =====================================================
   Field
===================================================== */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

/* =====================================================
   Delete Modal
===================================================== */

function DeleteModal({
  experience,
  onClose,
  onConfirm,
  loading,
}: {
  experience: Experience;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-400/10">
          <Trash2 size={21} />
        </div>

        <h2 className="mt-5 text-xl font-black">
          Delete experience?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Are you sure you want to delete{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {experience.position}
          </span>{" "}
          at{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {experience.company}
          </span>
          ?
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}

            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   Loading
===================================================== */

function LoadingState() {
  return (
    <div className="space-y-5">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="h-[300px] animate-pulse rounded-[28px] border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
        />
      ))}
    </div>
  );
}

/* =====================================================
   Error
===================================================== */

function ErrorState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-red-100 bg-white p-10 text-center dark:border-red-400/10 dark:bg-slate-900">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-400/10">
        <BriefcaseBusiness
          size={23}
        />
      </div>

      <h3 className="mt-4 text-lg font-black">
        Unable to load experiences
      </h3>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Something went wrong while
        loading your professional
        history.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-slate-900"
      >
        Try again
      </button>
    </div>
  );
}

/* =====================================================
   Empty
===================================================== */

function EmptyState({
  hasFilters,
  onCreate,
}: {
  hasFilters: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center dark:border-white/10 dark:bg-slate-900">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
        <BriefcaseBusiness
          size={25}
        />
      </div>

      <h3 className="mt-5 text-lg font-black">
        {hasFilters
          ? "No matching experience"
          : "No experience yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {hasFilters
          ? "Try changing your search or status filter."
          : "Start building the professional journey."}
      </p>

      {!hasFilters && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-slate-900"
        >
          <Plus size={16} />
          Add Experience
        </button>
      )}
    </div>
  );
}
