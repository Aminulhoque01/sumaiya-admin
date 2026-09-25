 
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  useFieldArray,
  useForm,
  type SubmitHandler,
  type UseFormRegisterReturn,
} from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { toast } from "sonner";

import {
  useCreateProjectMutation,
} from "../../redux/features/projects/projectApi";

import {
  useGetCategoriesQuery,
} from "../../redux/features/category/categoryApi";

/* =====================================================
   Validation Schema
===================================================== */

const projectSchema = z.object({
  title: z
    .string()
    .min(2, "Project title is required")
    .max(
      150,
      "Title must be less than 150 characters"
    ),

  slug: z
    .string()
    .optional()
    .or(z.literal("")),

  shortDescription: z
    .string()
    .min(
      10,
      "Short description must be at least 10 characters"
    )
    .max(
      300,
      "Short description must be less than 300 characters"
    ),

  description: z
    .string()
    .min(
      20,
      "Description must be at least 20 characters"
    ),

  category: z
    .string()
    .min(
      1,
      "Please select a category"
    ),

  tools: z.array(
    z.object({
      value: z
        .string()
        .min(
          1,
          "Tool name is required"
        ),
    })
  ),

  client: z
    .string()
    .optional()
    .or(z.literal("")),

  projectDate: z
    .string()
    .optional()
    .or(z.literal("")),

  projectUrl: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  behanceUrl: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  dribbbleUrl: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  /*
   * Important:
   * We are NOT using z.coerce.number()
   * because React Hook Form's input is handled
   * with valueAsNumber below.
   */
  order: z
    .number()
    .min(
      0,
      "Order cannot be negative"
    ),

  featured: z.boolean(),

  isPublished: z.boolean(),

  caseStudy: z.object({
    overview: z
      .string()
      .optional(),

    challenge: z
      .string()
      .optional(),

    solution: z
      .string()
      .optional(),

    process: z
      .string()
      .optional(),

    result: z
      .string()
      .optional(),
  }),

  seo: z.object({
    title: z
      .string()
      .optional(),

    description: z
      .string()
      .optional(),

    keywords: z
      .string()
      .optional(),
  }),
});

/* =====================================================
   Form Types
===================================================== */

type ProjectFormInput =
  z.input<typeof projectSchema>;

type ProjectFormValues =
  z.output<typeof projectSchema>;

/* =====================================================
   Component
===================================================== */

