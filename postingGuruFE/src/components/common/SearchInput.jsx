// src/components/common/SearchInput.jsx
import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/utils/cn';

const SearchInput = ({
                       placeholder = 'Search...',
                       onSearch,
                       debounceMs = 300,
                       className
                     }) => {
  const [value, setValue] = useState('');
  const debouncedValue = useDebounce(value, debounceMs);

  React.useEffect(() => {
    onSearch?.(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch?.('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent rounded"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
