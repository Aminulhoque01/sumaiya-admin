import { baseApi } from "../api/baseApi";

export interface ServiceImage {
  url: string;
  publicId: string;
  alt?: string;
}

export interface Service {
  _id: string;
  title: string;
  slug?: string;
  shortDescription: string;
  description?: string;
  icon?: string;
  image?: ServiceImage;
  features: string[];
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceData {
  title: string;
  slug?: string;
  shortDescription: string;
  description?: string;
  icon?: string;
  features?: string[];
  order?: number;
  isActive?: boolean;
}

export type UpdateServiceData =
  Partial<CreateServiceData>;

interface ServiceListResponse {
  success: boolean;
  message: string;
  data: Service[];
}

interface ServiceResponse {
  success: boolean;
  message: string;
  data: Service;
}

interface DeleteServiceResponse {
  success: boolean;
  message: string;
}

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<Service[], void>({
      query: () => "/services",
      transformResponse: (
        response: ServiceListResponse
      ) => response.data,

      providesTags: (result) =>
        result
          ? [
              ...result.map((service) => ({
                type: "Service" as const,
                id: service._id,
              })),
              {
                type: "Service" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "Service" as const,
                id: "LIST",
              },
            ],
    }),

    createService: builder.mutation<
      Service,
      CreateServiceData
    >({
      query: (body) => ({
        url: "/services",
        method: "POST",
        body,
      }),

      transformResponse: (
        response: ServiceResponse
      ) => response.data,

      invalidatesTags: [
        {
          type: "Service",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    updateService: builder.mutation<
      Service,
      {
        id: string;
        body: UpdateServiceData;
      }
    >({
      query: ({ id, body }) => ({
        url: `/services/${id}`,
        method: "PATCH",
        body,
      }),

      transformResponse: (
        response: ServiceResponse
      ) => response.data,

      invalidatesTags: (
        _result,
        _error,
        { id }
      ) => [
        {
          type: "Service",
          id,
        },
        {
          type: "Service",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    deleteService: builder.mutation<
      DeleteServiceResponse,
      string
    >({
      query: (id) => ({
        url: `/services/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Service",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetServicesQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;