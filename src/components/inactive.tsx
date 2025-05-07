import { Ban, MoveLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useRouter } from 'next/navigation';

function Inactive() {

    const router = useRouter();

    return (
        <div className="flex flex-col h-[calc(100vh-86px)] w-full items-center justify-center bg-red-50/10 text-center px-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-200/60 mb-6">
                <Ban className="w-24 h-24 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-red-700">
                บัญชีของคุณถูกระงับการใช้งาน
            </h1>
            <p className="text-red-600 mt-2 max-w-md">
                คุณไม่สามารถเข้าถึงห้องเรียนนี้ได้ เนื่องจากถูกระงับการใช้งาน หากคุณคิดว่าเป็นความผิดพลาด กรุณาติดต่ออาจารย์ผู้สอนเพื่อขอความช่วยเหลือ
            </p>
            <Button
                variant="destructive"
                className="mt-6"
                onClick={() => {
                    router.push(`/classroom`);
                }}
            >
                <MoveLeft />
                กลับหน้าหลัก
            </Button>
        </div>
    );
}

export default Inactive;
