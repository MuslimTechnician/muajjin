import { AboutSection } from '@/components/AboutSection';
import { CountrySelect } from '@/components/CountrySelect';
import { LabeledInputField } from '@/components/form/LabeledInputField';
import { JamaahTimesFields } from '@/components/settings/JamaahTimesFields';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/contexts/TranslationContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CALCULATION_METHODS, MADHABS } from '@/services/prayerTimesService';
import { UserSettings } from '@/types';
import { useEffect, useState } from 'react';

const DEFAULT_SETTINGS: UserSettings = {
  method: 1, // University of Islamic Sciences Karachi
  madhab: 1, // Hanafi
  jamaahTimes: {},
  suhoorAdjustment: 0,
  iftarAdjustment: 0,
  hijriAdjustment: 0,
  hijriDateChangeAtMaghrib: true,
  manualLocation: true, // Always use manual location
  country: 'Bangladesh',
  city: 'Dhaka',
  timeFormat: 'system',
};

const SettingsPage = () => {
  const { t } = useTranslation();
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>(
    'muajjin-settings',
    DEFAULT_SETTINGS,
  );
  const [localSettings, setLocalSettings] = useState<UserSettings>({
    ...userSettings,
  });

  useEffect(() => {
    setLocalSettings({ ...userSettings });
  }, [userSettings]);

  const handleSave = () => {
    setUserSettings(localSettings);
    toast({
      title: t('settings.settingsUpdated'),
      description: t('settings.settingsSavedDesc'),
    });
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
    <div className="mx-auto min-h-screen max-w-md p-4 pb-20">
      <div className="mb-6 flex justify-end">
        <ThemeToggle />
      </div>

      <Separator className="mb-6" />

      <Tabs defaultValue="salat-times" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-4">
          <TabsTrigger value="salat-times">
            {t('settings.salatTimes')}
          </TabsTrigger>
          <TabsTrigger value="location">{t('settings.location')}</TabsTrigger>
          <TabsTrigger value="jamaah">{t('settings.jamaahTimes')}</TabsTrigger>
          <TabsTrigger value="about">{t('aboutPage.title')}</TabsTrigger>
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
                  <SelectValue placeholder={t('settings.selectMadhabOption')} />
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
                {t('settings.hijriAdjustment')} ({localSettings.hijriAdjustment}{' '}
                days)
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
                <Label>{t('settings.suhoorAdjustment')}</Label>
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
                <Label>{t('settings.iftarAdjustment')}</Label>
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
              <Label htmlFor="manual-location">
                {t('settings.manualLocation')}
              </Label>
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
                />
              </div>
            ) : (
              <div className="space-y-4">
                <CountrySelect
                  selectedCountry={localSettings.country || ''}
                  selectedCity={localSettings.city || ''}
                  onCountryChange={(country) =>
                    updateSetting('country', country)
                  }
                  onCityChange={(city) => updateSetting('city', city)}
                />
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
          />
        </TabsContent>

        <TabsContent value="about">
          <AboutSection />
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>{t('settings.saveSettings')}</Button>
      </div>
    </div>
  );
};

export default SettingsPage;
