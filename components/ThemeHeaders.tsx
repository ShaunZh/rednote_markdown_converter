import React from 'react';
import { ChevronLeft, MoreHorizontal, Share, Battery, Wifi, Signal } from 'lucide-react';

export const IPhoneHeader = () => {
    return (
        <div className="w-full flex flex-col mb-4 select-none pointer-events-none">


            {/* Navigation Bar */}
            <div className="flex justify-between items-center py-2 px-1 text-amber-500">
                <div className="flex items-center gap-1">
                    <ChevronLeft size={22} className="relative -left-1" />
                    <span className="text-[17px] font-normal leading-none relative -top-[1px] -left-1">Notes</span>
                </div>
                <div className="flex items-center gap-4">
                    <Share size={20} />
                    <div className="w-6 h-6 rounded-full border border-amber-500 flex items-center justify-center">
                        <MoreHorizontal size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};
