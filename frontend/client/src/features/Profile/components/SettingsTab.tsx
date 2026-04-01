import { Bell, Shield, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { useSettingsLogic } from "../hooks/useSettingsLogic";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import { useTranslation } from "react-i18next";

const SettingsLogic: React.FC = () => {
  const { t } = useTranslation();

  const {
    form: { register, handleSubmit, formState: { errors }, watch },
    onSubmit,
    defaultCountry,
    phoneNumber,
    notifications,
    handleNotificationChange,
    handlePhoneChange,
    handleBirthMonthChange,
    handleBirthDayChange,
    handleBirthYearChange,
    handleGenderChange,
  } = useSettingsLogic();

  const handleSaveChanges = async () => {

    await handleSubmit(async (data) => {
      await onSubmit(data);
    })();

  };

  return (
    <TabsContent value="settings" className="space-y-8">
      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("Personal Information")}</CardTitle>
          <Button
            variant="outline"
            onClick={handleSaveChanges}
          >
           {t("Save Changes")}
          </Button>
        </CardHeader>

        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t("Full Name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("John")}
                    
                    {...register("name")}
                    className="pl-10 h-12"
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("Email Address")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    disabled
                    {...register("email")}
                    className="pl-10 h-12"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label>{t("Phone Number (Optional)")}</Label>
                <div className="">
                  <PhoneInput
                    defaultCountry={defaultCountry}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder={t('Enter your contact number')}
                    className="w-full"
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>

              {/* Birthday */}
              <div className="space-y-2">
                <Label>{t("Birthday (Optional)")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={watch("birthMonth") || ""} onValueChange={handleBirthMonthChange} >
                    <SelectTrigger><SelectValue placeholder={t("Month")} /></SelectTrigger>
                    <SelectContent>
                      {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
                        <SelectItem key={month} value={(index + 1).toString()}>{t(month)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={watch("birthDay") || ""} onValueChange={handleBirthDayChange} >
                    <SelectTrigger><SelectValue placeholder={t("Day")} /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={watch("birthYear") || ""} onValueChange={handleBirthYearChange} >
                    <SelectTrigger><SelectValue placeholder={t("Year")} /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 100 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label>{t("Gender (Optional)")}</Label>
                <Select value={watch("gender") || ""} onValueChange={handleGenderChange} >
                  <SelectTrigger><SelectValue placeholder={t("Select gender")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("Male")}</SelectItem>
                    <SelectItem value="female">{t("Female")}</SelectItem>
                    <SelectItem value="other">{t("Other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t("Notification Preferences")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("Order Updates")}</p>
              <p className="text-sm text-muted-foreground">{t("Get notified about your order status")}</p>
            </div>
            <Switch checked={notifications.orderUpdates} onCheckedChange={(checked) =>
              handleNotificationChange("orderUpdates", checked)
            } />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t("Newsletter")}</p>
              <p className="text-sm text-muted-foreground">{t("Receive our weekly newsletter")}</p>
            </div>
            <Switch checked={notifications.newsletter} onCheckedChange={(checked) =>
              handleNotificationChange("newsletter", checked)
            } />
          </div>
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t("Security & Privacy")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default SettingsLogic;
