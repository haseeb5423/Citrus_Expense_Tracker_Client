
import React from 'react';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div className={`animate-pulse bg-[var(--text-muted)]/10 rounded-xl ${className}`} />
    );
};

export const ChartSkeleton: React.FC = () => {
    return (
        <div className="lg:col-span-2 glass glass-glow p-8 rounded-[3rem] relative overflow-hidden min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="w-32 h-6" />
                        <Skeleton className="w-24 h-3" />
                    </div>
                </div>
                <Skeleton className="w-48 h-12 rounded-2xl" />
            </div>
            <div className="flex-1 mt-4">
                <Skeleton className="w-full h-40" />
            </div>
        </div>
    );
};

export const KpiCardSkeleton: React.FC = () => {
    return (
        <div className="glass glass-glow p-8 rounded-[2.5rem] relative overflow-hidden space-y-4">
            <div className="flex justify-between items-start">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <Skeleton className="w-16 h-3" />
            </div>
            <Skeleton className="w-40 h-10" />
            <Skeleton className="w-24 h-5 rounded-full" />
        </div>
    );
};
