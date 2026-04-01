import { Button } from "@/components/ui/button";
import { HtmlViewer } from "@/components/HtmlViewer";
import { useSettings } from "@/hooks/usePublicData";
import { RootState } from "@/lib/store/store";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";


export default function ReturnPolicy() {
  const { t } = useTranslation();
  const { data: settingsData } = useSettings();
  const pages = settingsData?.pages;
  const returnpolicyPage = pages?.find((page) => page.slug === 'return-policy');
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!returnpolicyPage) return null;

  return (
    <>
      <section className="relative py-10 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary">
        <div className="container mx-auto container-padding">
          <HtmlViewer html={returnpolicyPage.content} />
        </div>
      </section>
      {isAuthenticated ??
        <section className="bg-muted/30">
          <div className="container mx-auto container-padding text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold">
                {t("Ready to Join Our Community?")}
              </h2>
              <p className="text-xl text-muted-foreground">
                {t(
                  "Experience the Luxora difference for yourself. Start shopping today and discover why thousands of customers choose us for their online shopping needs."
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="h-14 px-8" asChild>
                  <Link to="/register">
                    {t("Create Account")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8" asChild>
                  <Link to="/shop">
                    {t("Browse Products")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      }
    </>
  );
}
