import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundError() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] font-bold leading-tight'>404</h1>
        <span className='font-medium'>{t("Page Not Found")}</span>
        <p className='text-center text-muted-foreground'>
          {t("The page you are looking for does not exist.")}
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => navigate(-1)}>
            {t("Go Back")}
          </Button>
          <Button onClick={() => navigate('/')}>
            {t("Back to Home")}
          </Button>
        </div>
      </div>
    </div>
  );
}
