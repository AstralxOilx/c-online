import {atom ,useAtom} from "jotai";

const editProfileModalAtom  = atom(false);

export const useEditProfileModal = () => {
    return useAtom(editProfileModalAtom);
};

