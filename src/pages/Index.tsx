import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlowModelTab } from '@/components/FlowModelTab';
import { MinWageTab } from '@/components/MinWageTab';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { I18nContext, Locale, translations, TranslationKey } from '@/lib/i18n';
import { DEFAULT_LOCALE, applySeo, isLocale, localePaths } from '@/lib/seo';

const Index = () => {
  const navigate = useNavigate();
  const { locale: routeLocale } = useParams();
  const locale = isLocale(routeLocale) ? routeLocale : DEFAULT_LOCALE;
  const [activeTab, setActiveTab] = useState('flow');

  useEffect(() => {
    if (!isLocale(routeLocale)) {
      navigate(localePaths[DEFAULT_LOCALE], { replace: true });
    }
  }, [navigate, routeLocale]);

  useEffect(() => {
    applySeo(locale);
  }, [locale]);

  const t = useCallback((key: TranslationKey) => translations[locale][key], [locale]);
  const setLocale = useCallback((nextLocale: Locale) => {
    navigate(localePaths[nextLocale]);
  }, [navigate]);
  const i18nValue = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="min-h-screen bg-background">
        <header className="border-b py-6 px-6 lg:px-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
              {t('title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-serif">
              {t('subtitle')}
            </p>
          </div>
          <LanguageSwitcher />
        </header>

        <main className="p-6 lg:px-10 max-w-[1400px] mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="font-serif">
              <TabsTrigger value="flow">{t('tabFlow')}</TabsTrigger>
              <TabsTrigger value="minwage">{t('tabMinWage')}</TabsTrigger>
            </TabsList>

            <TabsContent value="flow">
              <FlowModelTab />
            </TabsContent>

            <TabsContent value="minwage">
              <MinWageTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </I18nContext.Provider>
  );
};

export default Index;
