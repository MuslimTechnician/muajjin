export type UpdateCheckOptions = {
  force?: boolean;
  notifyUpToDate?: boolean;
};

type UpdateCheckListener = (options?: UpdateCheckOptions) => void;

const listeners = new Set<UpdateCheckListener>();

export const subscribeUpdateChecks = (listener: UpdateCheckListener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const requestUpdateCheck = (options?: UpdateCheckOptions) => {
  listeners.forEach((listener) => listener(options));
};
