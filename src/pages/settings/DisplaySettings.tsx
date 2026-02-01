import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, Check, GripVertical, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DEFAULT_CONTAINER_ORDER } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';
import { EContainerType } from '@/types/enums';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const CONTAINER_LABELS: Record<string, string> = {
  [EContainerType.DateTime]: 'Date & Time',
  [EContainerType.CurrentSalat]: 'Current Salat',
  [EContainerType.NextSalat]: 'Next Salat',
  [EContainerType.SalatTimes]: 'Salat Times',
  [EContainerType.ProhibitedTimes]: 'Forbidden Times',
  [EContainerType.SaumTimes]: 'Saum Times',
};

// Translation keys mapping
const CONTAINER_LABEL_KEYS: Record<string, string> = {
  [EContainerType.DateTime]: 'settings.dateTime',
  [EContainerType.CurrentSalat]: 'settings.currentSalat',
  [EContainerType.NextSalat]: 'settings.nextSalat',
  [EContainerType.SalatTimes]: 'settings.salatTimes',
  [EContainerType.ProhibitedTimes]: 'settings.forbiddenTimes',
  [EContainerType.SaumTimes]: 'settings.saumTimes',
};

// Sortable item for container reordering
function SortableContainer({
  id,
  label,
  isVisible,
  onToggle,
}: {
  id: string;
  label: string;
  isVisible: boolean;
  onToggle: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative cursor-move rounded-sm border p-3 hover:bg-muted/50 ${
        !isVisible ? 'opacity-50' : 'bg-background'
      }`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing">
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
  // const [userSettings] = useLocalStorage<UserSettings>('muajjin-settings', DEFAULT_SETTINGS);
  const [containerOrder, setContainerOrder] = useLocalStorage<string[]>(
    'muajjin-container-order',
    DEFAULT_CONTAINER_ORDER,
  );
  const [mounted, setMounted] = useState(false);
  const hasCustomFont = !!customFont;

  // Default visible containers - all visible by default
  const defaultVisibleContainers: Record<string, boolean> = {
    [EContainerType.DateTime]: true,
    [EContainerType.CurrentSalat]: true,
    [EContainerType.NextSalat]: true,
    [EContainerType.SalatTimes]: true,
    [EContainerType.ProhibitedTimes]: true,
    [EContainerType.SaumTimes]: true,
  };

  const [visibleContainers, setVisibleContainers] = useLocalStorage<
    Record<string, boolean>
  >('muajjin-visible-containers', defaultVisibleContainers);

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
    useSensor(KeyboardSensor),
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
    setVisibleContainers((prev) => ({
      ...prev,
      [containerId]: !prev[containerId],
    }));
  };

  const handleFontUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <h1 className="text-lg font-semibold">
            {t('settings.displaySettings')}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-md space-y-6 p-4">
        {/* Theme */}
        <div className="space-y-2">
          <Label>{t('settings.theme')}</Label>

          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="w-full"
              disabled={!mounted}>
              <Sun className="mr-2 h-4 w-4" />
              {t('settings.light')}
            </Button>

            <Button
              type="button"
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="w-full"
              disabled={!mounted}>
              <Moon className="mr-2 h-4 w-4" />
              {t('settings.dark')}
            </Button>

            <Button
              type="button"
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
              className="w-full"
              disabled={!mounted}>
              <Monitor className="mr-2 h-4 w-4" />
              {t('settings.system')}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Custom Font */}
        <div className="space-y-3">
          <Label>{t('settings.customFont')}</Label>
          <p className="text-sm text-muted-foreground">
            {t('settings.uploadFontDesc')}
          </p>

          {hasCustomFont ? (
            <div className="flex items-center justify-between rounded-sm border bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />

                <span className="text-sm font-medium">
                  {t('settings.currentFont')}: customfont.woff2
                </span>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={removeFont}
                className="gap-1">
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
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                {t('settings.uploadFont')}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
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
            modifiers={[restrictToVerticalAxis]}>
            <SortableContext
              items={containerOrder}
              strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {containerOrder.map((containerId) => (
                  <SortableContainer
                    key={containerId}
                    id={containerId}
                    label={
                      t(CONTAINER_LABEL_KEYS[containerId]) ||
                      CONTAINER_LABELS[containerId] ||
                      containerId
                    }
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
          <Button onClick={() => navigate(-1)} className="w-full" size="lg">
            {t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
