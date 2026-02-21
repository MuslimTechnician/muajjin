import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/contexts/TranslationContext';
import { StoredTranslation } from '@/types/translation';
import { FileText, Globe } from 'lucide-react';

interface ActiveLanguageSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  importedTranslations: StoredTranslation[];
  sectionClassName?: string;
  labelClassName?: string;
}

export function ActiveLanguageSelect({
  value,
  onValueChange,
  importedTranslations,
  sectionClassName = 'space-y-3',
  labelClassName = 'text-sm font-medium',
}: ActiveLanguageSelectProps) {
  const { t } = useTranslation();

  return (
    <div className={sectionClassName}>
      <Label className={labelClassName}>
        {t('settings.selectActiveLanguage')}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
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
          <SelectItem value="bn">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              বাংলা (Bangla)
            </div>
          </SelectItem>
          {importedTranslations.map((translation) => (
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
  );
}
