import {
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useTranslation } from 'react-i18next';
import { useContactLogic } from './hooks/useContactLogic';
import { Link } from 'react-router-dom';

const Contact = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isSubmitting,
    submitted,
    setSubmitted,
    phoneNumber,
    handlePhoneChange,
    defaultCountry,
    business_days,
    business_hours,
    contact_phone
  } = useContactLogic();

  if (submitted) {
    return (
      <div className="container mx-auto container-padding py-16">
        <div className="max-w-md mx-auto text-center space-y-8">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{t('Message Sent!')}</h1>
            <p className="text-muted-foreground text-lg">
              {t("Thank you for contacting us. We've received your message and will get back to you within 2 hours.")}
            </p>

          </div>
          <div className="space-y-4">
            <Button size="lg" className="w-full h-14" onClick={() => setSubmitted(false)}>
              {t('Send Another Message')}
            </Button>
            <Button variant="outline" size="lg" className="w-full h-14" asChild>
              <Link to="/">{t('Return to Home')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="py-10 bg-linear-to-br from-primary/5 via-accent/5 to-secondary">
        <div className="container mx-auto container-padding text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <Badge variant="secondary" className="px-4 py-2 text-base font-medium">
              {t('Get in Touch')}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold">{t("We're Here to Help")}</h1>
            <p className="text-xl text-muted-foreground">
              {t("Have a question, need support, or want to share feedback? Our team is ready to assist you.")}
            </p>
          </div>
        </div>
      </section>


      <div className="container mx-auto container-padding">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t('Send Us a Message')}</CardTitle>
                <p className="text-muted-foreground">{t("Fill out the form below and we'll get back to you as soon as possible.")}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('Full Name *')}</Label>
                      <Input id="name" {...register('name')} placeholder={t('Enter your full name')} className={errors.name ? 'border-destructive' : ''} />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="email">{t('Email Address *')}</Label>
                      <Input id="email" type="email" {...register('email')} placeholder={t('Enter your work email address')} className={errors.email ? 'border-destructive' : ''} />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("Phone Number")}</Label>
                    <PhoneInput defaultCountry={defaultCountry} value={phoneNumber} onChange={handlePhoneChange} placeholder={t('Enter your contact number')} className="w-full" />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="subject">{t('Subject *')}</Label>
                    <Input id="subject" {...register('subject')} placeholder={t('Enter the subject of your message')} className={errors.subject ? 'border-destructive' : ''} />
                    {errors.subject && <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="message">{t('Message *')}</Label>
                    <Textarea id="message" {...register('message')} placeholder={t('Please provide detailed information about your request')} rows={6} className={errors.message ? 'border-destructive' : ''} />
                    {errors.message && <p className="text-sm text-destructive mt-1">{errors.message.message}</p>}
                  </div>
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      {...register('terms')}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="terms" className="text-sm">
                      {t("Agree Terms")}{" "}
                      <Link to="/terms-conditions" className="text-primary underline">
                        {t("Terms & Conditions")}
                      </Link>{" "}
                      {t("And")}{" "}
                      <Link to="/privacy-policy" className="text-primary underline">
                        {t("Privacy Policy")}
                      </Link> *
                    </Label>
                    {errors.terms && <p className="text-sm text-destructive mt-1">{errors.terms.message}</p>}

                  </div>

                  <Button type="submit" size="lg" className="w-full h-14" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <span>{t('Sending...')}</span>
                      </div>
                    ) : (
                      <>
                        {t('Send Message')}
                        <Send className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('Quick Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">{t('Response Time')}</p>
                    <p className="text-sm text-muted-foreground">{t('We typically respond within 2 hours during business hours')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">{t('Support Hours')}</p>
                    <p className="text-sm text-muted-foreground">
                      {business_days}<br />
                      {business_hours}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-orange-900 mb-2">{t('Urgent Issues?')}</h3>
                    <p className="text-sm text-orange-800 mb-4">{t('For order cancellations, payment issues, or account security concerns:')}</p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full border-orange-300 text-orange-700"> <Link to={`https://wa.me/${contact_phone?.replace(/\D/g, '')}`}>{t('Live Chat')}</Link></Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
