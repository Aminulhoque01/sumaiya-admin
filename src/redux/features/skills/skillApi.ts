import { baseApi } from "../api/baseApi";

export interface Skill {
  _id: string;
  name: string;
  slug: string;
  category: string;
  icon?: string;
  proficiency?: number;
  experience?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSkillData {
  name: string;
  slug?: string;
  category: string;
  icon?: string;
  proficiency?: number;
  experience?: string;
  order?: number;
  isActive?: boolean;
}

export type UpdateSkillData =
  Partial<CreateSkillData>;

interface SkillListResponse {
  success: boolean;
  message: string;
  data: Skill[];
}

interface SkillResponse {
  success: boolean;
  message: string;
  data: Skill;
}

interface DeleteSkillResponse {
  success: boolean;
  message: string;
}

export const skillApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ============================
    // Get All Skills - Admin
    // ============================
    getAllSkills: builder.query<Skill[], void>({
      query: () => "/skills/all",

      transformResponse: (
        response: SkillListResponse
      ) => response.data,

      providesTags: (result) =>
        result
          ? [
              ...result.map((skill) => ({
                type: "Skill" as const,
                id: skill._id,
              })),
              {
                type: "Skill" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "Skill" as const,
                id: "LIST",
              },
            ],
    }),

    // ============================
    // Get Single Skill
    // ============================
    getSkillById: builder.query<Skill, string>({
      query: (id) => `/skills/${id}`,

      transformResponse: (
        response: SkillResponse
      ) => response.data,

      providesTags: (_result, _error, id) => [
        {
          type: "Skill",
          id,
        },
      ],
    }),

    // ============================
    // Create Skill
    // ============================
    createSkill: builder.mutation<
      Skill,
      CreateSkillData
    >({
      query: (body) => ({
        url: "/skills",
        method: "POST",
        body,
      }),

      transformResponse: (
        response: SkillResponse
      ) => response.data,

      invalidatesTags: [
        {
          type: "Skill",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    // ============================
    // Update Skill
    // ============================
    updateSkill: builder.mutation<
      Skill,
      {
        id: string;
        body: UpdateSkillData;
      }
    >({
      query: ({ id, body }) => ({
        url: `/skills/${id}`,
        method: "PATCH",
        body,
      }),

      transformResponse: (
        response: SkillResponse
      ) => response.data,

      invalidatesTags: (_result, _error, { id }) => [
        {
          type: "Skill",
          id,
        },
        {
          type: "Skill",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    // ============================
    // Delete Skill
    // ============================
    deleteSkill: builder.mutation<
      DeleteSkillResponse,
      string
    >({
      query: (id) => ({
        url: `/skills/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Skill",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetAllSkillsQuery,
  useGetSkillByIdQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useDeleteSkillMutation,
} = skillApi;