'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface HealthMetric {
  timestamp: number;
  metricName: string;
  value: number;
  status: 'healthy' | 'degraded' | 'critical';
}

interface HealingEvent {
  id: string;
  timestamp: number;
  type: string;
  description: string;
  status: 'completed' | 'failed' | 'in_progress';
  improvement?: number;
}

interface SystemStatus {
  isRunning: boolean;
  healingCycle: number;
  totalAnomalies: number;
  totalHealingActions: number;
  successRate: number;
  avgImprovement: number;
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [healingEvents, setHealingEvents] = useState<HealingEvent[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    isRunning: true,
    healingCycle: 0,
    totalAnomalies: 0,
    totalHealingActions: 0,
    successRate: 0,
    avgImprovement: 0,
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      // Generate mock metrics
      const now = Date.now();
      const newMetrics: HealthMetric[] = [
        {
          timestamp: now,
          metricName: 'response_time',
          value: 200 + Math.random() * 800,
          status: Math.random() > 0.8 ? 'degraded' : 'healthy',
        },
        {
          timestamp: now,
          metricName: 'error_rate',
          value: Math.random() * 0.1,
          status: Math.random() > 0.9 ? 'critical' : 'healthy',
        },
        {
          timestamp: now,
          metricName: 'cpu_usage',
          value: 30 + Math.random() * 50,
          status: 'healthy',
        },
      ];

      setMetrics(prev => [...prev.slice(-50), ...newMetrics]);

      // Randomly add healing events
      if (Math.random() > 0.95) {
        const event: HealingEvent = {
          id: `heal-${now}`,
          timestamp: now,
          type: ['Performance', 'Error', 'Resource'][Math.floor(Math.random() * 3)],
          description: 'Auto-fixed detected issue',
          status: Math.random() > 0.2 ? 'completed' : 'failed',
          improvement: Math.random() * 40 + 10,
        };
        setHealingEvents(prev => [event, ...prev.slice(0, 19)]);
        
        setSystemStatus(prev => ({
          ...prev,
          healingCycle: prev.healingCycle + 1,
          totalAnomalies: prev.totalAnomalies + 1,
          totalHealingActions: prev.totalHealingActions + (event.status === 'completed' ? 1 : 0),
          successRate: ((prev.totalHealingActions + (event.status === 'completed' ? 1 : 0)) / (prev.totalAnomalies + 1)) * 100,
          avgImprovement: event.improvement || prev.avgImprovement,
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Prepare chart data
  const chartData = metrics
    .filter(m => m.metricName === 'response_time')
    .slice(-20)
    .map(m => ({
      time: new Date(m.timestamp).toLocaleTimeString(),
      value: m.value,
    }));

  const healingStats = healingEvents.slice(0, 10).map(e => ({
    id: e.id.slice(-8),
    improvement: e.improvement || 0,
    status: e.status,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <span className="text-5xl">🦾</span>
            Liquid Metal Forge
          </h1>
          <p className="text-gray-300 text-lg">
            Autonomous Self-Healing System Dashboard
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatusCard
            title="System Status"
            value={systemStatus.isRunning ? 'Running' : 'Stopped'}
            color={systemStatus.isRunning ? 'green' : 'red'}
            icon="🟢"
          />
          <StatusCard
            title="Healing Cycles"
            value={systemStatus.healingCycle.toString()}
            color="blue"
            icon="🔄"
          />
          <StatusCard
            title="Success Rate"
            value={`${systemStatus.successRate.toFixed(1)}%`}
            color="purple"
            icon="✅"
          />
          <StatusCard
            title="Avg Improvement"
            value={`${systemStatus.avgImprovement.toFixed(1)}%`}
            color="yellow"
            icon="📈"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Response Time Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Response Time (ms)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Healing Impact Chart */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Healing Impact (%)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={healingStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="id" stroke="#ffffff80" />
                <YAxis stroke="#ffffff80" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="improvement" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Healing Events Timeline */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Healing Events</h2>
          <div className="space-y-3">
            {healingEvents.slice(0, 8).map(event => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {event.status === 'completed' ? '✅' : event.status === 'failed' ? '❌' : '⏳'}
                  </span>
                  <div>
                    <div className="font-medium">{event.type} Issue</div>
                    <div className="text-sm text-gray-400">{event.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                  {event.improvement !== undefined && (
                    <div className="text-green-400 font-medium">
                      +{event.improvement.toFixed(1)}% improvement
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatusCard({ title, value, color, icon }: { title: string; value: string; color: string; icon: string }) {
  const colorClasses = {
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} backdrop-blur-lg rounded-lg p-6 border`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-gray-300 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
