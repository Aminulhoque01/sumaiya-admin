 
import { baseApi } from "../api/baseApi";

/* =========================================================
   Types
========================================================= */

export type ContactStatus =
  | "NEW"
  | "READ"
  | "REPLIED"
  | "ARCHIVED";

export interface ContactReply {
  message: string;
  sentAt: string;
  messageId?: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  replies: ContactReply[];
  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   API Response Types
========================================================= */

interface ContactListResponse {
  success: boolean;
  message?: string;
  data: Contact[];
}

interface ContactResponse {
  success: boolean;
  message?: string;
  data: Contact;
}

interface DeleteContactResponse {
  success: boolean;
  message?: string;
}

/* =========================================================
   Payload Types
========================================================= */

export interface UpdateContactData {
  status: ContactStatus;
}

export interface ReplyContactData {
  message: string;
}

/* =========================================================
   Contact API
========================================================= */

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* -----------------------------------------------------
       Get All Contacts
    ----------------------------------------------------- */

    getAllContacts: builder.query<Contact[], void>({
      query: () => ({
        url: "/contacts",
        method: "GET",
      }),

      transformResponse: (
        response: ContactListResponse
      ) => {
        return response.data ?? [];
      },

      providesTags: (result) => {
        if (!result) {
          return [
            {
              type: "Contact" as const,
              id: "LIST",
            },
          ];
        }

        return [
          ...result.map((contact) => ({
            type: "Contact" as const,
            id: contact._id,
          })),

          {
            type: "Contact" as const,
            id: "LIST",
          },
        ];
      },
    }),

    /* -----------------------------------------------------
       Get Single Contact
    ----------------------------------------------------- */

    getContactById: builder.query<Contact, string>({
      query: (id) => ({
        url: `/contacts/${id}`,
        method: "GET",
      }),

      transformResponse: (
        response: ContactResponse
      ) => {
        return response.data;
      },

      providesTags: (_result, _error, id) => [
        {
          type: "Contact",
          id,
        },
      ],
    }),

    /* -----------------------------------------------------
       Update Contact Status
    ----------------------------------------------------- */

    updateContact: builder.mutation<
      Contact,
      {
        id: string;
        body: UpdateContactData;
      }
    >({
      query: ({ id, body }) => ({
        url: `/contacts/${id}`,
        method: "PATCH",
        body,
      }),

      transformResponse: (
        response: ContactResponse
      ) => {
        return response.data;
      },

      invalidatesTags: (_result, _error, { id }) => [
        {
          type: "Contact",
          id,
        },
        {
          type: "Contact",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    /* -----------------------------------------------------
       Send Email Reply
       
       POST:
       /api/contacts/:id/reply
    ----------------------------------------------------- */

    replyToContact: builder.mutation<
      Contact,
      {
        id: string;
        body: ReplyContactData;
      }
    >({
      query: ({ id, body }) => ({
        url: `/contacts/${id}`,
        method: "POST",
        body: {
          message: body.message.trim(),
        },
      }),

      transformResponse: (
        response: ContactResponse
      ) => {
        return response.data;
      },

      invalidatesTags: (_result, _error, { id }) => [
        {
          type: "Contact",
          id,
        },
        {
          type: "Contact",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),

    /* -----------------------------------------------------
       Delete Contact
    ----------------------------------------------------- */

    deleteContact: builder.mutation<
      DeleteContactResponse,
      string
    >({
      query: (id) => ({
        url: `/contacts/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        {
          type: "Contact",
          id: "LIST",
        },
        "Dashboard",
      ],
    }),
  }),

  overrideExisting: true,
});

/* =========================================================
   Hooks
========================================================= */

export const {
  useGetAllContactsQuery,
  useGetContactByIdQuery,
  useUpdateContactMutation,
  useReplyToContactMutation,
  useDeleteContactMutation,
} = contactApi;
 
