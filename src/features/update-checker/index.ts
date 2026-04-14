// Stub implementation used for non-GitHub builds.
// Exports no-op UpdateChecker and update request hooks.

export const UPDATE_ENABLED = false;

export const UpdateChecker = () => null;

export const requestUpdateCheck = (_opts?: unknown) => {};

export const subscribeUpdateChecks = (_listener?: unknown) => () => {};
