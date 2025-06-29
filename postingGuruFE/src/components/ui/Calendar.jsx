// src/components/ui/Calendar.jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import Button from './Button';

const Calendar = ({
                    mode = 'single',
                    selected,
                    onSelect,
                    disabled,
                    className,
                    ...props
                  }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const today = new Date();
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

  const days = [];
  let day = new Date(startDate);
  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const isSelected = (date) => {
    if (!selected) return false;
    if (mode === 'single') {
      return selected.toDateString() === date.toDateString();
    }
    return false;
  };

  const isToday = (date) => {
    return today.toDateString() === date.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isDisabled = (date) => {
    if (typeof disabled === 'function') {
      return disabled(date);
    }
    if (disabled instanceof Date) {
      return date < disabled;
    }
    return false;
  };

  const handleDateClick = (date) => {
    if (isDisabled(date)) return;
    onSelect?.(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className={cn('p-3', className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-sm font-medium">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>

        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div
            key={day}
            className="h-8 w-8 flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date, dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => handleDateClick(date)}
                disabled={isDisabled(date)}
                className={cn(
                  'h-8 w-8 text-xs rounded-md transition-colors hover:bg-accent',
                  {
                    'text-muted-foreground': !isCurrentMonth(date),
                    'bg-primary text-primary-foreground hover:bg-primary/90': isSelected(date),
                    'bg-accent': isToday(date) && !isSelected(date),
                    'opacity-50 cursor-not-allowed': isDisabled(date),
                  }
                )}
              >
                {date.getDate()}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;