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
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList } from 'lucide-react';

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

type CallLayoutType = 'grid' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('grid');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <PaginatedGridLayout />;
    }
  };

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
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md py-2 px-4 rounded-sm shadow-lg max-w-[90%]">
          <div className="flex items-center gap-2 flex-nowrap overflow-x-auto page-scrollbar">
            <CallControls onLeave={() => router.push(`/`)} />
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
                {['Grid', 'Speaker-Right'].map((item, index) => (
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





