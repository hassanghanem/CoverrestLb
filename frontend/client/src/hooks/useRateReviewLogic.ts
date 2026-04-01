import { useState } from "react";
import { useFullPageLoading } from "@/context/FullPageLoadingContext";
import { Review } from "@/types/api.interfaces";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createReview, deleteReview } from "@/lib/services/reviews-service";
import { useQueryClient } from "@tanstack/react-query";
import { RootState } from "@/lib/store/store";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export const useRateReviewLogic = () => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const { setFullPageLoading } = useFullPageLoading();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const onPageChange = (page: number) => {
    if (page > 0 && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleClose = () => setDialogOpen(false);

  const handleSubmit = async (data: any) => {
    if (!isAuthenticated) {
      toast.warning(t("Please login to continue"));
      navigate('/login');
      return;
    }

    setFullPageLoading(true);
    try {
      const formData = new FormData();
      formData.append("product_id", data.productId);
      formData.append("rating", data.rating.toString());
      formData.append("comment", data.comment);

      const response = await createReview(formData);

      if (response.result) {
        setDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["productById", data.slug] });
        queryClient.invalidateQueries({ queryKey: ["home"] });
        queryClient.invalidateQueries({ queryKey: ["shop"] });


      }
    } catch (error) {
      toast.error(t("Unexpected error"));
    }

    setFullPageLoading(false);
  };

  const handleEdit = (review: Review) => {
    setDialogOpen(true);
    setSelectedReview(review);
  };

  const handleAddNew = () => {
    setDialogOpen(true);
    setSelectedReview(null);
  };

  const handleDelete = async (id: number, slug: string) => {
    if (!isAuthenticated) {
      toast.warning(t("Please login to continue"));
      navigate('/login');
      return;
    }
    setFullPageLoading(true);
    try {
      const result = await deleteReview(id);
      if (result.result) {
        queryClient.invalidateQueries({ queryKey: ["productById", slug] });
      }
    } catch (error) {
      toast.error(t("Unexpected error"));
    }
    setFullPageLoading(false);
  };

  return {
    selectedReview,
    isDialogOpen,
    currentPage,
    onPageChange,
    handleClose,
    handleSubmit,
    handleEdit,
    handleAddNew,
    handleDelete
  };
};
