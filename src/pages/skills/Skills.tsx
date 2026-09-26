 
import {
  useMemo,
  useState,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react";

import {
  Activity,
  BarChart3,
  Check,
  ChevronDown,
  Code2,
  Edit3,
  Image,
  Layers3,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import { toast } from "sonner";

import {
  useCreateSkillMutation,
  useDeleteSkillMutation,
  useGetAllSkillsQuery,
  useUpdateSkillMutation,
  type Skill,
} from "../../redux/features/skills/skillApi";

/* =====================================================
   Types
===================================================== */

interface SkillFormState {
  name: string;
  slug: string;
  category: string;
  icon: string;
  proficiency: string;
  experience: string;
  order: string;
  isActive: boolean;
}

type StatusFilter =
  | "all"
  | "active"
  | "inactive";

/* =====================================================
   Initial Form
===================================================== */

const initialForm: SkillFormState = {
  name: "",
  slug: "",
  category: "",
  icon: "",
  proficiency: "80",
  experience: "",
  order: "0",
  isActive: true,
};

/* =====================================================
   Helpers
===================================================== */

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getErrorMessage = (error: unknown) => {
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

    return data?.message || "Something went wrong";
  }

  return "Something went wrong";
};

/* =====================================================
   Main Skills Page
===================================================== */

export default function Skills() {
  const {
    data: skills = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllSkillsQuery();

  const [createSkill, { isLoading: creating }] =
    useCreateSkillMutation();

  const [updateSkill, { isLoading: updating }] =
    useUpdateSkillMutation();

  const [deleteSkill, { isLoading: deleting }] =
    useDeleteSkillMutation();

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [editingSkill, setEditingSkill] =
    useState<Skill | null>(null);

  const [deletingSkill, setDeletingSkill] =
    useState<Skill | null>(null);

  const [form, setForm] =
    useState<SkillFormState>(initialForm);

  /* =====================================================
     Categories
  ===================================================== */

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        skills
          .map((skill) => skill.category)
          .filter(Boolean)
      )
    ).sort();
  }, [skills]);

  /* =====================================================
     Filtered Skills
  ===================================================== */

  const filteredSkills = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return skills
      .filter((skill) => {
        const matchesSearch =
          !query ||
          skill.name
            .toLowerCase()
            .includes(query) ||
          skill.category
            .toLowerCase()
            .includes(query) ||
          skill.experience
            ?.toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active"
            ? skill.isActive
            : !skill.isActive);

        const matchesCategory =
          categoryFilter === "all" ||
          skill.category === categoryFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCategory
        );
      })
      .sort(
        (a, b) =>
          (a.order ?? 0) -
          (b.order ?? 0)
      );
  }, [
    skills,
    search,
    statusFilter,
    categoryFilter,
  ]);

  /* =====================================================
     Stats
  ===================================================== */

  const stats = useMemo(() => {
    const total = skills.length;

    const active = skills.filter(
      (skill) => skill.isActive
    ).length;

    const inactive = total - active;

    const average =
      total > 0
        ? Math.round(
            skills.reduce(
              (sum, skill) =>
                sum +
                (skill.proficiency ?? 0),
              0
            ) / total
          )
        : 0;

    return {
      total,
      active,
      inactive,
      average,
    };
  }, [skills]);

  /* =====================================================
     Create Modal
  ===================================================== */

  const openCreateModal = () => {
    setEditingSkill(null);
    setForm({ ...initialForm });
    setModalOpen(true);
  };

  /* =====================================================
     Edit Modal
  ===================================================== */

  const openEditModal = (skill: Skill) => {
    setEditingSkill(skill);

    setForm({
      name: skill.name || "",
      slug: skill.slug || "",
      category: skill.category || "",
      icon: skill.icon || "",
      proficiency: String(
        skill.proficiency ?? 80
      ),
      experience: skill.experience || "",
      order: String(skill.order ?? 0),
      isActive: skill.isActive,
    });

    setModalOpen(true);
  };

  /* =====================================================
     Close Modal
  ===================================================== */

  const closeModal = () => {
    if (creating || updating) return;

    setModalOpen(false);
    setEditingSkill(null);
    setForm({ ...initialForm });
  };

  /* =====================================================
     Name Change
  ===================================================== */

  const handleNameChange = (
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: editingSkill
        ? prev.slug
        : slugify(value),
    }));
  };

  /* =====================================================
     Submit
  ===================================================== */

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error(
        "Skill name is required"
      );
      return;
    }

    if (!form.category.trim()) {
      toast.error(
        "Skill category is required"
      );
      return;
    }

    const proficiency = Math.min(
      100,
      Math.max(
        0,
        Number(form.proficiency) || 0
      )
    );

    const order =
      Number(form.order) || 0;

    const payload = {
      name: form.name.trim(),
      slug:
        form.slug.trim() ||
        slugify(form.name),
      category:
        form.category.trim(),
      icon: form.icon.trim() || undefined,
      proficiency,
      experience:
        form.experience.trim() ||
        undefined,
      order,
      isActive: form.isActive,
    };

    try {
      if (editingSkill) {
        await updateSkill({
          id: editingSkill._id,
          body: payload,
        }).unwrap();

        toast.success(
          "Skill updated successfully"
        );
      } else {
        await createSkill(
          payload
        ).unwrap();

        toast.success(
          "Skill created successfully"
        );
      }

      closeModal();
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    }
  };

  /* =====================================================
     Delete
  ===================================================== */

  const handleDelete = async () => {
    if (!deletingSkill) return;

    try {
      await deleteSkill(
        deletingSkill._id
      ).unwrap();

      toast.success(
        "Skill deleted successfully"
      );

      setDeleteOpen(false);
      setDeletingSkill(null);
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    }
  };

  /* =====================================================
     Toggle Status
  ===================================================== */

  const toggleSkillStatus = async (
    skill: Skill
  ) => {
    try {
      await updateSkill({
        id: skill._id,
        body: {
          isActive: !skill.isActive,
        },
      }).unwrap();

      toast.success(
        skill.isActive
          ? "Skill deactivated"
          : "Skill activated"
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    }
  };

  /* =====================================================
     Render
  ===================================================== */

  return (
    <div className="min-h-full bg-slate-50/80 p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* =====================================================
            Header
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-8">

          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="mb-3 flex items-center gap-2">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <Sparkles size={17} />
                </div>

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  Creative Skills
                </span>

              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Skills Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Manage Sumaiya&apos;s creative
                skills, proficiency levels,
                categories, icons and visibility.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <Plus size={18} />
              Add Skill
            </button>

          </div>
        </section>

        {/* =====================================================
            Stats
        ===================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            icon={<Layers3 size={19} />}
            label="Total Skills"
            value={stats.total}
            description="All skills"
          />

          <StatCard
            icon={<Check size={19} />}
            label="Active"
            value={stats.active}
            description="Visible publicly"
          />

          <StatCard
            icon={<Activity size={19} />}
            label="Inactive"
            value={stats.inactive}
            description="Currently hidden"
          />

          <StatCard
            icon={<BarChart3 size={19} />}
            label="Average"
            value={`${stats.average}%`}
            description="Overall proficiency"
          />

        </section>

        {/* =====================================================
            Toolbar
        ===================================================== */}

        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-5">

          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="relative w-full xl:max-w-md">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search skills..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:bg-white dark:border-white/10 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white/30 dark:focus:bg-slate-950"
              />

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              {/* Category */}

              <SelectFilter
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  {
                    label: "All categories",
                    value: "all",
                  },
                  ...categories.map(
                    (category) => ({
                      label: category,
                      value: category,
                    })
                  ),
                ]}
              />

              {/* Status */}

              <SelectFilter<StatusFilter>
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  {
                    label: "All status",
                    value: "all",
                  },
                  {
                    label: "Active",
                    value: "active",
                  },
                  {
                    label: "Inactive",
                    value: "inactive",
                  },
                ]}
              />

            </div>
          </div>
        </section>

        {/* =====================================================
            Content
        ===================================================== */}

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState
            onRetry={refetch}
          />
        ) : filteredSkills.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search) ||
              categoryFilter !==
                "all" ||
              statusFilter !==
                "all"
            }
            onCreate={openCreateModal}
          />
        ) : (
          <section className="relative">

            {isFetching && (
              <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
                <Loader2
                  size={13}
                  className="animate-spin"
                />
                Updating
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">

              {filteredSkills.map(
                (skill) => (
                  <SkillCard
                    key={skill._id}
                    skill={skill}
                    onEdit={() =>
                      openEditModal(
                        skill
                      )
                    }
                    onDelete={() => {
                      setDeletingSkill(
                        skill
                      );

                      setDeleteOpen(
                        true
                      );
                    }}
                    onToggle={() =>
                      toggleSkillStatus(
                        skill
                      )
                    }
                  />
                )
              )}

            </div>
          </section>
        )}
      </div>

      {/* =====================================================
          Create / Edit Modal
      ===================================================== */}

      {modalOpen && (
        <SkillModal
          editing={editingSkill}
          form={form}
          setForm={setForm}
          onNameChange={
            handleNameChange
          }
          onClose={closeModal}
          onSubmit={handleSubmit}
          loading={
            creating || updating
          }
        />
      )}

      {/* =====================================================
          Delete Modal
      ===================================================== */}

      {deleteOpen &&
        deletingSkill && (
          <DeleteModal
            skill={deletingSkill}
            onClose={() => {
              if (deleting) return;

              setDeleteOpen(false);
              setDeletingSkill(null);
            }}
            onConfirm={handleDelete}
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
  icon: ReactNode;
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

        <Zap
          size={15}
          className="text-slate-300 transition group-hover:text-slate-500 dark:text-slate-700 dark:group-hover:text-slate-400"
        />

      </div>

      <div className="mt-5">

        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-3xl font-black tracking-tight">
          {value}
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>

      </div>
    </div>
  );
}

/* =====================================================
   Skill Card
===================================================== */

function SkillCard({
  skill,
  onEdit,
  onDelete,
  onToggle,
}: {
  skill: Skill;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const proficiency = Math.min(
    100,
    Math.max(
      0,
      skill.proficiency ?? 0
    )
  );

  return (
    <article className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900">

      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-4">

        <div className="flex min-w-0 items-center gap-4">

          {/* Icon */}

          <div
            title={skill.name}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5"
          >
            {skill.icon ? (
              <img
                src={skill.icon}
                alt={`${skill.name} icon`}
                className="h-8 w-8 object-contain"
                loading="lazy"
              />
            ) : (
              <Code2
                size={22}
                className="text-slate-400"
              />
            )}
          </div>

          {/* No skill name shown */}

          <div className="min-w-0">

            <p className="truncate text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
              {skill.category}
            </p>

            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {skill.proficiency ?? 0}%
              proficiency
            </p>

          </div>

        </div>

        <StatusBadge
          active={skill.isActive}
        />

      </div>

      {/* Proficiency */}

      <div className="relative mt-6">

        <div className="mb-2 flex items-center justify-between">

          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Proficiency
          </span>

          <span className="text-sm font-black">
            {proficiency}%
          </span>

        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">

          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-700 dark:bg-white"
            style={{
              width: `${proficiency}%`,
            }}
          />

        </div>
      </div>

      {/* Information */}

      <div className="relative mt-5 grid grid-cols-2 gap-3">

        <InfoBox
          label="Experience"
          value={
            skill.experience ||
            "Not specified"
          }
        />

        <InfoBox
          label="Order"
          value={String(
            skill.order ?? 0
          )}
        />

      </div>

      {/* Actions */}

      <div className="relative mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 dark:border-white/10">

        <button
          type="button"
          onClick={onToggle}
          className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-bold transition ${
            skill.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-400"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              skill.isActive
                ? "bg-emerald-500"
                : "bg-slate-400"
            }`}
          />

          {skill.isActive
            ? "Active"
            : "Inactive"}
        </button>

        <div className="ml-auto flex gap-2">

          <button
            type="button"
            onClick={onEdit}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
            title="Edit skill"
          >
            <Edit3 size={15} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50 dark:border-red-400/10 dark:hover:bg-red-400/10"
            title="Delete skill"
          >
            <Trash2 size={15} />
          </button>

        </div>
      </div>
    </article>
  );
}

/* =====================================================
   Info Box
===================================================== */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3 dark:bg-white/5">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-bold text-slate-700 dark:text-slate-200">
        {value}
      </p>

    </div>
  );
}

/* =====================================================
   Status Badge
===================================================== */

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
          : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
      }`}
    >

      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-slate-400"
        }`}
      />

      {active ? "Active" : "Hidden"}

    </span>
  );
}

/* =====================================================
   Generic Select Filter
===================================================== */

function SelectFilter<
  T extends string = string
>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: Dispatch<
    SetStateAction<T>
  >;
  options: {
    label: string;
    value: T;
  }[];
}) {
  return (
    <div className="relative">

      <select
        value={value}
        onChange={(event) => {
          onChange(
            event.target.value as T
          );
        }}
        className="h-12 min-w-[160px] appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-10 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 dark:border-white/10 dark:bg-slate-950 dark:text-white dark:focus:border-white/30"
      >

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
          >
            {option.label}
          </option>
        ))}

      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
      />

    </div>
  );
}

/* =====================================================
   Skill Modal
===================================================== */

function SkillModal({
  editing,
  form,
  setForm,
  onNameChange,
  onClose,
  onSubmit,
  loading,
}: {
  editing: Skill | null;
  form: SkillFormState;
  setForm: Dispatch<
    SetStateAction<SkillFormState>
  >;
  onNameChange: (
    value: string
  ) => void;
  onClose: () => void;
  onSubmit: (
    event: FormEvent
  ) => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-white/10">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              {editing
                ? "Edit skill"
                : "New skill"}
            </p>

            <h2 className="mt-1 text-xl font-black">
              {editing
                ? "Update Skill"
                : "Add New Skill"}
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X size={19} />
          </button>

        </div>

        {/* Form */}

        <form
          onSubmit={onSubmit}
          className="overflow-y-auto p-6"
        >

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Name */}

            <Field
              label="Skill name"
              required
            >
              <input
                value={form.name}
                onChange={(e) =>
                  onNameChange(
                    e.target.value
                  )
                }
                placeholder="e.g. Photoshop"
                className="input"
              />
            </Field>

            {/* Slug */}

            <Field label="Slug">
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    slug: e.target.value,
                  }))
                }
                placeholder="photoshop"
                className="input"
              />
            </Field>

            {/* Category */}

            <Field
              label="Category"
              required
            >
              <input
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    category:
                      e.target.value,
                  }))
                }
                placeholder="e.g. Design"
                className="input"
              />
            </Field>

            {/* Icon */}

            <Field label="Skill Icon URL">

              <div className="relative">

                <Image
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="url"
                  value={form.icon}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      icon: e.target.value,
                    }))
                  }
                  placeholder="https://cdn.simpleicons.org/adobephotoshop"
                  className="input pl-11"
                />

              </div>

              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                Add a direct image or SVG icon URL.
              </p>

            </Field>

            {/* Proficiency */}

            <Field label="Proficiency (%)">

              <input
                type="number"
                min={0}
                max={100}
                value={
                  form.proficiency
                }
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    proficiency:
                      e.target.value,
                  }))
                }
                className="input"
              />

            </Field>

            {/* Experience */}

            <Field label="Experience">

              <input
                value={form.experience}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    experience:
                      e.target.value,
                  }))
                }
                placeholder="e.g. 4+ Years"
                className="input"
              />

            </Field>

            {/* Order */}

            <Field label="Display order">

              <input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    order:
                      e.target.value,
                  }))
                }
                className="input"
              />

            </Field>

            {/* Visibility */}

            <Field label="Visibility">

              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    isActive:
                      !prev.isActive,
                  }))
                }
                className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm font-bold transition ${
                  form.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400"
                    : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                }`}
              >

                <span>
                  {form.isActive
                    ? "Visible"
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

          {/* =====================================================
              Icon Preview
          ===================================================== */}

          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">

            <div className="mb-3 flex items-center gap-2">

              <Image
                size={15}
                className="text-slate-400"
              />

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Icon Preview
              </p>

            </div>

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/10">

                {form.icon ? (
                  <img
                    src={form.icon}
                    alt={
                      form.name ||
                      "Skill icon"
                    }
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <Code2
                    size={22}
                    className="text-slate-400"
                  />
                )}

              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-black">
                  {form.name ||
                    "Skill preview"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {form.category ||
                    "Category"}
                  {" • "}
                  {form.proficiency ||
                    0}
                  %
                </p>

                {form.icon && (
                  <p className="mt-1 max-w-md truncate text-[10px] text-slate-400">
                    {form.icon}
                  </p>
                )}

              </div>

            </div>
          </div>

          {/* Actions */}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
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
                    ? "Update Skill"
                    : "Create Skill"}
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
   Field
===================================================== */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
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
  skill,
  onClose,
  onConfirm,
  loading,
}: {
  skill: Skill;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-400/10">
          <Trash2 size={21} />
        </div>

        <h2 className="mt-5 text-xl font-black">
          Delete skill?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">

          Are you sure you want to delete{" "}

          <span className="font-bold text-slate-900 dark:text-white">
            {skill.name}
          </span>

          ? This action cannot be undone.

        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
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
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">

      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="h-[280px] animate-pulse rounded-[26px] border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
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
        <Activity size={23} />
      </div>

      <h3 className="mt-4 text-lg font-black">
        Unable to load skills
      </h3>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Something went wrong while
        loading your skills.
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
        <Layers3 size={25} />
      </div>

      <h3 className="mt-5 text-lg font-black">

        {hasFilters
          ? "No matching skills"
          : "No skills yet"}

      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">

        {hasFilters
          ? "Try changing your search or filters."
          : "Start building your creative skills library."}

      </p>

      {!hasFilters && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-slate-900"
        >
          <Plus size={16} />
          Add Skill
        </button>
      )}

    </div>
  );
}


 

 