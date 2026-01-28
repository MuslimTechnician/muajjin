import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserSettings } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Separator } from '@/components/ui/separator';
import { GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContainerType } from '@/pages/Index';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { DEFAULT_SETTINGS, DEFAULT_CONTAINER_ORDER } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';

const CONTAINER_LABELS: Record<string, string> = {
  [ContainerType.DateTime]: 'Date & Time',
  [ContainerType.CurrentPrayer]: 'Current Prayer',
  [ContainerType.NextPrayer]: 'Next Prayer',
  [ContainerType.PrayerTimes]: 'Prayer Times',
  [ContainerType.ProhibitedTimes]: 'Forbidden Times',
  [ContainerType.FastingTimes]: 'Fasting Times'
};

// Translation keys mapping
const CONTAINER_LABEL_KEYS: Record<string, string> = {
  [ContainerType.DateTime]: 'settings.dateTime',
  [ContainerType.CurrentPrayer]: 'settings.currentPrayer',
  [ContainerType.NextPrayer]: 'settings.nextPrayer',
  [ContainerType.PrayerTimes]: 'settings.prayerTimes',
  [ContainerType.ProhibitedTimes]: 'settings.forbiddenTimes',
  [ContainerType.FastingTimes]: 'settings.fastingTimes'
};

// Sortable item for container reordering
function SortableContainer({
  id,
  label,
  isVisible,
  onToggle
}: {
  id: string;
  label: string;
  isVisible: boolean;
  onToggle: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border rounded-sm p-3 hover:bg-muted/50 cursor-move ${
        !isVisible ? 'opacity-50' : 'bg-background'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical size={18} className="text-muted-foreground" />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <Switch
          checked={isVisible}
          onCheckedChange={() => onToggle(id)}
          className="cursor-pointer"
        />
      </div>
    </div>
  );
}

export default function DisplaySettings() {
  const navigate = useNavigate();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t, uploadFont, removeFont, customFont } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userSettings] = useLocalStorage<UserSettings>('muajjin-settings', DEFAULT_SETTINGS);
  const [containerOrder, setContainerOrder] = useLocalStorage<string[]>('muajjin-container-order', DEFAULT_CONTAINER_ORDER);
  const [mounted, setMounted] = useState(false);
  const hasCustomFont = !!customFont;

  // Default visible containers - all visible by default
  const defaultVisibleContainers: Record<string, boolean> = {
    [ContainerType.DateTime]: true,
    [ContainerType.CurrentPrayer]: true,
    [ContainerType.NextPrayer]: true,
    [ContainerType.PrayerTimes]: true,
    [ContainerType.ProhibitedTimes]: true,
    [ContainerType.FastingTimes]: true
  };

  const [visibleContainers, setVisibleContainers] = useLocalStorage<Record<string, boolean>>(
    'muajjin-visible-containers',
    defaultVisibleContainers
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the actual current theme (resolves "system" to "light" or "dark")
  const getCurrentTheme = () => {
    if (!mounted) return 'light';
    return theme === 'system' ? resolvedTheme || 'light' : theme;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = containerOrder.indexOf(active.id);
      const newIndex = containerOrder.indexOf(over.id);

      const newOrder = [...containerOrder];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, active.id);

      setContainerOrder(newOrder);
    }
  };

  const handleToggleContainer = (containerId: string) => {
    setVisibleContainers(prev => ({
      ...prev,
      [containerId]: !prev[containerId]
    }));
  };

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFont(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          <h1 className="text-lg font-semibold">{t('settings.displaySettings')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Theme */}
        <div className="space-y-2">
          <Label>{t('settings.theme')}</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="w-full"
              disabled={!mounted}
            >
              <Sun className="h-4 w-4 mr-2" />
              {t('settings.light')}
            </Button>
            <Button
              type="button"
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="w-full"
              disabled={!mounted}
            >
              <Moon className="h-4 w-4 mr-2" />
              {t('settings.dark')}
            </Button>
            <Button
              type="button"
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="w-full"
              disabled={!mounted}
            >
              <Monitor className="h-4 w-4 mr-2" />
              {t('settings.system')}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Custom Font */}
        <div className="space-y-3">
          <Label>{t('settings.customFont')}</Label>
          <p className="text-sm text-muted-foreground">{t('settings.uploadFontDesc')}</p>

          {hasCustomFont ? (
            <div className="flex items-center justify-between p-3 border rounded-sm bg-muted/30">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{t('settings.currentFont')}: customfont.woff2</span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={removeFont}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {t('settings.removeFont')}
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".woff2"
                onChange={handleFontUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {t('settings.uploadFont')}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {t('settings.fontFileName')}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Home Screen Layout */}
        <div className="space-y-3">
          <Label>{t('settings.homeScreenLayout')}</Label>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={containerOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {containerOrder.map(containerId => (
                  <SortableContainer
                    key={containerId}
                    id={containerId}
                    label={t(CONTAINER_LABEL_KEYS[containerId]) || CONTAINER_LABELS[containerId] || containerId}
                    isVisible={visibleContainers[containerId] ?? true}
                    onToggle={handleToggleContainer}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button onClick={() => navigate('/settings')} className="w-full" size="lg">
            {t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
