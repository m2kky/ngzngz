import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, Sparkles, ArrowRight, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useWorkspace } from '@/hooks/useWorkspace';
import { toast } from 'sonner';

type OnboardingMode = 'choice' | 'create' | 'join';
type CreateStep = 'workspace' | 'client' | 'project' | 'task' | 'complete';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export function OnboardingPage() {
  const [mode, setMode] = useState<OnboardingMode>('choice');
  const [createStep, setCreateStep] = useState<CreateStep>('workspace');
  const [workspaceId, setWorkspaceId] = useState<string>('');
  
  // Form states
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceVisibility, setWorkspaceVisibility] = useState<'private' | 'public'>('private');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  
  // Join states
  const [joinWorkspaceId, setJoinWorkspaceId] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  
  const {
    loading,
    createWorkspace,
    createClient,
    createProject,
    createTask,
    joinWorkspace,
    getWorkspaceById,
  } = useOnboarding();
  
  const navigate = useNavigate();

  // Temporary IDs for created entities
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }

    const { workspace, error } = await createWorkspace({
      name: workspaceName,
      visibility: workspaceVisibility,
    });

    if (error || !workspace) {
      toast.error(error || 'Failed to create workspace');
      return;
    }

    setWorkspaceId(workspace.id);
    toast.success('Workspace created!');
    setCreateStep('client');
  };

  const handleCreateClient = async () => {
    if (!clientName.trim()) {
      // Skip to next step
      setCreateStep('project');
      return;
    }

    const { client, error } = await createClient(workspaceId, {
      name: clientName,
      email: clientEmail || undefined,
    });

    if (error) {
      toast.error(error);
      return;
    }

    if (client) {
      setClientId(client.id);
      toast.success('Client created!');
    }
    setCreateStep('project');
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      // Skip to next step
      setCreateStep('task');
      return;
    }

    const { project, error } = await createProject(workspaceId, {
      name: projectName,
      client_id: clientId || undefined,
    });

    if (error) {
      toast.error(error);
      return;
    }

    if (project) {
      setProjectId(project.id);
      toast.success('Project created!');
    }
    setCreateStep('task');
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      // Skip to complete
      setCreateStep('complete');
      return;
    }

    const { task, error } = await createTask(workspaceId, {
      title: taskTitle,
      project_id: projectId || undefined,
    });

    if (error) {
      toast.error(error);
      return;
    }

    if (task) {
      toast.success('Task created!');
    }
    setCreateStep('complete');
  };

  // const { refreshWorkspace } = useWorkspace();

  const handleComplete = async () => {
    toast.success('Welcome to Ninjawy! 🥷');
    // Force a hard reload to ensure global state (like ProtectedRoute) picks up the new workspace
    // This effectively solves the redirect loop without refactoring to a global Context provider yet.
    window.location.href = '/';
  };

  const handleJoinWorkspace = async () => {
    if (!joinWorkspaceId.trim()) {
      toast.error('Please enter a workspace ID');
      return;
    }

    // Check if workspace exists
    const { workspace, error: fetchError } = await getWorkspaceById(joinWorkspaceId);
    
    if (fetchError || !workspace) {
      toast.error('Workspace not found');
      return;
    }

    const { success, error, requiresApproval } = await joinWorkspace(
      joinWorkspaceId,
      inviteToken || undefined
    );

    if (!success) {
      toast.error(error || 'Failed to join workspace');
      return;
    }

    if (requiresApproval) {
      toast.info('Join request sent! Waiting for admin approval.');
      // Could redirect to a "pending approval" page or back to choice
      setMode('choice');
    } else {
      toast.success('Successfully joined workspace!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-6xl block mb-4">🥷</span>
          <h1 className="text-3xl font-bold text-foreground">Welcome to Ninjawy</h1>
          <p className="text-muted-foreground mt-2">Let's get you set up</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Choice Mode */}
          {mode === 'choice' && (
            <motion.div key="choice" {...fadeIn} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-40 flex flex-col items-center justify-center gap-4 hover:bg-primary/10 hover:border-primary transition-all"
                  onClick={() => setMode('create')}
                >
                  <Building2 className="h-12 w-12 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">Create Workspace</h3>
                    <p className="text-sm text-muted-foreground">Start from scratch</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-40 flex flex-col items-center justify-center gap-4 hover:bg-primary/10 hover:border-primary transition-all"
                  onClick={() => setMode('join')}
                >
                  <Users className="h-12 w-12 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg">Join Workspace</h3>
                    <p className="text-sm text-muted-foreground">Use an ID or invite link</p>
                  </div>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Create Mode - Wizard */}
          {mode === 'create' && (
            <motion.div key="create" {...fadeIn} className="bg-card border rounded-lg p-8">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-8">
                {(['workspace', 'client', 'project', 'task', 'complete'] as CreateStep[]).map((step, idx) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        createStep === step
                          ? 'bg-primary text-primary-foreground'
                          : idx < (['workspace', 'client', 'project', 'task', 'complete'] as CreateStep[]).indexOf(createStep)
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {idx < (['workspace', 'client', 'project', 'task', 'complete'] as CreateStep[]).indexOf(createStep) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    {idx < 4 && <div className="w-12 h-0.5 bg-muted" />}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {createStep === 'workspace' && (
                  <motion.div key="workspace-step" {...fadeIn} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">Create Your Workspace</h2>
                      <p className="text-muted-foreground">This is where your team will collaborate</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="workspace-name">Workspace Name</Label>
                        <Input
                          id="workspace-name"
                          placeholder="Acme Inc."
                          value={workspaceName}
                          onChange={(e) => setWorkspaceName(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Visibility</Label>
                        <RadioGroup
                          value={workspaceVisibility}
                          onValueChange={(value) => setWorkspaceVisibility(value as 'private' | 'public')}
                          className="mt-2 space-y-2"
                        >
                          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                            <RadioGroupItem value="private" id="private" />
                            <Label htmlFor="private" className="cursor-pointer flex-1">
                              <div className="font-medium">Private</div>
                              <div className="text-sm text-muted-foreground">
                                Requires approval to join (except with invite link)
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                            <RadioGroupItem value="public" id="public" />
                            <Label htmlFor="public" className="cursor-pointer flex-1">
                              <div className="font-medium">Public</div>
                              <div className="text-sm text-muted-foreground">
                                Anyone can join with workspace ID
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setMode('choice')} className="flex-1">
                        Back
                      </Button>
                      <Button onClick={handleCreateWorkspace} disabled={loading} className="flex-1">
                        {loading ? <Loader2 className="animate-spin" /> : (
                          <>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {createStep === 'client' && (
                  <motion.div key="client-step" {...fadeIn} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">Add Your First Client</h2>
                      <p className="text-muted-foreground">Optional - you can skip this step</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="client-name">Client Name</Label>
                        <Input
                          id="client-name"
                          placeholder="Client Name"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-email">Email (Optional)</Label>
                        <Input
                          id="client-email"
                          type="email"
                          placeholder="client@example.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setCreateStep('project')} className="flex-1">
                        Skip
                      </Button>
                      <Button onClick={handleCreateClient} disabled={loading} className="flex-1">
                        {loading ? <Loader2 className="animate-spin" /> : (
                          <>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {createStep === 'project' && (
                  <motion.div key="project-step" {...fadeIn} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">Create Your First Project</h2>
                      <p className="text-muted-foreground">Optional - you can skip this step</p>
                    </div>

                    <div>
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        placeholder="Website Redesign"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setCreateStep('task')} className="flex-1">
                        Skip
                      </Button>
                      <Button onClick={handleCreateProject} disabled={loading} className="flex-1">
                        {loading ? <Loader2 className="animate-spin" /> : (
                          <>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {createStep === 'task' && (
                  <motion.div key="task-step" {...fadeIn} className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">Add Your First Task</h2>
                      <p className="text-muted-foreground">Optional - you can skip this step</p>
                    </div>

                    <div>
                      <Label htmlFor="task-title">Task Title</Label>
                      <Input
                        id="task-title"
                        placeholder="Design homepage mockup"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setCreateStep('complete')} className="flex-1">
                        Skip
                      </Button>
                      <Button onClick={handleCreateTask} disabled={loading} className="flex-1">
                        {loading ? <Loader2 className="animate-spin" /> : (
                          <>
                            Complete <Check className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {createStep === 'complete' && (
                  <motion.div key="complete-step" {...fadeIn} className="space-y-6 text-center">
                    <Sparkles className="h-16 w-16 text-primary mx-auto" />
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">All Set!</h2>
                      <p className="text-muted-foreground">Your workspace is ready to go</p>
                    </div>

                    <Button onClick={handleComplete} className="w-full">
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Join Mode */}
          {mode === 'join' && (
            <motion.div key="join" {...fadeIn} className="bg-card border rounded-lg p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Join a Workspace</h2>
                <p className="text-muted-foreground">Enter workspace ID or invite token</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="join-workspace-id">Workspace ID</Label>
                  <Input
                    id="join-workspace-id"
                    placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
                    value={joinWorkspaceId}
                    onChange={(e) => setJoinWorkspaceId(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="invite-token">Invite Token (Optional)</Label>
                  <Input
                    id="invite-token"
                    placeholder="If you have an invite link"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For private workspaces, an invite token allows instant access
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setMode('choice')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleJoinWorkspace} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="animate-spin" /> : 'Join Workspace'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
