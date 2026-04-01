import { toast } from "sonner";

export const showApiErrorToasts = (responseData: any) => {
    const message = responseData?.message || "An error occurred";
    toast.error(message, { duration: 6000 });

    if (responseData?.errors && typeof responseData.errors === 'object') {
        Object.values(responseData.errors as Record<string, string[]>)
            .flat()
            .forEach((msg) => {
                if (typeof msg === "string") {
                    toast.error(msg, { duration: 6000 });
                }
            });
    }

    if (responseData?.error && typeof responseData.error === 'string') {
        toast.error(responseData.error, { duration: 6000 });
    }
};
