import { toast } from "sonner";

export const showApiErrorToasts = (responseData: any) => {
    const shownMessages = new Set<string>();

    const pushToast = (msg: unknown) => {
        if (typeof msg !== "string") return;
        const normalized = msg.trim();
        if (!normalized) return;
        if (shownMessages.has(normalized)) return;
        shownMessages.add(normalized);
        toast.error(normalized, { duration: 6000 });
    };

    // Primary message
    const message = responseData?.message || "An error occurred";
    pushToast(message);

    // Validation errors
    if (responseData?.errors && typeof responseData.errors === "object") {
        Object.values(responseData.errors as Record<string, string[]>)
            .flat()
            .forEach(pushToast);
    }

    // Single error field
    if (responseData?.error && typeof responseData.error === "string") {
        pushToast(responseData.error);
    }
};
