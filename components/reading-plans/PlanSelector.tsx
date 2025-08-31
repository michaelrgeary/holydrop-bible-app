'use client';

import { useState, useEffect } from 'react';
import { useReadingPlanStore } from '@/lib/stores/readingPlanStore';
import { Calendar, Clock, Tag } from 'lucide-react';

interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  dailyMinutes: number;
  tags: string[];
}

export function PlanSelector() {
  const [plans, setPlans] = useState<Record<string, ReadingPlan>>({});
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { startPlan } = useReadingPlanStore();

  useEffect(() => {
    // Load plans from JSON
    fetch('/data/reading-plans/plans.json')
      .then(res => res.json())
      .then(data => {
        // Extract plan metadata (without the actual readings)
        const planMeta: Record<string, ReadingPlan> = {};
        Object.entries(data).forEach(([key, plan]: [string, any]) => {
          planMeta[key] = {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            duration: plan.duration,
            difficulty: plan.difficulty,
            dailyMinutes: plan.dailyMinutes,
            tags: plan.tags
          };
        });
        setPlans(planMeta);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load plans:', err);
        setLoading(false);
      });
  }, []);

  const handleStartPlan = async () => {
    if (!selectedPlan || !plans[selectedPlan]) return;
    
    const plan = plans[selectedPlan];
    await startPlan(plan.id, plan.name, plan.duration);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'challenging': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-water-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading reading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Start Your Bible Journey
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose a reading plan that fits your schedule and spiritual goals. 
          Build a daily habit with our guided reading experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {Object.values(plans).map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`
              relative p-6 rounded-xl border-2 cursor-pointer transition-all
              ${selectedPlan === plan.id 
                ? 'border-water-500 bg-water-50 dark:bg-water-900/20 shadow-lg transform scale-[1.02]' 
                : 'border-gray-200 dark:border-gray-700 hover:border-water-300 hover:shadow-md'
              }
            `}
          >
            {selectedPlan === plan.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-water-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {plan.name}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {plan.description}
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{plan.duration} days</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{plan.dailyMinutes} min/day</span>
              </div>
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(plan.difficulty)}`}>
                {plan.difficulty}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {plan.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:relative md:bg-transparent md:border-0 md:p-0">
          <div className="flex flex-col md:flex-row gap-4 md:justify-center">
            <button
              onClick={handleStartPlan}
              className="px-8 py-3 bg-water-500 hover:bg-water-600 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105"
            >
              Start {plans[selectedPlan].name}
            </button>
            
            <button
              onClick={() => setSelectedPlan(null)}
              className="px-8 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}