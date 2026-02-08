'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface SchedulePopoverProps {
  onSchedule: (date: string, label: string) => void;
  disabled?: boolean;
}

export function SchedulePopover({ onSchedule, disabled }: SchedulePopoverProps) {
  const [open, setOpen] = useState(false);

  const handleSchedule = (daysFromNow: number) => {
    setOpen(false);
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const label =
      daysFromNow === 1
        ? 'Scheduled for tomorrow'
        : daysFromNow === 7
          ? 'Scheduled for next week'
          : `Scheduled for ${format(date, 'MMM d')}`;
    onSchedule(format(date, 'yyyy-MM-dd'), label);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="lg"
          variant="outline"
          disabled={disabled}
          className="h-14 text-base"
        >
          <CalendarIcon className="h-5 w-5 mr-2" />
          Schedule
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2 z-[60]" align="center">
        <div className="grid gap-1">
          <Button variant="ghost" className="justify-start" onClick={() => handleSchedule(1)}>
            Tomorrow
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => handleSchedule(2)}>
            In 2 days
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => handleSchedule(7)}>
            Next week
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => handleSchedule(14)}>
            In 2 weeks
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
