import { useState, useEffect } from 'react';

export type ViewType = 'list' | 'board' | 'calendar';

export interface DataViewConfig {
  viewType: ViewType;
  visibleColumns: Record<string, boolean>;
  grouping: { field: string; direction: 'asc' | 'desc' } | null;
}

interface UseDataViewConfigProps {
  key: string; // Storage key (e.g., 'tasks-view')
  defaultView?: ViewType;
  defaultVisibleColumns?: Record<string, boolean>;
}

export function useDataViewConfig({ 
  key, 
  defaultView = 'list',
  defaultVisibleColumns = {} 
}: UseDataViewConfigProps) {
  
  // Initialize state from localStorage or defaults
  const [config, setConfig] = useState<DataViewConfig>(() => {
    if (typeof window === 'undefined') {
      return {
        viewType: defaultView,
        visibleColumns: defaultVisibleColumns,
        grouping: null
      };
    }

    try {
      const stored = localStorage.getItem(`view-config-${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist
        return {
          viewType: parsed.viewType || defaultView,
          visibleColumns: { ...defaultVisibleColumns, ...parsed.visibleColumns },
          grouping: parsed.grouping || null
        };
      }
    } catch (e) {
      console.error('Failed to parse view config', e);
    }

    return {
      viewType: defaultView,
      visibleColumns: defaultVisibleColumns,
      grouping: null,
      timelineScale: 'Month'
    };
  });

  // Persist to localStorage whenever config changes
  useEffect(() => {
    localStorage.setItem(`view-config-${key}`, JSON.stringify(config));
  }, [config, key]);

  const setViewType = (viewType: ViewType) => {
    setConfig(prev => ({ ...prev, viewType }));
  };

  const setVisibleColumns = (visibleColumns: Record<string, boolean>) => {
    setConfig(prev => ({ ...prev, visibleColumns }));
  };

  const toggleColumnVisibility = (columnId: string, isVisible: boolean) => {
    setConfig(prev => ({
      ...prev,
      visibleColumns: {
        ...prev.visibleColumns,
        [columnId]: isVisible
      }
    }));
  };

  const setGrouping = (grouping: DataViewConfig['grouping']) => {
    setConfig(prev => ({ ...prev, grouping }));
  };

  const setTimelineScale = (scale: 'Day' | 'Week' | 'Month') => {
    setConfig(prev => ({ ...prev, timelineScale: scale }));
  };

  return {
    config,
    setViewType,
    setVisibleColumns,
    toggleColumnVisibility,
    setGrouping,
    setTimelineScale
  };
}
