import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, XCircle, Lightbulb } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  reason?: string;
  status?: "green" | "yellow" | "incomplete";
  animated?: boolean;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function ScoreDisplay({
  score,
  maxScore = 100,
  reason,
  status = "green",
  animated = true,
  size = "md",
  showDetails = true,
  className = "",
  "data-testid": testId,
}: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animated && score !== displayScore) {
      setIsAnimating(true);
      const duration = 1000;
      const steps = 60;
      const increment = (score - displayScore) / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const newScore = displayScore + (increment * currentStep);
        
        if (currentStep >= steps) {
          setDisplayScore(score);
          setIsAnimating(false);
          clearInterval(timer);
        } else {
          setDisplayScore(Math.round(newScore));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [score, displayScore, animated]);

  const percentage = (displayScore / maxScore) * 100;
  
  const getScoreColor = () => {
    if (status === "green" || percentage >= 80) return "text-green-600";
    if (status === "yellow" || percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreIcon = () => {
    if (status === "green" || percentage >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === "yellow" || percentage >= 60) return <AlertCircle className="w-5 h-5 text-orange-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusBadge = () => {
    if (status === "green") return <Badge className="bg-green-100 text-green-800">Grün</Badge>;
    if (status === "yellow") return <Badge className="bg-orange-100 text-orange-800">Gelb</Badge>;
    return <Badge className="bg-red-100 text-red-800">Unvollständig</Badge>;
  };

  const circleSize = size === "sm" ? 60 : size === "lg" ? 120 : 80;
  const strokeWidth = size === "sm" ? 4 : size === "lg" ? 6 : 5;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (size === "sm") {
    return (
      <div className={`flex items-center space-x-2 ${className}`} data-testid={testId}>
        <div className="relative">
          <svg width={circleSize} height={circleSize} className="transform -rotate-90">
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-slate-200"
            />
            <circle
              cx={circleSize / 2}
              cy={circleSize / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${getScoreColor()}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-bold ${getScoreColor()}`}>
              {displayScore}
            </span>
          </div>
        </div>
        {getStatusBadge()}
      </div>
    );
  }

  return (
    <Card className={`${className}`} data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-slate-900">Kandidaten-Score</h4>
          <div className="flex items-center space-x-2">
            {getScoreIcon()}
            {getStatusBadge()}
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <svg width={circleSize} height={circleSize} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="text-slate-200"
              />
              {/* Progress circle */}
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transition-all duration-1000 ${getScoreColor()}`}
                style={{
                  "--score": percentage,
                } as React.CSSProperties}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor()}`}>
                {displayScore}
              </span>
              <span className="text-xs text-slate-500">von {maxScore}</span>
            </div>
          </div>
        </div>

        {/* Progress bar alternative for smaller screens */}
        <div className="md:hidden mb-4">
          <Progress 
            value={percentage} 
            className="h-3"
            data-testid="score-progress-bar"
          />
          <div className="flex justify-between text-sm text-slate-600 mt-1">
            <span>0</span>
            <span className="font-medium">{displayScore}/{maxScore}</span>
          </div>
        </div>

        {showDetails && reason && (
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-900 mb-1">
                  Bewertung
                </div>
                <div className="text-sm text-slate-600">
                  {reason}
                </div>
              </div>
            </div>
          </div>
        )}

        {isAnimating && (
          <div className="text-center text-xs text-slate-500 mt-2">
            Score wird berechnet...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
