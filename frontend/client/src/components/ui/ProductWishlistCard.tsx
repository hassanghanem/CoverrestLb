import { useFullPageLoading } from "@/context/FullPageLoadingContext";
import { useGetWishlist } from "@/hooks/usePublicData";
import { addOrRemoveWishlistItem } from "@/lib/services/wishlist-service";
import { RootState } from "@/lib/store/store";
import { Product } from "@/types/api.interfaces";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useSelector } from "react-redux";
import { Button } from "./button";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface ProductWishlistCardProps {
    product: Product;

}

const ProductWishlistCard: React.FC<ProductWishlistCardProps> = ({ product }) => {

    const { setFullPageLoading } = useFullPageLoading();
    const queryClient = useQueryClient();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: wishlistData } = useGetWishlist(isAuthenticated, {});
    const isInWishlist = wishlistData?.wishlist?.some(
        (item) => item.product.id === product.id
    );
    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.warning(t("Please log in to add items to your wishlist."));
            localStorage.setItem('loginRedirect', location.pathname);
            navigate('/login', {
                replace: true,
            });
            return;
        }

        setFullPageLoading(true);
        const response = await addOrRemoveWishlistItem(product.id);
        if (response.result) {
            queryClient.invalidateQueries({ queryKey: ['getWishlist'] });
        }
        setFullPageLoading(false);
    };

    return (
            <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-md backdrop-blur-sm"
                onClick={handleClick}
            >
                <Heart
                    className={`w-3.5 h-3.5 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`}
                />
            </Button>
    );
};

export default ProductWishlistCard;
