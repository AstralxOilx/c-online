import { usePaginatedQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

const BATCH_SIZE = 20;

interface UseGetSubmitAssignmentsProps {
  assignmentId: Id<"assignments">;
}

export const useGetSubmitAssignments = ({ assignmentId }: UseGetSubmitAssignmentsProps) => {
  
  const { results, status, loadMore } = usePaginatedQuery(
    api.submitAssignment.get,
    { assignmentId },
    { initialNumItems: BATCH_SIZE }
  );
  

  return {
    data: results,       // ข้อมูลที่ได้จาก query
    status,              // loading | success | error
    loadMore,            // เรียกเมื่ออยากโหลดเพิ่ม
  };
};
