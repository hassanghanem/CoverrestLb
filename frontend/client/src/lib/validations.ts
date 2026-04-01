import parsePhoneNumberFromString from "libphonenumber-js";
import { z } from "zod";

// Centralized phone validation function
const createPhoneValidation = (t: (key: string) => string, required: boolean = false) => {
  const baseValidation = z.string().max(20);

  const validation = required
    ? baseValidation.min(5, t("Phone number is required"))
    : baseValidation;

  return validation.refine((val) => {
    if (!val) return !required; // Allow empty if not required
    try {
      // Try parsing with country code first (international format)
      let phone = parsePhoneNumberFromString(val);
      if (phone?.isValid()) {
        return true;
      }

      // If that fails, try parsing with common countries (national format)
      const commonCountries = ["LB", "US", "GB", "FR", "DE", "AE", "SA"];
      for (const country of commonCountries) {
        try {
          phone = parsePhoneNumberFromString(val, country as any);
          if (phone?.isValid()) {
            return true;
          }
        } catch {
          continue;
        }
      }

      return false;
    } catch {
      return false;
    }
  }, { message: t("Invalid phone number") });
};

export const loginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("Please enter a valid email address")),
    rememberMe: z.boolean().optional(),
  });

export const registerSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("Full name must be at least 2 characters")),
    email: z.string().email(t("Invalid email address")),
    phone: createPhoneValidation(t, false),
    birthMonth: z.string().optional(),
    birthDay: z.string().optional(),
    birthYear: z.string().optional(),
    gender: z.string().optional(),
    agreeTerms: z.boolean().refine((val) => val === true, t("You must agree to the terms and conditions")),
    agreeMarketing: z.boolean().optional(),
  });

export const otpSchema = (t: (key: string) => string) =>
  z.object({
    otp: z
      .string()
      .length(6, t("OTP must be exactly 6 digits"))
      .regex(/^\d{6}$/, t("OTP must contain only numbers")),
  });

export const contactFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("First name must be at least 2 characters")),
    email: z.string().email(t("Please enter a valid email address")),
    phone: z.string().optional(),
    subject: z.string().min(3, t("Subject must be at least 3 characters")).max(100, t("Subject must be less than 100 characters")),
    message: z.string().min(10, t("Message must be at least 10 characters")),
    terms: z.boolean().refine((val) => val === true, t("You must agree to the terms and conditions")),
  });

export const addressSchema = (t: (key: string) => string) =>
  z.object({
    recipient_name: z.string().min(1, t("Recipient name is required")).max(191),
    address: z.string().min(1, t("Address is required")).max(191),
    phone_number: createPhoneValidation(t, true),
    city: z.string().min(2, t("City is required")).max(191),
    notes: z.string().max(500).optional().nullable(),
    latitude: z.string().optional().nullable(),
    longitude: z.string().optional().nullable(),
    is_default: z.boolean(),
  });

export const accountDetailsFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(1, t("Name is required")),
    gender: z.string().optional().or(z.literal("")),
    birthdate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), { message: t("Invalid birthdate") }),
    phone: createPhoneValidation(t, false),
    email: z.string().email(t("Invalid email address")),
    birthDay: z.string().optional(),
    birthMonth: z.string().optional(),
    birthYear: z.string().optional(),
  });

export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;
export type RegisterFormData = z.infer<ReturnType<typeof registerSchema>>;
export type OTPFormData = z.infer<ReturnType<typeof otpSchema>>;
export type AddressFormData = z.infer<ReturnType<typeof addressSchema>>;
export type ContactFormData = z.infer<ReturnType<typeof contactFormSchema>>;
export type AccountDetailsFormData = z.infer<ReturnType<typeof accountDetailsFormSchema>>;
