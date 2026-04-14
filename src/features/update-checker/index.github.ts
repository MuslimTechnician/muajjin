// GitHub-release implementation, only bundled when mode === 'github'

export const UPDATE_ENABLED = true;

export { UpdateChecker } from '@/features/update-checker/components/update-checker';
export {
  requestUpdateCheck,
  subscribeUpdateChecks,
} from '@/features/update-checker/services/update-events';
