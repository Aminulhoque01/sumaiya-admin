 
import { baseApi } from "../api/baseApi";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AdminUser {
  _id?: string;
  name?: string;
  email: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    accessToken?: string;
    user?: AdminUser;
    admin?: AdminUser;
  };
  token?: string;
  accessToken?: string;
  user?: AdminUser;
  admin?: AdminUser;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      LoginResponse,
      LoginRequest
    >({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useLoginMutation,
} = authApi;
 
