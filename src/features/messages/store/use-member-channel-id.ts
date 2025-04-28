import { useQueryState } from 'nuqs';

export const useMemberChannelId = () => {
  return useQueryState('memberChannelId');
}
