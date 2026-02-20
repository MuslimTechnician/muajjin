import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from '@/contexts/TranslationContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { subscribeUpdateChecks } from '@/services/updateEvents';
import {
  fetchLatestRelease,
  isNewerVersion,
  ReleaseInfo,
} from '@/services/updateService';
import { useCallback, useEffect, useRef, useState } from 'react';
import packageInfo from '../../package.json';

const IGNORED_RELEASE_KEY = 'muajjin-update-ignored';

const isOnline = () => {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
};

export function UpdateChecker() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [ignoredVersion, setIgnoredVersion] = useLocalStorage<
    string | null
  >(IGNORED_RELEASE_KEY, null);
  const isCheckingRef = useRef(false);

  const currentVersion = packageInfo.version || '0.0.0';

  const checkForUpdates = useCallback(
    async (options?: { force?: boolean; notifyUpToDate?: boolean }) => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        const latestRelease = await fetchLatestRelease();
        if (!latestRelease) {
          if (options?.notifyUpToDate) {
            toast({
              title: t('update.checkFailedTitle'),
              description: t('update.checkFailedDescription'),
              duration: 3000,
            });
          }
          return;
        }
        const isNewer = isNewerVersion(
          currentVersion,
          latestRelease.latestVersion,
        );
        if (!isNewer) {
          if (options?.notifyUpToDate) {
            toast({
              title: t('update.upToDateTitle'),
              description: t('update.upToDateDescription', {
                currentVersion,
              }),
              duration: 3000,
            });
          }
          return;
        }
        if (
          !options?.force &&
          ignoredVersion &&
          ignoredVersion === latestRelease.latestVersion
        ) {
          return;
        }

        setReleaseInfo(latestRelease);
        setIsOpen(true);
      } finally {
        isCheckingRef.current = false;
      }
    },
    [currentVersion, ignoredVersion, t],
  );

  useEffect(() => {
    if (!isOnline()) return;
    checkForUpdates();
  }, [checkForUpdates]);

  useEffect(() => {
    const unsubscribe = subscribeUpdateChecks((options) => {
      if (!isOnline()) {
        toast({
          title: t('update.offlineTitle'),
          description: t('update.offlineDescription'),
          duration: 3000,
        });
        return;
      }
      checkForUpdates({
        force: Boolean(options?.force),
        notifyUpToDate: options?.notifyUpToDate ?? true,
      });
    });

    const handleOnline = () => {
      if (isOnline()) {
        checkForUpdates();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
      unsubscribe();
    };
  }, [checkForUpdates, t]);

  const handleIgnore = () => {
    if (releaseInfo?.latestVersion) {
      setIgnoredVersion(releaseInfo.latestVersion);
    }
    setIsOpen(false);
  };

  const handleDownload = () => {
    const target =
      releaseInfo?.downloadUrl || releaseInfo?.releaseUrl || null;
    if (target) {
      window.open(target, '_blank', 'noopener,noreferrer');
    }
    setIsOpen(false);
  };

  if (!releaseInfo) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent
        className="w-[90%] rounded-2xl"
        onOpenAutoFocus={(event) => event.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('update.availableTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('update.availableDescription', {
              latestVersion: releaseInfo.latestVersion,
              currentVersion,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={handleIgnore}
            className="outline-none ring-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
            {t('update.ignore')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDownload}
            disabled={!releaseInfo.downloadUrl && !releaseInfo.releaseUrl}
            className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0">
            {t('update.download', {
              latestVersion: releaseInfo.latestVersion,
            })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
