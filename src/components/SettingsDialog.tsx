
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { CALCULATION_METHODS, MADHABS } from '@/services/prayerTimesService';
import { UserSettings } from '@/types';

interface SettingsDialogProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export function SettingsDialog({ settings, onUpdateSettings }: SettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>({ ...settings });
  
  const handleSave = () => {
    onUpdateSettings(localSettings);
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="prayer-times">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="prayer-times">Prayer Times</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="jamaah">Jama'ah Times</TabsTrigger>
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
        </Tabs>
        
        <div className="flex justify-end mt-4">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
