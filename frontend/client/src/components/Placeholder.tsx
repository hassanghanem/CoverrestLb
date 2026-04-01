import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PlaceholderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
}

const Placeholder = ({
  title,
  description = "This page is under construction. Please check back later or continue prompting to have this page built out.",
  showBackButton = true,
}: PlaceholderProps) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto container-padding">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <Construction className="w-10 h-10 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4">
          {t(title)}
        </h1>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          {t(description)}
        </p>

        {showBackButton && (
          <Button asChild variant="outline" className="gap-2">
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              {t("Back to Home")}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Placeholder;
