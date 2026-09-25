import { baseApi } from "../api/baseApi";

export interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export type UpdateCategoryData =
  Partial<CreateCategoryData>;

interface CategoryListResponse {
  success: boolean;
  message: string;
  data: Category[];
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /categories
    getCategories: builder.query<Category[], void>({
      query: () => "/categories",

      transformResponse: (
        response: CategoryListResponse
      ) => response.data,

      providesTags: (result) =>
        result
          ? [
              ...result.map((category) => ({
                type: "Category" as const,
                id: category._id,
              })),

              {
                type: "Category" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "Category" as const,
                id: "LIST",
              },
            ],
    }),

    // POST /categories
    createCategory: builder.mutation<
      Category,
      CreateCategoryData
    >({
      query: (body) => ({
        url: "/categories",
        method: "POST",
        body,
      }),

      transformResponse: (
        response: CategoryResponse
      ) => response.data,

      invalidatesTags: [
        {
          type: "Category",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    // PATCH /categories/:id
    updateCategory: builder.mutation<
      Category,
      {
        id: string;
        body: UpdateCategoryData;
      }
    >({
      query: ({ id, body }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body,
      }),

      transformResponse: (
        response: CategoryResponse
      ) => response.data,

      invalidatesTags: (
        _result,
        _error,
        { id }
      ) => [
        {
          type: "Category",
          id,
        },
        {
          type: "Category",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    // DELETE /categories/:id
    deleteCategory: builder.mutation<
      DeleteCategoryResponse,
      string
    >({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Category",
          id: "LIST",
        },
        "Dashboard",
        "Project",
      ],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
 
