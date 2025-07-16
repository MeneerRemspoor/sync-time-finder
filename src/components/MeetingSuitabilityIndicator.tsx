
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Clock } from 'lucide-react';

interface TimezoneConfig {
  id: string;
  name: string;
  timezone: string;
  enabled: boolean;
  isMyTimezone: boolean;
}

interface MeetingSuitabilityIndicatorProps {
  timezones: TimezoneConfig[];
  selectedTime: Date;
}

const MeetingSuitabilityIndicator: React.FC<MeetingSuitabilityIndicatorProps> = ({
  timezones,
  selectedTime
}) => {
  // Calculate suitability for each timezone
  const getSuitability = (hour: number) => {
    if (hour >= 9 && hour <= 17) return 'excellent'; // 9 AM - 5 PM
    if (hour >= 7 && hour <= 20) return 'good'; // 7 AM - 8 PM
    if (hour >= 6 && hour <= 22) return 'fair'; // 6 AM - 10 PM
    return 'poor'; // Late night/early morning
  };

  const suitabilityScores = timezones.map(tz => {
    const localTime = new Date(selectedTime.toLocaleString("en-US", { timeZone: tz.timezone }));
    const hours = localTime.getHours();
    const suitability = getSuitability(hours);
    
    const scores = { excellent: 4, good: 3, fair: 2, poor: 1 };
    return { timezone: tz, score: scores[suitability], suitability };
  });

  const totalScore = suitabilityScores.reduce((sum, item) => sum + item.score, 0);
  const maxPossibleScore = timezones.length * 4;
  const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  const excellentCount = suitabilityScores.filter(s => s.suitability === 'excellent').length;
  const goodCount = suitabilityScores.filter(s => s.suitability === 'good').length;
  const fairCount = suitabilityScores.filter(s => s.suitability === 'fair').length;
  const poorCount = suitabilityScores.filter(s => s.suitability === 'poor').length;

  const getOverallRating = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent Meeting Time', color: 'bg-green-100 text-green-800', icon: '🟢' };
    if (percentage >= 75) return { label: 'Good Meeting Time', color: 'bg-blue-100 text-blue-800', icon: '🔵' };
    if (percentage >= 50) return { label: 'Fair Meeting Time', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' };
    return { label: 'Poor Meeting Time', color: 'bg-red-100 text-red-800', icon: '🔴' };
  };

  const overallRating = getOverallRating(percentage);

  if (timezones.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp size={20} className="text-purple-600" />
          Meeting Suitability Score
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-gray-900">
              {percentage}%
            </div>
            <Badge className={`${overallRating.color} font-medium flex items-center gap-2`}>
              <span>{overallRating.icon}</span>
              {overallRating.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={16} />
            <span>{timezones.length} timezone{timezones.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">{excellentCount}</div>
            <div className="text-xs text-green-700">Perfect</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-600">{goodCount}</div>
            <div className="text-xs text-blue-700">Good</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-lg font-bold text-yellow-600">{fairCount}</div>
            <div className="text-xs text-yellow-700">Early/Late</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-lg font-bold text-red-600">{poorCount}</div>
            <div className="text-xs text-red-700">Off Hours</div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MeetingSuitabilityIndicator;
