'use client';
import { useState } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  ReactionsButton,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, PhoneMissed } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';
import Loader from './loader';
import { Button } from './ui/button';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right' | 'speaker-top' | 'speaker-bottom';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-bottom');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-left':
        return <SpeakerLayout participantsBarPosition="left" />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="right" />;
      case 'speaker-top':
        return <SpeakerLayout participantsBarPosition="top" />;
      case 'speaker-bottom':
        return <SpeakerLayout participantsBarPosition="bottom" />;
      default:
        return <SpeakerLayout participantsBarPosition="bottom" />;
    }
  };

  const LeaveButton = ({ onLeave }: { onLeave: () => void }) => {
    const call = useCall();
    const handleLeave = async () => {
      await call?.leave();
      onLeave(); // กลับไปยังหน้า home หรือหน้าก่อนหน้า
    };
    return (
      <Button
        onClick={handleLeave}
        className="bg-red-600 text-white hover:bg-red-700 rounded-2xl px-4 py-2"
      >
       <PhoneMissed />
      </Button>
    );
  };

  const CustomCallControls = () => {
    return (
      <div className="flex gap-2 items-center">
        {/* ปุ่มเปิด/ปิดไมค์ */}
        <ToggleAudioPublishingButton />

        {/* ปุ่มเปิด/ปิดกล้อง */}
        <ToggleVideoPublishingButton />

        {/* ปุ่มReactions */}
        <ReactionsButton />

        {/* ปุ่มแชร์หน้าจอ */}
        <ScreenShareButton />

        {/* ปุ่มวางสายคนเดียว */}
        <LeaveButton onLeave={() => router.push('/')} />
      </div>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#294158] text-white">
      <div className="relative flex h-full w-full flex-col md:flex-row items-center justify-center">
        {/* Call Layout */}
        <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
          <CallLayout />
        </div>

        {/* Participants List */}
        {showParticipants && ( // Show participants only when showParticipants is true
          <div
            className={cn(
              'w-full h-[calc(100vh-86px)]', // ให้แสดงในทุกขนาดหน้าจอ
              {
                'show-block': showParticipants,
              }
            )}
          >
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="fixed bottom-0 w-full flex items-center justify-center">
        <div className="fixed bottom-1 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md py-3 px-5 rounded-sm shadow-lg max-w-[90%]">
          <div className="flex items-center gap-2 flex-nowrap overflow-x-auto page-scrollbar">
            {/* <CallControls onLeave={() => router.push(`/`)} /> */}
            <CustomCallControls />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
                  <LayoutList size={20} className="text-white" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="border-dark-1 bg-dark-1 text-white"
                side="top"
                align="start"
              >
                {['grid', 'speaker-left', 'speaker-right', 'speaker-top', 'speaker-bottom'].map((item, index) => (
                  <div key={index}>
                    <DropdownMenuItem
                      onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                    >
                      {item}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="border-dark-1" />
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <CallStatsButton />
            <Button
              variant="ghost"
              className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]"
              onClick={() => setShowParticipants((prev) => !prev)} // Toggle the visibility
            >
              <Users size={20} className="text-white" />
            </Button>
            {!isPersonalRoom && <EndCallButton />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;
















// 'use client';
// import { useState } from 'react';
// import {
//   CallControls,
//   CallParticipantsList,
//   CallStatsButton,
//   CallingState,
//   PaginatedGridLayout,
//   SpeakerLayout,
//   useCallStateHooks,
// } from '@stream-io/video-react-sdk';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Users, LayoutList } from 'lucide-react';

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from './ui/dropdown-menu';
// import EndCallButton from './EndCallButton';
// import { cn } from '@/lib/utils';
// import Loader from './loader';
// import { Button } from './ui/button';
// import { useClassroomId } from '@/hooks/use-classroom-id';

// type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

// const MeetingRoom = () => {
//   const searchParams = useSearchParams();
//   const isPersonalRoom = !!searchParams.get('personal');
//   const router = useRouter();
//   const [layout, setLayout] = useState<CallLayoutType>('grid');
//   const [showParticipants, setShowParticipants] = useState(false);
//   const { useCallCallingState } = useCallStateHooks();
//   const classroomId = useClassroomId();
//   // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
//   const callingState = useCallCallingState();

//   if (callingState !== CallingState.JOINED) return <Loader />;

//   const CallLayout = () => {
//     switch (layout) {
//       case 'grid':
//         return <PaginatedGridLayout />;
//       case 'speaker-right':
//         return <SpeakerLayout participantsBarPosition="left" />;
//       default:
//         return <SpeakerLayout participantsBarPosition="right" />;
//     }
//   };

//   return (
//     <section className="relative h-screen w-full overflow-hidden pt-4">
//       <div className="relative flex size-full items-center justify-center">
//         <div className=" flex size-full max-w-[1000px] items-center">
//           <CallLayout />
//         </div>
//         <div
//           className={cn('h-[calc(100vh-86px)] hidden ml-2', {
//             'show-block': showParticipants,
//           })}
//         >
//           <CallParticipantsList onClose={() => setShowParticipants(false)} />
//         </div>
//       </div>
//       {/* video layout and call controls */}
//       <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
//         <CallControls onLeave={() => router.push(`/`)} />

//         <DropdownMenu>
//           <div className="flex items-center">
//             <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
//               <LayoutList size={20} className="text-white" />
//             </DropdownMenuTrigger>
//           </div>
//           <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
//             {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
//               <div key={index}>
//                 <DropdownMenuItem
//                   onClick={() =>
//                     setLayout(item.toLowerCase() as CallLayoutType)
//                   }
//                 >
//                   {item}
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator className="border-dark-1" />
//               </div>
//             ))}
//           </DropdownMenuContent>
//         </DropdownMenu>
//         <CallStatsButton />
//         <Button onClick={() => setShowParticipants((prev) => !prev)}>
//           <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
//             <Users size={20} className="text-white" />
//           </div>
//         </Button>
//         {!isPersonalRoom && <EndCallButton />}
//       </div>
//     </section>
//   );
// };

// export default MeetingRoom;



