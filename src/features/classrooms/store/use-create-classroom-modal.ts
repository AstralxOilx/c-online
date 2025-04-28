import {atom ,useAtom} from "jotai";

const createClassroomModalAtom  = atom(false);

export const useCreateClassroomModal = () => {
    return useAtom(createClassroomModalAtom);
};

