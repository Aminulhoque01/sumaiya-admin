import {
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  Check,
  Edit3,
  GripVertical,
  Layers3,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import { toast } from "sonner";

import {
  useCreateServiceMutation,
  useDeleteServiceMutation,
  useGetServicesQuery,
  useUpdateServiceMutation,
  type Service,
} from "../../redux/features/services/serviceApi";

type FilterType = "all" | "active" | "inactive";

interface ServiceFormState {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  features: string[];
  order: number;
  isActive: boolean;
}

const emptyForm: ServiceFormState = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  icon: "",
  features: [""],
  order: 0,
  isActive: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
}

export default function Services() {
  const {
    data: services = [],
    isLoading,
    isError,
  } = useGetServicesQuery();

  const [createService, { isLoading: isCreating }] =
    useCreateServiceMutation();

  const [updateService, { isLoading: isUpdating }] =
    useUpdateServiceMutation();

  const [deleteService, { isLoading: isDeleting }] =
    useDeleteServiceMutation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const [modalOpen, setModalOpen] = useState(false);

  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [form, setForm] =
    useState<ServiceFormState>({
      ...emptyForm,
      features: [""],
    });

  const [openMenu, setOpenMenu] =
    useState<string | null>(null);

  /* =====================================================
     FILTERED SERVICES
  ===================================================== */

  const filteredServices = useMemo(() => {
    const query = search.toLowerCase().trim();

    return [...services]
      .filter((service) => {
        if (filter === "active") {
          return service.isActive;
        }

        if (filter === "inactive") {
          return !service.isActive;
        }

        return true;
      })
      .filter((service) => {
        if (!query) {
          return true;
        }

        const slug =
          service.slug?.toLowerCase() || "";

        const title =
          service.title?.toLowerCase() || "";

        const shortDescription =
          service.shortDescription?.toLowerCase() || "";

        const features =
          service.features || [];

        return (
          title.includes(query) ||
          slug.includes(query) ||
          shortDescription.includes(query) ||
          features.some((feature) =>
            feature
              .toLowerCase()
              .includes(query)
          )
        );
      })
      .sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0)
      );
  }, [services, filter, search]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalServices = services.length;

  const activeServices = services.filter(
    (service) => service.isActive
  ).length;

  const inactiveServices =
    totalServices - activeServices;

  /* =====================================================
     FORM HELPERS
  ===================================================== */

  const resetForm = () => {
    setForm({
      ...emptyForm,
      features: [""],
    });

    setEditingService(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
    setOpenMenu(null);
  };

  const openEditModal = (
    service: Service
  ) => {
    setEditingService(service);

    setForm({
      title: service.title || "",
      slug: service.slug || "",
      shortDescription:
        service.shortDescription || "",
      description:
        service.description || "",
      icon: service.icon || "",
      features:
        service.features &&
        service.features.length > 0
          ? [...service.features]
          : [""],
      order: service.order ?? 0,
      isActive:
        service.isActive ?? true,
    });

    setModalOpen(true);
    setOpenMenu(null);
  };

  const closeModal = () => {
    if (isCreating || isUpdating) {
      return;
    }

    setModalOpen(false);
    resetForm();
  };

  const updateField = (
    field: keyof ServiceFormState,
    value:
      | string
      | number
      | boolean
      | string[]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleTitleChange = (
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      title: value,
      slug: editingService
        ? previous.slug
        : slugify(value),
    }));
  };

  /* =====================================================
     FEATURES
  ===================================================== */

  const addFeature = () => {
    setForm((previous) => ({
      ...previous,
      features: [
        ...previous.features,
        "",
      ],
    }));
  };

  const updateFeature = (
    index: number,
    value: string
  ) => {
    setForm((previous) => {
      const features = [
        ...previous.features,
      ];

      features[index] = value;

      return {
        ...previous,
        features,
      };
    });
  };

  const removeFeature = (
    index: number
  ) => {
    setForm((previous) => {
      const features =
        previous.features.filter(
          (_, featureIndex) =>
            featureIndex !== index
        );

      return {
        ...previous,
        features:
          features.length > 0
            ? features
            : [""],
      };
    });
  };

  /* =====================================================
     CREATE / UPDATE
  ===================================================== */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const title = form.title.trim();
    const shortDescription =
      form.shortDescription.trim();

    if (!title) {
      toast.error(
        "Service title is required."
      );
      return;
    }

    if (!shortDescription) {
      toast.error(
        "Short description is required."
      );
      return;
    }

    const cleanFeatures =
      form.features
        .map((feature) =>
          feature.trim()
        )
        .filter(Boolean);

    const payload = {
      title,

      slug:
        form.slug.trim() ||
        slugify(title),

      shortDescription,

      description:
        form.description.trim() ||
        undefined,

      icon:
        form.icon.trim() ||
        undefined,

      features: cleanFeatures,

      order: Number(form.order) || 0,

      isActive: form.isActive,
    };

    try {
      if (editingService) {
        await updateService({
          id: editingService._id,
          body: payload,
        }).unwrap();

        toast.success(
          "Service updated successfully."
        );
      } else {
        await createService(
          payload
        ).unwrap();

        toast.success(
          "Service created successfully."
        );
      }

      setModalOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Something went wrong."
      );
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      await deleteService(
        deleteId
      ).unwrap();

      toast.success(
        "Service deleted successfully."
      );

      setDeleteId(null);
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to delete service."
      );
    }
  };

  /* =====================================================
     TOGGLE STATUS
  ===================================================== */

  const handleToggleStatus = async (
    service: Service
  ) => {
    try {
      await updateService({
        id: service._id,
        body: {
          isActive:
            !service.isActive,
        },
      }).unwrap();

      toast.success(
        service.isActive
          ? "Service deactivated."
          : "Service activated."
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to update status."
      );
    }

    setOpenMenu(null);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-full space-y-8 pb-10">
      {/* =================================================
         HEADER
      ================================================= */}

      <header className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-slate-950">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />

              Creative Services
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
              Services
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px] dark:text-slate-400">
              Manage the creative services
              displayed on Sumaiya&apos;s
              portfolio website.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
          >
            <Plus className="h-4 w-4 transition group-hover:rotate-90" />

            Add Service
          </button>
        </div>
      </header>

      {/* =================================================
         STATS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 bg-black p-5 ">
        <StatCard
          icon={Layers3}
          label="Total Services"
          value={totalServices}
          description="All services"
           
        />

        <StatCard
          icon={Check}
          label="Active"
          value={activeServices}
          description="Visible publicly"
          accent="green"
        />

        <StatCard
          icon={Zap}
          label="Inactive"
          value={inactiveServices}
          description="Currently hidden"
          accent="amber"
        />
      </div>

      {/* =================================================
         TOOLBAR
      ================================================= */}

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-slate-950">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}

          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search services..."
              className="h-12 w-full rounded-2xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-violet-400 dark:focus:bg-white/[0.07]"
            />
          </div>

          {/* Filters */}

          <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/[0.04]">
            {(
              [
                ["all", "All"],
                ["active", "Active"],
                ["inactive", "Inactive"],
              ] as const
            ).map(
              ([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setFilter(value)
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                    filter === value
                      ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 dark:bg-white dark:text-slate-950 dark:ring-white/10"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* =================================================
         CONTENT
      ================================================= */}

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : filteredServices.length === 0 ? (
        <EmptyState
          search={search}
          onCreate={openCreateModal}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map(
            (service) => (
              <ServiceCard
                key={service._id}
                service={service}
                menuOpen={
                  openMenu ===
                  service._id
                }
                onMenu={() =>
                  setOpenMenu(
                    openMenu ===
                      service._id
                      ? null
                      : service._id
                  )
                }
                onEdit={() =>
                  openEditModal(service)
                }
                onDelete={() =>
                  setDeleteId(
                    service._id
                  )
                }
                onToggle={() =>
                  handleToggleStatus(
                    service
                  )
                }
              />
            )
          )}
        </div>
      )}

      {/* =================================================
         CREATE / EDIT MODAL
      ================================================= */}

      {modalOpen && (
        <ServiceModal
          editingService={
            editingService
          }
          form={form}
          isSubmitting={
            isCreating || isUpdating
          }
          onClose={closeModal}
          onSubmit={handleSubmit}
          onTitleChange={
            handleTitleChange
          }
          onFieldChange={
            updateField
          }
          onAddFeature={
            addFeature
          }
          onUpdateFeature={
            updateFeature
          }
          onRemoveFeature={
            removeFeature
          }
        />
      )}

      {/* =================================================
         DELETE MODAL
      ================================================= */}

      {deleteId && (
        <DeleteModal
          loading={isDeleting}
          onCancel={() =>
            setDeleteId(null)
          }
          onConfirm={
            handleDelete
          }
        />
      )}
    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

interface StatCardProps {
  icon: typeof Layers3;
  label: string;
  value: number;
  description: string;
  accent?: "green" | "amber";
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  accent,
}: StatCardProps) {
  const styles =
    accent === "green"
      ? {
          box: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/[0.06]",
          icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
        }
      : accent === "amber"
        ? {
            box: "border-amber-200 bg-amber-50/70 dark:border-amber-500/20 dark:bg-amber-500/[0.06]",
            icon: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
          }
        : {
            box: "border-violet-200 bg-violet-50/70 dark:border-violet-500/20 dark:bg-violet-500/[0.06]",
            icon: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
          };

  return (
    <div
      className={`rounded-[1.75rem] border p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${styles.box}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            {value}
          </p>

          <p className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${styles.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   SERVICE CARD
===================================================== */

interface ServiceCardProps {
  service: Service;
  menuOpen: boolean;
  onMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

function ServiceCard({
  service,
  menuOpen,
  onMenu,
  onEdit,
  onDelete,
  onToggle,
}: ServiceCardProps) {
  const features =
    service.features || [];

  return (
    <article className="group relative overflow-visible rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10 dark:border-white/10 dark:bg-slate-950 dark:hover:border-white/20 dark:hover:shadow-black/30">
      {/* Accent */}

      <div className="absolute inset-x-0 top-0 h-1 rounded-t-[1.75rem] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />

      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-lg font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
            {service.icon || "✦"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-slate-950 dark:text-white">
              {service.title}
            </h3>

            <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-500">
              /{service.slug || "no-slug"}
            </p>
          </div>
        </div>

        {/* Menu */}

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onMenu}
            aria-label="Service actions"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800 dark:hover:border-white/10 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40">
              <button
                type="button"
                onClick={onEdit}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.07]"
              >
                <Edit3 className="h-4 w-4" />

                Edit service
              </button>

              <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.07]"
              >
                <Zap className="h-4 w-4" />

                {service.isActive
                  ? "Deactivate"
                  : "Activate"}
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-white/10" />

              <button
                type="button"
                onClick={onDelete}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />

                Delete service
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status */}

      <div className="mt-6 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
            service.isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              service.isActive
                ? "bg-emerald-500"
                : "bg-slate-400"
            }`}
          />

          {service.isActive
            ? "Active"
            : "Inactive"}
        </span>

        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <GripVertical className="h-3.5 w-3.5" />

          Order {service.order ?? 0}
        </div>
      </div>

      {/* Description */}

      <p className="mt-5 line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-600 dark:text-slate-400">
        {service.shortDescription}
      </p>

      {/* Divider */}

      <div className="my-5 border-t border-slate-100 dark:border-white/[0.07]" />

      {/* Features */}

      {features.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {features
            .slice(0, 4)
            .map(
              (feature, index) => (
                <span
                  key={`${feature}-${index}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300"
                >
                  {feature}
                </span>
              )
            )}

          {features.length > 4 && (
            <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
              +{features.length - 4}
            </span>
          )}
        </div>
      ) : (
        <p className="text-xs font-medium text-slate-400">
          No features added
        </p>
      )}
    </article>
  );
}

/* =====================================================
   SERVICE MODAL
===================================================== */

interface ServiceModalProps {
  editingService: Service | null;
  form: ServiceFormState;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>
  ) => void;
  onTitleChange: (
    value: string
  ) => void;
  onFieldChange: (
    field: keyof ServiceFormState,
    value:
      | string
      | number
      | boolean
      | string[]
  ) => void;
  onAddFeature: () => void;
  onUpdateFeature: (
    index: number,
    value: string
  ) => void;
  onRemoveFeature: (
    index: number
  ) => void;
}

function ServiceModal({
  editingService,
  form,
  isSubmitting,
  onClose,
  onSubmit,
  onTitleChange,
  onFieldChange,
  onAddFeature,
  onUpdateFeature,
  onRemoveFeature,
}: ServiceModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-md sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-slate-950">
        {/* Modal Header */}

        <div className="relative border-b border-slate-200 px-5 py-5 sm:px-7 dark:border-white/10">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Sparkles className="h-4 w-4" />

                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                  {editingService
                    ? "Edit Service"
                    : "New Service"}
                </span>
              </div>

              <h2 className="mt-1.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl dark:text-white">
                {editingService
                  ? "Update service"
                  : "Create a new service"}
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {editingService
                  ? "Update the service information below."
                  : "Add a new creative service to the portfolio."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close modal"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form */}

        <form
          onSubmit={onSubmit}
          className="overflow-y-auto"
        >
          <div className="space-y-7 p-5 sm:p-7">
            {/* BASIC INFORMATION */}

            <section>
              <SectionTitle>
                Basic Information
              </SectionTitle>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <InputField
                  label="Service Title"
                  value={form.title}
                  onChange={
                    onTitleChange
                  }
                  placeholder="Brand Identity Design"
                  required
                />

                <InputField
                  label="Slug"
                  value={form.slug}
                  onChange={(value) =>
                    onFieldChange(
                      "slug",
                      slugify(value)
                    )
                  }
                  placeholder="brand-identity-design"
                />

                <div className="md:col-span-2">
                  <InputField
                    label="Short Description"
                    value={
                      form.shortDescription
                    }
                    onChange={(value) =>
                      onFieldChange(
                        "shortDescription",
                        value
                      )
                    }
                    placeholder="A concise description of this service..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <TextAreaField
                    label="Description"
                    value={
                      form.description
                    }
                    onChange={(value) =>
                      onFieldChange(
                        "description",
                        value
                      )
                    }
                    placeholder="Describe this service in more detail..."
                  />
                </div>
              </div>
            </section>

            {/* DISPLAY SETTINGS */}

            <section>
              <SectionTitle>
                Display Settings
              </SectionTitle>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <InputField
                  label="Icon"
                  value={form.icon}
                  onChange={(value) =>
                    onFieldChange(
                      "icon",
                      value
                    )
                  }
                  placeholder="✦ or icon name"
                />

                <InputField
                  label="Display Order"
                  type="number"
                  value={String(
                    form.order
                  )}
                  onChange={(value) =>
                    onFieldChange(
                      "order",
                      Number(value) || 0
                    )
                  }
                  placeholder="0"
                />
              </div>

              {/* ACTIVE TOGGLE */}

              <button
                type="button"
                onClick={() =>
                  onFieldChange(
                    "isActive",
                    !form.isActive
                  )
                }
                className="mt-5 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Publish service
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Active services are visible
                    on the public portfolio.
                  </p>
                </div>

                <span
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    form.isActive
                      ? "bg-emerald-500"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      form.isActive
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </span>
              </button>
            </section>

            {/* FEATURES */}

            <section>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <SectionTitle>
                    Service Features
                  </SectionTitle>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Add the key things included
                    in this service.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    onAddFeature
                  }
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/15"
                >
                  <Plus className="h-3.5 w-3.5" />

                  Add feature
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {form.features.map(
                  (feature, index) => (
                    <div
                      key={index}
                      className="flex gap-2"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400"
                      >
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      <input
                        value={feature}
                        onChange={(
                          event
                        ) =>
                          onUpdateFeature(
                            index,
                            event.target
                              .value
                          )
                        }
                        placeholder={`Feature ${
                          index + 1
                        }`}
                        className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/[0.06]"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          onRemoveFeature(
                            index
                          )
                        }
                        aria-label={`Remove feature ${index + 1}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-white/10 dark:hover:border-red-500/20 dark:hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                )}
              </div>
            </section>
          </div>

          {/* FOOTER */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7 dark:border-white/10 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 rounded-xl px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-200/70 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-white/[0.06]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {editingService
                ? "Update Service"
                : "Create Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =====================================================
   SECTION TITLE
===================================================== */

function SectionTitle({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h3 className="text-sm font-bold text-slate-950 dark:text-white">
      {children}
    </h3>
  );
}

/* =====================================================
   INPUT FIELD
===================================================== */

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: InputFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/[0.06]"
      />
    </label>
  );
}

/* =====================================================
   TEXTAREA
===================================================== */

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: TextAreaFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
        {label}
      </span>

      <textarea
        rows={5}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-white/[0.06]"
      />
    </label>
  );
}

/* =====================================================
   LOADING
===================================================== */

function LoadingState() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-[330px] animate-pulse rounded-[1.75rem] border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

/* =====================================================
   ERROR
===================================================== */

function ErrorState() {
  return (
    <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-10 text-center dark:border-red-500/20 dark:bg-red-500/5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <Zap className="h-6 w-6" />
      </div>

      <p className="mt-5 text-sm font-bold text-red-700 dark:text-red-400">
        Failed to load services.
      </p>

      <p className="mt-1 text-xs text-red-600/70 dark:text-red-400/70">
        Please check your backend
        connection and try again.
      </p>
    </div>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function EmptyState({
  search,
  onCreate,
}: {
  search: string;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">
        <Layers3 className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
        {search
          ? "No services found"
          : "No services yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
        {search
          ? "Try a different search term."
          : "Create your first service to start building the portfolio."}
      </p>

      {!search && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
        >
          <Plus className="h-4 w-4" />

          Add Service
        </button>
      )}
    </div>
  );
}

/* =====================================================
   DELETE MODAL
===================================================== */

function DeleteModal({
  loading,
  onCancel,
  onConfirm,
}: {
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-slate-950">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <Trash2 className="h-5 w-5" />
        </div>

        <h3 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
          Delete service?
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
          This action cannot be undone.
          The service will be permanently
          removed from your portfolio.
        </p>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-white/[0.06]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            Delete
          </button>
        </div>
      </div>
    </div>
  );
}