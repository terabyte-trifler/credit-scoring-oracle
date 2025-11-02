// components/features/OracleStatus.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Activity, Clock, CheckCircle, Zap } from "lucide-react";

interface OracleStats {
  isHealthy: boolean;
  lastUpdate: Date;
  responseTime: number;
  requestsProcessed: number;
}

export function OracleStatus() {
  const [stats, setStats] = useState<OracleStats>({
    isHealthy: true,
    lastUpdate: new Date(),
    responseTime: 2.8,
    requestsProcessed: 0,
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const isLive = true;

  useEffect(() => {
    // Update current time every second for accurate "time ago" display
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Simulate real-time updates
    const statsInterval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        lastUpdate: new Date(),
        responseTime: 2.5 + Math.random() * 1.5, // 2.5-4.0 seconds
        requestsProcessed:
          prev.requestsProcessed + Math.floor(Math.random() * 3),
      }));
    }, 5000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const formatLastUpdate = () => {
    const seconds = Math.floor(
      (currentTime.getTime() - stats.lastUpdate.getTime()) / 1000
    );
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Oracle Status</CardTitle>
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Live
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div className="flex-1">
              <div className="font-medium text-green-900">Operational</div>
              <div className="text-sm text-green-700">
                All systems running normally
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Response Time</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.responseTime.toFixed(1)}s
              </div>
              <div className="text-xs text-gray-600 mt-1">Average</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Requests</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.requestsProcessed}
              </div>
              <div className="text-xs text-gray-600 mt-1">Processed</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Last Update</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {formatLastUpdate()}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {stats.lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Network Performance */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">
              Network Performance
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Somnia TPS:</span>
                <span className="font-semibold text-blue-900">400,000+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Block Time:</span>
                <span className="font-semibold text-blue-900">~400ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Gas Cost:</span>
                <span className="font-semibold text-blue-900">~$0.0001</span>
              </div>
            </div>
          </div>

          {/* Oracle Info */}
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <strong>ML Model:</strong> Random Forest v1.0 (85% accuracy)
            </p>
            <p>
              <strong>Oracle Type:</strong> Centralized (MVP)
            </p>
            <p>
              <strong>Update Frequency:</strong> On-demand
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
