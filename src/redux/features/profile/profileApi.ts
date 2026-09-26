import { baseApi } from "../api/baseApi";

export interface ProfileImage {
  url: string;
  publicId: string;
  alt?: string;
}

export interface SocialLinks {
  behance?: string;
  dribbble?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
}

export interface Profile {
  _id: string;

  name: string;
  title: string;

  shortBio?: string;
  bio?: string;

  profileImage?: ProfileImage;
  coverImage?: ProfileImage;

  location?: string;
  email?: string;
  phone?: string;
  website?: string;

  availability?: string;

  yearsOfExperience?: number;

  resumeUrl?: string;

  socialLinks?: SocialLinks;

  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data: Profile;
}

export interface DeleteProfileResponse {
  success: boolean;
  message: string;
}

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<Profile, void>({
      query: () => "/profile/admin",

      transformResponse: (
        response: ProfileResponse
      ) => response.data,

      providesTags: ["Profile"],
    }),

    createProfile: builder.mutation<
      Profile,
      FormData
    >({
      query: (body) => ({
        url: "/profile",
        method: "POST",
        body,
      }),

      transformResponse: (
        response: ProfileResponse
      ) => response.data,

      invalidatesTags: [
        "Profile",
        "Dashboard",
      ],
    }),

    updateProfile: builder.mutation<
      Profile,
      FormData
    >({
      query: (body) => ({
        url: "/profile",
        method: "PATCH",
        body,
      }),

      transformResponse: (
        response: ProfileResponse
      ) => response.data,

      invalidatesTags: [
        "Profile",
        "Dashboard",
      ],
    }),

    deleteProfile: builder.mutation<
      DeleteProfileResponse,
      void
    >({
      query: () => ({
        url: "/profile",
        method: "DELETE",
      }),

      invalidatesTags: [
        "Profile",
        "Dashboard",
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
} = profileApi;