import { useParentMessageId } from "@/features/messages/store/use-parent-message-id";
import { useProfileMemberId } from "@/features/members/store/use-profile-member-id"; 
import { useMemberChannelId } from "@/features/messages/store/use-member-channel-id";  
import { useEditAssignmentId } from "@/features/assignments/store/use-edit-assignment-id";
import { useStudentSubmitAssignmentId } from "@/features/assignments/store/use-student-submit-assignment-id";
import { useSubmitAssignmentId } from "@/features/submitAssignment/store/use-submit-assignment-id";

export const usePanel = () => {
    const [parentMessageId, setParentMessageId] = useParentMessageId();
    const [profileMemberId, setProfileMemberId] = useProfileMemberId();
    const [memberChannelId, setMemberChannelId] = useMemberChannelId(); 
    const [editAssignmentId, setEditAssignmentId] = useEditAssignmentId(); 
    const [studentSubmitAssignmentId, setStudentSubmitAssignmentId] = useStudentSubmitAssignmentId(); 
    const [submitAssignmentId, setSubmitAssignmentId] = useSubmitAssignmentId(); 


    // const [submitAssignmentId, setSubmitAssignmentId] = useSubmitAssignmentId(); 

    const onOpenProfile = (memberId: string) => {
        setProfileMemberId(memberId);
        setParentMessageId(null); 
        setMemberChannelId(null); 
        setEditAssignmentId(null);
        setStudentSubmitAssignmentId(null);
        // setSubmitAssignmentId(null);
    }

    const onOpenMessage = (messageId: string) => {
        setParentMessageId(messageId); 
        setProfileMemberId(null);
        setMemberChannelId(null); 
        setEditAssignmentId(null);
        setStudentSubmitAssignmentId(null);
        // setSubmitAssignmentId(null);
    }

    const onMemberChannel = (memberChannelId: string) => {
        setMemberChannelId(memberChannelId); 
        setProfileMemberId(null); 
        setParentMessageId(null); 
        setEditAssignmentId(null);
        setStudentSubmitAssignmentId(null);
        // setSubmitAssignmentId(null);
        // setAssignmentId(assignmentId);
    }
    const onEditAssignment = (assignmentId: string) => {
        setEditAssignmentId(assignmentId);
        setMemberChannelId(null); 
        setProfileMemberId(null); 
        setParentMessageId(null); 
        setStudentSubmitAssignmentId(null);
        // setSubmitAssignmentId(null);
        // setAssignmentId(assignmentId);
    }
    const onStudentAssignment = (studentAssignmentId: string) => {
        setStudentSubmitAssignmentId(studentAssignmentId);
        setMemberChannelId(null); 
        setProfileMemberId(null); 
        setParentMessageId(null); 
        setEditAssignmentId(null);
        // setSubmitAssignmentId(null);
        // setAssignmentId(assignmentId);
    }

    
    const onSubmitAssignment = (assignmentId: string) => {
        setSubmitAssignmentId(assignmentId);
        setStudentSubmitAssignmentId(null);
        setMemberChannelId(null); 
        setProfileMemberId(null); 
        setParentMessageId(null); 
        setEditAssignmentId(null);
        
    }

    // const onSubmitAssignment = (assignmentId: string) => {
    //     setProfileMemberId(null); 
    //     setParentMessageId(null); 
    //     // setAssignmentId(null);
    //     // setSubmitAssignmentId(assignmentId);
    // }


    

    const onClose = () => {
        setParentMessageId(null);
        setProfileMemberId(null);
        setMemberChannelId(null);  
        setEditAssignmentId(null);
        setStudentSubmitAssignmentId(null);
        setSubmitAssignmentId(null);
    }

    return {
        parentMessageId,
        profileMemberId,
        memberChannelId,
        editAssignmentId,
        studentSubmitAssignmentId,
        submitAssignmentId,
        onSubmitAssignment,
        onStudentAssignment,
        onEditAssignment,
        onMemberChannel, 
        onOpenProfile,
        onOpenMessage,
        onClose,
    }
}