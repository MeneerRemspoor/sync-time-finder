
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, MapPin, Grip, Settings, Eye, EyeOff, Star } from 'lucide-react';

interface TimezoneConfig {
  id: string;
  name: string;
  timezone: string;
  enabled: boolean;
  isMyTimezone: boolean;
}

interface TimezoneColumnProps {
  timezone: TimezoneConfig;
  selectedTime: Date;
  is24Hour: boolean;
  isMyTimezone: boolean;
  onToggle: () => void;
  onSetMyTimezone: () => void;
  onUpdateTimezone: (timezone: string) => void;
  onUpdateName: (name: string) => void;
  showSettings: boolean;
  onToggleSettings: () => void;
  isDarkMode: boolean;
}

const TIMEZONE_OPTIONS = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)', abbr: 'PST' },
  { value: 'America/New_York', label: 'Eastern Time (EST/EDT)', abbr: 'EST' },
  { value: 'Europe/London', label: 'London (GMT/BST)', abbr: 'GMT' },
  { value: 'Europe/Amsterdam', label: 'Central Europe (CET/CEST)', abbr: 'CET' },
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', abbr: 'IST' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', abbr: 'JST' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time', abbr: 'AEST' },
];

const TimezoneColumn: React.FC<TimezoneColumnProps> = ({
  timezone,
  selectedTime,
  is24Hour,
  isMyTimezone,
  onToggle,
  onSetMyTimezone,
  onUpdateTimezone,
  onUpdateName,
  showSettings,
  onToggleSettings,
  isDarkMode
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(timezone.name);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate local time for this timezone
  const localTime = new Date(selectedTime.toLocaleString("en-US", { timeZone: timezone.timezone }));
  const hours = localTime.getHours();
  
  // Determine meeting suitability based on local time
  const getSuitability = (hour: number) => {
    if (hour >= 9 && hour <= 17) return 'excellent'; // 9 AM - 5 PM
    if (hour >= 7 && hour <= 20) return 'good'; // 7 AM - 8 PM
    if (hour >= 6 && hour <= 22) return 'fair'; // 6 AM - 10 PM
    return 'poor'; // Late night/early morning
  };

  const suitability = getSuitability(hours);
  
  const suitabilityConfig = {
    excellent: { 
      bg: isDarkMode ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30' : 'bg-gradient-to-br from-green-50 to-emerald-50', 
      border: isDarkMode ? 'border-green-400/50' : 'border-green-200',
      badge: isDarkMode ? 'bg-green-800/50 text-green-200' : 'bg-green-100 text-green-800',
      label: 'Perfect Time',
      icon: '🟢'
    },
    good: { 
      bg: isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-sky-900/30' : 'bg-gradient-to-br from-blue-50 to-sky-50', 
      border: isDarkMode ? 'border-blue-400/50' : 'border-blue-200',
      badge: isDarkMode ? 'bg-blue-800/50 text-blue-200' : 'bg-blue-100 text-blue-800',
      label: 'Good Time',
      icon: '🔵'
    },
    fair: { 
      bg: isDarkMode ? 'bg-gradient-to-br from-yellow-900/30 to-amber-900/30' : 'bg-gradient-to-br from-yellow-50 to-amber-50', 
      border: isDarkMode ? 'border-yellow-400/50' : 'border-yellow-200',
      badge: isDarkMode ? 'bg-yellow-800/50 text-yellow-200' : 'bg-yellow-100 text-yellow-800',
      label: 'Early/Late',
      icon: '🟡'
    },
    poor: { 
      bg: isDarkMode ? 'bg-gradient-to-br from-red-900/30 to-rose-900/30' : 'bg-gradient-to-br from-red-50 to-rose-50', 
      border: isDarkMode ? 'border-red-400/50' : 'border-red-200',
      badge: isDarkMode ? 'bg-red-800/50 text-red-200' : 'bg-red-100 text-red-800',
      label: 'Off Hours',
      icon: '🔴'
    }
  };

  const config = suitabilityConfig[suitability];
  
  const timeString = is24Hour 
    ? localTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : localTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  
  const dateString = localTime.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  // Get timezone abbreviation
  const getTimezoneAbbr = (tz: string) => {
    const option = TIMEZONE_OPTIONS.find(opt => opt.value === tz);
    return option?.abbr || tz.split('/')[1]?.replace('_', ' ') || 'UTC';
  };

  const cardBg = timezone.enabled ? config.bg : (isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50');
  const cardBorder = timezone.enabled ? config.border : (isDarkMode ? 'border-gray-600' : 'border-gray-300');
  const cardOpacity = timezone.enabled ? 'opacity-100' : 'opacity-60';
  
  // Enhanced styling for "my timezone"
  const myTimezoneEnhancement = isMyTimezone ? (isDarkMode ? 'ring-2 ring-purple-400/50 shadow-xl shadow-purple-500/20' : 'ring-2 ring-purple-300 shadow-xl shadow-purple-200/50') : '';

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const handleNameEdit = () => {
    setIsEditing(true);
  };

  const handleNameSave = () => {
    onUpdateName(editedName);
    setIsEditing(false);
  };

  const handleNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setEditedName(timezone.name);
      setIsEditing(false);
    }
  };

  return (
    <Card className={`${cardBg} ${cardBorder} ${cardOpacity} ${myTimezoneEnhancement} border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 relative`}>
      {/* Star button in top left corner */}
      <div className="absolute top-2 left-2 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSetMyTimezone}
          className={`p-1 h-auto ${isMyTimezone ? (isDarkMode ? 'text-yellow-400' : 'text-yellow-500') : (isDarkMode ? 'text-gray-500 hover:text-yellow-400' : 'text-gray-400 hover:text-yellow-500')}`}
        >
          <Star size={16} fill={isMyTimezone ? "currentColor" : "none"} />
        </Button>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-2 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-1 h-auto"
        >
          {timezone.enabled ? <Eye size={14} className={isDarkMode ? "text-gray-300" : "text-gray-600"} /> : <EyeOff size={14} className={isDarkMode ? "text-gray-500" : "text-gray-400"} />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSettings}
          className="p-1 h-auto"
        >
          <Settings size={14} className={isDarkMode ? "text-gray-400" : "text-gray-400"} />
        </Button>
        <div className="cursor-grab">
          <Grip size={16} className={isDarkMode ? "text-gray-500" : "text-gray-400"} />
        </div>
      </div>
      
      {/* My Timezone Badge - positioned below the star */}
      {isMyTimezone && (
        <div className="absolute top-8 left-2 z-10">
          <Badge variant="secondary" className={`text-xs font-medium flex items-center gap-1 w-fit ${isDarkMode ? 'bg-purple-800/70 text-purple-200' : 'bg-purple-100 text-purple-800'}`}>
            My Zone
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3 pt-12">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin size={18} className={isDarkMode ? "text-gray-400" : "text-gray-600"} />
            {isEditing ? (
              <input
                ref={nameInputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleNameKeyPress}
                className={`bg-transparent border border-gray-300 outline-none font-semibold text-lg rounded px-2 py-1 max-w-32 ${isDarkMode ? 'text-white border-gray-600 focus:border-gray-400' : 'text-gray-900 focus:border-gray-500'}`}
              />
            ) : (
              <span 
                onClick={handleNameEdit}
                className={`font-semibold text-lg cursor-pointer hover:bg-opacity-20 hover:bg-gray-500 rounded px-1 py-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                {timezone.name}
              </span>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showSettings && (
          <div className={`rounded-lg p-4 space-y-3 border ${isDarkMode ? 'bg-gray-800/90 border-gray-600' : 'bg-white/90 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Enable Zone</span>
              <Switch checked={timezone.enabled} onCheckedChange={onToggle} />
            </div>
            
            <div className="space-y-2">
              <label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Timezone</label>
              <Select value={timezone.timezone} onValueChange={onUpdateTimezone}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={`border shadow-lg z-50 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                  {TIMEZONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button
              variant={isMyTimezone ? "default" : "outline"}
              size="sm"
              onClick={onSetMyTimezone}
              className="w-full text-xs flex items-center gap-1"
            >
              <Star size={12} />
              {isMyTimezone ? "My Timezone" : "Set as My Timezone"}
            </Button>
          </div>
        )}
        
        <div className="text-center">
          <div className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {timeString}
          </div>
          <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {dateString}
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <Badge className={`${config.badge} font-medium flex items-center gap-2 w-fit`}>
            <span>{config.icon}</span>
            {config.label}
          </Badge>
        </div>
        
        <div className="text-center">
          <div className={`text-xs rounded-full px-3 py-1 inline-block flex items-center gap-1 w-fit ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-white/50 text-gray-500'}`}>
            <Clock size={12} />
            {getTimezoneAbbr(timezone.timezone)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimezoneColumn;
