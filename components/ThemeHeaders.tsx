import React from 'react';
import { ChevronLeft, MoreHorizontal, Share, Battery, Wifi, Signal } from 'lucide-react';

export const IPhoneHeader = () => {
    return (
        <div className="w-full flex flex-col mb-2.5 select-none pointer-events-none">


            {/* Navigation Bar */}
            <div className="flex justify-between items-center py-1.5 px-1 text-amber-500">
                <div className="flex items-center gap-1">
                    <ChevronLeft size={20} className="relative -left-1" />
                    <span className="text-[16px] font-normal leading-none relative -top-[1px] -left-1">备忘录</span>
                </div>
                <div className="flex items-center gap-3.5">
                    <Share size={18} />
                    <div className="w-[22px] h-[22px] rounded-full border border-amber-500 flex items-center justify-center">
                        <MoreHorizontal size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};
