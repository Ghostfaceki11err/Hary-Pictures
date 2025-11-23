import React, { useMemo } from 'react';
import { Category, Picture, StorageUsage, ActivityItem } from '../types';
import { formatBytes } from '../utils/formatBytes';
import { Upload, Trash2, FolderPlus, FolderMinus, Edit, Clock, TrendingUp, BarChart3, PieChart } from 'lucide-react';

interface DashboardSectionProps {
  categories: Category[];
  pictures: Picture[];
  storageUsage: StorageUsage;
  categoryIdToCount: Record<string, number>;
  activities: ActivityItem[];
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  categories,
  pictures,
  storageUsage,
  categoryIdToCount,
  activities,
}) => {
  // Get regular categories (excluding About Me and Hero)
  const regularCategories = useMemo(() => {
    return categories.filter(cat => {
      const slug = cat.slug.toLowerCase();
      return slug !== 'about-me' && slug !== 'hero';
    });
  }, [categories]);

  // Get largest category
  const largestCategory = useMemo(() => {
    if (regularCategories.length === 0) return null;
    return regularCategories.reduce((max, cat) => {
      const count = categoryIdToCount[cat.id] || 0;
      const maxCount = categoryIdToCount[max.id] || 0;
      return count > maxCount ? cat : max;
    }, regularCategories[0]);
  }, [regularCategories, categoryIdToCount]);

  // Calculate uploads over time (last 7 days)
  const uploadsOverTime = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date;
    });

    return last7Days.map(date => {
      const count = activities.filter(activity => {
        if (activity.type !== 'upload') return false;
        const activityDate = new Date(activity.timestamp);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === date.getTime();
      }).length;
      return { date, count, label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
    });
  }, [activities]);

  // Pictures per category (top 8)
  const picturesPerCategory = useMemo(() => {
    return regularCategories
      .map(cat => ({
        name: cat.name_am,
        count: categoryIdToCount[cat.id] || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [regularCategories, categoryIdToCount]);

  // Storage by category (top 6)
  const storageByCategory = useMemo(() => {
    // Estimate storage by category (assuming average file size)
    const avgFileSize = pictures.length > 0 ? storageUsage.used / pictures.length : 0;
    return regularCategories
      .map(cat => ({
        name: cat.name_am,
        size: (categoryIdToCount[cat.id] || 0) * avgFileSize,
        count: categoryIdToCount[cat.id] || 0,
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 6);
  }, [regularCategories, categoryIdToCount, storageUsage.used, pictures.length]);

  const totalStorage = storageByCategory.reduce((sum, item) => sum + item.size, 0);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'upload':
        return <Upload className="w-4 h-4" />;
      case 'delete':
        return <Trash2 className="w-4 h-4" />;
      case 'category_create':
        return <FolderPlus className="w-4 h-4" />;
      case 'category_delete':
        return <FolderMinus className="w-4 h-4" />;
      case 'category_update':
        return <Edit className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'upload':
        return 'text-emerald-400 bg-emerald-400/10';
      case 'delete':
        return 'text-red-400 bg-red-400/10';
      case 'category_create':
        return 'text-blue-400 bg-blue-400/10';
      case 'category_delete':
        return 'text-orange-400 bg-orange-400/10';
      case 'category_update':
        return 'text-purple-400 bg-purple-400/10';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Find max value for chart scaling
  const maxUploads = Math.max(...uploadsOverTime.map(d => d.count), 1);
  const maxPictures = Math.max(...picturesPerCategory.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Largest Category */}
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl group hover:bg-white/10 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            {largestCategory ? (
              <>
                <div className="text-3xl font-bold text-white mb-1">
                  {categoryIdToCount[largestCategory.id] || 0}
                </div>
                <div className="text-sm text-gray-400">Largest Category</div>
                <div className="mt-3 text-xs text-gray-500 truncate">
                  {largestCategory.name_am}
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-white mb-1">0</div>
                <div className="text-sm text-gray-400">Largest Category</div>
                <div className="mt-3 text-xs text-gray-500">No categories yet</div>
              </>
            )}
          </div>
        </div>

        {/* Total Categories */}
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="text-3xl font-bold text-white mb-1">{categories.length}</div>
          <div className="text-sm text-gray-400">Total Categories</div>
        </div>

        {/* Total Pictures */}
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="text-3xl font-bold text-white mb-1">{pictures.length}</div>
          <div className="text-sm text-gray-400">Total Pictures</div>
        </div>

        {/* Storage Used */}
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="text-2xl font-bold text-white mb-1">{formatBytes(storageUsage.used)}</div>
          <div className="text-sm text-gray-400">Storage Used</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Uploads Over Time */}
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
          <div className="relative">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Uploads Over Time (Last 7 Days)
            </h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {uploadsOverTime.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full h-full flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-cyan-500 rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(day.count / maxUploads) * 100}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                      title={`${day.count} uploads on ${day.label}`}
                    />
                  </div>
                  <div className="text-xs text-gray-400 text-center">{day.label}</div>
                  {day.count > 0 && (
                    <div className="text-xs font-semibold text-white">{day.count}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart - Pictures Per Category */}
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
          <div className="relative">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Pictures Per Category (Top 8)
            </h3>
            <div className="space-y-3">
              {picturesPerCategory.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-300 truncate text-right">{item.name}</div>
                  <div className="flex-1 relative">
                    <div className="h-6 bg-white/10 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                        style={{ width: `${(item.count / maxPictures) * 100}%`, minWidth: item.count > 0 ? '20px' : '0' }}
                      >
                        <span className="text-xs font-semibold text-white">{item.count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pie Chart - Storage By Category */}
      <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
        <div className="relative">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            Storage By Category (Top 6)
          </h3>
          
          {/* Storage Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-sm text-gray-400 mb-1">Total Used</div>
              <div className="text-xl font-bold text-white">{formatBytes(storageUsage.used)}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-sm text-gray-400 mb-1">Available</div>
              <div className="text-xl font-bold text-white">{formatBytes(storageUsage.total - storageUsage.used)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SVG Pie Chart */}
            <div className="flex items-center justify-center">
              <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="40"
                />
                {storageByCategory.map((item, index) => {
                  const percentage = totalStorage > 0 ? (item.size / totalStorage) : 0;
                  // Calculate cumulative offset (sum of all previous segments)
                  const cumulativeOffset = storageByCategory
                    .slice(0, index)
                    .reduce((sum, i) => sum + (totalStorage > 0 ? (i.size / totalStorage) : 0), 0);
                  
                  const circumference = 2 * Math.PI * 80;
                  const arcLength = percentage * circumference;
                  
                  const colors = [
                    '#10b981', // emerald
                    '#06b6d4', // cyan
                    '#3b82f6', // blue
                    '#8b5cf6', // purple
                    '#ec4899', // pink
                    '#f59e0b', // amber
                  ];

                  return (
                    <circle
                      key={index}
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke={colors[index % colors.length]}
                      strokeWidth="40"
                      strokeDasharray={`${arcLength} ${circumference}`}
                      strokeDashoffset={-cumulativeOffset * circumference}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-3">
              {storageByCategory.map((item, index) => {
                const percentage = totalStorage > 0 ? (item.size / totalStorage) * 100 : 0;
                const colors = [
                  'bg-emerald-500',
                  'bg-cyan-500',
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-pink-500',
                  'bg-amber-500',
                ];
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">{item.name}</div>
                      <div className="text-xs text-gray-400">
                        {formatBytes(item.size)} ({percentage.toFixed(1)}%) - {item.count} pictures
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5"></div>
        <div className="relative">
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No activity yet</p>
              </div>
            ) : (
              activities.slice(0, 20).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{activity.description}</div>
                    <div className="text-gray-400 text-xs mt-1">{formatTimeAgo(activity.timestamp)}</div>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {new Date(activity.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