export default function CreateProject() {
  const navigate = useNavigate();

  /* ===================================================
     Create Mutation
  =================================================== */

  const [
    createProject,
    {
      isLoading: isCreating,
    },
  ] = useCreateProjectMutation();

  /* ===================================================
     Categories
  =================================================== */

  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useGetCategoriesQuery();

  /* ===================================================
     Image State
  =================================================== */

  const [
    thumbnail,
    setThumbnail,
  ] = useState<File | null>(null);

  const [
    thumbnailPreview,
    setThumbnailPreview,
  ] = useState<string | null>(null);

  const [
    gallery,
    setGallery,
  ] = useState<File[]>([]);

  const [
    galleryPreviews,
    setGalleryPreviews,
  ] = useState<string[]>([]);

  /* ===================================================
     React Hook Form
  =================================================== */

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {
      errors,
    },
  } = useForm<
    ProjectFormInput,
    unknown,
    ProjectFormValues
  >({
    resolver: zodResolver(
      projectSchema
    ),

    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      category: "",

      tools: [
        {
          value: "",
        },
      ],

      client: "",
      projectDate: "",

      projectUrl: "",
      behanceUrl: "",
      dribbbleUrl: "",

      order: 0,

      featured: false,
      isPublished: true,

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

  /* ===================================================
     Tools Field Array
  =================================================== */

  const {
    fields: toolFields,
    append: appendTool,
    remove: removeTool,
  } = useFieldArray({
    control,
    name: "tools",
  });

  /* ===================================================
     Watch
  =================================================== */

  const title = watch("title");

  const isPublished = watch(
    "isPublished"
  );

  const featured = watch(
    "featured"
  );

  /* ===================================================
     Auto Generate Slug
  =================================================== */

  useEffect(() => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        "");

    setValue(
      "slug",
      slug,
      {
        shouldValidate: false,
      }
    );
  }, [
    title,
    setValue,
  ]);

  /* ===================================================
     Thumbnail Change
  =================================================== */

  const handleThumbnailChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    /* File type */

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      toast.error(
        "Please select an image file."
      );

      event.target.value = "";
      return;
    }

    /* File size */

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      toast.error(
        "Thumbnail must be less than 5MB."
      );

      event.target.value = "";
      return;
    }

    /* Revoke old preview */

    if (thumbnailPreview) {
      URL.revokeObjectURL(
        thumbnailPreview
      );
    }

    const preview =
      URL.createObjectURL(
        file
      );

    setThumbnail(file);
    setThumbnailPreview(
      preview
    );

    event.target.value = "";
  };

  /* ===================================================
     Remove Thumbnail
  =================================================== */

  const removeThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(
        thumbnailPreview
      );
    }

    setThumbnail(null);
    setThumbnailPreview(null);
  };

  /* ===================================================
     Gallery Change
  =================================================== */

  const handleGalleryChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files ?? []
    );

    if (!files.length) {
      return;
    }

    /* Maximum files */

    if (
      gallery.length +
        files.length >
      10
    ) {
      toast.error(
        "Maximum 10 gallery images allowed."
      );

      event.target.value = "";
      return;
    }

    /* Validate files */

    const validFiles =
      files.filter(
        (file) => {
          const isImage =
            file.type.startsWith(
              "image/"
            );

          const isValidSize =
            file.size <=
            5 * 1024 * 1024;

          return (
            isImage &&
            isValidSize
          );
        }
      );

    if (
      validFiles.length !==
      files.length
    ) {
      toast.error(
        "Some files were skipped. Only images under 5MB are allowed."
      );
    }

    if (!validFiles.length) {
      event.target.value = "";
      return;
    }

    const previews =
      validFiles.map(
        (file) =>
          URL.createObjectURL(
            file
          )
      );

    setGallery(
      (previous) => [
        ...previous,
        ...validFiles,
      ]
    );

    setGalleryPreviews(
      (previous) => [
        ...previous,
        ...previews,
      ]
    );

    event.target.value = "";
  };

  /* ===================================================
     Remove Gallery Image
  =================================================== */

  const removeGalleryImage = (
    index: number
  ) => {
    const preview =
      galleryPreviews[index];

    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    setGallery(
      (previous) =>
        previous.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );

    setGalleryPreviews(
      (previous) =>
        previous.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );
  };

  /* ===================================================
     Submit
  =================================================== */

  const onSubmit: SubmitHandler<
    ProjectFormValues
  > = async (
    values
  ) => {
    try {
      /* ===============================================
         Prepare Payload
      =============================================== */

      const payload = {
        title:
          values.title.trim(),

        slug:
          values.slug?.trim() ||
          undefined,

        shortDescription:
          values.shortDescription.trim(),

        description:
          values.description.trim(),

        category:
          values.category,

        tools:
          values.tools
            .map(
              (tool) =>
                tool.value.trim()
            )
            .filter(Boolean),

        client:
          values.client?.trim() ||
          undefined,

        projectDate:
          values.projectDate ||
          undefined,

        featured:
          values.featured,

        isPublished:
          values.isPublished,

        order:
          values.order,

        projectUrl:
          values.projectUrl?.trim() ||
          undefined,

        behanceUrl:
          values.behanceUrl?.trim() ||
          undefined,

        dribbbleUrl:
          values.dribbbleUrl?.trim() ||
          undefined,

        caseStudy: {
          overview:
            values.caseStudy.overview?.trim() ||
            undefined,

          challenge:
            values.caseStudy.challenge?.trim() ||
            undefined,

          solution:
            values.caseStudy.solution?.trim() ||
            undefined,

          process:
            values.caseStudy.process?.trim() ||
            undefined,

          result:
            values.caseStudy.result?.trim() ||
            undefined,
        },

        seo: {
          title:
            values.seo.title?.trim() ||
            undefined,

          description:
            values.seo.description?.trim() ||
            undefined,

          keywords:
            values.seo.keywords
              ?.split(",")
              .map(
                (keyword) =>
                  keyword.trim()
              )
              .filter(Boolean),
        },
      };

      /* ===============================================
         FormData
      =============================================== */

      const formData =
        new FormData();

      /*
       * Backend expects:
       *
       * req.body.data
       */

      formData.append(
        "data",
        JSON.stringify(
          payload
        )
      );

      /* Thumbnail */

      if (thumbnail) {
        formData.append(
          "thumbnail",
          thumbnail
        );
      }

      /* Gallery */

      gallery.forEach(
        (file) => {
          formData.append(
            "gallery",
            file
          );
        }
      );

      /* ===============================================
         API Request
      =============================================== */

      await createProject(
        formData
      ).unwrap();

      /* ===============================================
         Success
      =============================================== */

      toast.success(
        "Project created successfully."
      );

      navigate(
        "/admin/projects"
      );
    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error
        )
      );
    }
  };

  /* ===================================================
     Thumbnail Size
  =================================================== */

  const thumbnailSize =
    useMemo(() => {
      if (!thumbnail) {
        return null;
      }

      return (
        thumbnail.size /
        (1024 * 1024)
      ).toFixed(2);
    }, [thumbnail]);

  /* ===================================================
     Render
  =================================================== */

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* =================================================
          Header
      ================================================= */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/admin/projects"
            className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-black/45 transition hover:text-black dark:text-white/45 dark:hover:text-white"
          >
            <ArrowLeft size={15} />

            Back to Projects
          </Link>

          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
            <Sparkles size={14} />

            Portfolio
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#111] dark:text-white sm:text-4xl">
            Create Project
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50 dark:text-white/50">
            Add a new project to
            Sumaiya's creative portfolio.
          </p>
        </div>

        {/* Header actions */}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/projects"
              )
            }
            className="h-11 rounded-full border border-black/10 px-5 text-sm font-medium text-black/65 transition hover:bg-black/5 dark:border-white/10 dark:text-white/65 dark:hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="create-project-form"
            disabled={isCreating}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#111] px-5 text-sm font-medium text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {isCreating ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Save size={16} />
            )}

            {isCreating
              ? "Creating..."
              : "Create Project"}
          </button>
        </div>
      </div>

      {/* =================================================
          Form
      ================================================= */}

      <form
        id="create-project-form"
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="space-y-6"
      >
        {/* =================================================
            01 — Project Information
        ================================================= */}

        <Section
          number="01"
          title="Project Information"
          description="The main information visitors will see."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {/* Title */}

            <Field
              label="Project Title"
              required
              error={
                errors.title?.message
              }
              className="md:col-span-2"
            >
              <input
                {...register("title")}
                placeholder="e.g. Brand Identity for Lumina"
                className={inputClass}
              />
            </Field>

            {/* Slug */}

            <Field
              label="Slug"
              error={
                errors.slug?.message
              }
            >
              <input
                {...register("slug")}
                placeholder="brand-identity-for-lumina"
                className={inputClass}
              />
            </Field>

            {/* Category */}

            <Field
              label="Category"
              required
              error={
                errors.category?.message
              }
            >
              <select
                {...register(
                  "category"
                )}
                disabled={
                  isCategoriesLoading
                }
                className={inputClass}
              >
                <option className="bg-white text-black dark:bg-[#181818] dark:text-white" value="">
                  {isCategoriesLoading
                    ? "Loading categories..."
                    : "Select category"}
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category._id
                      }
                      value={
                        category._id
                      }
                      className="bg-white text-black dark:bg-[#181818] dark:text-white"
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}
              </select>

              {isCategoriesError && (
                <p className="mt-2 text-xs text-red-500">
                  Failed to load categories.
                </p>
              )}
            </Field>

            {/* Short Description */}

            <Field
              label="Short Description"
              required
              error={
                errors
                  .shortDescription
                  ?.message
              }
              className="md:col-span-2"
            >
              <textarea
                {...register(
                  "shortDescription"
                )}
                rows={3}
                placeholder="A short summary of this project..."
                className={`${textareaClass} resize-none`}
              />
            </Field>

            {/* Description */}

            <Field
              label="Description"
              required
              error={
                errors.description
                  ?.message
              }
              className="md:col-span-2"
            >
              <textarea
                {...register(
                  "description"
                )}
                rows={7}
                placeholder="Write a detailed description of the project..."
                className={`${textareaClass} resize-y`}
              />
            </Field>
          </div>
        </Section>

        {/* =================================================
            02 — Images
        ================================================= */}

        <Section
          number="02"
          title="Project Images"
          description="Upload a cover image and up to 10 gallery images."
        >
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            {/* Thumbnail */}

            <div>
              <Field
                label="Thumbnail"
                required
              >
                <label className="group relative block aspect-[16/10] cursor-pointer overflow-hidden rounded-3xl border border-dashed border-black/15 bg-black/[0.025] transition hover:border-black/30 dark:border-white/15 dark:bg-white/[0.025] dark:hover:border-white/30">
                  {thumbnailPreview ? (
                    <>
                      <img
                        src={
                          thumbnailPreview
                        }
                        alt="Thumbnail preview"
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/35" />

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-medium text-black">
                          Change image
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5">
                        <ImagePlus
                          size={25}
                          className="text-black/45 dark:text-white/45"
                        />
                      </div>

                      <p className="mt-4 text-sm font-medium text-[#111] dark:text-white">
                        Upload thumbnail
                      </p>

                      <p className="mt-1 text-xs text-black/40 dark:text-white/40">
                        PNG, JPG, WEBP • Max
                        5MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      handleThumbnailChange
                    }
                    className="sr-only"
                  />
                </label>
              </Field>

              {thumbnail && (
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-3 dark:bg-white/[0.03]">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-[#111] dark:text-white">
                      {
                        thumbnail.name
                      }
                    </p>

                    <p className="mt-1 text-[11px] text-black/40 dark:text-white/40">
                      {thumbnailSize} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      removeThumbnail
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-500 transition hover:bg-red-500/10"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Gallery */}

            <div>
              <Field label="Gallery">
                <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-black/[0.025] px-6 text-center transition hover:border-black/30 dark:border-white/15 dark:bg-white/[0.025] dark:hover:border-white/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5">
                    <Upload
                      size={20}
                      className="text-black/45 dark:text-white/45"
                    />
                  </div>

                  <p className="mt-4 text-sm font-medium text-[#111] dark:text-white">
                    Add gallery images
                  </p>

                  <p className="mt-1 text-xs text-black/40 dark:text-white/40">
                    Up to 10 images • Max
                    5MB each
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleGalleryChange
                    }
                    className="sr-only"
                  />
                </label>
              </Field>

              {galleryPreviews.length >
                0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {galleryPreviews.map(
                    (
                      preview,
                      index
                    ) => (
                      <div
                        key={
                          preview
                        }
                        className="group relative aspect-square overflow-hidden rounded-2xl bg-black/5 dark:bg-white/5"
                      >
                        <img
                          src={
                            preview
                          }
                          alt={`Gallery ${
                            index +
                            1
                          }`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeGalleryImage(
                              index
                            )
                          }
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
                        >
                          <X
                            size={13}
                          />
                        </button>

                        <span className="absolute bottom-2 left-2 rounded-full bg-black/65 px-2 py-1 text-[10px] text-white backdrop-blur">
                          {index +
                            1}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </Section>

        {/* =================================================
            03 — Project Details
        ================================================= */}

        <Section
          number="03"
          title="Project Details"
          description="Additional information about the project."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {/* Client */}

            <Field
              label="Client"
              error={
                errors.client?.message
              }
            >
              <input
                {...register(
                  "client"
                )}
                placeholder="e.g. Lumina Studio"
                className={inputClass}
              />
            </Field>

            {/* Date */}

            <Field
              label="Project Date"
              error={
                errors.projectDate
                  ?.message
              }
            >
              <input
                type="date"
                {...register(
                  "projectDate"
                )}
                className={inputClass}
              />
            </Field>

            {/* Project URL */}

            <Field
              label="Project URL"
              error={
                errors.projectUrl
                  ?.message
              }
            >
              <input
                {...register(
                  "projectUrl"
                )}
                placeholder="https://..."
                className={inputClass}
              />
            </Field>

            {/* Behance */}

            <Field
              label="Behance URL"
              error={
                errors.behanceUrl
                  ?.message
              }
            >
              <input
                {...register(
                  "behanceUrl"
                )}
                placeholder="https://behance.net/..."
                className={inputClass}
              />
            </Field>

            {/* Dribbble */}

            <Field
              label="Dribbble URL"
              error={
                errors.dribbbleUrl
                  ?.message
              }
            >
              <input
                {...register(
                  "dribbbleUrl"
                )}
                placeholder="https://dribbble.com/..."
                className={inputClass}
              />
            </Field>

            {/* Display Order */}

            <Field
              label="Display Order"
              error={
                errors.order?.message
              }
            >
              <input
                type="number"
                min={0}
                {...register(
                  "order",
                  {
                    valueAsNumber: true,
                  }
                )}
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* =================================================
            04 — Tools
        ================================================= */}

        <Section
          number="04"
          title="Tools & Software"
          description="Add the tools and software used in this project."
        >
          <div className="space-y-3">
            {toolFields.map(
              (
                field,
                index
              ) => (
                <div
                  key={
                    field.id
                  }
                  className="flex gap-2"
                >
                  <div className="flex-1">
                    <input
                      {...register(
                        `tools.${index}.value`
                      )}
                      placeholder={`Tool ${
                        index +
                        1
                      } — e.g. Adobe Illustrator`}
                      className={inputClass}
                    />

                    {errors.tools?.[
                      index
                    ]?.value
                      ?.message && (
                      <p className="mt-2 text-xs text-red-500">
                        {
                          errors
                            .tools[
                            index
                          ]?.value
                            ?.message
                        }
                      </p>
                    )}
                  </div>

                  {toolFields.length >
                    1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeTool(
                          index
                        )
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-500/15 text-red-500 transition hover:bg-red-500/10"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  )}
                </div>
              )
            )}

            <button
              type="button"
              onClick={() =>
                appendTool({
                  value: "",
                })
              }
              className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 px-4 text-xs font-medium text-black/65 transition hover:bg-black/5 dark:border-white/10 dark:text-white/65 dark:hover:bg-white/5"
            >
              <Plus size={15} />

              Add Tool
            </button>
          </div>
        </Section>

        {/* =================================================
            05 — Case Study
        ================================================= */}

        <Section
          number="05"
          title="Case Study"
          description="Tell the story behind this creative project."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <TextAreaField
              label="Overview"
              placeholder="What was this project about?"
              register={register(
                "caseStudy.overview"
              )}
            />

            <TextAreaField
              label="Challenge"
              placeholder="What challenge did the client have?"
              register={register(
                "caseStudy.challenge"
              )}
            />

            <TextAreaField
              label="Solution"
              placeholder="How did the design solve the problem?"
              register={register(
                "caseStudy.solution"
              )}
            />

            <TextAreaField
              label="Process"
              placeholder="Describe the creative process..."
              register={register(
                "caseStudy.process"
              )}
            />

            <TextAreaField
              label="Result"
              placeholder="What was the final outcome?"
              register={register(
                "caseStudy.result"
              )}
              className="md:col-span-2"
            />
          </div>
        </Section>

        {/* =================================================
            06 — SEO
        ================================================= */}

        <Section
          number="06"
          title="SEO"
          description="Optimize this project for search engines."
        >
          <div className="grid gap-5">
            {/* SEO Title */}

            <Field label="SEO Title">
              <input
                {...register(
                  "seo.title"
                )}
                placeholder="Project SEO title"
                className={inputClass}
              />
            </Field>

            {/* SEO Description */}

            <Field label="SEO Description">
              <textarea
                {...register(
                  "seo.description"
                )}
                rows={4}
                placeholder="Short search engine description..."
                className={`${textareaClass} resize-none`}
              />
            </Field>

            {/* Keywords */}

            <Field label="Keywords">
              <input
                {...register(
                  "seo.keywords"
                )}
                placeholder="branding, graphic design, visual identity"
                className={inputClass}
              />

              <p className="mt-2 text-[11px] text-black/35 dark:text-white/35">
                Separate keywords with commas.
              </p>
            </Field>
          </div>
        </Section>

        {/* =================================================
            07 — Publishing
        ================================================= */}

        <Section
          number="07"
          title="Publishing"
          description="Control how this project appears on the public portfolio."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {/* Publish */}

            <ToggleCard
              title="Publish Project"
              description="Make this project visible on the public website."
              checked={
                isPublished
              }
              onChange={(
                checked
              ) =>
                setValue(
                  "isPublished",
                  checked
                )
              }
            />

            {/* Featured */}

            <ToggleCard
              title="Featured Project"
              description="Highlight this project in featured portfolio sections."
              checked={
                featured
              }
              onChange={(
                checked
              ) =>
                setValue(
                  "featured",
                  checked
                )
              }
            />
          </div>
        </Section>

        {/* =================================================
            Bottom Action
        ================================================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-end dark:border-white/10">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/projects"
              )
            }
            className="h-12 rounded-full border border-black/10 px-6 text-sm font-medium text-black/65 transition hover:bg-black/5 dark:border-white/10 dark:text-white/65 dark:hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isCreating}
             className="inline-flex h-11 items-center gap-2 rounded-full bg-[#111] px-5 text-sm font-medium text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {isCreating ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Check size={17} />
            )}

            {isCreating
              ? "Creating Project..."
              : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =====================================================
   Section Component
===================================================== */

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
    <section className="rounded-3xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#131313] sm:p-7">
      {/* Section Header */}

      <div className="mb-7 flex gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-semibold text-black/55 dark:bg-white/5 dark:text-white/55">
          {number}
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#111] dark:text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-black/45 dark:text-white/45">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* =====================================================
   Field Component
===================================================== */

function Field({
  label,
  required,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2.5 block text-xs font-medium text-black/65 dark:text-white/65">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* =====================================================
   TextArea Field
===================================================== */

function TextAreaField({
  label,
  placeholder,
  register,
  className = "",
}: {
  label: string;
  placeholder: string;

  /*
   * This is the correct type for:
   *
   * register("caseStudy.overview")
   */
  register: UseFormRegisterReturn;

  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2.5 block text-xs font-medium text-black/65 dark:text-white/65">
        {label}
      </label>

      <textarea
        {...register}
        rows={6}
        placeholder={placeholder}
        className={`${textareaClass} resize-y`}
      />
    </div>
  );
}

/* =====================================================
   Toggle Card
===================================================== */

function ToggleCard({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (
    checked: boolean
  ) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`flex items-center justify-between gap-5 rounded-3xl border p-5 text-left transition ${
        checked
          ? "border-black/20 bg-black/[0.025] dark:border-white/20 dark:bg-white/[0.035]"
          : "border-black/10 dark:border-white/10"
      }`}
    >
      <div>
        <p className="text-sm font-medium text-[#111] dark:text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-black/45 dark:text-white/45">
          {description}
        </p>
      </div>

      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-[#111] dark:bg-white"
            : "bg-black/10 dark:bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full transition ${
            checked
              ? "left-6 bg-white dark:bg-black"
              : "left-1 bg-white dark:bg-white/70"
          }`}
        />
      </div>
    </button>
  );
}

/* =====================================================
   Styles
===================================================== */

const inputClass =
  "h-11 w-full rounded-2xl border border-black/10 bg-black/[0.025] px-4 text-sm text-[#111] outline-none transition placeholder:text-black/30 focus:border-black/30 focus:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/25 dark:focus:border-white/30 dark:focus:bg-white/[0.05]";

const textareaClass =
  "w-full rounded-2xl border border-black/10 bg-black/[0.025] px-4 py-3 text-sm leading-6 text-[#111] outline-none transition placeholder:text-black/30 focus:border-black/30 focus:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:placeholder:text-white/25 dark:focus:border-white/30 dark:focus:bg-white/[0.05]";

/* =====================================================
   API Error Helper
===================================================== */

function getApiErrorMessage(
  error: unknown
): string {
  if (
    typeof error ===
      "object" &&
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

    if (
      data?.message
    ) {
      return data.message;
    }
  }

  if (
    typeof error ===
      "object" &&
    error !== null &&
    "error" in error
  ) {
    const apiError = (
      error as {
        error?: string;
      }
    ).error;

    if (apiError) {
      return apiError;
    }
  }

  return "Failed to create project.";
}
 