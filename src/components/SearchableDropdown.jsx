import { useState, useRef, useEffect } from 'react';

// ============================================================================
// SEARCHABLE DROPDOWN — Komponen dropdown dengan fitur pencarian
// Cocok untuk form yang punya banyak pilihan (kendaraan, jenis form, dll)
// Mobile-friendly dengan touch target yang besar
// ============================================================================

const SearchableDropdown = ({
  options = [],         // [{ value, label, sublabel?, icon?, group? }]
  value,                // currently selected value
  onChange,             // (value) => void
  placeholder = '-- Pilih --',
  searchPlaceholder = 'Ketik untuk mencari...',
  label,                // optional label text
  labelNumber,          // optional numbered label (e.g. "2")
  labelIcon,            // optional icon component
  required = false,
  disabled = false,
  helpText,             // optional helper text below dropdown
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Find selected option
  const selectedOption = options.find(opt => String(opt.value) === String(value));

  // Filter options by search
  const filteredOptions = options.filter(opt => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      opt.label?.toLowerCase().includes(q) ||
      opt.sublabel?.toLowerCase().includes(q) ||
      opt.group?.toLowerCase().includes(q)
    );
  });

  // Group options
  const groupedOptions = [];
  let currentGroup = null;
  filteredOptions.forEach(opt => {
    if (opt.group && opt.group !== currentGroup) {
      groupedOptions.push({ type: 'group', label: opt.group });
      currentGroup = opt.group;
    }
    groupedOptions.push({ type: 'option', ...opt });
  });

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
        setHighlightIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-option]');
      if (items[highlightIndex]) {
        items[highlightIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightIndex]);

  const selectableOptions = groupedOptions.filter(g => g.type === 'option');

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex(prev => Math.min(prev + 1, selectableOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && selectableOptions[highlightIndex]) {
          handleSelect(selectableOptions[highlightIndex].value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearch('');
        setHighlightIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
    setHighlightIndex(-1);
  };

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearch('');
      setHighlightIndex(-1);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-2 flex items-center space-x-2">
          {labelIcon && <span className="w-4 h-4">{labelIcon}</span>}
          <span>{labelNumber ? `${labelNumber}. ${label}` : label}</span>
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-full px-4 py-3 border rounded-xl text-left text-xs sm:text-sm font-semibold
          focus:ring-2 focus:ring-[#1E4B8E] dark:focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-800 shadow-xs cursor-pointer
          flex items-center justify-between transition-all duration-150
          ${isOpen
            ? 'border-[#1E4B8E] dark:border-blue-500 ring-2 ring-[#1E4B8E]/20 dark:ring-blue-500/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}
        `}
      >
        <div className="flex items-center space-x-2.5 min-w-0 flex-1">
          {/* Selected option icon */}
          {selectedOption?.icon && (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedOption.iconBg || 'bg-gray-100 dark:bg-gray-700'}`}>
              {typeof selectedOption.icon === 'function'
                ? <selectedOption.icon className="w-4 h-4" />
                : selectedOption.icon
              }
            </div>
          )}
          <div className="min-w-0 flex-1">
            {selectedOption ? (
              <>
                <div className="font-bold text-gray-900 dark:text-white truncate">{selectedOption.label}</div>
                {selectedOption.sublabel && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate">{selectedOption.sublabel}</div>
                )}
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 font-normal">{placeholder}</span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 overflow-x-hidden"
          style={{ maxHeight: '340px' }}
        >
          {/* Search Input */}
          <div className="p-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 sticky top-0">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1E4B8E] dark:focus:ring-blue-500 focus:outline-none focus:border-[#1E4B8E] dark:focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-white font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); searchInputRef.current?.focus(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div ref={listRef} className="overflow-y-auto" style={{ maxHeight: '270px' }}>
            {groupedOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                <svg className="w-6 h-6 mx-auto mb-1.5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tidak ditemukan "{search}"
              </div>
            ) : (
              groupedOptions.map((item, idx) => {
                if (item.type === 'group') {
                  return (
                    <div key={`group-${idx}`} className="px-3 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/80 dark:bg-gray-900/80 border-y border-gray-100 dark:border-gray-700 sticky top-0">
                      {item.label}
                    </div>
                  );
                }

                const optionIdx = selectableOptions.indexOf(item);
                const isSelected = String(item.value) === String(value);
                const isHighlighted = optionIdx === highlightIndex;

                return (
                  <button
                    key={item.value}
                    type="button"
                    data-option="true"
                    onClick={() => handleSelect(item.value)}
                    className={`w-full px-3.5 py-3 text-left flex items-center space-x-2.5 transition-colors cursor-pointer border-b border-gray-50 dark:border-gray-700/50 last:border-b-0 overflow-hidden
                      ${isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-900/30 text-[#1E4B8E] dark:text-blue-400'
                        : isHighlighted
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    {/* Option icon */}
                    {item.icon && (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${item.iconBg || 'bg-gray-100 dark:bg-gray-700'}`}>
                        {typeof item.icon === 'function'
                          ? <item.icon className="w-5 h-5" />
                          : item.icon
                        }
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-[#1E4B8E] dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                        {item.label}
                      </div>
                      {item.sublabel && (
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate mt-0.5">
                          {item.sublabel}
                        </div>
                      )}
                    </div>

                    {/* Selected check */}
                    {isSelected && (
                      <svg className="w-5 h-5 text-[#1E4B8E] dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <p className="text-[11px] text-gray-400 mt-1.5">{helpText}</p>
      )}
    </div>
  );
};

export default SearchableDropdown;
