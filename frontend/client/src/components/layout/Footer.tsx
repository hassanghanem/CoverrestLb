import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { FaTiktok } from "react-icons/fa6";

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Newsletter from './Newsletter';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/usePublicData';
import { RootState } from '@/lib/store/store';
import { useSelector } from 'react-redux';
import { getEffectiveTheme, useTheme } from '@/context/theme-context';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { data: settingsData } = useSettings();
  const configurations = settingsData?.configurations || [];
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const contact_phone = configurations.find(item => item.key === 'contact_phone')?.value;
  const contact_email = configurations.find(item => item.key === 'contact_email')?.value;
  const store_name = configurations.find(item => item.key === 'store_name')?.value;
  const store_address = configurations.find(item => item.key === 'store_address')?.value;

  const facebook_link = configurations.find(item => item.key === 'facebook_link')?.value;
  const instagram_link = configurations.find(item => item.key === 'instagram_link')?.value;
  const youtube_link = configurations.find(item => item.key === 'youtube_link')?.value;
  const tiktok_link = configurations.find(item => item.key === 'tiktok_link')?.value;


  const footerSections = [
    {
      title: t('Useful Links'),
      links: [
        { label: t('Home'), href: '/' },
        { label: t('Shop'), href: '/shop' },
        { label: t('FAQ'), href: '/faq' },
      ],
    },
    {
      title: t('Customer Service'),
      links: [
        { label: t('About Us'), href: '/about-us' },
        { label: t('Contact Us'), href: '/contact' },
        { label: t('Terms & Conditions'), href: '/terms-conditions' },
        { label: t('Privacy Policy'), href: '/privacy-policy' },
        { label: t('Return Policy'), href: '/return-policy' },
      ],
    },
    ...(isAuthenticated
      ? [
        {
          title: t('My Account'),
          links: [
            { label: t('View Cart'), href: '/cart' },
            { label: t('Checkout'), href: '/checkout' },
            { label: t('Account'), href: '/profile' },
            { label: t('Wishlist'), href: '/wishlist' },
          ],
        },
      ]
      : []),
  ];

  const legal = [
    { name: t('Privacy Policy'), href: 'https://appfinity.cloud/privacy-policy' },
    { name: t('Terms & Conditions'), href: 'https://appfinity.cloud/terms-conditions' },
  ];

  const currentYear = new Date().getFullYear();

  const theme = getEffectiveTheme(useTheme().theme);
  return (
    <footer className="bg-muted/30 border-t border-border mt-5">
      <Newsletter />

      <div className="container mx-auto container-padding py-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              {
                (theme === 'light') ?
                  <img src="/assets/logo-white-nobg.png" alt={store_name || 'Store Logo'} className="h-auto w-[200px] sm:w-[200px] md:w-[250px]" />
                  :
                  <img src="/assets/logo-black-nobg.png" alt={store_name || 'Store Logo'} className="h-auto w-[200px] sm:w-[200px] md:w-[250px]" />
              }            </Link>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t('CoverrestLB offers high-quality phone covers, cases, and accessories in Lebanon. Protect your phone in style with our trendy and durable products.')}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="text-sm">{store_address}</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span className="text-sm">     <a
                  href={contact_phone ? `https://wa.me/${contact_phone.replace(/\D/g, '')}` : ''}
                  target="_blank"
                  rel="noopener noreferrer"

                >+{contact_phone}</a></span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />

                <span className="text-sm">     <a
                  href={contact_email ? `mailto:${contact_email}` : ''}
                  target="_blank"
                  rel="noopener noreferrer"

                >{contact_email}</a></span>
              </div>
            </div>

            <div className="flex space-x-4">
              {facebook_link && (
                <a href={facebook_link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
                    <Facebook className="w-4 h-4" />
                  </Button>
                </a>
              )}

              {instagram_link && (
                <a href={instagram_link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
                    <Instagram className="w-4 h-4" />
                  </Button>
                </a>
              )}

              {youtube_link && (
                <a href={youtube_link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
                    <Youtube className="w-4 h-4" />
                  </Button>
                </a>
              )}

              {tiktok_link && (
                <a href={tiktok_link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
                    <FaTiktok className="w-4 h-4" />
                  </Button>
                </a>
              )}

            </div>
          </div>

          {footerSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-foreground mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator />
      <div className="container mx-auto container-padding py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <a href="https://appfinity.cloud" className="text-muted-foreground text-sm" target="_blank" rel="noopener noreferrer">
              © {currentYear} AppFinity. {t('All rights reserved.')}
            </a>
            <div className="flex space-x-4">
              {legal.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
