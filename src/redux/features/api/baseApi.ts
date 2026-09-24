 
import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://sumaiya-backend.vercel.app/api";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem(
        "admin_token"
      );

      if (token) {
        headers.set(
          "Authorization",
          `Bearer ${token}`
        );
      }

      return headers;
    },
  }),

  tagTypes: [
    "Auth",
    "Dashboard",
    "Profile",
    "Project",
    "Category",
    "Service",
    "Skill",
    "Experience",
    "Testimonial",
    "Contact",
    "Settings",
    "AI",
  ],

  endpoints: () => ({}),
});
 
