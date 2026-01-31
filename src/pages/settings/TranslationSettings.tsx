import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TranslationSettings() {
  const navigate = useNavigate();
  const { t, activeTranslation, setActiveTranslation, importedTranslations, importTranslation, deleteTranslation } = useTranslation();

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
    if (confirm(t('settings.deleteConfirm').replace('"{{languageName}}"', `"${languageName}"`))) {
      deleteTranslation(id);
      toast.success(t('settings.translationDeleted'));
    }
  };

  const translationList = Object.values(importedTranslations);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-background px-4 py-3">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{t('settings.translations')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Import Section */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">{t('settings.importTranslation')}</Label>
          <p className="text-sm text-muted-foreground">
            {t('settings.communityDesc')}
            {' '}<a
              href="https://github.com/MuslimTechnician/muajjin/discussions/1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t('settings.learnMore')}
            </a>
          </p>

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
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
          <Label className="text-base font-semibold">{t('settings.selectActiveLanguage')}</Label>
          <Select
            value={activeTranslation?.id || 'en'}
            onValueChange={(value) => setActiveTranslation(value === 'en' ? null : value)}
          >
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
              {translationList.map((translation) => (
                <SelectItem key={translation.id} value={translation.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {translation.meta.languageName}
                    <span className="text-xs text-muted-foreground ml-1">
                      ({translation.meta.direction})
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Imported Translations List */}
        {translationList.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('settings.importedTranslations')}</Label>
            <div className="space-y-2">
              {translationList.map((translation) => (
                <Card key={translation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{translation.meta.languageName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('settings.code')}: {translation.meta.languageCode} •
                          {t('settings.direction')}: {translation.meta.direction.toUpperCase()} •
                          {t('settings.version')}: {translation.meta.version}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('settings.imported')}: {new Date(translation.importedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(translation.id, translation.meta.languageName)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {translationList.length === 0 && (
          <Card className="bg-muted/30">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{t('settings.noTranslations')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('settings.noTranslationsDesc')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
