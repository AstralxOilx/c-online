// 'use client';

// import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

// import { Button } from './ui/button';
// import { useRouter } from 'next/navigation';
// import { useClassroomId } from '@/hooks/use-classroom-id';

// const EndCallButton = () => {
//   const call = useCall();
//   const router = useRouter();
//   const classroomId = useClassroomId();

//   if (!call)
//     throw new Error(
//       'useStreamCall must be used within a StreamCall component.',
//     );

//   // https://getstream.io/video/docs/react/guides/call-and-participant-state/#participant-state-3
//   const { useLocalParticipant } = useCallStateHooks();
//   const localParticipant = useLocalParticipant();

//   const isMeetingOwner =
//     localParticipant &&
//     call.state.createdBy &&
//     localParticipant.userId === call.state.createdBy.id;

//   if (!isMeetingOwner) return null;

//   const endCall = async () => {
//     await call.endCall();
//     router.push(`/classroom/${classroomId}`);
//   };



//   return (
//     <Button onClick={endCall} className="bg-red-500">
//       วางสายให้ทุกคน
//     </Button>
//   );
// };

// export default EndCallButton;







'use client';
 
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk'; 
import { Button } from './ui/button'; 

const EndCallButton = () => {
  const call = useCall(); 

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.'
    );
  }

  // State hook for local participant (ผู้ที่เข้าร่วมประชุม)
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  // ตรวจสอบว่าเป็นเจ้าของห้องประชุมหรือไม่
  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  // ฟังก์ชันที่ใช้เมื่อกดปุ่ม "End Call"
  const endCall = async () => {
    await call.endCall(); // สิ้นสุดการประชุม

    // หลังจากสิ้นสุดการประชุมแล้ว ให้รีไดเร็กไปยัง classroom
    // router.push(`/classroom/${classroomId}`);
  };


  return (
    <Button onClick={endCall}  className="bg-red-600 text-white hover:bg-red-700 rounded-2xl px-4 py-2">
      วางสายให้ทุกคน
    </Button>
  );
};

export default EndCallButton;

