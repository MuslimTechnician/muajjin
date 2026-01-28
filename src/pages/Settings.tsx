import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { CALCULATION_METHODS, CALCULATION_METHOD_KEYS, MADHABS } from '@/services/prayerTimesService';
import { UserSettings } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CountrySelect } from '@/components/CountrySelect';
import { AboutSection } from '@/components/AboutSection';

const DEFAULT_SETTINGS: UserSettings = {
  method: 1, // University of Islamic Sciences Karachi
  madhab: 1, // Hanafi
  jamaahTimes: {},
  sehriAdjustment: 0,
  iftarAdjustment: 0,
  hijriAdjustment: 0,
  manualLocation: true, // Always use manual location
  country: 'Bangladesh',
  city: 'Dhaka'
};

const SettingsPage = () => {
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('muajjin-settings', DEFAULT_SETTINGS);
  const [localSettings, setLocalSettings] = useState<UserSettings>({ ...userSettings });
  
  useEffect(() => {
    setLocalSettings({ ...userSettings });
  }, [userSettings]);
  
  const handleSave = () => {
    setUserSettings(localSettings);
    toast({
      title: "Settings Updated",
      description: "Your prayer time settings have been saved.",
    });
  };
  
  const handleJamaahTimeChange = (prayer: keyof UserSettings['jamaahTimes'], value: string) => {
    setLocalSettings({
      ...localSettings,
      jamaahTimes: {
        ...localSettings.jamaahTimes,
        [prayer]: value
      }
    });
  };
  
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="min-h-screen p-4 max-w-md mx-auto pb-20">
      <div className="flex justify-end mb-6">
        <ThemeToggle />
      </div>
      
      <Separator className="mb-6" />
      
      <Tabs defaultValue="prayer-times" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4 w-full">
          <TabsTrigger value="prayer-times">Prayer Times</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="jamaah">Jama'ah</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prayer-times">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="calculation-method">Calculation Method</Label>
              <Select 
                value={localSettings.method.toString()} 
                onValueChange={(value) => updateSetting('method', parseInt(value))}
              >
                <SelectTrigger id="calculation-method">
                  <SelectValue placeholder="Select method" />
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
              <Label htmlFor="madhab">Madhab (for Asr)</Label>
              <Select 
                value={localSettings.madhab.toString()} 
                onValueChange={(value) => updateSetting('madhab', parseInt(value))}
              >
                <SelectTrigger id="madhab">
                  <SelectValue placeholder="Select madhab" />
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
              <Label>Hijri Date Adjustment ({localSettings.hijriAdjustment} days)</Label>
              <Slider 
                min={-3} 
                max={3} 
                step={1} 
                value={[localSettings.hijriAdjustment]} 
                onValueChange={(value) => updateSetting('hijriAdjustment', value[0])}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sehri Adjustment ({localSettings.sehriAdjustment} min)</Label>
                <Slider 
                  min={-3} 
                  max={3} 
                  step={1} 
                  value={[localSettings.sehriAdjustment]} 
                  onValueChange={(value) => updateSetting('sehriAdjustment', value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Iftar Adjustment ({localSettings.iftarAdjustment} min)</Label>
                <Slider 
                  min={-3} 
                  max={3} 
                  step={1} 
                  value={[localSettings.iftarAdjustment]} 
                  onValueChange={(value) => updateSetting('iftarAdjustment', value[0])}
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
                onCheckedChange={(checked) => updateSetting('manualLocation', checked)}
              />
              <Label htmlFor="manual-location">Manual location</Label>
            </div>
            
            {localSettings.manualLocation ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input 
                    id="latitude" 
                    type="number" 
                    value={localSettings.latitude || ''} 
                    onChange={(e) => updateSetting('latitude', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input 
                    id="longitude" 
                    type="number" 
                    value={localSettings.longitude || ''} 
                    onChange={(e) => updateSetting('longitude', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <CountrySelect 
                  selectedCountry={localSettings.country || ''}
                  selectedCity={localSettings.city || ''}
                  onCountryChange={(country) => updateSetting('country', country)}
                  onCityChange={(city) => updateSetting('city', city)}
                />
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="jamaah">
          <div className="space-y-4">
            {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
              <div key={prayer} className="space-y-2">
                <Label htmlFor={`jamaah-${prayer}`}>{prayer} Jama'ah Time</Label>
                <Input 
                  id={`jamaah-${prayer}`}
                  type="time"
                  value={localSettings.jamaahTimes[prayer as keyof UserSettings['jamaahTimes']] || ''}
                  onChange={(e) => handleJamaahTimeChange(
                    prayer as keyof UserSettings['jamaahTimes'], 
                    e.target.value
                  )}
                />
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="about">
          <AboutSection />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
};

export default SettingsPage;
