import { useState } from "react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ResendOtpButton from "./ResendOtpButton";
import { RootState } from "@/lib/store/store";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp } from "@/lib/services/Auth-services";
import { setUserData } from "@/lib/store/slices/authSlice";
import AuthCardComponent from "../../components/AuthCardComponent";
import { generateCaptcha } from "@/lib/services/Captcha-services";

function VerifyOtpFormComponent() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { email, password, expiryAt } = useSelector((state: RootState) => state.auth);

  if (!email || !password || !expiryAt) {
    navigate("/");
  }

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async (otpValue: string) => {
    const res = await generateCaptcha();

    if (!res.result || !res.token) {
      toast.error(t("Captcha verification failed, please try again"));
      return;
    }

    const recaptchaToken = res.token;
    setIsSubmitting(true);
    const response = await verifyOtp(email, password, otpValue, recaptchaToken);

    if (response.result) {
      dispatch(setUserData(response.user));

      localStorage.setItem("Authorization", response.user.token);
      localStorage.setItem("X-Team-ID", response.user.teams[0].id);

      const hasDashboardAccess = response.user.permissions.includes("view-dashboard");
      if (hasDashboardAccess) {
        navigate("/dashboard");
      } else {
        navigate("/profile");
      }
    }

    setOtp("");
    setIsSubmitting(false);
  };

  const handleOtpChange = (otpValue: string) => {
    setOtp(otpValue);
    if (otpValue.length === 6) {
      onSubmit(otpValue);
    }
  };

  return (
    <AuthCardComponent
      title={t("Verify OTP")}
      description={t("Enter the 6-digit OTP sent to your email")}
    >
      <div className="flex flex-col items-center justify-center" dir="ltr">
        <InputOTP value={otp} onChange={handleOtpChange} maxLength={6} disabled={isSubmitting}>
          <InputOTPGroup>
            {[...Array(6)].map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <div className="text-center text-sm mt-2">{t("Please enter the 6-digit code below")}</div>

        <ResendOtpButton />
      </div>
    </AuthCardComponent>
  );
}

export default VerifyOtpFormComponent;
