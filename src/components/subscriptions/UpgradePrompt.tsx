'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { FEATURES, FeatureName, getTierName } from '@/lib/subscriptions/feature-gates'
import { HugeiconsIcon } from '@hugeicons/react'
import { LockIcon } from '@hugeicons/core-free-icons'

interface UpgradePromptProps {
    requiredFeature: FeatureName
    compact?: boolean
}

/**
 * Prompt displayed when user tries to access a premium feature
 */
export function UpgradePrompt({ requiredFeature, compact = false }: UpgradePromptProps) {
    const feature = FEATURES[requiredFeature]

    if (!feature) return null

    const tierName = getTierName(feature.tier)

    if (compact) {
        return (
            <div className="flex items-center gap-3 p-4 rounded-lg backdrop-blur-xl bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/50 dark:border-zinc-800/50">
                <HugeiconsIcon
                    icon={LockIcon}
                    className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {feature.name}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Requiere plan {tierName}
                    </p>
                </div>
                <Button size="sm" asChild>
                    <Link href="/dashboard/profile/payment">
                        Mejorar Plan
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                    <HugeiconsIcon
                        icon={LockIcon}
                        className="w-6 h-6 text-zinc-600 dark:text-zinc-400"
                    />
                </div>
                <CardTitle className="text-xl">
                    Mejora tu Plan
                </CardTitle>
                <CardDescription>
                    Esta función requiere el plan <span className="font-semibold">{tierName}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    <h4 className="font-semibold text-sm mb-2 text-zinc-900 dark:text-zinc-100">
                        {feature.name}
                    </h4>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {feature.description}
                    </p>
                </div>

                <div className="text-xs text-zinc-500 dark:text-zinc-500 text-center">
                    Desbloquea esta y más funciones con el plan {tierName}
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                    <Link href="/#pricing">
                        Ver Planes
                    </Link>
                </Button>
                <Button className="flex-1" asChild>
                    <Link href="/dashboard/profile/payment">
                        Mejorar Ahora
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
