
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/contexts/TranslationContext';

export function AboutSection() {
  const { t } = useTranslation();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('about.title')}</CardTitle>
        <CardDescription>{t('about.information')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('about.appDescription')}
        </p>

        <Separator className="my-2" />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="salat-times">
            <AccordionTrigger>{t('about.sections.salatTimes')}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">{t('about.sections.salatTimesDesc')}</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>{t('about.sections.salatTimesList1')}</li>
                <li>{t('about.sections.salatTimesList2')}</li>
                <li>{t('about.sections.salatTimesList3')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="location">
            <AccordionTrigger>{t('about.sections.location')}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">{t('about.sections.locationDesc')}</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>{t('about.sections.locationList1')}</li>
                <li>{t('about.sections.locationList2')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="calculation-methods">
            <AccordionTrigger>{t('about.sections.calculationMethods')}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">{t('about.sections.calculationMethodsDesc')}</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>{t('about.sections.calculationMethodsList1')}</li>
                <li>{t('about.sections.calculationMethodsList2')}</li>
                <li>{t('about.sections.calculationMethodsList3')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="jamaah-times">
            <AccordionTrigger>{t('about.sections.jamaahTimes')}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm mb-2">{t('about.sections.jamaahTimesDesc')}</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>{t('about.sections.jamaahTimesList1')}</li>
                <li>{t('about.sections.jamaahTimesList2')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
