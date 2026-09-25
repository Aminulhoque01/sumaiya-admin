 
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

interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => "/categories",

      transformResponse: (
        response: CategoryResponse
      ) => response.data,

      providesTags: ["Category"],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetCategoriesQuery,
} = categoryApi;
 
