import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function InstructorRegisterLoading() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <div className="mb-6">
                <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Form Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="space-y-2">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-4 w-72" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Bio Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-4 w-full" />
                            </div>

                            {/* Specialties Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Skeleton key={i} className="h-8 w-24 rounded-full" />
                                    ))}
                                </div>
                            </div>

                            {/* Certifications Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Country Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            {/* Experience Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Benefits Skeleton */}
                <div className="lg:col-span-1">
                    <Card className="bg-zinc-50 dark:bg-zinc-900 border-indigo-100 dark:border-indigo-900/30 sticky top-8">
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                                    <div className="space-y-2 w-full">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
