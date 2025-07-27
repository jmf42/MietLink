import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Globe, Server } from "lucide-react";

interface TrustBadgesProps {
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

export function TrustBadges({ variant = "default", className = "" }: TrustBadgesProps) {
  const badges = [
    {
      icon: Shield,
      text: "Swiss-hosted",
      className: "trust-badge swiss-hosted",
      description: "Gehostet in der Schweiz"
    },
    {
      icon: Lock,
      text: "GDPR Compliant",
      className: "trust-badge gdpr-compliant", 
      description: "GDPR-konform"
    },
    {
      icon: Server,
      text: "SSL Encrypted",
      className: "trust-badge ssl-encrypted",
      description: "SSL-verschlüsselt"
    }
  ];

  if (variant === "compact") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {badges.slice(0, 2).map((badge, index) => (
          <div key={index} className="flex items-center space-x-1">
            <badge.icon className="w-3 h-3 text-green-600" />
            <span className="text-xs text-slate-600">{badge.text}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={`grid md:grid-cols-3 gap-4 ${className}`}>
        {badges.map((badge, index) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <badge.icon className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900 text-sm">{badge.text}</div>
              <div className="text-xs text-slate-600">{badge.description}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {badges.map((badge, index) => (
        <Badge 
          key={index} 
          variant="outline" 
          className={badge.className}
          data-testid={`trust-badge-${badge.text.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <badge.icon className="w-3 h-3 mr-1" />
          {badge.text}
        </Badge>
      ))}
    </div>
  );
}
