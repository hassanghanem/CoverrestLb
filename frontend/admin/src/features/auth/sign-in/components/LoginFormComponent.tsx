import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { setAuthData } from "@/lib/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { login } from "@/lib/services/Auth-services";
import { generateCaptcha } from "@/lib/services/Captcha-services";
import AuthCardComponent from "../../components/AuthCardComponent";
import SubmitButton from "@/components/fields/SubmitButton";
import { clearAllStorage } from "@/utils/clearAllStorage";

const LoginFormComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formSchema = z.object({
    email: z.string().email({ message: t("Please enter a valid email") }),
    password: z.string().min(1, { message: t("Password is required") }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const dispatch = useDispatch();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      // Clear any existing authorization token before login
      localStorage.removeItem('Authorization');
      localStorage.removeItem('X-Team-ID');
      clearAllStorage();
      const res = await generateCaptcha();
      if (!res.result || !res.token) {
        toast.error(t("Captcha verification failed, please try again"));
        return;
      }

      const recaptchaToken = res.token;
      const response = await login(data.email, data.password, recaptchaToken);

      if (response.result) {
        const authData = {
          email: data.email,
          password: data.password,
          expiryAt: response.expiresAt,
        };
        dispatch(setAuthData(authData));
        navigate("otp");
      }
    } catch (error) {
      console.error("Something went wrong");
    }
  };

  return (
    <AuthCardComponent
      title={t("Login")}
      description={t("Please login to your account")}
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("Enter your email")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t("Password")}</FormLabel>
                  <Link
                    to="/forgotPassword"
                    className="inline-block text-sm underline-offset-4 hover:underline"
                  >
                    {t("Forgot Password?")}
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("Enter your password")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton pendingLabel={t("Logging in...")} disabled={form.formState.isSubmitting}>
            {t("Login")}
          </SubmitButton>
        </form>
      </FormProvider>
    </AuthCardComponent>
  );
};

export default LoginFormComponent;
