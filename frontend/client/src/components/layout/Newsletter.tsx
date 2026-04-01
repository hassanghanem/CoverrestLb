import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useFullPageLoading } from '@/context/FullPageLoadingContext';
import { newsletterSubscribe } from '@/lib/services/newsletter-services';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateCaptcha } from '@/lib/services/captcha-service';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const { setFullPageLoading, FullPageloading } = useFullPageLoading();
  const { t } = useTranslation();


  const handleSignUpNewsletter = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.warning(t('Please enter your email.'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.warning(t('Please enter a valid email address.'));
      return;
    }

    setFullPageLoading(true);

    try {
      const res = await generateCaptcha();

      if (!res.result || !res.token) {
        toast.error(t("Captcha verification failed, please try again"));
        setFullPageLoading(false);
        return;
      }

      const recaptchaToken = res.token;

      await newsletterSubscribe(trimmedEmail, recaptchaToken);
      setEmail('');

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error(t('An unexpected error occurred. Please try again.'));
    } finally {
      setFullPageLoading(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignUpNewsletter();
    }
  };

  return (
    <div className="bg-primary">
      <div className="container mx-auto container-padding py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-primary-foreground mb-4">
            {t('Stay in the Loop')}
          </h3>
          <p className="text-primary-foreground/80 mb-6">
            {t('Subscribe to our newsletter for exclusive deals, new arrivals, and style inspiration.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              placeholder={t('Enter your email address')}
              className="pl-10 pr-4 h-12 border-2 focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={FullPageloading}
            />
            <Button
              variant="outline"
              className="h-12 px-8 font-semibold"
              onClick={handleSignUpNewsletter}
              disabled={FullPageloading}
            >
              {t('Subscribe')}
            </Button>
          </div>
          <p className="text-primary-foreground/60 text-sm mt-4">
            {t('By subscribing, you agree to our Privacy Policy and consent to receive updates.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
