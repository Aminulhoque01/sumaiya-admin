 
import { baseApi } from "../api/baseApi";

/* =========================
   Cloudinary Image
========================= */

export interface CloudinaryImage {
  url: string;
  publicId: string;
}

/* =========================
   Category
========================= */

export interface ProjectCategory {
  _id: string;
  name: string;
  slug?: string;
}

/* =========================
   Case Study
========================= */

export interface ProjectCaseStudy {
  overview?: string;
  challenge?: string;
  solution?: string;
  process?: string;
  result?: string;
}

/* =========================
   SEO
========================= */

export interface ProjectSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

/* =========================
   Project
========================= */

export interface Project {
  _id: string;

  title: string;
  slug?: string;

  shortDescription: string;
  description: string;

  thumbnail?: CloudinaryImage;

  gallery?: CloudinaryImage[];

  category:
    | string
    | ProjectCategory;

  tools?: string[];

  client?: string;
  projectDate?: string;

  featured?: boolean;
  isPublished?: boolean;

  order?: number;

  projectUrl?: string;
  behanceUrl?: string;
  dribbbleUrl?: string;

  caseStudy?: ProjectCaseStudy;

  seo?: ProjectSEO;

  createdAt?: string;
  updatedAt?: string;
}

/* =========================
   API Responses
========================= */

interface ProjectListResponse {
  success: boolean;
  message: string;
  data: Project[];
}

interface ProjectResponse {
  success: boolean;
  message: string;
  data: Project;
}

interface DeleteProjectResponse {
  success: boolean;
  message: string;
}

/* =========================
   Create Payload
========================= */

export interface CreateProjectData {
  title: string;
  slug?: string;

  shortDescription: string;
  description: string;

  category: string;

  tools?: string[];

  client?: string;
  projectDate?: string;

  featured?: boolean;
  isPublished?: boolean;

  order?: number;

  projectUrl?: string;
  behanceUrl?: string;
  dribbbleUrl?: string;

  caseStudy?: ProjectCaseStudy;

  seo?: ProjectSEO;
}

/* =========================
   Update Payload
========================= */

export interface UpdateProjectData
  extends Partial<CreateProjectData> {
  thumbnail?: CloudinaryImage;
  gallery?: CloudinaryImage[];
}

/* =========================
   API
========================= */

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* =========================
       Get All Projects
    ========================= */

    getAllProjects: builder.query<
      Project[],
      void
    >({
      query: () => "/projects/all",

      transformResponse: (
        response: ProjectListResponse
      ) => response.data,

      providesTags: (result) =>
        result
          ? [
              ...result.map((project) => ({
                type: "Project" as const,
                id: project._id,
              })),
              {
                type: "Project" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "Project" as const,
                id: "LIST",
              },
            ],
    }),

    /* =========================
       Get Single Project
    ========================= */

    getProjectById: builder.query<
      Project,
      string
    >({
      query: (id) => `/projects/${id}`,

      transformResponse: (
        response: ProjectResponse
      ) => response.data,

      providesTags: (_result, _error, id) => [
        {
          type: "Project",
          id,
        },
      ],
    }),

    /* =========================
       Create Project
    ========================= */

    createProject: builder.mutation<
      Project,
      FormData
    >({
      query: (formData) => ({
        url: "/projects",
        method: "POST",
        body: formData,
      }),

      transformResponse: (
        response: ProjectResponse
      ) => response.data,

      invalidatesTags: [
        {
          type: "Project",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    /* =========================
       Update Project
    ========================= */

    updateProject: builder.mutation<
      Project,
      {
        id: string;
        body: UpdateProjectData;
      }
    >({
      query: ({ id, body }) => ({
        url: `/projects/${id}`,
        method: "PATCH",
        body,
      }),

      transformResponse: (
        response: ProjectResponse
      ) => response.data,

      invalidatesTags: (_result, _error, { id }) => [
        {
          type: "Project",
          id,
        },
        {
          type: "Project",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    /* =========================
       Delete Project
    ========================= */

    deleteProject: builder.mutation<
      DeleteProjectResponse,
      string
    >({
      query: (id) => ({
        url: `/projects/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Project",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetAllProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
 
