import { useState, useCallback } from 'react';
import { DesignElement } from '../types/design';

interface HistoryState {
  elements: DesignElement[];
  timestamp: number;
}

export const useDesignHistory = (initialElements: DesignElement[] = []) => {
  const [history, setHistory] = useState<HistoryState[]>([
    { elements: initialElements, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addToHistory = useCallback((elements: DesignElement[]) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push({ elements: [...elements], timestamp: Date.now() });
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
    
    setHistory(newHistory);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1].elements;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1].elements;
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    currentElements: history[currentIndex]?.elements || [],
  };
};