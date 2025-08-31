'use client';

import { PlanSelector } from '@/components/reading-plans/PlanSelector';
import { DailyReading } from '@/components/reading-plans/DailyReading';
import { ProgressDashboard } from '@/components/reading-plans/ProgressDashboard';
import { useReadingPlanStore } from '@/lib/stores/readingPlanStore';

export default function ReadingPlansPage() {
  const { activePlan } = useReadingPlanStore();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-water-50 to-white dark:from-gray-900 dark:to-gray-800">
      {!activePlan ? (
        <PlanSelector />
      ) : (
        <>
          <ProgressDashboard />
          <DailyReading />
        </>
      )}
    </div>
  );
}