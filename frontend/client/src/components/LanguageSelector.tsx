import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGS } from '@/i18n';
import { useQueryClient } from '@tanstack/react-query';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();

  const handleLangChange = (lang: string) => {
    if (i18n.language === lang) return;
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    queryClient.invalidateQueries();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
          <Globe className="w-4 h-4" />
          {i18n.language.toUpperCase()}
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {SUPPORTED_LANGS.map((lang) => (
          <DropdownMenuItem key={lang} onClick={() => handleLangChange(lang)}>
            {lang.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
