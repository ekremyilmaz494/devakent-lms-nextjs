'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { TopPerformer } from '@/lib/mock-data'

interface TopPerformersProps {
  performers: TopPerformer[]
}

function getRankColor(index: number): string {
  if (index === 0) return 'text-yellow-600 dark:text-yellow-500'
  if (index === 1) return 'text-gray-500 dark:text-gray-400'
  if (index === 2) return 'text-amber-700 dark:text-amber-600'
  return 'text-muted-foreground'
}

function getScoreBadgeVariant(score: number): 'default' | 'secondary' {
  return score >= 95 ? 'default' : 'secondary'
}

export function TopPerformers({ performers }: TopPerformersProps) {
  return (
    <div className="space-y-4">
      {performers.map((performer, index) => {
        const initials = performer.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        return (
          <div
            key={performer.id}
            className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
            style={{
              animation: `fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms backwards`,
            }}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center font-mono text-lg font-bold ${getRankColor(index)}`}
            >
              #{index + 1}
            </div>
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {performer.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {performer.department}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={getScoreBadgeVariant(performer.score)}>
                {performer.score.toFixed(1)}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {performer.completedCount} eğitim
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
