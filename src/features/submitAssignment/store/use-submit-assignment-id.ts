import { useQueryState } from 'nuqs';

export const useSubmitAssignmentId = () => {
  return useQueryState('submitAssignmentId');
}
