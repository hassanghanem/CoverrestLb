import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HtmlViewer } from '@/components/HtmlViewer';
import { useSettings } from '@/hooks/usePublicData';
import { useTranslation } from 'react-i18next';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
import { useTeamMembers } from './hooks/useTeamMembers';
import { Card, CardContent } from '@/components/ui/card';
import { getText } from '@/utils/getText';

const About = () => {
  const { data: settingsData } = useSettings();
  const pages = settingsData?.pages;
  const aboutPage = pages?.find((page) => page.slug === 'about-us');
  const { t, i18n } = useTranslation();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  if (!aboutPage) return null;
  const { data: dataTeamMembers } = useTeamMembers({});
  const teamMembers = dataTeamMembers?.team_members;
  return (
    <>
      <section className="relative py-10 bg-linear-to-br from-primary/5 via-accent/5 to-secondary">
        <div className="container mx-auto container-padding">
          <HtmlViewer html={aboutPage.content} />
        </div>
      </section>

      {Array.isArray(teamMembers) && teamMembers.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto container-padding">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                {t("Meet Our Team")}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center card-hover">
                  <CardContent className="p-8 space-y-6">
                    <div className="w-32 h-32 bg-muted rounded-full mx-auto flex items-center justify-center">
                      <img src={member.image} alt={getText(member.name, i18n.language)} className="w-32 h-32 rounded-full object-cover" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{getText(member.name, i18n.language)}</h3>
                      <p className="text-primary font-medium">{getText(member.occupation, i18n.language)} </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
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
};

export default About;
