"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CategoryChartProps {
  data: Array<{ category: string; completedCount: number; averageScore: number }>;
}

export default function CategoryChart({ data }: CategoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="category" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="averageScore" fill="#3b82f6" name="Ortalama Puan" />
      </BarChart>
    </ResponsiveContainer>
  );
}
