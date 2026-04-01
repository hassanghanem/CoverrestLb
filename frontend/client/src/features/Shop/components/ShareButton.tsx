import { Button } from "@/components/ui/button";
import { Share2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ShareButton({ title }: { title: string }) {
  const { t } = useTranslation();
  const location = useLocation();
  const fullUrl = `${window.location.origin}${location.pathname}${location.search}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: fullUrl,
        });
      } catch (err) {
        console.error(t("Sharing failed"), err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullUrl);
      } catch (err) {
        console.error(t("Copy failed"), err);
      }
    }
  };

  return (
    <Button variant="outline" onClick={handleShare} size="icon">
      <Share2 className="w-4 h-4" />
    </Button>
  );
}
