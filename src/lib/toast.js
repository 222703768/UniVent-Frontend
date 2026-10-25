import { toast } from "sonner";
import { getApiErrorMessage } from "./apiError";

/**
 * Toast helpers (FE 43).
 *  - notifySuccess: call ONLY after the API has confirmed a mutation.
 *  - notifyError:   shows the backend message (never a stack trace).
 * Persistent notifications are stored domain records, not toasts.
 */
export const notifySuccess = (message) => toast.success(message);

export const notifyError = (error, fallback) => toast.error(getApiErrorMessage(error, fallback));
