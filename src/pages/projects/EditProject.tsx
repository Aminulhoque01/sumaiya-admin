 
"use client";

import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  useFieldArray,
  useForm,
  type SubmitHandler,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useGetProjectByIdQuery, useUpdateProjectMutation } from "../../redux/features/projects/projectApi";
import { useGetCategoriesQuery } from "../../redux/features/category/categoryApi";

 
const projectSchema = z.object({
  title: z
    .string()
    .min(2, "Project title is required"),

  slug: z
    .string()
    .optional(),

  shortDescription: z
    .string()
    .min(10, "Short description is required"),

  description: z
    .string()
    .min(20, "Description is required"),

  category: z
    .string()
    .min(1, "Please select a category"),

  client: z
    .string()
    .optional(),

  projectDate: z
    .string()
    .optional(),

  projectUrl: z
    .string()
    .optional(),

  behanceUrl: z
    .string()
    .optional(),

  dribbbleUrl: z
    .string()
    .optional(),

  order: z
    .number()
    .min(0),

  featured: z.boolean(),

  isPublished: z.boolean(),

  tools: z.array(
    z.object({
      value: z.string().min(1, "Tool name is required"),
    })
  ),

  caseStudy: z.object({
    overview: z.string().optional(),
    challenge: z.string().optional(),
    solution: z.string().optional(),
    process: z.string().optional(),
    result: z.string().optional(),
  }),

  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
  }),
});

type ProjectFormInput = z.input<typeof projectSchema>;
type ProjectFormValues = z.output<typeof projectSchema>;

