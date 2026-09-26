import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Archive,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock3,
  Inbox,
  Loader2,
  Mail,
  MailOpen,
  MessageCircle,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Reply,
  Search,
  Send,
  Trash2,
  User,
 
} from "lucide-react";

import { toast } from "sonner";
import { useDeleteContactMutation, useGetAllContactsQuery, useReplyToContactMutation, useUpdateContactMutation, type Contact, type ContactStatus } from "../../redux/features/contacts/contactApi";

 

type FilterStatus =
  | "ALL"
  | ContactStatus;

const statusConfig: Record<
  ContactStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
  NEW: {
    label: "New",
    className:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dotClassName: "bg-blue-500",
  },

  READ: {
    label: "Read",
    className:
      "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    dotClassName: "bg-slate-500",
  },

  REPLIED: {
    label: "Replied",
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dotClassName: "bg-emerald-500",
  },

  ARCHIVED: {
    label: "Archived",
    className:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    dotClassName: "bg-orange-500",
  },
};

const formatDate = (
  date: string
) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(value);
};

const formatTime = (
  date: string
) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(value);
};

const getInitials = (
  name: string
) => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getPreview = (
  message: string,
  length = 105
) => {
  if (message.length <= length) {
    return message;
  }

  return `${message.slice(0, length)}...`;
};

