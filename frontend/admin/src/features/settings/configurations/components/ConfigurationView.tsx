import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ConfigurationForm } from "./ConfigurationForm";
import { useConfigurationsLogic } from "../hooks/useConfigurationsFormLogic";

const ConfigurationView = () => {
  const { handleSubmitConfigForm, initialConfigData, costMethods } = useConfigurationsLogic();
  const { t } = useTranslation();

  return (
    <div className="h-full w-full flex items-center justify-center mb-5">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t("Configure Settings")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ConfigurationForm
            onSubmit={handleSubmitConfigForm}
            initialData={initialConfigData}
            costMethods={costMethods}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationView;
