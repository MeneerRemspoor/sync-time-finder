import React, { useState, useEffect, useRef } from 'react';
import { Clock, Copy, RotateCcw, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import TimezoneColumn from './TimezoneColumn';
import TimeSlider from './TimeSlider';

interface TimezoneConfig {
  id: string;
  name: string;
  timezone: string;
  enabled: boolean;
  isMyTimezone: boolean;
}

const DEFAULT_TIMEZONES: TimezoneConfig[] = [
  { id: '1', name: 'San Francisco', timezone: 'America/Los_Angeles', enabled: true, isMyTimezone: false },
  { id: '2', name: 'New York', timezone: 'America/New_York', enabled: true, isMyTimezone: true },
  { id: '3', name: 'Amsterdam', timezone: 'Europe/Amsterdam', enabled: true, isMyTimezone: false },
  { id: '4', name: 'Mumbai', timezone: 'Asia/Kolkata', enabled: true, isMyTimezone: false },
];

const TimezoneSync = () => {
  const [timezones, setTimezones] = useState<TimezoneConfig[]>(DEFAULT_TIMEZONES);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Dark mode as default
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [openSettingsCard, setOpenSettingsCard] = useState<string | null>(null);
  const [isCustomTime, setIsCustomTime] = useState(false);
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  // Update selected time every minute only if not custom time
  useEffect(() => {
    if (!isCustomTime) {
      const interval = setInterval(() => {
        setSelectedTime(new Date());
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [isCustomTime]);

  // Handle clicks outside cards to close settings
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenSettingsCard(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleTimeChange = (newTime: Date) => {
    setSelectedTime(newTime);
    setIsCustomTime(true);
  };

  const toggleTimezone = (id: string) => {
    setTimezones(prev => prev.map(tz => 
      tz.id === id ? { ...tz, enabled: !tz.enabled } : tz
    ));
  };

  const setMyTimezone = (id: string) => {
    setTimezones(prev => prev.map(tz => ({
      ...tz,
      isMyTimezone: tz.id === id
    })));
  };

  const updateTimezone = (id: string, timezone: string) => {
    setTimezones(prev => prev.map(tz => 
      tz.id === id ? { ...tz, timezone } : tz
    ));
  };

  const updateTimezoneName = (id: string, name: string) => {
    setTimezones(prev => prev.map(tz => 
      tz.id === id ? { ...tz, name } : tz
    ));
  };

  const resetToDefaults = () => {
    setTimezones(DEFAULT_TIMEZONES);
    setSelectedTime(new Date());
    setIs24Hour(false);
    setIsCustomTime(false);
    toast({
      title: "Settings Reset",
      description: "All timezones have been reset to default values.",
    });
  };

  const resetToNow = () => {
    setSelectedTime(new Date());
    setIsCustomTime(false);
  };

  const copyMeetingTime = () => {
    const enabledTimezones = timezones.filter(tz => tz.enabled);
    const timeStrings = enabledTimezones.map(tz => {
      const localTime = new Date(selectedTime.toLocaleString("en-US", { timeZone: tz.timezone }));
      const timeStr = is24Hour 
        ? localTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : localTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${tz.name}: ${timeStr}`;
    });
    
    const meetingText = `Meeting Time:\n${timeStrings.join('\n')}`;
    navigator.clipboard.writeText(meetingText);
    
    toast({
      title: "Meeting Time Copied!",
      description: "The meeting times have been copied to your clipboard.",
    });
  };

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetId) {
      const draggedIndex = timezones.findIndex(tz => tz.id === draggedItem);
      const targetIndex = timezones.findIndex(tz => tz.id === targetId);
      
      const newTimezones = [...timezones];
      const [draggedTimezone] = newTimezones.splice(draggedIndex, 1);
      newTimezones.splice(targetIndex, 0, draggedTimezone);
      
      setTimezones(newTimezones);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const enabledTimezones = timezones.filter(tz => tz.enabled);

  return (
    <div ref={containerRef} className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'} p-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <Clock size={24} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Timezone Meeting Sync</h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Coordinate meetings across global timezones</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sun size={16} className={isDarkMode ? 'text-gray-400' : 'text-yellow-500'} />
              <Switch 
                checked={isDarkMode} 
                onCheckedChange={setIsDarkMode}
              />
              <Moon size={16} className={isDarkMode ? 'text-blue-400' : 'text-gray-400'} />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>12h</span>
              <Switch 
                checked={is24Hour} 
                onCheckedChange={setIs24Hour}
              />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>24h</span>
            </div>
            <Button
              variant="outline"
              onClick={resetToDefaults}
              className="flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Reset
            </Button>
            <Button
              onClick={copyMeetingTime}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Copy size={16} />
              Copy Meeting Time
            </Button>
          </div>
        </div>

        {/* Combined Time Slider with Meeting Suitability */}
        <div className="mb-8">
          <TimeSlider 
            selectedTime={selectedTime} 
            onTimeChange={handleTimeChange}
            onResetToNow={resetToNow}
            is24Hour={is24Hour}
            timezones={enabledTimezones}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Timezone Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {timezones.map((timezone) => (
            <div
              key={timezone.id}
              draggable
              onDragStart={() => handleDragStart(timezone.id)}
              onDragOver={(e) => handleDragOver(e, timezone.id)}
              onDragEnd={handleDragEnd}
              className="cursor-move"
            >
              <TimezoneColumn
                timezone={timezone}
                selectedTime={selectedTime}
                is24Hour={is24Hour}
                isMyTimezone={timezone.isMyTimezone}
                onToggle={() => toggleTimezone(timezone.id)}
                onSetMyTimezone={() => setMyTimezone(timezone.id)}
                onUpdateTimezone={(newTimezone) => updateTimezone(timezone.id, newTimezone)}
                onUpdateName={(newName) => updateTimezoneName(timezone.id, newName)}
                showSettings={openSettingsCard === timezone.id}
                onToggleSettings={() => setOpenSettingsCard(openSettingsCard === timezone.id ? null : timezone.id)}
                isDarkMode={isDarkMode}
              />
            </div>
          ))}
        </div>

        {enabledTimezones.length === 0 && (
          <div className="text-center py-12">
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No timezones selected. Enable some timezones using the eye icon on the cards.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimezoneSync;
