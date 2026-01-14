import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkspaceSwitcher } from '../WorkspaceSwitcher';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('@/hooks/useWorkspace');
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('WorkspaceSwitcher', () => {
  const mockSwitchWorkspace = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
  });

  it('should not render if no workspace is selected', () => {
    (useWorkspace as any).mockReturnValue({
      workspace: null,
      workspaces: [],
      switchWorkspace: mockSwitchWorkspace,
    });

    const { container } = render(<WorkspaceSwitcher />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render active workspace name', () => {
    const mockWorkspace = { id: 'ws-1', name: 'My Workspace', slug: 'my-ws' };
    (useWorkspace as any).mockReturnValue({
      workspace: mockWorkspace,
      workspaces: [mockWorkspace],
      switchWorkspace: mockSwitchWorkspace,
    });

    render(<WorkspaceSwitcher />);
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
  });

  it('should show all workspaces in dropdown', async () => {
    const user = userEvent.setup();
    const workspaces = [
      { id: 'ws-1', name: 'Workspace 1', slug: 'ws-1' },
      { id: 'ws-2', name: 'Workspace 2', slug: 'ws-2' },
    ];
    (useWorkspace as any).mockReturnValue({
      workspace: workspaces[0],
      workspaces,
      switchWorkspace: mockSwitchWorkspace,
    });

    render(<WorkspaceSwitcher />);
    
    // Open dropdown
    const trigger = screen.getByText('Workspace 1');
    await user.click(trigger);

    expect(await screen.findByText('Workspace 2')).toBeInTheDocument();
  });

  it('should call switchWorkspace when an item is clicked', async () => {
    const user = userEvent.setup();
    const workspaces = [
      { id: 'ws-1', name: 'Workspace 1', slug: 'ws-1' },
      { id: 'ws-2', name: 'Workspace 2', slug: 'ws-2' },
    ];
    (useWorkspace as any).mockReturnValue({
      workspace: workspaces[0],
      workspaces,
      switchWorkspace: mockSwitchWorkspace,
    });

    render(<WorkspaceSwitcher />);
    
    // Open dropdown
    await user.click(screen.getByText('Workspace 1'));
    
    // Click other workspace
    const item = await screen.findByText('Workspace 2');
    await user.click(item);

    expect(mockSwitchWorkspace).toHaveBeenCalledWith('ws-2');
  });

  it('should navigate to onboarding when Create Workspace is clicked', async () => {
    const user = userEvent.setup();
    const workspaces = [{ id: 'ws-1', name: 'Workspace 1', slug: 'ws-1' }];
    (useWorkspace as any).mockReturnValue({
      workspace: workspaces[0],
      workspaces,
      switchWorkspace: mockSwitchWorkspace,
    });

    render(<WorkspaceSwitcher />);
    
    // Open dropdown
    await user.click(screen.getByText('Workspace 1'));
    
    // Click Create Workspace
    const createItem = await screen.findByText('Create Workspace');
    await user.click(createItem);

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });
});
