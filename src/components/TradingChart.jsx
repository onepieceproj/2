import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const TradingChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('price');
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    if (data && data.length > 0) {
      const processedData = data.map((item, index) => ({
        time: new Date(item.timestamp || Date.now() - (data.length - index) * 60000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        price: item.price,
        volume: item.volume,
        change: item.changePercent,
        symbol: item.symbol
      }));
      setChartData(processedData);
    }
  }, [data]);

  const getMetricColor = (value) => {
    if (selectedMetric === 'change') {
      return value >= 0 ? '#10B981' : '#EF4444';
    }
    return '#8B5CF6';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div 
          className="bg-gray-900/95 backdrop-blur-sm border border-purple-700/50 rounded-lg p-4 shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-purple-300 text-sm mb-2">{label}</p>
          {selectedMetric === 'price' && (
            <>
              <p className="text-white font-semibold">
                Price: ${data.price?.toLocaleString()}
              </p>
              <p className={`text-sm ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Change: {data.change >= 0 ? '+' : ''}{data.change?.toFixed(2)}%
              </p>
            </>
          )}
          {selectedMetric === 'volume' && (
            <p className="text-white font-semibold">
              Volume: {data.volume?.toLocaleString()}
            </p>
          )}
          {selectedMetric === 'change' && (
            <p className={`font-semibold ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Change: {data.change >= 0 ? '+' : ''}{data.change?.toFixed(2)}%
            </p>
          )}
        </motion.div>
      );
    }
    return null;
  };

  const getChartValue = (item) => {
    switch (selectedMetric) {
      case 'volume':
        return item.volume;
      case 'change':
        return item.change;
      default:
        return item.price;
    }
  };

  const getYAxisDomain = () => {
    if (selectedMetric === 'change') {
      return ['dataMin - 1', 'dataMax + 1'];
    }
    return ['dataMin - 100', 'dataMax + 100'];
  };

  return (
    <motion.div 
      className="w-full h-96"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Metric:</span>
          </div>
          <select 
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="bg-purple-800/30 border border-purple-600/50 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-purple-400"
          >
            <option value="price">Price</option>
            <option value="volume">Volume</option>
            <option value="change">Change %</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          {chartData.length > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              {selectedMetric === 'price' && (
                <>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">
                    ${chartData[chartData.length - 1]?.price?.toLocaleString()}
                  </span>
                </>
              )}
              {selectedMetric === 'change' && (
                <>
                  {chartData[chartData.length - 1]?.change >= 0 ? 
                    <TrendingUp className="w-4 h-4 text-green-400" /> :
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  }
                  <span className={chartData[chartData.length - 1]?.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {chartData[chartData.length - 1]?.change >= 0 ? '+' : ''}{chartData[chartData.length - 1]?.change?.toFixed(2)}%
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        {selectedMetric === 'volume' ? (
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={12}
              tickLine={false}
              domain={getYAxisDomain()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#volumeGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#8B5CF6', stroke: '#1F2937', strokeWidth: 2 }}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF" 
              fontSize={12}
              tickLine={false}
              domain={getYAxisDomain()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={selectedMetric === 'change' ? '#10B981' : '#8B5CF6'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: selectedMetric === 'change' ? '#10B981' : '#8B5CF6', stroke: '#1F2937', strokeWidth: 2 }}
            />
            {selectedMetric === 'change' && (
              <Line
                type="monotone"
                dataKey={() => 0}
                stroke="#6B7280"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};

export default TradingChart;