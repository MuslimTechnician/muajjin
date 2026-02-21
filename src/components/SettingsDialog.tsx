import { LabeledInputField } from '@/components/form/LabeledInputField';
import { JamaahTimesFields } from '@/components/settings/JamaahTimesFields';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/contexts/TranslationContext';
import { CALCULATION_METHODS, MADHABS } from '@/services/prayerTimesService';
import { UserSettings } from '@/types';
import { Settings } from 'lucide-react';
import { useState } from 'react';

interface SettingsDialogProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export function SettingsDialog({
  settings,
  onUpdateSettings,
}: SettingsDialogProps) {
  const { t } = useTranslation();
  const [localSettings, setLocalSettings] = useState<UserSettings>({
    ...settings,
  });

  const handleSave = () => {
    onUpdateSettings(localSettings);
  };

  const handleJamaahTimeChange = (
    prayer: keyof UserSettings['jamaahTimes'],
    value: string,
  ) => {
    setLocalSettings({
      ...localSettings,
      jamaahTimes: {
        ...localSettings.jamaahTimes,
        [prayer]: value,
      },
    });
  };

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="salat-times">
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="salat-times">
              {t('settings.salatTimes')}
            </TabsTrigger>
            <TabsTrigger value="location">{t('settings.location')}</TabsTrigger>
            <TabsTrigger value="jamaah">
              {t('settings.jamaahTimes')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="salat-times">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calculation-method">
                  {t('settings.calculationMethod')}
                </Label>
                <Select
                  value={localSettings.method.toString()}
                  onValueChange={(value) =>
                    updateSetting('method', parseInt(value))
                  }>
                  <SelectTrigger id="calculation-method">
                    <SelectValue placeholder={t('settings.selectMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CALCULATION_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="madhab">{t('settings.madhab')}</Label>
                <Select
                  value={localSettings.madhab.toString()}
                  onValueChange={(value) =>
                    updateSetting('madhab', parseInt(value))
                  }>
                  <SelectTrigger id="madhab">
                    <SelectValue
                      placeholder={t('settings.selectMadhabOption')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {MADHABS.map((madhab) => (
                      <SelectItem key={madhab.id} value={madhab.id.toString()}>
                        {madhab.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Hijri Date Adjustment ({localSettings.hijriAdjustment} days)
                </Label>
                <Slider
                  min={-3}
                  max={3}
                  step={1}
                  value={[localSettings.hijriAdjustment]}
                  onValueChange={(value) =>
                    updateSetting('hijriAdjustment', value[0])
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Suhoor Adjustment ({localSettings.suhoorAdjustment} min)
                  </Label>
                  <Slider
                    min={-3}
                    max={3}
                    step={1}
                    value={[localSettings.suhoorAdjustment]}
                    onValueChange={(value) =>
                      updateSetting('suhoorAdjustment', value[0])
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Iftar Adjustment ({localSettings.iftarAdjustment} min)
                  </Label>
                  <Slider
                    min={-3}
                    max={3}
                    step={1}
                    value={[localSettings.iftarAdjustment]}
                    onValueChange={(value) =>
                      updateSetting('iftarAdjustment', value[0])
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="manual-location"
                  checked={localSettings.manualLocation}
                  onCheckedChange={(checked) =>
                    updateSetting('manualLocation', checked)
                  }
                />
                <Label htmlFor="manual-location">Manual location</Label>
              </div>

              {localSettings.manualLocation ? (
                <div className="grid grid-cols-2 gap-4">
                  <LabeledInputField
                    id="latitude"
                    type="number"
                    label={t('settings.latitudeLabel')}
                    value={localSettings.latitude || ''}
                    onChange={(value) =>
                      updateSetting('latitude', parseFloat(value) || 0)
                    }
                    containerClassName="space-y-2"
                    inputClassName=""
                  />
                  <LabeledInputField
                    id="longitude"
                    type="number"
                    label={t('settings.longitudeLabel')}
                    value={localSettings.longitude || ''}
                    onChange={(value) =>
                      updateSetting('longitude', parseFloat(value) || 0)
                    }
                    containerClassName="space-y-2"
                    inputClassName=""
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={localSettings.city || ''}
                      onChange={(e) => updateSetting('city', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={localSettings.country || ''}
                      onChange={(e) => updateSetting('country', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="jamaah">
            <JamaahTimesFields
              values={localSettings.jamaahTimes}
              onChange={handleJamaahTimeChange}
              getPrayerLabel={(prayer) =>
                `${prayer} ${t('settings.jamaahTimeLabel')}`
              }
              containerClassName="space-y-4"
              itemClassName="space-y-2"
              inputClassName=""
            />
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave}>{t('settings.saveSettings')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
