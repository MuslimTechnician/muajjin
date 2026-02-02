import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/contexts/TranslationContext';
import { FileText, Globe, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppHeader } from '@/components/AppHeader';
import { StoredTranslation } from '@/types/translation';

export default function TranslationSettings() {
  const navigate = useNavigate();
  const {
    t,
    activeTranslation,
    setActiveTranslation,
    importedTranslations,
    importTranslation,
    deleteTranslation,
  } = useTranslation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const result = importTranslation(json);

        if (result.success) {
          toast.success(t('settings.importSuccess'));
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          toast.error(result.error || t('settings.importError'));
        }
      } catch (error) {
        toast.error(t('errors.invalidFile'));
      }
    };
    reader.readAsText(file);
  };

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader showBackButton={true} title={t('settings.translations')} />

      {/* Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        {/* Import Section */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            {t('settings.importTranslation')}
          </Label>
          <a
            href="https://github.com/MuslimTechnician/muajjin/discussions/1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground text-primary hover:underline block">
            {t('settings.importDescriptionWithLearnMore')}
          </a>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            {t('settings.importFile')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
        </div>

        {/* Active Language Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            {t('settings.selectActiveLanguage')}
          </Label>
          <Select
            value={activeTranslation?.id || 'en'}
            onValueChange={(value) =>
              setActiveTranslation(value === 'en' ? null : value)
            }>
            <SelectTrigger>
              <SelectValue placeholder={t('settings.selectLanguageOption')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {t('settings.englishDefault')}
                </div>
              </SelectItem>
              {importedTranslationsList.map((translation) => (
                <SelectItem key={translation.id} value={translation.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {translation.meta.languageName}
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({translation.meta.direction})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                          {t('settings.code')}: {translation.meta.languageCode}{' '}
                          •{t('settings.direction')}:{' '}
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
      </div>
    </div>
  );
}
