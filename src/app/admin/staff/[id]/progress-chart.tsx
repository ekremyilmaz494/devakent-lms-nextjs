"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProgressChartProps {
  data: Array<{ month: string; started: number; completed: number }>;
}

export default function ProgressChart({ data }: ProgressChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="started" stroke="#3b82f6" name="Başlanan" />
        <Line type="monotone" dataKey="completed" stroke="#10b981" name="Tamamlanan" />
      </LineChart>
    </ResponsiveContainer>
  );
}
