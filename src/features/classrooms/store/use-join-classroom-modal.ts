import {atom ,useAtom} from "jotai";

const joinClassroomModalAtom  = atom(false);

export const useJoinClassroomModal = () => {
    return useAtom(joinClassroomModalAtom);
};

