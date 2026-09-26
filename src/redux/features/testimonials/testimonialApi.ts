import { baseApi } from "../api/baseApi";

export interface TestimonialAvatar {
  url: string;
  publicId: string;
  alt?: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: TestimonialAvatar;
  message: string;
  rating?: number;
  project?: string;
  order: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface TestimonialListResponse {
  success: boolean;
  message: string;
  data: Testimonial[];
}

interface TestimonialResponse {
  success: boolean;
  message: string;
  data: Testimonial;
}

interface DeleteTestimonialResponse {
  success: boolean;
  message: string;
}

export const testimonialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // Get all - Admin
    // ==========================================

    getAllTestimonials: builder.query<
      Testimonial[],
      void
    >({
      query: () => "/testimonials/all",

      transformResponse: (
        response: TestimonialListResponse
      ) => response.data,

      providesTags: (result) =>
        result
          ? [
              ...result.map((testimonial) => ({
                type: "Testimonial" as const,
                id: testimonial._id,
              })),
              {
                type: "Testimonial" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "Testimonial" as const,
                id: "LIST",
              },
            ],
    }),

    // ==========================================
    // Single
    // ==========================================

    getTestimonialById: builder.query<
      Testimonial,
      string
    >({
      query: (id) =>
        `/testimonials/${id}`,

      transformResponse: (
        response: TestimonialResponse
      ) => response.data,

      providesTags: (_result, _error, id) => [
        {
          type: "Testimonial",
          id,
        },
      ],
    }),

    // ==========================================
    // Create
    // ==========================================

    createTestimonial: builder.mutation<
      Testimonial,
      FormData
    >({
      query: (body) => ({
        url: "/testimonials",
        method: "POST",
        body,
      }),

      transformResponse: (
        response: TestimonialResponse
      ) => response.data,

      invalidatesTags: [
        {
          type: "Testimonial",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    // ==========================================
    // Update
    // ==========================================

    updateTestimonial: builder.mutation<
      Testimonial,
      {
        id: string;
        body: FormData;
      }
    >({
      query: ({ id, body }) => ({
        url: `/testimonials/${id}`,
        method: "PATCH",
        body,
      }),

      transformResponse: (
        response: TestimonialResponse
      ) => response.data,

      invalidatesTags: (
        _result,
        _error,
        { id }
      ) => [
        {
          type: "Testimonial",
          id,
        },
        {
          type: "Testimonial",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    // ==========================================
    // Delete
    // ==========================================

    deleteTestimonial: builder.mutation<
      DeleteTestimonialResponse,
      string
    >({
      query: (id) => ({
        url: `/testimonials/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Testimonial",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetAllTestimonialsQuery,
  useGetTestimonialByIdQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
} = testimonialApi;