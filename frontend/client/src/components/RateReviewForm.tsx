import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Product } from "@/types/api.interfaces";
import { StarRatingInput } from "./ui/StarRatingInput";

export type RateReviewFormValues = {
    rating: number;
    comment?: string;
    productId: string;
    slug: string;
};

interface RateReviewFormProps {
    product: Product;
    onSubmit: (data: RateReviewFormValues) => void;
    initialData?: Partial<Omit<RateReviewFormValues, "productId" | "slug">>;
    isEdit?: boolean;
    isOpen: boolean;
    onClose: () => void;
}

export const RateReviewForm: React.FC<RateReviewFormProps> = ({
    product,
    onSubmit,
    initialData,
    isEdit,
    isOpen,
    onClose,
}) => {
    const { t } = useTranslation();

    const formSchema = z.object({
        rating: z
            .number()
            .min(1, t("Rating is required."))
            .max(5, t("Maximum rating is 5."))
            .refine(Number.isInteger, { message: t("Rating must be an integer.") }),
        comment: z.string().max(1000).optional(),
        productId: z.string(),
        slug: z.string(),
    });

    const methods = useForm<RateReviewFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rating: initialData?.rating ?? 5,
            comment: initialData?.comment ?? "",
            productId: product.id.toString(),
            slug: product.slug,
        },
    });

    useEffect(() => {
        if (initialData) {
            methods.reset({
                rating: initialData.rating ? Number(initialData.rating) : 5,
                comment: initialData.comment ?? "",
                productId: product.id.toString(),
                slug: product.slug,
            });
        }
    }, [initialData, product.id, product.slug, methods]);

    const { handleSubmit, watch, setValue, control } = methods;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent >
                <DialogHeader>
                    <DialogTitle>{isEdit ? t("Edit Review") : t("Add Review")}</DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? t("Update your review for this product.")
                            : t("Share your feedback about this product.")}
                    </DialogDescription>
                </DialogHeader>

                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={control}
                            name="rating"
                            render={() => (
                                <FormItem>
                                    <FormLabel>{t("Rating")}</FormLabel>
                                    <FormControl>
                                        <StarRatingInput
                                            value={watch("rating")}
                                            onChange={(val) =>
                                                setValue("rating", val, { shouldValidate: true })
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="comment"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>{t("Comment")}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t("Write your review here")} {...field} />
                                    </FormControl>
                                    <FormMessage>{fieldState?.error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                {t("Cancel")}
                            </Button>
                            <Button type="submit">{isEdit ? t("Update") : t("Submit")}</Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
};
