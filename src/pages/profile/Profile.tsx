import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Check,
  ExternalLink,
 
  FileText,
  Image as ImageIcon,
 
   
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  User,
   
 
} from "lucide-react";
 

import { toast } from "sonner";
import { useCreateProfileMutation, useDeleteProfileMutation, useGetProfileQuery, useUpdateProfileMutation } from "../../redux/features/profile/profileApi";

 

interface ImagePreview {
  url: string;
  file?: File;
}

interface FormState {
  name: string;
  title: string;
  shortBio: string;
  bio: string;

  location: string;
  email: string;
  phone: string;
  website: string;

  availability: string;
  yearsOfExperience: string;

  resumeUrl: string;

  behance: string;
  dribbble: string;
  linkedin: string;
  instagram: string;
  facebook: string;
  youtube: string;

  isActive: boolean;
}

const initialForm: FormState = {
  name: "",
  title: "",
  shortBio: "",
  bio: "",

  location: "",
  email: "",
  phone: "",
  website: "",

  availability: "",
  yearsOfExperience: "",

  resumeUrl: "",

  behance: "",
  dribbble: "",
  linkedin: "",
  instagram: "",
  facebook: "",
  youtube: "",

  isActive: true,
};

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            h-12 w-full rounded-xl
            border border-zinc-200
            bg-zinc-50/80
            ${icon ? "pl-11" : "px-4"}
            pr-4
            text-sm text-zinc-900
            placeholder:text-zinc-400
            outline-none
            transition-all duration-200

            hover:border-zinc-300
            hover:bg-white

            focus:border-zinc-400
            focus:bg-white
            focus:ring-4
            focus:ring-zinc-900/5

            dark:border-zinc-800
            dark:bg-zinc-900/70
            dark:text-zinc-100
            dark:placeholder:text-zinc-600

            dark:hover:border-zinc-700
            dark:hover:bg-zinc-900

            dark:focus:border-zinc-600
            dark:focus:bg-zinc-900
            dark:focus:ring-white/5
          `}
        />
      </div>
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (
    event: ChangeEvent<HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </label>

      <textarea
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full resize-y rounded-xl
          border border-zinc-200
          bg-zinc-50/80
          px-4 py-3.5
          text-sm leading-6
          text-zinc-900
          placeholder:text-zinc-400
          outline-none
          transition-all duration-200

          hover:border-zinc-300
          hover:bg-white

          focus:border-zinc-400
          focus:bg-white
          focus:ring-4
          focus:ring-zinc-900/5

          dark:border-zinc-800
          dark:bg-zinc-900/70
          dark:text-zinc-100
          dark:placeholder:text-zinc-600

          dark:hover:border-zinc-700
          dark:hover:bg-zinc-900

          dark:focus:border-zinc-600
          dark:focus:bg-zinc-900
          dark:focus:ring-white/5
        "
      />
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400">
        {eyebrow}
      </div>

      <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
        {title}
      </h2>

      <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function ImageUploader({
  label,
  preview,
  onChange,
  onRemove,
  inputRef,
}: {
  label: string;
  preview?: ImagePreview;
  onChange: (
    event: ChangeEvent<HTMLInputElement>
  ) => void;
  onRemove: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">
          {label}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          JPG, PNG or WebP
        </p>
      </div>

      {preview ? (
        <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
          <img
            src={preview.url}
            alt={label}
            className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
            <span className="text-xs font-medium text-white">
              Current image
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/25"
              >
                Replace
              </button>

              <button
                type="button"
                onClick={onRemove}
                className="rounded-lg bg-red-500/80 p-2 text-white transition hover:bg-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="
            flex h-56 w-full flex-col
            items-center justify-center
            rounded-2xl border border-dashed
            border-zinc-300
            bg-zinc-50/70
            text-center
            transition-all duration-200

            hover:border-zinc-400
            hover:bg-zinc-100

            dark:border-zinc-700
            dark:bg-zinc-900/60

            dark:hover:border-zinc-600
            dark:hover:bg-zinc-900
          "
        >
          <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
            <ImageIcon
              size={22}
              className="text-zinc-500 dark:text-zinc-300"
            />
          </div>

          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            Upload {label.toLowerCase()}
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            Click to browse image
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}

export default function Profile() {
  const {
    data: profile,
    isLoading,
    isFetching,
    refetch,
  } = useGetProfileQuery();

  const [createProfile, createState] =
    useCreateProfileMutation();

  const [updateProfile, updateState] =
    useUpdateProfileMutation();

  const [deleteProfile, deleteState] =
    useDeleteProfileMutation();

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [profileImage, setProfileImage] =
    useState<ImagePreview>();

  const [coverImage, setCoverImage] =
    useState<ImagePreview>();

  const profileImageRef =
    useRef<HTMLInputElement>(null);

  const coverImageRef =
    useRef<HTMLInputElement>(null);

  const isSaving =
    createState.isLoading ||
    updateState.isLoading;

  const isDeleting =
    deleteState.isLoading;

  useEffect(() => {
    if (!profile) return;

    setForm({
      name: profile.name || "",
      title: profile.title || "",
      shortBio: profile.shortBio || "",
      bio: profile.bio || "",

      location: profile.location || "",
      email: profile.email || "",
      phone: profile.phone || "",
      website: profile.website || "",

      availability: profile.availability || "",

      yearsOfExperience:
        profile.yearsOfExperience !== undefined
          ? String(profile.yearsOfExperience)
          : "",

      resumeUrl: profile.resumeUrl || "",

      behance:
        profile.socialLinks?.behance || "",
      dribbble:
        profile.socialLinks?.dribbble || "",
      linkedin:
        profile.socialLinks?.linkedin || "",
      instagram:
        profile.socialLinks?.instagram || "",
      facebook:
        profile.socialLinks?.facebook || "",
      youtube:
        profile.socialLinks?.youtube || "",

      isActive: profile.isActive,
    });

    if (profile.profileImage?.url) {
      setProfileImage({
        url: profile.profileImage.url,
      });
    }

    if (profile.coverImage?.url) {
      setCoverImage({
        url: profile.coverImage.url,
      });
    }
  }, [profile]);

  const updateField = <
    K extends keyof FormState
  >(
    key: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover"
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    const preview = {
      url: URL.createObjectURL(file),
      file,
    };

    if (type === "profile") {
      setProfileImage(preview);
    } else {
      setCoverImage(preview);
    }
  };

  const removeImage = (
    type: "profile" | "cover"
  ) => {
    if (type === "profile") {
      setProfileImage(undefined);

      if (profileImageRef.current) {
        profileImageRef.current.value = "";
      }
    } else {
      setCoverImage(undefined);

      if (coverImageRef.current) {
        coverImageRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Professional title is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      title: form.title.trim(),

      shortBio:
        form.shortBio.trim() || undefined,

      bio:
        form.bio.trim() || undefined,

      location:
        form.location.trim() || undefined,

      email:
        form.email.trim() || undefined,

      phone:
        form.phone.trim() || undefined,

      website:
        form.website.trim() || undefined,

      availability:
        form.availability.trim() || undefined,

      yearsOfExperience:
        form.yearsOfExperience
          ? Number(form.yearsOfExperience)
          : undefined,

      resumeUrl:
        form.resumeUrl.trim() || undefined,

      socialLinks: {
        behance:
          form.behance.trim() || undefined,

        dribbble:
          form.dribbble.trim() || undefined,

        linkedin:
          form.linkedin.trim() || undefined,

        instagram:
          form.instagram.trim() || undefined,

        facebook:
          form.facebook.trim() || undefined,

        youtube:
          form.youtube.trim() || undefined,
      },

      isActive: form.isActive,
    };

    const formData = new FormData();

    formData.append(
      "data",
      JSON.stringify(payload)
    );

    if (profileImage?.file) {
      formData.append(
        "profileImage",
        profileImage.file
      );
    }

    if (coverImage?.file) {
      formData.append(
        "coverImage",
        coverImage.file
      );
    }

    try {
      if (profile?._id) {
        await updateProfile(
          formData
        ).unwrap();

        toast.success(
          "Profile updated successfully."
        );
      } else {
        await createProfile(
          formData
        ).unwrap();

        toast.success(
          "Profile created successfully."
        );
      }

      await refetch();
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Something went wrong."
      );
    }
  };

  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete the profile?"
      );

    if (!confirmed) return;

    try {
      await deleteProfile().unwrap();

      setForm(initialForm);
      setProfileImage(undefined);
      setCoverImage(undefined);

      toast.success(
        "Profile deleted successfully."
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to delete profile."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={28}
            className="animate-spin text-zinc-500"
          />

          <p className="text-sm text-zinc-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl pb-12">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
            <User size={14} />
            Profile Management
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            Profile & About
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Manage the personal information, biography,
            images and social presence shown across the
            portfolio website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <div
              className={`
                inline-flex items-center gap-2
                rounded-full border px-3.5 py-2
                text-xs font-semibold

                ${
                  form.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                }
              `}
            >
              <span
                className={`
                  h-1.5 w-1.5 rounded-full
                  ${
                    form.isActive
                      ? "bg-emerald-500"
                      : "bg-zinc-400"
                  }
                `}
              />

              {form.isActive
                ? "Profile Active"
                : "Profile Inactive"}
            </div>
          )}

          {isFetching && (
            <Loader2
              size={17}
              className="animate-spin text-zinc-400"
            />
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Basic Information */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-7">
          <SectionHeader
            eyebrow="01 / Identity"
            title="Basic Information"
            description="The core information visitors will see throughout the portfolio."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Full Name *"
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              placeholder="Sumaiya Haque"
              icon={<User size={17} />}
            />

            <InputField
              label="Professional Title *"
              value={form.title}
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value
                )
              }
              placeholder="Graphic Designer & Visual Creative"
            />

            <div className="md:col-span-2">
              <InputField
                label="Short Bio"
                value={form.shortBio}
                onChange={(event) =>
                  updateField(
                    "shortBio",
                    event.target.value
                  )
                }
                placeholder="A short introduction for the hero section..."
              />
            </div>

            <div className="md:col-span-2">
              <TextareaField
                label="Full Biography"
                value={form.bio}
                onChange={(event) =>
                  updateField(
                    "bio",
                    event.target.value
                  )
                }
                placeholder="Write a detailed biography..."
                rows={7}
              />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-7">
          <SectionHeader
            eyebrow="02 / Visual Identity"
            title="Profile Images"
            description="Manage the profile and cover imagery used throughout the public portfolio."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <ImageUploader
              label="Profile Image"
              preview={profileImage}
              onChange={(event) =>
                handleImageChange(
                  event,
                  "profile"
                )
              }
              onRemove={() =>
                removeImage("profile")
              }
              inputRef={profileImageRef}
            />

            <ImageUploader
              label="Cover Image"
              preview={coverImage}
              onChange={(event) =>
                handleImageChange(
                  event,
                  "cover"
                )
              }
              onRemove={() =>
                removeImage("cover")
              }
              inputRef={coverImageRef}
            />
          </div>
        </section>

        {/* Contact */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-7">
          <SectionHeader
            eyebrow="03 / Contact"
            title="Contact Information"
            description="These details can be used by the contact section and portfolio visitors."
          />

          <div className="grid gap-5 md:grid-cols-2">
            <InputField
              label="Location"
              value={form.location}
              onChange={(event) =>
                updateField(
                  "location",
                  event.target.value
                )
              }
              placeholder="Dhaka, Bangladesh"
              icon={<MapPin size={17} />}
            />

            <InputField
              label="Email"
              value={form.email}
              onChange={(event) =>
                updateField(
                  "email",
                  event.target.value
                )
              }
              placeholder="hello@example.com"
              type="email"
              icon={<Mail size={17} />}
            />

            <InputField
              label="Phone"
              value={form.phone}
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value
                )
              }
              placeholder="+880 1XXXXXXXXX"
              icon={<Phone size={17} />}
            />

            <InputField
              label="Website"
              value={form.website}
              onChange={(event) =>
                updateField(
                  "website",
                  event.target.value
                )
              }
              placeholder="https://example.com"
              icon={<ExternalLink size={17} />}
            />

            <InputField
              label="Availability"
              value={form.availability}
              onChange={(event) =>
                updateField(
                  "availability",
                  event.target.value
                )
              }
              placeholder="Available for freelance projects"
            />

            <InputField
              label="Years of Experience"
              value={form.yearsOfExperience}
              onChange={(event) =>
                updateField(
                  "yearsOfExperience",
                  event.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="5"
              type="number"
            />
          </div>
        </section>

        {/* Resume */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-7">
          <SectionHeader
            eyebrow="04 / Career"
            title="Resume"
            description="Add the public URL of the resume or CV visitors can access."
          />

          <InputField
            label="Resume URL"
            value={form.resumeUrl}
            onChange={(event) =>
              updateField(
                "resumeUrl",
                event.target.value
              )
            }
            placeholder="https://example.com/resume.pdf"
            icon={<FileText size={17} />}
          />
        </section>

       
         

        {/* Status */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-7">
          <SectionHeader
            eyebrow="06 / Visibility"
            title="Profile Status"
            description="Control whether this profile should be active on the public website."
          />

          <button
            type="button"
            onClick={() =>
              updateField(
                "isActive",
                !form.isActive
              )
            }
            className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 text-left transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
          >
            <div className="flex items-center gap-3">
              <div
                className={`
                  flex h-10 w-10 items-center justify-center rounded-xl
                  ${
                    form.isActive
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
                  }
                `}
              >
                <Check size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Public Profile
                </p>

                <p className="mt-0.5 text-xs text-zinc-500">
                  {form.isActive
                    ? "Profile is visible on the website."
                    : "Profile is currently hidden."}
                </p>
              </div>
            </div>

            <div
              className={`
                relative h-6 w-11 rounded-full transition
                ${
                  form.isActive
                    ? "bg-emerald-500"
                    : "bg-zinc-300 dark:bg-zinc-700"
                }
              `}
            >
              <span
                className={`
                  absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition
                  ${
                    form.isActive
                      ? "left-6"
                      : "left-1"
                  }
                `}
              />
            </div>
          </button>
        </section>

        {/* Actions */}
        <div className="sticky bottom-4 z-20 flex flex-col-reverse gap-3 rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {profile && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSaving}
                className="
                  inline-flex items-center gap-2
                  rounded-xl px-4 py-2.5
                  text-sm font-semibold
                  text-red-500
                  transition
                  hover:bg-red-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  dark:hover:bg-red-950/30
                "
              >
                {isDeleting ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={16} />
                )}

                Delete Profile
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-zinc-950
              px-6
              py-3
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-zinc-950/10
              transition-all
              hover:-translate-y-0.5
              hover:bg-zinc-800
              disabled:cursor-not-allowed
              disabled:opacity-60

              dark:bg-white
              dark:text-zinc-950
              dark:hover:bg-zinc-200
            "
          >
            {isSaving ? (
              <Loader2
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            {profile
              ? "Save Changes"
              : "Create Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}