import React from 'react';
import { useI18n, Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

const LANGUAGES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
  { code: 'ko', label: 'KO' },
];

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex gap-1">
      {LANGUAGES.map(({ code, label }) => (
        <Button
          key={code}
          variant={locale === code ? 'default' : 'ghost'}
          size="sm"
          className="h-7 px-2 text-xs font-mono"
          onClick={() => setLocale(code)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
};
