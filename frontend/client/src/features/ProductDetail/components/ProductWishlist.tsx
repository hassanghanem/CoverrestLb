import { useFullPageLoading } from "@/context/FullPageLoadingContext";
import { useGetWishlist } from "@/hooks/usePublicData";
import { addOrRemoveWishlistItem } from "@/lib/services/wishlist-service";
import { RootState } from "@/lib/store/store";
import { Product } from "@/types/api.interfaces";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useSelector } from "react-redux";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProductWishlistProps {
    product: Product;

}

const ProductWishlist: React.FC<ProductWishlistProps> = ({ product }) => {

    const { setFullPageLoading } = useFullPageLoading();
    const queryClient = useQueryClient();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { data: wishlistData } = useGetWishlist(isAuthenticated, {});


    const isInWishlist = wishlistData?.wishlist?.some(
        (item) => item.product.id === product.id
    );
    const handleClick = async () => {
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
            variant="outline"
            size="icon"
            onClick={handleClick}
        >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
    );
};

export default ProductWishlist;
