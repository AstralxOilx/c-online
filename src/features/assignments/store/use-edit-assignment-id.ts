import { useQueryState } from 'nuqs';

export const useEditAssignmentId = () => {
  return useQueryState('editAssignmentId');
}
