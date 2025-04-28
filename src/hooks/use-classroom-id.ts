import {useParams} from "next/navigation";

import { Id } from "../../convex/_generated/dataModel";

export const useClassroomId = () => {
    const params = useParams();

    return params.classroomId as Id<"classrooms">;
}