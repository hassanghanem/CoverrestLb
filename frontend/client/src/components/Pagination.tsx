import React from "react";
import { Pagination } from "@/types/api.interfaces";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  pagination?: Pagination;
  onPageChange: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
}) => {
  const { t, i18n } = useTranslation();

  if (!pagination) return null;

  const { current_page, last_page } = pagination;

  const handlePrev = () => {
    if (current_page > 1) onPageChange(current_page - 1);
  };

  const handleNext = () => {
    if (current_page < last_page) onPageChange(current_page + 1);
  };

  const handlePageClick = (page: number) => {
    if (page !== current_page) onPageChange(page);
  };

  // Smart window of pages (max 5 shown)
  const visiblePages = Array.from(
    { length: Math.min(5, last_page) },
    (_, i) => {
      const start = Math.max(1, Math.min(last_page - 4, current_page - 2));
      return start + i;
    }
  );

  return (
    <div className="flex justify-center mt-8 lg:mt-12">
      <div className="flex items-center space-x-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={current_page === 1}
        >
          <i
            className={`icon-long-arrow-${
              i18n.language === "ar" ? "right" : "left"
            } mr-1`}
          />
          {t("Previous")}
        </Button>

        {/* Page Numbers */}
        {visiblePages.map((page) => (
          <Button
            key={page}
            variant={page === current_page ? "default" : "outline"}
            onClick={() => handlePageClick(page)}
            className="w-10"
          >
            {page}
          </Button>
        ))}

        {/* Next Button */}
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={current_page === last_page}
        >
          {t("Next")}
          <i
            className={`icon-long-arrow-${
              i18n.language === "ar" ? "left" : "right"
            } ml-1`}
          />
        </Button>
      </div>
    </div>
  );
};

export default PaginationComponent;
