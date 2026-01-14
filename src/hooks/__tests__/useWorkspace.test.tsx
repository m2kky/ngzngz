import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWorkspace } from '../useWorkspace';
import { WorkspaceProvider } from '@/context/WorkspaceContext';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Use vi.hoisted to ensure mocks are created before vi.mock calls
const mocks = vi.hoisted(() => {
  return {
    mockFrom: vi.fn(),
    mockSelect: vi.fn(),
    mockEq: vi.fn(),
    mockIn: vi.fn(),
    mockSingle: vi.fn(),
  };
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: mocks.mockFrom,
  },
}));

vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('useWorkspace', () => {
  const mockUser = { id: 'user-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup Supabase chain mocks
    mocks.mockFrom.mockReturnValue({
      select: mocks.mockSelect,
    });
    mocks.mockSelect.mockReturnValue({
      eq: mocks.mockEq,
      in: mocks.mockIn,
    });
    mocks.mockEq.mockReturnValue({
      eq: mocks.mockEq,
      single: mocks.mockSingle,
      in: mocks.mockIn,
      limit: vi.fn().mockReturnValue({}), 
    });
    mocks.mockIn.mockReturnValue({
      // Promise resolution for final chain
      then: vi.fn(), 
    });
  });

  it('should return loading initially', () => {
    (useAuth as any).mockReturnValue({ user: mockUser, loading: true });
    
    const { result } = renderHook(() => useWorkspace(), {
      wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>
    });
    
    expect(result.current.loading).toBe(true);
  });

  it('should fetch and return workspaces when auth is ready', async () => {
    (useAuth as any).mockReturnValue({ user: mockUser, loading: false });

    const mockMembers = [{ workspace_id: 'ws-1' }, { workspace_id: 'ws-2' }];
    const mockWorkspaces = [
      { id: 'ws-1', name: 'Workspace 1' },
      { id: 'ws-2', name: 'Workspace 2' }
    ];

    // Mock members fetch (first call)
    mocks.mockSelect.mockResolvedValueOnce({ data: mockMembers, error: null });
    
    // Mock the standard responses
    mocks.mockFrom.mockImplementation((table: string) => {
      if (table === 'workspace_members') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: mockMembers, error: null }), // fetch user members
              single: () => Promise.resolve({ data: mockMembers[0], error: null }) // fetch single member
            })
          })
        };
      }
      if (table === 'workspaces') {
        return {
          select: () => ({
            in: () => Promise.resolve({ data: mockWorkspaces, error: null }),
            eq: () => ({
               single: () => Promise.resolve({ data: mockWorkspaces[0], error: null })
            })
          })
        };
      }
      return { select: () => ({ eq: () => ({}) }) };
    });

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workspaces).toHaveLength(2);
    expect(result.current.workspace).toEqual(mockWorkspaces[0]);
  });

  it('should handle no workspaces', async () => {
    (useAuth as any).mockReturnValue({ user: mockUser, loading: false });

    mocks.mockFrom.mockImplementation((table: string) => {
        if (table === 'workspace_members') {
            return {
              select: () => ({
                eq: () => ({
                  eq: () => Promise.resolve({ data: [], error: null })
                })
              })
            };
        }
        return { select: () => ({}) };
    });

    const { result } = renderHook(() => useWorkspace(), {
       wrapper: ({ children }) => <WorkspaceProvider>{children}</WorkspaceProvider>
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.workspaces).toHaveLength(0);
    expect(result.current.workspace).toBeNull();
  });
});
