 
import { baseApi } from "../api/baseApi";

export interface DashboardStats {
  projects?: {
    total?: number;
    published?: number;
    featured?: number;
    draft?: number;
  };

  services?: number;
  skills?: number;
  experiences?: number;
  testimonials?: number;

  contacts?: {
    total?: number;
    new?: number;
  };

  messages?: {
    total?: number;
    new?: number;
  };
}

interface DashboardStatsResponse {
  success: boolean;
  message?: string;
  data?: DashboardStats;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<
      DashboardStats,
      void
    >({
      query: () => "/dashboard/stats",

      transformResponse: (
        response: DashboardStatsResponse
      ) => {
        return response.data || {};
      },

      providesTags: ["Dashboard"],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetDashboardStatsQuery,
} = dashboardApi;
 
