// GitHub-release implementation, only bundled when mode === 'github'

export const UPDATE_ENABLED = true;

export { UpdateChecker } from '@/components/UpdateChecker';
export {
  requestUpdateCheck,
  subscribeUpdateChecks,
} from '@/services/updateEvents';
