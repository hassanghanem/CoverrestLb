import React from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge"; // adjust path if needed

type AvailabilityStatus = "coming_soon" | "pre_order" | "out_of_stock";

const statusMap: Record<
  AvailabilityStatus,
  { textKey: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  coming_soon: { 
    textKey: "Coming Soon", 
    variant: "secondary",
    className: "bg-blue-500 text-white border-transparent hover:bg-blue-600"
  },
  pre_order: { 
    textKey: "Pre Order", 
    variant: "outline",
    className: "bg-orange-500 text-white border-transparent hover:bg-orange-600"
  },
  out_of_stock: { 
    textKey: "Out of Stock", 
    variant: "destructive",
    className: "bg-red-500 text-white border-transparent hover:bg-red-600"
  },
};

interface ProductStatusProps {
  status?: AvailabilityStatus;
  isNew?: boolean;
  badge?: string;
}

const ProductStatus: React.FC<ProductStatusProps> = ({ status, isNew, badge }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1">
      {isNew && (
        <Badge className="text-[10px] px-2 py-0.5 bg-green-500 text-white border-transparent hover:bg-green-600">
          {t("New")}
        </Badge>
      )}

      {badge && (
        <Badge className="text-[10px] px-2 py-0.5 bg-purple-500 text-white border-transparent hover:bg-purple-600">
          {badge}
        </Badge>
      )}

      {status && statusMap[status] && (
        <Badge className={`text-[10px] px-2 py-0.5 ${statusMap[status].className}`}>
          {t(statusMap[status].textKey)}
        </Badge>
      )}
    </div>
  );
};

export default ProductStatus;
