import { useRef, useEffect } from 'react';

interface SwipeGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

/**
 * Custom hook for detecting horizontal swipe gestures on touch devices.
 * Distinguishes between horizontal swipes and vertical scrolling.
 *
 * @param elementRef - Ref to the element to attach gesture detection to
 * @param config - Configuration with swipe callbacks and threshold
 */
export function useSwipeGesture(
  elementRef: React.RefObject<HTMLElement | null>,
  config: SwipeGestureConfig
) {
  const { onSwipeLeft, onSwipeRight, threshold = 50 } = config;

  const touchStartRef = useRef({ x: 0, y: 0, timestamp: 0 });
  const touchActiveRef = useRef(false);
  const isHorizontalRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };
      touchActiveRef.current = true;
      isHorizontalRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchActiveRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Determine if this is a horizontal or vertical movement
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      // If we've determined it's horizontal, prevent default scroll
      if (isHorizontal && Math.abs(deltaX) >= threshold) {
        e.preventDefault();
        isHorizontalRef.current = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchActiveRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const timeDelta = Date.now() - touchStartRef.current.timestamp;

      // Ignore slow swipes (likely scrolling)
      if (timeDelta > 500) {
        touchActiveRef.current = false;
        return;
      }

      // Check if movement is primarily horizontal
      const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);

      if (!isHorizontal) {
        touchActiveRef.current = false;
        return;
      }

      // Check if movement exceeds threshold
      if (Math.abs(deltaX) >= threshold) {
        if (deltaX < 0) {
          // Swiped left → next card
          onSwipeLeft?.();
        } else {
          // Swiped right → previous card
          onSwipeRight?.();
        }
      }

      touchActiveRef.current = false;
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, onSwipeLeft, onSwipeRight, threshold]);
}
