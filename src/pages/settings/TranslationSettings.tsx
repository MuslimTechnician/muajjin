import { SettingsPageLayout } from '@/components/settings/SettingsPageLayout';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { ActiveLanguageSelect } from '@/components/translation/ActiveLanguageSelect';
import { TranslationImportControl } from '@/components/translation/TranslationImportControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/contexts/TranslationContext';
import { ArrowUpRight, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TranslationSettings() {
  const {
    t,
    activeTranslation,
    setActiveTranslation,
    importedTranslations,
    deleteTranslation,
  } = useTranslation();

  const handleDelete = (id: string, languageName: string) => {
    if (
      confirm(
        t('settings.deleteConfirm').replace(
          '"{{languageName}}"',
          `"${languageName}"`,
        ),
      )
    ) {
      deleteTranslation(id);
      toast.success(t('settings.translationDeleted'));
    }
  };

  const importedTranslationsList = Object.values(importedTranslations);

  return (
    <SettingsPageLayout
      title={t('settings.translations')}
      contentClassName="max-w-md mx-auto px-5 py-6 space-y-6">
      {/* Import Section */}
      <SettingsSection
        title={
          <span className="text-base font-semibold">
            {t('settings.importTranslation')}
          </span>
        }>
        <TranslationImportControl
          buttonLabel={t('settings.importFile')}
          helper={
            <a
              href="https://github.com/MuslimTechnician/muajjin/discussions/1"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-primary hover:underline">
              {t('settings.importDescriptionWithLearnMore')}{' '}
              <ArrowUpRight className="inline h-4 w-4" />
            </a>
          }
          helperPosition="before"
        />
      </SettingsSection>

      {/* Active Language Selection */}
      <ActiveLanguageSelect
        value={activeTranslation?.id || 'en'}
        importedTranslations={importedTranslationsList}
        onValueChange={(value) =>
          setActiveTranslation(value === 'en' ? null : value)
        }
        sectionClassName="space-y-3"
        labelClassName="text-base font-semibold"
      />

      {/* Imported Translations List */}
      {importedTranslationsList.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            {t('settings.importedTranslations')}
          </Label>
          <div className="space-y-2">
            {importedTranslationsList.map((translation) => (
              <Card key={translation.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {translation.meta.languageName}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('settings.code')}: {translation.meta.languageCode} •
                        {t('settings.direction')}:{' '}
                        {translation.meta.direction.toUpperCase()} •
                        {t('settings.version')}: {translation.meta.version}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('settings.imported')}:{' '}
                        {new Date(translation.importedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDelete(
                          translation.id,
                          translation.meta.languageName,
                        )
                      }
                      className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </SettingsPageLayout>
  );
}
