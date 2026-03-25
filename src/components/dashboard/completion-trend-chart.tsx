'use client'

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TrendDataPoint } from '@/lib/mock-data'

interface CompletionTrendChartProps {
  data: TrendDataPoint[]
}

export function CompletionTrendChart({ data }: CompletionTrendChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTamamlanan" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--color-primary))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--color-primary))"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="colorDevamEden" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--color-accent))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--color-accent))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
            vertical={false}
          />
          <XAxis
            dataKey="day"
            className="text-sm text-muted-foreground"
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            className="text-sm text-muted-foreground"
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
            }}
          />
          <Area
            type="monotone"
            dataKey="tamamlanan"
            name="Tamamlanan"
            stroke="hsl(var(--color-primary))"
            strokeWidth={2}
            fill="url(#colorTamamlanan)"
            activeDot={{ r: 6 }}
          />
          <Area
            type="monotone"
            dataKey="devamEden"
            name="Devam Eden"
            stroke="hsl(var(--color-accent))"
            strokeWidth={2}
            fill="url(#colorDevamEden)"
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
