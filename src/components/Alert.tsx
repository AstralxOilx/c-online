import Link from 'next/link';
import Image from 'next/image';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useRouter } from 'next/navigation';

interface PermissionCardProps {
  title: string;
  iconUrl?: string;
}

const Alert = ({ title, iconUrl }: PermissionCardProps) => { 
  return ( 
      <section className="flex h-screen w-full justify-center items-center">
        <Card className="w-full h-full flex justify-center items-center border-none bg-dark-1 p-6 py-9 text-white">
          <CardContent>
            <div className="flex flex-col gap-9">
              <div className="flex justify-center items-center flex-col gap-3.5">
                {iconUrl && (
                  <div className="flex-center">
                    <Image src={iconUrl} width={72} height={72} alt="icon" />
                  </div>
                )}
                <p className="text-center text-xl font-semibold text-black">{title}</p>
              </div> 
            </div>
          </CardContent>
        </Card>
      </section> 
  );
};

export default Alert;