function InputField({
  label,
  placeholder,
  register,
  error,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
      />

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function TextAreaField({
  label,
  placeholder,
  register,
  error,
  className = "",
}: {
  label: string;
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {label}
      </label>

      <textarea
        rows={5}
        placeholder={placeholder}
        {...register}
        className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:focus:border-white"
      />

      {error && (
        <p className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800 md:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-xs font-semibold text-white dark:bg-white dark:text-black">
            {number}
          </div>

          <div>
            <h2 className="text-base font-semibold text-zinc-950 dark:text-white">
              {title}
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6">
        {children}
      </div>
    </section>
  );
}

export default function EditProject() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isSaving, setIsSaving] = useState(false);

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
  } = useGetProjectByIdQuery(id || "", {
    skip: !id,
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useGetCategoriesQuery();

  const [updateProject] =
    useUpdateProjectMutation();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<
    ProjectFormInput,
    unknown,
    ProjectFormValues
  >({
    resolver: zodResolver(projectSchema),

    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      category: "",
      client: "",
      projectDate: "",
      projectUrl: "",
      behanceUrl: "",
      dribbbleUrl: "",
      order: 0,
      featured: false,
      isPublished: false,

      tools: [
        {
          value: "",
        },
      ],

      caseStudy: {
        overview: "",
        challenge: "",
        solution: "",
        process: "",
        result: "",
      },

      seo: {
        title: "",
        description: "",
        keywords: "",
      },
    },
  });

  const { fields, append, remove } =
    useFieldArray({
      control,
      name: "tools",
    });

  useEffect(() => {
    if (!project) return;

    const categoryId =
      typeof project.category === "string"
        ? project.category
        : project.category?._id || "";

    reset({
      title: project.title || "",
      slug: project.slug || "",
      shortDescription:
        project.shortDescription || "",
      description:
        project.description || "",

      category: categoryId,

      client: project.client || "",
      projectDate:
        project.projectDate
          ? project.projectDate.slice(0, 10)
          : "",

      projectUrl:
        project.projectUrl || "",

      behanceUrl:
        project.behanceUrl || "",

      dribbbleUrl:
        project.dribbbleUrl || "",

      order: project.order ?? 0,

      featured:
        project.featured ?? false,

      isPublished:
        project.isPublished ?? false,

      tools:
        project.tools?.length
          ? project.tools.map((tool) => ({
              value: tool,
            }))
          : [{ value: "" }],

      caseStudy: {
        overview:
          project.caseStudy?.overview || "",
        challenge:
          project.caseStudy?.challenge || "",
        solution:
          project.caseStudy?.solution || "",
        process:
          project.caseStudy?.process || "",
        result:
          project.caseStudy?.result || "",
      },

      seo: {
        title:
          project.seo?.title || "",

        description:
          project.seo?.description || "",

        keywords:
          project.seo?.keywords?.join(", ") || "",
      },
    });
  }, [project, reset]);

  const thumbnail = useMemo(
    () => project?.thumbnail?.url || "",
    [project]
  );

  const gallery = useMemo(
    () => project?.gallery || [],
    [project]
  );

  const onSubmit: SubmitHandler<
    ProjectFormValues
  > = async (values) => {
    if (!id) return;

    try {
      setIsSaving(true);

      const payload = {
        title: values.title,
        slug: values.slug || undefined,

        shortDescription:
          values.shortDescription,

        description:
          values.description,

        category:
          values.category,

        client:
          values.client || undefined,

        projectDate:
          values.projectDate || undefined,

        projectUrl:
          values.projectUrl || undefined,

        behanceUrl:
          values.behanceUrl || undefined,

        dribbbleUrl:
          values.dribbbleUrl || undefined,

        order:
          values.order,

        featured:
          values.featured,

        isPublished:
          values.isPublished,

        tools:
          values.tools
            .map((item) => item.value.trim())
            .filter(Boolean),

        caseStudy: {
          overview:
            values.caseStudy.overview || undefined,

          challenge:
            values.caseStudy.challenge || undefined,

          solution:
            values.caseStudy.solution || undefined,

          process:
            values.caseStudy.process || undefined,

          result:
            values.caseStudy.result || undefined,
        },

        seo: {
          title:
            values.seo.title || undefined,

          description:
            values.seo.description ||
            undefined,

          keywords:
            values.seo.keywords
              ? values.seo.keywords
                  .split(",")
                  .map((item) =>
                    item.trim()
                  )
                  .filter(Boolean)
              : [],
        },
      };

      await updateProject({
        id,
        body: payload,
      }).unwrap();

      toast.success(
        "Project updated successfully"
      );

      navigate("/admin/projects");
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to update project"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (projectLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-zinc-500" />

          <p className="text-sm text-zinc-500">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900/40 dark:bg-red-950/20">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Project not found
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            We could not load this project.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/projects")
            }
            className="mt-5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50 px-4 py-6 dark:bg-black md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/admin/projects")
              }
              className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-950 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </button>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Project Management
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-4xl">
              Edit Project
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              Update your project information,
              content, SEO and publishing settings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate("/admin/projects")
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="submit"
              form="edit-project-form"
              disabled={isSaving}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {isSaving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>

        <form
          id="edit-project-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >

          {/* Project Information */}
          <Section
            number="01"
            title="Project Information"
            description="Core information displayed across your portfolio."
          >
            <div className="grid gap-5 md:grid-cols-2">

              <InputField
                label="Project Title"
                placeholder="e.g. Brand Identity Design"
                register={register("title")}
                error={errors.title?.message}
              />

              <InputField
                label="Slug"
                placeholder="brand-identity-design"
                register={register("slug")}
                error={errors.slug?.message}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Category
                </label>

                <select
                  {...register("category")}
                  disabled={categoriesLoading}
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                >
                  <option value="">
                    Select category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category._id}
                        value={category._id}
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>

                {errors.category && (
                  <p className="text-xs text-red-500">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <InputField
                label="Client"
                placeholder="Client or company name"
                register={register("client")}
              />

              <InputField
                label="Project Date"
                type="date"
                register={register(
                  "projectDate"
                )}
              />

              <InputField
                label="Display Order"
                type="number"
                register={register("order", {
                  valueAsNumber: true,
                })}
                error={errors.order?.message}
              />

              <InputField
                label="Project URL"
                placeholder="https://example.com"
                register={register(
                  "projectUrl"
                )}
              />

              <InputField
                label="Behance URL"
                placeholder="https://behance.net/..."
                register={register(
                  "behanceUrl"
                )}
              />

              <InputField
                label="Dribbble URL"
                placeholder="https://dribbble.com/..."
                register={register(
                  "dribbbleUrl"
                )}
              />

              <TextAreaField
                label="Short Description"
                placeholder="A short description of this project..."
                register={register(
                  "shortDescription"
                )}
                error={
                  errors.shortDescription
                    ?.message
                }
                className="md:col-span-2"
              />

              <TextAreaField
                label="Full Description"
                placeholder="Describe the project in detail..."
                register={register(
                  "description"
                )}
                error={
                  errors.description?.message
                }
                className="md:col-span-2"
              />
            </div>
          </Section>

          {/* Existing Images */}
          <Section
            number="02"
            title="Project Media"
            description="Review the current project thumbnail and gallery."
          >
            <div className="space-y-6">

              {thumbnail && (
                <div>
                  <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Current Thumbnail
                  </p>

                  <div className="relative max-w-md overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <img
                      src={thumbnail}
                      alt={project.title}
                      className="aspect-[16/10] w-full object-cover"
                    />

                    <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      Current thumbnail
                    </div>
                  </div>
                </div>
              )}

              {gallery.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    Current Gallery
                  </p>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {gallery.map(
                      (image, index) => (
                        <div
                          key={
                            image.publicId ||
                            index
                          }
                          className="group overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
                        >
                          <img
                            src={image.url}
                            alt={`${project.title} ${index + 1}`}
                            className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-900/40">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Image replacement
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Current backend update endpoint
                  supports project data updates.
                  Thumbnail and gallery replacement
                  can be enabled later without
                  changing this form structure.
                </p>
              </div>
            </div>
          </Section>

          {/* Tools */}
          <Section
            number="03"
            title="Tools & Technologies"
            description="Software and technologies used for this project."
          >
            <div className="space-y-3">
              {fields.map(
                (field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-3"
                  >
                    <input
                      {...register(
                        `tools.${index}.value`
                      )}
                      placeholder={`Tool ${
                        index + 1
                      }`}
                      className="h-11 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        remove(index)
                      }
                      disabled={
                        fields.length === 1
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 dark:border-zinc-800 dark:hover:border-red-900 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              )}

              <button
                type="button"
                onClick={() =>
                  append({
                    value: "",
                  })
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 text-sm font-medium text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-white dark:hover:text-white"
              >
                <Plus className="h-4 w-4" />
                Add Tool
              </button>
            </div>
          </Section>

          {/* Case Study */}
          <Section
            number="04"
            title="Case Study"
            description="Detailed project story for visitors who want deeper context."
          >
            <div className="grid gap-5 md:grid-cols-2">

              <TextAreaField
                label="Overview"
                placeholder="Project overview..."
                register={register(
                  "caseStudy.overview"
                )}
              />

              <TextAreaField
                label="Challenge"
                placeholder="What challenge did the project solve?"
                register={register(
                  "caseStudy.challenge"
                )}
              />

              <TextAreaField
                label="Solution"
                placeholder="What solution did you create?"
                register={register(
                  "caseStudy.solution"
                )}
              />

              <TextAreaField
                label="Process"
                placeholder="Explain the creative process..."
                register={register(
                  "caseStudy.process"
                )}
              />

              <TextAreaField
                label="Result"
                placeholder="What was the final result?"
                register={register(
                  "caseStudy.result"
                )}
                className="md:col-span-2"
              />
            </div>
          </Section>

          {/* SEO */}
          <Section
            number="05"
            title="SEO Settings"
            description="Search engine metadata for this project."
          >
            <div className="grid gap-5">

              <InputField
                label="SEO Title"
                placeholder="Project SEO title"
                register={register(
                  "seo.title"
                )}
              />

              <TextAreaField
                label="SEO Description"
                placeholder="Short search engine description..."
                register={register(
                  "seo.description"
                )}
              />

              <InputField
                label="Keywords"
                placeholder="branding, logo, packaging, identity"
                register={register(
                  "seo.keywords"
                )}
              />

              <p className="text-xs text-zinc-500">
                Separate keywords with commas.
              </p>
            </div>
          </Section>

          {/* Publishing */}
          <Section
            number="06"
            title="Publishing"
            description="Control how this project appears on the public portfolio."
          >
            <div className="grid gap-4 md:grid-cols-2">

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Publish Project
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Make this project visible
                    publicly.
                  </p>
                </div>

                <input
                  type="checkbox"
                  {...register(
                    "isPublished"
                  )}
                  className="h-5 w-5 accent-black dark:accent-white"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Featured Project
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Highlight this project in
                    featured sections.
                  </p>
                </div>

                <input
                  type="checkbox"
                  {...register(
                    "featured"
                  )}
                  className="h-5 w-5 accent-black dark:accent-white"
                />
              </label>
            </div>
          </Section>

          {/* Bottom Save */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                navigate("/admin/projects")
              }
              className="h-12 rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-7 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}

              {isSaving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
 
