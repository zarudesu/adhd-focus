'use client';

/**
 * Calm Review Component
 * beatyour8 Philosophy: Not a reward, but a return of meaning
 *
 * ADHD brains don't get dopamine from completion.
 * They need cognitive replacement - understanding WHY it was enough.
 *
 * This is not "well done" - this is "this was enough".
 * Not celebration, but reflection.
 * Not dopamine, but meaning.
 */

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface CalmReviewProps {
  /** Type of action that triggered the review */
  trigger: 'task_complete' | 'day_end' | 'session_end' | 'habit_done';
  /** Optional context for personalized messages */
  context?: {
    tasksCompleted?: number;
    totalTasks?: number;
    isPartial?: boolean;
    timeSpent?: number;
  };
  /** Called when review is dismissed */
  onComplete?: () => void;
}

// Messages that return meaning, not dopamine
// Each message explains WHY what was done was enough
const REVIEW_MESSAGES = {
  task_complete: [
    {
      heading: 'This was enough.',
      body: 'You did a part.\nFor a brain with ADHD, this matters more than finishing everything.',
      footer: 'You can stop now.',
    },
    {
      heading: 'Part is better than zero.',
      body: '20% of effort already creates movement.\nThe rest doesn\'t have to be today.',
      footer: 'This counts.',
    },
    {
      heading: 'You started.',
      body: 'For ADHD, starting is the hardest part.\nYou already did it.',
      footer: 'That\'s the win.',
    },
    {
      heading: 'Done.',
      body: 'Not "well done". Just done.\nThat\'s all that matters.',
      footer: null,
    },
    {
      heading: 'You moved.',
      body: 'Movement beats perfection.\nAlways.',
      footer: null,
    },
  ],
  day_end: [
    {
      heading: 'Today was enough.',
      body: 'You did what you could.\nThat\'s the only fair measure.',
      footer: 'Rest now.',
    },
    {
      heading: 'The day is complete.',
      body: 'Not because everything is done.\nBecause you showed up.',
      footer: null,
    },
    {
      heading: 'You can close the day.',
      body: 'What\'s left will wait.\nIt always does.',
      footer: null,
    },
  ],
  session_end: [
    {
      heading: 'Session complete.',
      body: 'You gave it time.\nTime is honest effort.',
      footer: 'Take a break.',
    },
    {
      heading: 'You focused.',
      body: 'Even if it felt scattered.\nYou stayed.',
      footer: null,
    },
  ],
  habit_done: [
    {
      heading: 'Checked.',
      body: 'Not perfect. Just checked.\nThat builds more than perfection.',
      footer: null,
    },
    {
      heading: 'You showed up.',
      body: 'Consistency isn\'t about doing it well.\nIt\'s about doing it at all.',
      footer: null,
    },
  ],
};

// Messages for partial completion - explaining why partial is enough
const PARTIAL_MESSAGES = [
  {
    heading: 'You didn\'t finish everything.',
    body: 'And that\'s normal.\nComplete isn\'t the goal. Movement is.',
    footer: 'This was enough.',
  },
  {
    heading: 'Part of the task.',
    body: 'Part is not failure.\nPart is progress with honesty.',
    footer: null,
  },
  {
    heading: 'Incomplete is okay.',
    body: 'Your brain wanted to stop.\nYou respected that. Good.',
    footer: null,
  },
];

function getRandomMessage(
  trigger: CalmReviewProps['trigger'],
  isPartial?: boolean
): { heading: string; body: string; footer: string | null } {
  const messages = isPartial ? PARTIAL_MESSAGES : REVIEW_MESSAGES[trigger];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function CalmReview({ trigger, context, onComplete }: CalmReviewProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<ReturnType<typeof getRandomMessage> | null>(null);

  useEffect(() => {
    setMounted(true);
    setMessage(getRandomMessage(trigger, context?.isPartial));

    // Fade in
    const fadeInTimer = setTimeout(() => setVisible(true), 50);

    // Auto-dismiss after reading time (longer than rewards - this needs to be read)
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 6000);

    return () => {
      clearTimeout(fadeInTimer);
      clearTimeout(dismissTimer);
    };
  }, [trigger, context?.isPartial]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      onComplete?.();
    }, 300);
  }, [onComplete]);

  if (!mounted || !message) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        "bg-background/95 backdrop-blur-sm",
        "transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
      onClick={handleDismiss}
    >
      {/* The review content - lots of whitespace, calm */}
      <div className="max-w-md mx-auto px-8 py-12 text-center">
        {/* Subtle accent - just a small dot or line */}
        <div className="mb-8 flex justify-center">
          <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Heading - calm, not celebratory */}
        <h2 className="text-xl font-medium text-foreground mb-6">
          {message.heading}
        </h2>

        {/* Body - the meaning, the explanation */}
        <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-line mb-6">
          {message.body}
        </p>

        {/* Footer - optional closing thought */}
        {message.footer && (
          <p className="text-sm text-muted-foreground/70">
            {message.footer}
          </p>
        )}

        {/* Subtle hint to dismiss */}
        <p className="mt-12 text-xs text-muted-foreground/40">
          tap anywhere
        </p>
      </div>
    </div>,
    document.body
  );
}

/**
 * Hook to show Calm Review at appropriate moments
 */
export function useCalmReview() {
  const [review, setReview] = useState<CalmReviewProps | null>(null);

  const showReview = useCallback((
    trigger: CalmReviewProps['trigger'],
    context?: CalmReviewProps['context']
  ) => {
    setReview({ trigger, context });
  }, []);

  const dismissReview = useCallback(() => {
    setReview(null);
  }, []);

  return {
    review,
    showReview,
    dismissReview,
    CalmReviewPortal: review ? (
      <CalmReview
        trigger={review.trigger}
        context={review.context}
        onComplete={dismissReview}
      />
    ) : null,
  };
}
