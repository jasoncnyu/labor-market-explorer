import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlowModelTab } from '@/components/FlowModelTab';
import { MinWageTab } from '@/components/MinWageTab';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { I18nContext, Locale, translations, TranslationKey } from '@/lib/i18n';

const Index = () => {
  const [locale, setLocale] = useState<Locale>('en');
  const t = useCallback((key: TranslationKey) => translations[locale][key], [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
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
          <Tabs defaultValue="flow" className="space-y-6">
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