const Contacts = () => {
  const {
    data: contacts = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetAllContactsQuery();

  const [
    updateContact,
    {
      isLoading: isUpdating,
    },
  ] = useUpdateContactMutation();

  const [
    replyToContact,
    {
      isLoading: isReplying,
    },
  ] = useReplyToContactMutation();

  const [
    deleteContact,
    {
      isLoading: isDeleting,
    },
  ] = useDeleteContactMutation();

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<FilterStatus>("ALL");

  const [
    selectedContactId,
    setSelectedContactId,
  ] = useState<string | null>(null);

  const [
    replyMessage,
    setReplyMessage,
  ] = useState("");

  const [
    showMobileDetail,
    setShowMobileDetail,
  ] = useState(false);

  const selectedContact = useMemo(
    () =>
      contacts.find(
        (contact) =>
          contact._id === selectedContactId
      ) ?? null,
    [
      contacts,
      selectedContactId,
    ]
  );

  const stats = useMemo(() => {
    return {
      total: contacts.length,

      new: contacts.filter(
        (item) =>
          item.status === "NEW"
      ).length,

      read: contacts.filter(
        (item) =>
          item.status === "READ"
      ).length,

      replied: contacts.filter(
        (item) =>
          item.status === "REPLIED"
      ).length,

      archived: contacts.filter(
        (item) =>
          item.status === "ARCHIVED"
      ).length,
    };
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return contacts.filter(
      (contact) => {
        const matchesSearch =
          !normalizedSearch ||
          contact.name
            .toLowerCase()
            .includes(normalizedSearch) ||
          contact.email
            .toLowerCase()
            .includes(normalizedSearch) ||
          contact.subject
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          contact.message
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "ALL" ||
          contact.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    contacts,
    search,
    statusFilter,
  ]);

  useEffect(() => {
    if (!selectedContact) {
      setReplyMessage("");
      return;
    }

    setReplyMessage("");
  }, [selectedContactId]);

  const handleSelectContact = async (
    contact: Contact
  ) => {
    setSelectedContactId(
      contact._id
    );

    setShowMobileDetail(true);

    if (contact.status === "NEW") {
      try {
        await updateContact({
          id: contact._id,
          body: {
            status: "READ",
          },
        }).unwrap();
      } catch {
        // Keep opening the message even if status update fails.
      }
    }
  };

  const handleStatusChange = async (
    status: ContactStatus
  ) => {
    if (!selectedContact) {
      return;
    }

    try {
      await updateContact({
        id: selectedContact._id,
        body: {
          status,
        },
      }).unwrap();

      toast.success(
        `Message marked as ${statusConfig[status].label.toLowerCase()}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update message"
      );
    }
  };

  const handleSendReply = async () => {
    if (!selectedContact) {
      return;
    }

    const message =
      replyMessage.trim();

    if (!message) {
      toast.error(
        "Please write a reply first."
      );
      return;
    }

    try {
      await replyToContact({
        id: selectedContact._id,
        body: {
          message,
        },
      }).unwrap();

      setReplyMessage("");

      toast.success(
        `Reply sent to ${selectedContact.email}`
      );
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to send reply."
      );
    }
  };

  const handleDelete = async (
    contact: Contact
  ) => {
    const confirmed =
      window.confirm(
        `Delete message from ${contact.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteContact(
        contact._id
      ).unwrap();

      toast.success(
        "Message deleted successfully."
      );

      if (
        selectedContactId ===
        contact._id
      ) {
        setSelectedContactId(null);
        setShowMobileDetail(false);
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          "Failed to delete message."
      );
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-full bg-slate-50/70 px-4 py-5 text-slate-900 dark:bg-[#08090c] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Communication Center
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Contact Inbox
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Manage visitor messages, reply
              directly by email, and keep every
              conversation organized.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isFetching}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.07]"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isFetching
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard
            icon={Inbox}
            label="Total"
            value={stats.total}
            active={
              statusFilter === "ALL"
            }
            onClick={() =>
              setStatusFilter("ALL")
            }
          />

          <StatCard
            icon={Mail}
            label="New"
            value={stats.new}
            tone="blue"
            active={
              statusFilter === "NEW"
            }
            onClick={() =>
              setStatusFilter("NEW")
            }
          />

          <StatCard
            icon={MailOpen}
            label="Read"
            value={stats.read}
            tone="slate"
            active={
              statusFilter === "READ"
            }
            onClick={() =>
              setStatusFilter("READ")
            }
          />

          <StatCard
            icon={CheckCheck}
            label="Replied"
            value={stats.replied}
            tone="green"
            active={
              statusFilter === "REPLIED"
            }
            onClick={() =>
              setStatusFilter("REPLIED")
            }
          />

          <StatCard
            icon={Archive}
            label="Archived"
            value={stats.archived}
            tone="orange"
            active={
              statusFilter ===
              "ARCHIVED"
            }
            onClick={() =>
              setStatusFilter(
                "ARCHIVED"
              )
            }
          />
        </div>

        {/* Main inbox */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.35)] dark:border-white/[0.08] dark:bg-[#0d0f13] dark:shadow-none">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
            <div className="relative min-w-0 flex-1 sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search messages..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-white/20 dark:focus:ring-white/5"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {(
                [
                  "ALL",
                  "NEW",
                  "READ",
                  "REPLIED",
                  "ARCHIVED",
                ] as FilterStatus[]
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      status
                    )
                  }
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    statusFilter ===
                    status
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  }`}
                >
                  {status === "ALL"
                    ? "All"
                    : statusConfig[
                        status
                      ].label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="grid min-h-[620px] lg:grid-cols-[minmax(380px,0.9fr)_minmax(500px,1.1fr)]">
            {/* List */}
            <div
              className={`border-slate-200 dark:border-white/[0.08] lg:border-r ${
                showMobileDetail
                  ? "hidden lg:block"
                  : "block"
              }`}
            >
              {isLoading ? (
                <LoadingState />
              ) : filteredContacts.length ===
                0 ? (
                <EmptyState
                  search={Boolean(
                    search.trim()
                  )}
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {filteredContacts.map(
                    (contact) => (
                      <ContactListItem
                        key={
                          contact._id
                        }
                        contact={
                          contact
                        }
                        selected={
                          contact._id ===
                          selectedContactId
                        }
                        onClick={() =>
                          handleSelectContact(
                            contact
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {/* Detail */}
            <div
              className={`min-w-0 ${
                showMobileDetail
                  ? "block"
                  : "hidden lg:block"
              }`}
            >
              {selectedContact ? (
                <ConversationPanel
                  contact={
                    selectedContact
                  }
                  replyMessage={
                    replyMessage
                  }
                  setReplyMessage={
                    setReplyMessage
                  }
                  isReplying={
                    isReplying
                  }
                  isUpdating={
                    isUpdating
                  }
                  isDeleting={
                    isDeleting
                  }
                  onSendReply={
                    handleSendReply
                  }
                  onStatusChange={
                    handleStatusChange
                  }
                  onDelete={() =>
                    handleDelete(
                      selectedContact
                    )
                  }
                  onBack={() => {
                    setShowMobileDetail(
                      false
                    );
                  }}
                />
              ) : (
                <NoSelection />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: typeof Inbox;
  label: string;
  value: number;
  tone?:
    | "blue"
    | "slate"
    | "green"
    | "orange";
  active?: boolean;
  onClick?: () => void;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  tone = "slate",
  active,
  onClick,
}: StatCardProps) => {
  const toneClasses = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    slate:
      "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    green:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    orange:
      "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border p-4 text-left transition ${
        active
          ? "border-slate-300 bg-white shadow-sm dark:border-white/15 dark:bg-white/[0.06]"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-white/[0.08] dark:bg-[#0d0f13] dark:hover:border-white/15"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
};

interface ContactListItemProps {
  contact: Contact;
  selected: boolean;
  onClick: () => void;
}

const ContactListItem = ({
  contact,
  selected,
  onClick,
}: ContactListItemProps) => {
  const config =
    statusConfig[contact.status];

  const replyCount =
    contact.replies?.length ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 text-left transition ${
        selected
          ? "bg-slate-100 dark:bg-white/[0.06]"
          : "hover:bg-slate-50 dark:hover:bg-white/[0.025]"
      }`}
    >
      <div className="flex gap-3">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
          {getInitials(
            contact.name
          )}

          {contact.status ===
            "NEW" && (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500 dark:border-[#0d0f13]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className={`truncate text-sm ${
                  contact.status === "NEW"
                    ? "font-semibold"
                    : "font-medium"
                }`}
              >
                {contact.name}
              </h3>

              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-500">
                {contact.email}
              </p>
            </div>

            <span className="shrink-0 text-[11px] text-slate-400">
              {formatDate(
                contact.createdAt
              )}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${config.className}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`}
              />

              {config.label}
            </span>

            {replyCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 dark:bg-white/[0.05] dark:text-slate-400">
                <Reply className="h-3 w-3" />
                {replyCount}
              </span>
            )}
          </div>

          <p className="mt-3 truncate text-xs leading-5 text-slate-500 dark:text-slate-400">
            {contact.subject
              ? `${contact.subject} — `
              : ""}
            {getPreview(
              contact.message
            )}
          </p>
        </div>
      </div>
    </button>
  );
};

interface ConversationPanelProps {
  contact: Contact;
  replyMessage: string;
  setReplyMessage: (
    value: string
  ) => void;
  isReplying: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onSendReply: () => void;
  onStatusChange: (
    status: ContactStatus
  ) => void;
  onDelete: () => void;
  onBack: () => void;
}

const ConversationPanel = ({
  contact,
  replyMessage,
  setReplyMessage,
  isReplying,
  isUpdating,
  isDeleting,
  onSendReply,
  onStatusChange,
  onDelete,
  onBack,
}: ConversationPanelProps) => {
 statusConfig[contact.status];

  const replies =
    contact.replies ?? [];

  return (
    <div className="flex h-full min-h-[620px] flex-col">
      {/* Detail header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/[0.08]">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-white lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
            {getInitials(
              contact.name
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">
              {contact.name}
            </h2>

            <p className="truncate text-xs text-slate-500">
              {contact.email}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <StatusMenu
            status={contact.status}
            disabled={isUpdating}
            onChange={
              onStatusChange
            }
          />

          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            title="Delete"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-3xl space-y-7">
          {/* Visitor info */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <InfoItem
              icon={Mail}
              label="Email"
              value={contact.email}
            />

            <InfoItem
              icon={Phone}
              label="Phone"
              value={
                contact.phone ||
                "Not provided"
              }
            />

            <InfoItem
              icon={Clock3}
              label="Received"
              value={`${formatDate(
                contact.createdAt
              )} • ${formatTime(
                contact.createdAt
              )}`}
            />
          </div>

          {/* Subject */}
          {contact.subject && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Subject
              </p>

              <h3 className="text-lg font-semibold tracking-tight">
                {contact.subject}
              </h3>
            </div>
          )}

          {/* Original message */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/[0.08] dark:bg-white/[0.025]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm dark:bg-white/[0.06] dark:text-slate-200">
                  <User className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-semibold">
                    {contact.name}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Original message
                  </p>
                </div>
              </div>

              <span className="text-[11px] text-slate-400">
                {formatTime(
                  contact.createdAt
                )}
              </span>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
              {contact.message}
            </p>
          </div>

          {/* Reply history */}
          {replies.length > 0 && (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Reply History
                </span>

                <div className="h-px flex-1 bg-slate-200 dark:bg-white/[0.08]" />
              </div>

              <div className="space-y-3">
                {replies.map(
                  (
                    reply,
                    index
                  ) => (
                    <div
                      key={`${reply.sentAt}-${index}`}
                      className="ml-auto max-w-[92%] rounded-2xl rounded-br-md border border-emerald-500/10 bg-emerald-500/[0.06] p-4 sm:max-w-[85%]"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                            <Send className="h-3.5 w-3.5" />
                          </span>

                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            Sent reply
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-400">
                          {formatDate(
                            reply.sentAt
                          )}{" "}
                          •{" "}
                          {formatTime(
                            reply.sentAt
                          )}
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {reply.message}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reply composer */}
      <div className="border-t border-slate-200 bg-white p-4 dark:border-white/[0.08] dark:bg-[#0d0f13]">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-slate-300 focus-within:ring-4 focus-within:ring-slate-900/5 dark:border-white/[0.08] dark:bg-white/[0.025] dark:focus-within:border-white/15 dark:focus-within:ring-white/5">
            <textarea
              value={replyMessage}
              onChange={(event) =>
                setReplyMessage(
                  event.target.value
                )
              }
              placeholder={`Reply to ${contact.name}...`}
              rows={4}
              disabled={isReplying}
              className="min-h-[100px] w-full resize-none border-0 bg-transparent px-3 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            />

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-2 pt-2 dark:border-white/[0.07]">
              <div className="flex min-w-0 items-center gap-2 text-[11px] text-slate-400">
                <span className="hidden sm:inline">
                  Replying to
                </span>

                <span className="truncate font-medium text-slate-500 dark:text-slate-300">
                  {contact.email}
                </span>
              </div>

              <button
                type="button"
                onClick={onSendReply}
                disabled={
                  isReplying ||
                  !replyMessage.trim()
                }
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {isReplying ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="mt-2 px-1 text-[10px] text-slate-400">
            Your reply will be sent directly to the
            visitor's email address.
          </p>
        </div>
      </div>
    </div>
  );
};

interface InfoItemProps {
  icon: typeof Mail;
  label: string;
  value: string;
}

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: InfoItemProps) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-white/[0.07] dark:bg-white/[0.02]">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-slate-400" />

        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-1.5 truncate text-xs font-medium text-slate-700 dark:text-slate-300">
        {value}
      </p>
    </div>
  );
};

interface StatusMenuProps {
  status: ContactStatus;
  disabled: boolean;
  onChange: (
    status: ContactStatus
  ) => void;
}

const StatusMenu = ({
  status,
  disabled,
  onChange,
}: StatusMenuProps) => {
  const [
    open,
    setOpen,
  ] = useState(false);

  const config =
    statusConfig[status];

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen(!open)
        }
        className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition disabled:opacity-50 ${config.className}`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`}
        />

        {config.label}

        <MoreHorizontal className="h-3.5 w-3.5 opacity-60" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close status menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() =>
              setOpen(false)
            }
          />

          <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/[0.08] dark:bg-[#15171c]">
            {(
              Object.keys(
                statusConfig
              ) as ContactStatus[]
            ).map(
              (item) => {
                const itemConfig =
                  statusConfig[
                    item
                  ];

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onChange(
                        item
                      );
                      setOpen(
                        false
                      );
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                      item === status
                        ? "bg-slate-100 font-semibold dark:bg-white/[0.07]"
                        : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${itemConfig.dotClassName}`}
                    />

                    {itemConfig.label}

                    {item ===
                      status && (
                      <Check className="ml-auto h-3.5 w-3.5" />
                    )}
                  </button>
                );
              }
            )}
          </div>
        </>
      )}
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="flex min-h-[620px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.05]">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        </div>

        <p className="text-xs text-slate-400">
          Loading messages...
        </p>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  search: boolean;
}

const EmptyState = ({
  search,
}: EmptyStateProps) => {
  return (
    <div className="flex min-h-[620px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/[0.05]">
        {search ? (
          <Search className="h-6 w-6 text-slate-400" />
        ) : (
          <Inbox className="h-6 w-6 text-slate-400" />
        )}
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        {search
          ? "No messages found"
          : "Your inbox is empty"}
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        {search
          ? "Try changing your search or filter."
          : "New messages from your portfolio contact form will appear here."}
      </p>
    </div>
  );
};

const NoSelection = () => {
  return (
    <div className="flex h-full min-h-[620px] flex-col items-center justify-center px-6 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl bg-slate-200/40 blur-2xl dark:bg-white/[0.03]" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
          <MessageCircle className="h-7 w-7 text-slate-400" />
        </div>
      </div>

      <h3 className="mt-5 text-sm font-semibold">
        Select a message
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">
        Choose a conversation from your inbox
        to read the message and send a reply.
      </p>
    </div>
  );
};

export default Contacts;