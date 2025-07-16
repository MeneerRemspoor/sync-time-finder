import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, RotateCcw, TrendingUp, Users, Lightbulb } from 'lucide-react';

interface TimezoneConfig {
  id: string;
  name: string;
  timezone: string;
  enabled: boolean;
  isMyTimezone: boolean;
}

interface TimeSliderProps {
  selectedTime: Date;
  onTimeChange: (time: Date) => void;
  onResetToNow: () => void;
  is24Hour: boolean;
  timezones: TimezoneConfig[];
  isDarkMode: boolean;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ 
  selectedTime, 
  onTimeChange, 
  onResetToNow, 
  is24Hour, 
  timezones, 
  isDarkMode 
}) => {
  // Convert time to minutes since midnight for slider
  const timeToMinutes = (date: Date) => {
    return date.getHours() * 60 + date.getMinutes();
  };

  // Convert minutes since midnight back to time
  const minutesToTime = (minutes: number) => {
    const newTime = new Date(selectedTime);
    newTime.setHours(Math.floor(minutes / 60));
    newTime.setMinutes(minutes % 60);
    return newTime;
  };

  // Calculate suitability for each timezone
  const getSuitability = (hour: number) => {
    if (hour >= 9 && hour <= 17) return 'excellent'; // 9 AM - 5 PM
    if (hour >= 7 && hour <= 20) return 'good'; // 7 AM - 8 PM
    if (hour >= 6 && hour <= 22) return 'fair'; // 6 AM - 10 PM
    return 'poor'; // Late night/early morning
  };

  // Find optimal meeting time
  const findOptimalTime = () => {
    const enabledTimezones = timezones.filter(tz => tz.enabled);
    let bestScore = 0;
    let bestTime = 9 * 60; // Default to 9 AM

    for (let minutes = 0; minutes < 1440; minutes += 30) { // Check every 30 minutes
      const testTime = minutesToTime(minutes);
      const scores = enabledTimezones.map(tz => {
        const localTime = new Date(testTime.toLocaleString("en-US", { timeZone: tz.timezone }));
        const hours = localTime.getHours();
        const suitability = getSuitability(hours);
        const scoreMap = { excellent: 4, good: 3, fair: 2, poor: 1 };
        return scoreMap[suitability];
      });
      
      const totalScore = scores.reduce((sum, score) => sum + score, 0);
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestTime = minutes;
      }
    }
    
    return bestTime;
  };

  const currentMinutes = timeToMinutes(selectedTime);
  const enabledTimezones = timezones.filter(tz => tz.enabled);
  const optimalMinutes = findOptimalTime();
  
  const handleSliderChange = (value: number[]) => {
    const newTime = minutesToTime(value[0]);
    onTimeChange(newTime);
  };

  const goToOptimalTime = () => {
    const optimalTime = minutesToTime(optimalMinutes);
    onTimeChange(optimalTime);
  };

  const formatSliderTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (is24Hour) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    } else {
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
    }
  };

  // Calculate suitability scores for current time

  const suitabilityScores = enabledTimezones.map(tz => {
    const localTime = new Date(selectedTime.toLocaleString("en-US", { timeZone: tz.timezone }));
    const hours = localTime.getHours();
    const suitability = getSuitability(hours);
    
    const scores = { excellent: 4, good: 3, fair: 2, poor: 1 };
    return { timezone: tz, score: scores[suitability], suitability };
  });

  const totalScore = suitabilityScores.reduce((sum, item) => sum + item.score, 0);
  const maxPossibleScore = enabledTimezones.length * 4;
  const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  const excellentCount = suitabilityScores.filter(s => s.suitability === 'excellent').length;
  const goodCount = suitabilityScores.filter(s => s.suitability === 'good').length;
  const fairCount = suitabilityScores.filter(s => s.suitability === 'fair').length;
  const poorCount = suitabilityScores.filter(s => s.suitability === 'poor').length;

  const getOverallRating = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent Meeting Time', color: isDarkMode ? 'bg-green-800/50 text-green-200' : 'bg-green-100 text-green-800', icon: '🟢' };
    if (percentage >= 75) return { label: 'Good Meeting Time', color: isDarkMode ? 'bg-blue-800/50 text-blue-200' : 'bg-blue-100 text-blue-800', icon: '🔵' };
    if (percentage >= 50) return { label: 'Fair Meeting Time', color: isDarkMode ? 'bg-yellow-800/50 text-yellow-200' : 'bg-yellow-100 text-yellow-800', icon: '🟡' };
    return { label: 'Poor Meeting Time', color: isDarkMode ? 'bg-red-800/50 text-red-200' : 'bg-red-100 text-red-800', icon: '🔴' };
  };

  const overallRating = getOverallRating(percentage);

  const displayTimeString = is24Hour 
    ? selectedTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : selectedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <Card className={`border-2 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800/80 backdrop-blur-sm border-purple-400/50' : 'bg-white/80 backdrop-blur-sm border-purple-200'}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-purple-600" />
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Meeting Time Selector</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToOptimalTime}
              className="flex items-center gap-2"
            >
              <Lightbulb size={14} />
              Optimal
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onResetToNow}
              className="flex items-center gap-2"
            >
              <RotateCcw size={14} />
              Now
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {displayTimeString}
          </div>
          <div className={`text-sm flex items-center justify-center gap-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <Calendar size={14} />
            {selectedTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        
        <div className="px-4">
          <div className={`flex justify-between text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {is24Hour ? (
              <>
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
              </>
            ) : (
              <>
                <span>12:00 AM</span>
                <span>6:00 AM</span>
                <span>12:00 PM</span>
                <span>6:00 PM</span>
                <span>11:59 PM</span>
              </>
            )}
          </div>
          
          <div className="relative">
            <Slider
              value={[currentMinutes]}
              onValueChange={handleSliderChange}
              max={1439} // 23:59 in minutes
              min={0}
              step={15} // 15-minute increments
              className="w-full"
            />
            
            {/* Optimal time indicator */}
            <div 
              className="absolute top-0 w-1 h-6 bg-yellow-400 rounded-full -mt-2 pointer-events-none"
              style={{ 
                left: `${(optimalMinutes / 1439) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <div className={`text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap ${isDarkMode ? 'bg-yellow-800 text-yellow-200' : 'bg-yellow-100 text-yellow-800'}`}>
                  ⭐ {formatSliderTime(optimalMinutes)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Suitability Score Section */}
        {enabledTimezones.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-purple-600" />
              <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Meeting Suitability</span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {percentage}%
                </div>
                <Badge className={`${overallRating.color} font-medium flex items-center gap-2 text-xs w-fit`}>
                  <span>{overallRating.icon}</span>
                  {overallRating.label}
                </Badge>
              </div>
              
              <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <Users size={14} />
                <span>{enabledTimezones.length} zone{enabledTimezones.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className={`rounded-full h-2 overflow-hidden mb-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                <div className={`text-sm font-bold ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>{excellentCount}</div>
                <div className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Perfect</div>
              </div>
              <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <div className={`text-sm font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>{goodCount}</div>
                <div className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>Good</div>
              </div>
              <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'}`}>
                <div className={`text-sm font-bold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>{fairCount}</div>
                <div className={`text-xs ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Early/Late</div>
              </div>
              <div className={`rounded-lg p-2 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                <div className={`text-sm font-bold ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>{poorCount}</div>
                <div className={`text-xs ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Off Hours</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSlider;
