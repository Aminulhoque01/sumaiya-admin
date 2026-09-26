 
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
} from "react";

import {
  Award,
  Check,
  ChevronDown,
  Edit3,
  ImagePlus,
  Loader2,
  MessageSquareQuote,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  useCreateTestimonialMutation,
  useDeleteTestimonialMutation,
  useGetAllTestimonialsQuery,
  useUpdateTestimonialMutation,
  type Testimonial,
} from "../../redux/features/testimonials/testimonialApi";

/* =====================================================
   Types
===================================================== */

interface TestimonialForm {
  name: string;
  role: string;
  company: string;
  message: string;
  rating: string;
  project: string;
  order: string;
  isActive: boolean;
  isFeatured: boolean;
}

type StatusFilter = "all" | "active" | "inactive";

type FeaturedFilter = "all" | "featured" | "normal";

/* =====================================================
   Constants
===================================================== */

const emptyForm: TestimonialForm = {
  name: "",
  role: "",
  company: "",
  message: "",
  rating: "5",
  project: "",
  order: "0",
  isActive: true,
  isFeatured: false,
};

/* =====================================================
   Error Helper
===================================================== */

const getErrorMessage = (error: unknown): string => {
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

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

/* =====================================================
   Main Component
===================================================== */

export default function Testimonials() {
  const {
    data: testimonials = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAllTestimonialsQuery();

  const [createTestimonial, { isLoading: creating }] =
    useCreateTestimonialMutation();

  const [updateTestimonial, { isLoading: updating }] =
    useUpdateTestimonialMutation();

  const [deleteTestimonial, { isLoading: deleting }] =
    useDeleteTestimonialMutation();

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [featuredFilter, setFeaturedFilter] =
    useState<FeaturedFilter>("all");

  const [modalOpen, setModalOpen] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);

  const [deletingTestimonial, setDeletingTestimonial] =
    useState<Testimonial | null>(null);

  const [form, setForm] =
    useState<TestimonialForm>(emptyForm);

  const [avatarFile, setAvatarFile] =
    useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  /* =====================================================
     Filtered Testimonials
  ===================================================== */

  const filteredTestimonials = useMemo(() => {
    const query = search.trim().toLowerCase();

    return testimonials
      .filter((testimonial) => {
        const matchesSearch =
          !query ||
          testimonial.name
            ?.toLowerCase()
            .includes(query) ||
          testimonial.role
            ?.toLowerCase()
            .includes(query) ||
          testimonial.company
            ?.toLowerCase()
            .includes(query) ||
          testimonial.project
            ?.toLowerCase()
            .includes(query) ||
          testimonial.message
            ?.toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active"
            ? testimonial.isActive
            : !testimonial.isActive);

        const matchesFeatured =
          featuredFilter === "all" ||
          (featuredFilter === "featured"
            ? testimonial.isFeatured
            : !testimonial.isFeatured);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesFeatured
        );
      })
      .sort(
        (a, b) =>
          (a.order ?? 0) -
          (b.order ?? 0)
      );
  }, [
    testimonials,
    search,
    statusFilter,
    featuredFilter,
  ]);

  /* =====================================================
     Stats
  ===================================================== */

  const stats = useMemo(() => {
    const total = testimonials.length;

    const active = testimonials.filter(
      (item) => item.isActive
    ).length;

    const featured = testimonials.filter(
      (item) => item.isFeatured
    ).length;

    const inactive = total - active;

    return {
      total,
      active,
      featured,
      inactive,
    };
  }, [testimonials]);

  /* =====================================================
     Modal Helpers
  ===================================================== */

  const openCreateModal = () => {
    setEditingTestimonial(null);
    setForm({ ...emptyForm });
    setAvatarFile(null);
    setAvatarPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setModalOpen(true);
  };

  const openEditModal = (
    testimonial: Testimonial
  ) => {
    setEditingTestimonial(testimonial);

    setForm({
      name: testimonial.name || "",
      role: testimonial.role || "",
      company: testimonial.company || "",
      message: testimonial.message || "",
      rating: String(
        testimonial.rating ?? 5
      ),
      project: testimonial.project || "",
      order: String(
        testimonial.order ?? 0
      ),
      isActive: testimonial.isActive,
      isFeatured: testimonial.isFeatured,
    });

    setAvatarFile(null);

    setAvatarPreview(
      testimonial.avatar?.url || null
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    if (creating || updating) return;

    setModalOpen(false);
    setEditingTestimonial(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setForm({ ...emptyForm });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     Avatar
  ===================================================== */

  const handleAvatarChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setAvatarFile(file);
    setAvatarPreview(previewUrl);
  };

  const removeAvatar = () => {
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(null);
    setAvatarPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =====================================================
     Submit
  ===================================================== */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Client name is required.");
      return;
    }

    if (!form.message.trim()) {
      toast.error(
        "Testimonial message is required."
      );
      return;
    }

    const rating = Number(form.rating);

    if (
      Number.isNaN(rating) ||
      rating < 0 ||
      rating > 5
    ) {
      toast.error(
        "Rating must be between 0 and 5."
      );
      return;
    }

    const order = Number(form.order);

    const payload = {
      name: form.name.trim(),

      role:
        form.role.trim() || undefined,

      company:
        form.company.trim() || undefined,

      message:
        form.message.trim(),

      rating,

      project:
        form.project.trim() || undefined,

      order:
        Number.isNaN(order) ? 0 : order,

      isActive:
        form.isActive,

      isFeatured:
        form.isFeatured,
    };

    const formData = new FormData();

    formData.append(
      "data",
      JSON.stringify(payload)
    );

    if (avatarFile) {
      formData.append(
        "avatar",
        avatarFile
      );
    }

    try {
      if (editingTestimonial) {
        await updateTestimonial({
          id: editingTestimonial._id,
          body: formData,
        }).unwrap();

        toast.success(
          "Testimonial updated successfully."
        );
      } else {
        await createTestimonial(
          formData
        ).unwrap();

        toast.success(
          "Testimonial created successfully."
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
    if (!deletingTestimonial) {
      return;
    }

    try {
      await deleteTestimonial(
        deletingTestimonial._id
      ).unwrap();

      toast.success(
        "Testimonial deleted successfully."
      );

      setDeleteOpen(false);
      setDeletingTestimonial(null);
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    }
  };

  /* =====================================================
     Toggle Active
  ===================================================== */

  const toggleActive = async (
    testimonial: Testimonial
  ) => {
    const formData = new FormData();

    formData.append(
      "data",
      JSON.stringify({
        isActive:
          !testimonial.isActive,
      })
    );

    try {
      await updateTestimonial({
        id: testimonial._id,
        body: formData,
      }).unwrap();

      toast.success(
        testimonial.isActive
          ? "Testimonial hidden."
          : "Testimonial activated."
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    }
  };

  /* =====================================================
     Toggle Featured
  ===================================================== */

  const toggleFeatured = async (
    testimonial: Testimonial
  ) => {
    const formData = new FormData();

    formData.append(
      "data",
      JSON.stringify({
        isFeatured:
          !testimonial.isFeatured,
      })
    );

    try {
      await updateTestimonial({
        id: testimonial._id,
        body: formData,
      }).unwrap();

      toast.success(
        testimonial.isFeatured
          ? "Removed from featured."
          : "Added to featured."
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
    <div className="min-h-full bg-[#f6f7fb] p-4 text-slate-950 transition-colors dark:bg-[#070b14] dark:text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-7">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] dark:border-white/[0.08] dark:bg-[#0d1320]">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-950">
                  <MessageSquareQuote size={19} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                    Client Stories
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Social proof management
                  </p>
                </div>
              </div>

              <h1 className="text-3xl font-black tracking-[-0.03em] sm:text-4xl">
                Testimonials
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Manage client feedback, ratings,
                avatars and featured stories from
                one beautiful dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="group inline-flex h-13 items-center justify-center gap-2.5 rounded-2xl bg-slate-950 px-6 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:bg-white dark:text-slate-950"
            >
              <Plus
                size={18}
                className="transition-transform duration-300 group-hover:rotate-90"
              />

              Add Testimonial
            </button>
          </div>
        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={
              <MessageSquareQuote size={19} />
            }
            label="Total"
            value={stats.total}
            description="Client stories"
          />

          <StatCard
            icon={<Check size={19} />}
            label="Active"
            value={stats.active}
            description="Visible publicly"
          />

          <StatCard
            icon={<Award size={19} />}
            label="Featured"
            value={stats.featured}
            description="Highlighted stories"
          />

          <StatCard
            icon={<Star size={19} />}
            label="Inactive"
            value={stats.inactive}
            description="Hidden testimonials"
          />
        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.25)] dark:border-white/[0.08] dark:bg-[#0d1320] sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            <div className="relative w-full xl:max-w-2xl">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search client, role, company, project..."
                className="admin-input h-12 w-full rounded-2xl pl-11 pr-12"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PremiumSelect
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(
                    value as StatusFilter
                  )
                }
                options={[
                  {
                    value: "all",
                    label: "All status",
                  },
                  {
                    value: "active",
                    label: "Active",
                  },
                  {
                    value: "inactive",
                    label: "Inactive",
                  },
                ]}
              />

              <PremiumSelect
                value={featuredFilter}
                onChange={(value) =>
                  setFeaturedFilter(
                    value as FeaturedFilter
                  )
                }
                options={[
                  {
                    value: "all",
                    label: "All testimonials",
                  },
                  {
                    value: "featured",
                    label: "Featured",
                  },
                  {
                    value: "normal",
                    label: "Normal",
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : filteredTestimonials.length === 0 ? (
          <EmptyState
            hasFilters={
              Boolean(search) ||
              statusFilter !== "all" ||
              featuredFilter !== "all"
            }
            onCreate={openCreateModal}
          />
        ) : (
          <section className="relative">
            {isFetching && (
              <div className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-xs font-black text-slate-500 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/95 dark:text-slate-300">
                <Loader2
                  size={13}
                  className="animate-spin"
                />

                Updating
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {filteredTestimonials.map(
                (testimonial, index) => (
                  <TestimonialCard
                    key={testimonial._id}
                    testimonial={testimonial}
                    index={index}
                    onEdit={() =>
                      openEditModal(
                        testimonial
                      )
                    }
                    onDelete={() => {
                      setDeletingTestimonial(
                        testimonial
                      );

                      setDeleteOpen(true);
                    }}
                    onToggleActive={() =>
                      toggleActive(
                        testimonial
                      )
                    }
                    onToggleFeatured={() =>
                      toggleFeatured(
                        testimonial
                      )
                    }
                  />
                )
              )}
            </div>
          </section>
        )}
      </div>

      {/* =================================================
          TESTIMONIAL MODAL
      ================================================= */}

      {modalOpen && (
        <TestimonialModal
          editing={editingTestimonial}
          form={form}
          setForm={setForm}
          avatarPreview={avatarPreview}
          avatarFile={avatarFile}
          fileInputRef={fileInputRef}
          onAvatarChange={handleAvatarChange}
          onRemoveAvatar={removeAvatar}
          onClose={closeModal}
          onSubmit={handleSubmit}
          loading={creating || updating}
        />
      )}

      {/* =================================================
          DELETE MODAL
      ================================================= */}

      {deleteOpen &&
        deletingTestimonial && (
          <DeleteModal
            testimonial={deletingTestimonial}
            onClose={() => {
              if (deleting) return;

              setDeleteOpen(false);
              setDeletingTestimonial(null);
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
  value: number;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-5 shadow-[0_15px_45px_-35px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/[0.08] dark:bg-[#0d1320]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-slate-900/[0.025] blur-2xl dark:bg-white/[0.025]" />

      <div className="relative flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/[0.07] dark:text-white">
          {icon}
        </div>

        <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-white/20" />
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-3xl font-black tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =====================================================
   Premium Select
===================================================== */

function PremiumSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="admin-input h-12 min-w-[170px] appearance-none cursor-pointer px-4 pr-10 text-xs font-bold"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

/* =====================================================
   Testimonial Card
===================================================== */

function TestimonialCard({
  testimonial,
  index,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
}: {
  testimonial: Testimonial;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onToggleFeatured: () => void;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/[0.08] dark:bg-[#0d1320] sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-500/[0.055] blur-3xl" />

      <div className="relative">

        {/* Top */}

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            {testimonial.avatar?.url ? (
              <img
                src={testimonial.avatar.url}
                alt={
                  testimonial.avatar.alt ||
                  testimonial.name
                }
                className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm ring-4 ring-slate-100 dark:ring-white/[0.05]"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg font-black text-slate-500 dark:bg-white/[0.07] dark:text-slate-300">
                {testimonial.name
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <h2 className="truncate text-base font-black">
                {testimonial.name}
              </h2>

              <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                {[
                  testimonial.role,
                  testimonial.company,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Client"}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-400">
            #{String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Rating */}

        <div className="mt-5 flex items-center gap-1">
          {Array.from({ length: 5 }).map(
            (_, starIndex) => {
              const rating =
                testimonial.rating ?? 0;

              const filled =
                starIndex < rating;

              return (
                <Star
                  key={starIndex}
                  size={15}
                  className={
                    filled
                      ? "fill-current text-amber-400"
                      : "text-slate-200 dark:text-slate-700"
                  }
                />
              );
            }
          )}

          <span className="ml-2 text-xs font-black text-slate-400">
            {testimonial.rating ?? 0}/5
          </span>
        </div>

        {/* Message */}

        <div className="relative mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-white/[0.05] dark:bg-white/[0.025]">
          <span className="absolute -left-1 -top-4 text-6xl font-black leading-none text-slate-200 dark:text-white/[0.07]">
            “
          </span>

          <p className="relative text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">
            {testimonial.message}
          </p>
        </div>

        {/* Meta */}

        <div className="mt-4 flex flex-wrap gap-2">
          {testimonial.project && (
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-500 dark:border-white/[0.07] dark:bg-white/[0.035] dark:text-slate-400">
              Project: {testimonial.project}
            </span>
          )}

          <span
            className={`rounded-xl px-3 py-1.5 text-[11px] font-black ${
              testimonial.isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-400"
            }`}
          >
            {testimonial.isActive
              ? "Published"
              : "Hidden"}
          </span>

          {testimonial.isFeatured && (
            <span className="rounded-xl bg-amber-50 px-3 py-1.5 text-[11px] font-black text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
              Featured
            </span>
          )}
        </div>

        {/* Actions */}

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-white/[0.07]">
          <button
            type="button"
            onClick={onToggleActive}
            className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-black transition ${
              testimonial.isActive
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-400 dark:hover:bg-emerald-400/15"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/[0.05] dark:text-slate-400 dark:hover:bg-white/10"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                testimonial.isActive
                  ? "bg-emerald-500"
                  : "bg-slate-400"
              }`}
            />

            {testimonial.isActive
              ? "Active"
              : "Inactive"}
          </button>

          <button
            type="button"
            onClick={onToggleFeatured}
            className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-black transition ${
              testimonial.isFeatured
                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-400/10 dark:text-amber-400"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/[0.05] dark:text-slate-400 dark:hover:bg-white/10"
            }`}
          >
            <Star
              size={13}
              className={
                testimonial.isFeatured
                  ? "fill-current"
                  : ""
              }
            />

            {testimonial.isFeatured
              ? "Featured"
              : "Feature"}
          </button>

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-black text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/[0.08] dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
            >
              <Edit3 size={14} />
              Edit
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-100 px-3 text-xs font-black text-red-500 transition hover:bg-red-50 dark:border-red-400/10 dark:hover:bg-red-400/10"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =====================================================
   Testimonial Modal
===================================================== */

function TestimonialModal({
  editing,
  form,
  setForm,
  avatarPreview,
  avatarFile,
  fileInputRef,
  onAvatarChange,
  onRemoveAvatar,
  onClose,
  onSubmit,
  loading,
}: {
  editing: Testimonial | null;
  form: TestimonialForm;
  setForm: Dispatch<
    SetStateAction<TestimonialForm>
  >;
  avatarPreview: string | null;
  avatarFile: File | null;
  fileInputRef: RefObject<
    HTMLInputElement | null
  >;
  onAvatarChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  onRemoveAvatar: () => void;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
  loading: boolean;
}) {
  const updateField = <
    K extends keyof TestimonialForm
  >(
    field: K,
    value: TestimonialForm[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-md sm:p-5">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.45)] dark:border-white/[0.08] dark:bg-[#0b111d]">

        {/* Header */}

        <div className="relative flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-white/[0.07] sm:px-7">
          <div className="absolute -left-16 -top-20 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                {editing
                  ? "Edit testimonial"
                  : "New testimonial"}
              </p>
            </div>

            <h2 className="mt-1 text-xl font-black tracking-tight">
              {editing
                ? "Update Testimonial"
                : "Create Testimonial"}
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-400">
              Add polished client feedback to the portfolio.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:border-white/[0.08] dark:hover:bg-white/[0.05] dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}

        <form
          onSubmit={onSubmit}
          className="overflow-y-auto px-5 py-6 sm:px-7 sm:py-7"
        >
          {/* Avatar */}

          <div className="mb-8 rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-5 dark:border-white/[0.07] dark:bg-white/[0.025]">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Client Avatar
            </p>

            <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="h-24 w-24 rounded-[24px] object-cover shadow-lg ring-4 ring-white dark:ring-white/[0.05]"
                    />

                    {avatarFile && (
                      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                        <Check size={13} />
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white text-slate-400 dark:border-white/10 dark:bg-white/[0.03]">
                    <ImagePlus size={25} />
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onAvatarChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    <Upload size={16} />

                    {avatarFile
                      ? "Change Avatar"
                      : "Upload Avatar"}
                  </button>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={onRemoveAvatar}
                      className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-100 bg-white px-4 text-sm font-black text-red-500 transition hover:bg-red-50 dark:border-red-400/10 dark:bg-transparent dark:hover:bg-red-400/10"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  )}
                </div>

                <p className="mt-3 text-xs font-medium text-slate-400">
                  JPG, PNG or WebP · Maximum 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Client Information */}

          <div>
            <SectionHeading
              number="01"
              title="Client Information"
              description="Basic information about the client."
            />

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Name"
                required
              >
                <input
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Sarah Johnson"
                  autoComplete="off"
                  className="admin-input"
                />
              </Field>

              <Field label="Role">
                <input
                  value={form.role}
                  onChange={(event) =>
                    updateField(
                      "role",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Creative Director"
                  autoComplete="off"
                  className="admin-input"
                />
              </Field>

              <Field label="Company">
                <input
                  value={form.company}
                  onChange={(event) =>
                    updateField(
                      "company",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Acme Studio"
                  autoComplete="off"
                  className="admin-input"
                />
              </Field>

              <Field label="Project">
                <input
                  value={form.project}
                  onChange={(event) =>
                    updateField(
                      "project",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Brand Identity"
                  autoComplete="off"
                  className="admin-input"
                />
              </Field>
            </div>
          </div>

          {/* Testimonial */}

          <div className="mt-9">
            <SectionHeading
              number="02"
              title="Testimonial"
              description="Client feedback and display settings."
            />

            <div className="mt-5">
              <Field
                label="Message"
                required
              >
                <textarea
                  value={form.message}
                  onChange={(event) =>
                    updateField(
                      "message",
                      event.target.value
                    )
                  }
                  rows={6}
                  placeholder="Write the client's testimonial here..."
                  className="admin-input min-h-[150px] resize-none py-3.5 leading-7"
                />
              </Field>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Rating">
                <div className="relative">
                  <select
                    value={form.rating}
                    onChange={(event) =>
                      updateField(
                        "rating",
                        event.target.value
                      )
                    }
                    className="admin-input h-12 w-full appearance-none cursor-pointer pr-11"
                  >
                    <option value="0">
                      0 — No rating
                    </option>
                    <option value="1">
                      1 — ★
                    </option>
                    <option value="2">
                      2 — ★★
                    </option>
                    <option value="3">
                      3 — ★★★
                    </option>
                    <option value="4">
                      4 — ★★★★
                    </option>
                    <option value="5">
                      5 — ★★★★★
                    </option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </Field>

              <Field label="Display Order">
                <input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(event) =>
                    updateField(
                      "order",
                      event.target.value
                    )
                  }
                  placeholder="0"
                  className="admin-input"
                />
              </Field>
            </div>
          </div>

          {/* Visibility */}

          <div className="mt-9">
            <SectionHeading
              number="03"
              title="Visibility"
              description="Control how this testimonial appears."
            />

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ToggleCard
                title="Published"
                description="Show this testimonial publicly."
                active={form.isActive}
                onClick={() =>
                  updateField(
                    "isActive",
                    !form.isActive
                  )
                }
              />

              <ToggleCard
                title="Featured"
                description="Highlight this testimonial."
                active={form.isFeatured}
                onClick={() =>
                  updateField(
                    "isFeatured",
                    !form.isFeatured
                  )
                }
              />
            </div>
          </div>

          {/* Actions */}

          <div className="mt-9 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 dark:border-white/[0.07] sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-12 rounded-xl border border-slate-200 px-6 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.05]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-7 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
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
                    ? "Update Testimonial"
                    : "Create Testimonial"}
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
   Section Heading
===================================================== */

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-black text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
        {number}
      </div>

      <div>
        <h3 className="text-sm font-black">
          {title}
        </h3>

        <p className="mt-0.5 text-xs font-medium text-slate-400">
          {description}
        </p>
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
      <span className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
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
   Toggle Card
===================================================== */

function ToggleCard({
  title,
  description,
  active,
  onClick,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
        active
          ? "border-emerald-200 bg-emerald-50/80 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/[0.07] dark:hover:bg-emerald-400/10"
          : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:bg-white/[0.05]"
      }`}
    >
      <div className="min-w-0 pr-4">
        <p className="text-sm font-black">
          {title}
        </p>

        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <div
        className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${
          active
            ? "bg-emerald-500"
            : "bg-slate-300 dark:bg-white/20"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            active
              ? "translate-x-5"
              : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}

/* =====================================================
   Delete Modal
===================================================== */

function DeleteModal({
  testimonial,
  onClose,
  onConfirm,
  loading,
}: {
  testimonial: Testimonial;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.5)] dark:border-white/[0.08] dark:bg-[#0d1320]">

        <div className="p-6 sm:p-7">
          <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-400/10">
            <Trash2 size={21} />
          </div>

          <h2 className="mt-5 text-xl font-black tracking-tight">
            Delete testimonial?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Are you sure you want to permanently
            delete the testimonial from{" "}
            <span className="font-black text-slate-900 dark:text-white">
              {testimonial.name}
            </span>
            ?
          </p>

          <div className="mt-6 rounded-2xl border border-red-100 bg-red-50/70 p-4 dark:border-red-400/10 dark:bg-red-400/[0.05]">
            <p className="text-xs font-medium leading-5 text-red-600 dark:text-red-400">
              This action cannot be undone.
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-black text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.05]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-black text-white transition hover:bg-red-600 disabled:opacity-60"
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
    </div>
  );
}

/* =====================================================
   Loading
===================================================== */

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {Array.from({ length: 4 }).map(
        (_, index) => (
          <div
            key={index}
            className="h-[360px] animate-pulse rounded-[30px] border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#0d1320]"
          />
        )
      )}
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
    <div className="rounded-[30px] border border-red-100 bg-white p-10 text-center dark:border-red-400/10 dark:bg-[#0d1320]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-400/10">
        <MessageSquareQuote size={23} />
      </div>

      <h3 className="mt-4 text-lg font-black">
        Unable to load testimonials
      </h3>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Something went wrong while loading
        client feedback.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
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
    <div className="rounded-[30px] border border-slate-200 bg-white p-12 text-center dark:border-white/[0.08] dark:bg-[#0d1320]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-white/[0.05] dark:text-slate-400">
        <MessageSquareQuote size={25} />
      </div>

      <h3 className="mt-5 text-lg font-black">
        {hasFilters
          ? "No matching testimonials"
          : "No testimonials yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {hasFilters
          ? "Try changing your search or filters."
          : "Add your first client testimonial to the portfolio."}
      </p>

      {!hasFilters && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950"
        >
          <Plus size={16} />
          Add Testimonial
        </button>
      )}
    </div>
  );
}


 