import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, trend, trendValue, colorClass }) => {
  return (
    <div className="relative overflow-hidden bg-card border border-border p-5 shadow-sm rounded-[0.25rem]">
      {/* Accent strip */}
      <div className={`absolute bottom-0 left-0 h-1 w-full ${colorClass || 'bg-primary'}`}></div>
      
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <h2 className="text-2xl font-bold font-mono text-foreground leading-tight">{value}</h2>
        </div>
        <div className={`p-2 rounded-full bg-muted/30 ${colorClass?.replace('bg-', 'text-') || 'text-primary'}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-xs font-medium">
          {trend === 'up' ? (
            <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
          )}
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {trendValue}
          </span>
          <span className="text-muted-foreground ml-1">since last period</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
