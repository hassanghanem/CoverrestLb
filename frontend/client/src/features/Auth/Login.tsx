import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from './AuthLayout';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { sendMagicLink, loginWithGoogle } from '@/lib/services/auth-service';
import { toast } from "sonner";
import { generateCaptcha } from '@/lib/services/captcha-service';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createLoginSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t('Please enter a valid email address')),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: t('You must agree to the Terms of Service and Privacy Policy'),
  }),
  agreeMarketing: z.boolean().optional(),
});

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    setValue,
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: {
      email: '',
      agreeTerms: false,
      agreeMarketing: false,
    },
    mode: "onChange",
  });

 
  useEffect(() => {
    const token = localStorage.getItem('Authorization');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await generateCaptcha();
      if (!res.result || !res.token) {
        toast.error(t("Captcha verification failed, please try again"));
        return;
      }
      const recaptchaToken = res.token;
      
      const response = await sendMagicLink({
        email: data.email,
        agreeTerms: data.agreeTerms,
        agreeMarketing: data.agreeMarketing,
        recaptchaToken
      });

      if (response.result) {
        reset();
      } else {
        setError('root', { 
          type: 'server', 
          message: response.message 
        });
      }
    } catch (err) {
      setError('root', { 
        type: 'server', 
        message: t('Something went wrong.') 
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      if (result.url) {
        window.location.href = result.url;
      } else if (result.message) {
        setError('root', { 
          type: 'server', 
          message: result.message 
        });
      }
    } catch (err) {
      setError('root', { 
        type: 'server', 
        message: t('Failed to initiate Google login.') 
      });
    }
  };

  const clearFieldError = (fieldName: keyof LoginFormData) => {
    clearErrors(fieldName);
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl font-bold">{t('Sign In or Register')}</CardTitle>
            <p className="text-muted-foreground">{t('Enter your email to receive a magic link')}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('Email Address')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('Enter your email')}
                  className={errors.email ? 'border-destructive' : ''}
                  {...register('email')}
                  onChange={(e) => {
                    setValue('email', e.target.value);
                    clearFieldError('email');
                  }}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input
                  id="agreeTerms"
                  type="checkbox"
                  {...register('agreeTerms')}
                  onChange={(e) => {
                    setValue('agreeTerms', e.target.checked);
                    clearFieldError('agreeTerms');
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="agreeTerms" className="text-sm cursor-pointer">
                  {t('I agree to the')} <a href="/terms-conditions" className="text-primary hover:underline">{t('Terms of Service')}</a> {t('and')} <a href="/privacy-policy" className="text-primary hover:underline">{t('Privacy Policy')}</a>
                </Label>
              </div>
              {errors.agreeTerms && (
                <p className="text-sm text-destructive mt-1">{errors.agreeTerms.message}</p>
              )}

              <div className="flex items-start space-x-2">
                <input
                  id="agreeMarketing"
                  type="checkbox"
                  {...register('agreeMarketing')}
                  onChange={(e) => setValue('agreeMarketing', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="agreeMarketing" className="text-sm cursor-pointer">
                  {t('I would like to receive marketing emails about new products, sales, and exclusive offers')}
                </Label>
              </div>

              {errors.root && (
                <p className="text-sm text-destructive mt-1">{errors.root.message}</p>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>{t('Sending...')}</span>
                  </div>
                ) : (
                  t('Verify')
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('Or continue with')}
                </span>
              </div>
            </div>

            <Button
              type="button"
              className="w-full h-12 text-lg font-semibold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={handleGoogleLogin}
            >
              <img 
                src="/assets/google-icon.png" 
                alt="Google" 
                className="w-5 h-5 mr-2 inline-block align-middle" 
              />
              {t('Sign in with Google')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default Login;