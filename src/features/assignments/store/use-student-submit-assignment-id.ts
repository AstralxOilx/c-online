import { useQueryState } from 'nuqs';

export const useStudentSubmitAssignmentId = () => {
  return useQueryState('studentSubmitAssignmentId');
}
