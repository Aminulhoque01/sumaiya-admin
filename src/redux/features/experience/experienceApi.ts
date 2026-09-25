import { baseApi } from "../api/baseApi";

export interface Experience {
  _id: string;
  company: string;
  position: string;
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  responsibilities: string[];
  technologies: string[];
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExperienceData {
  company: string;
  position: string;
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  responsibilities?: string[];
  technologies?: string[];
  order?: number;
  isActive?: boolean;
}

export type UpdateExperienceData =
  Partial<CreateExperienceData>;

interface ExperienceListResponse {
  success: boolean;
  message: string;
  data: Experience[];
}

interface ExperienceResponse {
  success: boolean;
  message: string;
  data: Experience;
}

interface DeleteExperienceResponse {
  success: boolean;
  message: string;
}

export const experienceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // Admin - All Experiences
    // ==========================================

    getAllExperiences: builder.query<
      Experience[],
      void
    >({
      query: () => "/experiences/all",

      transformResponse: (
        response: ExperienceListResponse
      ) => response.data,

      providesTags: (result) =>
        result
          ? [
              ...result.map((experience) => ({
                type: "Experience" as const,
                id: experience._id,
              })),
              {
                type: "Experience" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "Experience" as const,
                id: "LIST",
              },
            ],
    }),

    // ==========================================
    // Single Experience
    // ==========================================

    getExperienceById: builder.query<
      Experience,
      string
    >({
      query: (id) => `/experiences/${id}`,

      transformResponse: (
        response: ExperienceResponse
      ) => response.data,

      providesTags: (_result, _error, id) => [
        {
          type: "Experience",
          id,
        },
      ],
    }),

    // ==========================================
    // Create
    // ==========================================

    createExperience: builder.mutation<
      Experience,
      CreateExperienceData
    >({
      query: (body) => ({
        url: "/experiences",
        method: "POST",
        body,
      }),

      transformResponse: (
        response: ExperienceResponse
      ) => response.data,

      invalidatesTags: [
        {
          type: "Experience",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    // ==========================================
    // Update
    // ==========================================

    updateExperience: builder.mutation<
      Experience,
      {
        id: string;
        body: UpdateExperienceData;
      }
    >({
      query: ({ id, body }) => ({
        url: `/experiences/${id}`,
        method: "PATCH",
        body,
      }),

      transformResponse: (
        response: ExperienceResponse
      ) => response.data,

      invalidatesTags: (
        _result,
        _error,
        { id }
      ) => [
        {
          type: "Experience",
          id,
        },
        {
          type: "Experience",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    // ==========================================
    // Delete
    // ==========================================

    deleteExperience: builder.mutation<
      DeleteExperienceResponse,
      string
    >({
      query: (id) => ({
        url: `/experiences/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Experience",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetAllExperiencesQuery,
  useGetExperienceByIdQuery,
  useCreateExperienceMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} = experienceApi;