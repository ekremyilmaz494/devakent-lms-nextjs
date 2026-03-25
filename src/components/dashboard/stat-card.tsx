import { type LucideIcon } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { TrendingUp, TrendingDown } from 'lucide-react'

const statCardVariants = cva(
  'stat-card group relative overflow-hidden rounded-xl p-6 transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-l-[hsl(var(--color-primary))]',
        success: 'border-l-[hsl(var(--color-success))]',
        warning: 'border-l-[hsl(var(--color-warning))]',
        info: 'border-l-[hsl(var(--color-info))]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface StatCardProps extends VariantProps<typeof statCardVariants> {
  label: string
  value: string | number
  change?: number
  trend?: 'up' | 'down'
  icon: LucideIcon
  className?: string
}

export function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  variant,
  className,
}: StatCardProps) {
  const trendColor = trend === 'up' ? 'text-success' : 'text-error'
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown

  return (
    <div className={statCardVariants({ variant, className })}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight">
            {value}
          </p>
          {change !== undefined && trend && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="font-medium">{change > 0 ? '+' : ''}{change}%</span>
              <span className="text-muted-foreground">son 30 gün</span>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-muted/50 p-3 transition-transform group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  )
}
