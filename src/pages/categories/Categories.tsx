 
import {
  Check,
  Edit3,
  FolderKanban,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";

import { toast } from "sonner";
import { useCreateCategoryMutation, useDeleteCategoryMutation, useGetCategoriesQuery, useUpdateCategoryMutation, type Category } from "../../redux/features/category/categoryApi";
 
interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
}

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  order: 0,
  isActive: true,
};

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function Categories() {
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useGetCategoriesQuery();

  const [createCategory, { isLoading: creating }] =
    useCreateCategoryMutation();

  const [updateCategory, { isLoading: updating }] =
    useUpdateCategoryMutation();

  const [deleteCategory, { isLoading: deleting }] =
    useDeleteCategoryMutation();

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">(
      "all"
    );

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Category | null>(null);

  const [form, setForm] =
    useState<CategoryForm>(emptyForm);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const searchValue = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        !searchValue ||
        category.name
          .toLowerCase()
          .includes(searchValue) ||
        category.slug
          ?.toLowerCase()
          .includes(searchValue) ||
        category.description
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          category.isActive !== false) ||
        (statusFilter === "inactive" &&
          category.isActive === false);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    categories,
    search,
    statusFilter,
  ]);

  const totalCategories =
    categories.length;

  const activeCategories =
    categories.filter(
      (category) =>
        category.isActive !== false
    ).length;

  const inactiveCategories =
    categories.filter(
      (category) =>
        category.isActive === false
    ).length;

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (
    category: Category
  ) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description:
        category.description || "",
      order: category.order ?? 0,
      isActive:
        category.isActive !== false,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (creating || updating) return;

    setIsModalOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
  };

  const handleNameChange = (
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      name: value,

      slug:
        editingCategory
          ? previous.slug
          : createSlug(value),
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error(
        "Category name is required"
      );
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        slug:
          form.slug.trim() ||
          createSlug(form.name),

        description:
          form.description.trim(),

        order: Number(form.order),

        isActive: form.isActive,
      };

      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          body: payload,
        }).unwrap();

        toast.success(
          "Category updated successfully"
        );
      } else {
        await createCategory(
          payload
        ).unwrap();

        toast.success(
          "Category created successfully"
        );
      }

      closeModal();
    } catch (error) {
      console.error(error);

      toast.error(
        editingCategory
          ? "Failed to update category"
          : "Failed to create category"
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCategory(
        deleteTarget._id
      ).unwrap();

      toast.success(
        "Category deleted successfully"
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to delete category"
      );
    }
  };

  const handleToggleStatus = async (
    category: Category
  ) => {
    try {
      await updateCategory({
        id: category._id,

        body: {
          isActive:
            category.isActive === false,
        },
      }).unwrap();

      toast.success(
        category.isActive === false
          ? "Category activated"
          : "Category deactivated"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to update category status"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-zinc-500" />

          <p className="text-sm text-zinc-500">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-8 py-7 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <h2 className="font-semibold text-red-600 dark:text-red-400">
            Failed to load categories
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Please check your backend
            connection and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-full bg-zinc-50 px-4 py-6 dark:bg-black md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Content Management
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-4xl">
                Categories
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Organize your portfolio projects
                with clean and reusable categories.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>

          {/* Stats */}
          <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Total
                  </p>

                  <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
                    {totalCategories}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
                  <FolderKanban className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Active
                  </p>

                  <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
                    {activeCategories}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                    Inactive
                  </p>

                  <p className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
                    {inactiveCategories}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
                  <X className="h-5 w-5 text-zinc-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search categories..."
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-white"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
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
                        setStatusFilter(
                          value
                        )
                      }
                      className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                        statusFilter ===
                        value
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-black"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Empty */}
          {filteredCategories.length ===
            0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <FolderKanban className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-700" />

              <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
                No categories found
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Try changing your search or
                create a new category.
              </p>
            </div>
          )}

          {/* Desktop Table */}
          {filteredCategories.length >
            0 && (
            <div className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left dark:border-zinc-800">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Category
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Slug
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Order
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCategories.map(
                      (category) => (
                        <tr
                          key={category._id}
                          className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
                        >
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-semibold text-zinc-900 dark:text-white">
                                {category.name}
                              </p>

                              {category.description && (
                                <p className="mt-1 max-w-md truncate text-xs text-zinc-500">
                                  {
                                    category.description
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <code className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                              {category.slug ||
                                "-"}
                            </code>
                          </td>

                          <td className="px-6 py-5 text-sm text-zinc-600 dark:text-zinc-400">
                            {category.order ??
                              0}
                          </td>

                          <td className="px-6 py-5">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleStatus(
                                  category
                                )
                              }
                              disabled={updating}
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                category.isActive !==
                                false
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  category.isActive !==
                                  false
                                    ? "bg-emerald-500"
                                    : "bg-zinc-400"
                                }`}
                              />

                              {category.isActive !==
                              false
                                ? "Active"
                                : "Inactive"}
                            </button>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    category
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:hover:text-white"
                                title="Edit"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget(
                                    category
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 dark:border-zinc-800 dark:hover:border-red-900 dark:hover:bg-red-950/20"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mobile Cards */}
          {filteredCategories.length >
            0 && (
            <div className="space-y-3 md:hidden">
              {filteredCategories.map(
                (category) => (
                  <div
                    key={category._id}
                    className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                          {category.name}
                        </h3>

                        <code className="mt-2 inline-block rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-500 dark:bg-zinc-900">
                          {category.slug ||
                            "-"}
                        </code>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(
                            category
                          )
                        }
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          category.isActive !==
                          false
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500"
                        }`}
                      >
                        {category.isActive !==
                        false
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </div>

                    {category.description && (
                      <p className="mt-3 text-sm leading-6 text-zinc-500">
                        {category.description}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-900">
                      <span className="text-xs text-zinc-400">
                        Order:{" "}
                        {category.order ??
                          0}
                      </span>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              category
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 dark:border-zinc-800"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget(
                              category
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-red-500 dark:border-zinc-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">

            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">
                  {editingCategory
                    ? "Edit Category"
                    : "Create Category"}
                </h2>

                <p className="mt-1 text-xs text-zinc-500">
                  {editingCategory
                    ? "Update category information."
                    : "Add a new portfolio category."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Category Name
                </label>

                <input
                  value={form.name}
                  onChange={(event) =>
                    handleNameChange(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Branding"
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Slug
                </label>

                <input
                  value={form.slug}
                  onChange={(event) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        slug: event.target.value,
                      })
                    )
                  }
                  placeholder="branding"
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        description:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Describe this category..."
                  className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Display Order
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(event) =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          order: Number(
                            event.target.value
                          ),
                        })
                      )
                    }
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 px-4 dark:border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      Active
                    </p>

                    <p className="text-[11px] text-zinc-500">
                      Visible category
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          isActive:
                            event.target.checked,
                        })
                      )
                    }
                    className="h-5 w-5 accent-black dark:accent-white"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    creating || updating
                  }
                  className="h-11 flex-1 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating || updating
                  }
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-semibold text-white dark:bg-white dark:text-black"
                >
                  {creating || updating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}

                  {creating || updating
                    ? "Saving..."
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-zinc-950 dark:text-white">
              Delete category?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {deleteTarget.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
                className="h-11 flex-1 rounded-xl border border-zinc-200 text-sm font-medium dark:border-zinc-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
 
