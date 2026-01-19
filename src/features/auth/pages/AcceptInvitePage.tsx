import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getErrorMessage } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

type VerifyInviteTokenRow = {
  workspace_id: string;
  workspace_name: string;
  email: string | null;
  role_id: string | null;
  expires_at: string | null;
  used_at: string | null;
};

export function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [status, setStatus] = useState<'verifying' | 'valid' | 'invalid' | 'accepting' | 'success' | 'error'>('verifying');
  const [inviteDetails, setInviteDetails] = useState<{ workspace_name: string; email: string | null } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setStatus('invalid');
        setErrorMessage('No invitation token provided.');
        return;
      }

      try {
        const { data, error } = await supabase.rpc('verify_invite_token', { lookup_token: token } as { lookup_token: string });
        const rows = data as unknown as VerifyInviteTokenRow[] | null;

        if (error || !rows || rows.length === 0) {
          throw new Error('Invitation not found or expired.');
        }

        const invite = rows[0];

        setInviteDetails({
          workspace_name: invite.workspace_name || 'Unknown Workspace',
          email: invite.email ?? null,
        });
        setStatus('valid');

      } catch (err: unknown) {
        console.error(err);
        setStatus('invalid');
        setErrorMessage(err instanceof Error ? err.message : 'Invitation not found or expired.');
      }
    }

    verifyToken();
  }, [token]);

  const handleAccept = async () => {
    if (!user || !token) return;
    setStatus('accepting');

    try {
        // Call secure RPC function
        const { error: rpcError } = await supabase.rpc('accept_invitation', {
            lookup_token: token
        } as { lookup_token: string });

        if (rpcError) throw rpcError;

        setStatus('success');
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.href = '/'; // Hard reload to pick up new context
        }, 2000);

    } catch (err: unknown) {
        console.error(err);
        setStatus('error');
        setErrorMessage(getErrorMessage(err) || 'Failed to accept invitation.');
    }
  };

  if (authLoading || status === 'verifying') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] text-white">
        <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0c] p-4">
      <Card className="w-full max-w-md bg-[#191919] border-[#2c2c2c] text-white">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {status === 'invalid' && 'Invalid Invitation'}
            {status === 'error' && 'Something went wrong'}
            {status === 'success' && 'Welcome Aboard!'}
            {(status === 'valid' || status === 'accepting') && 'Join Workspace'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'invalid' && errorMessage}
            {status === 'error' && errorMessage}
            {status === 'success' && `You have successfully joined ${inviteDetails?.workspace_name}. Redirecting...`}
            {(status === 'valid' || status === 'accepting') && (
                <>
                    You have been invited to join <span className="text-primary font-semibold">{inviteDetails?.workspace_name}</span>.
                </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
            
            {status === 'invalid' && (
                <XCircle className="w-16 h-16 text-destructive opacity-80" />
            )}

            {status === 'success' && (
                <CheckCircle className="w-16 h-16 text-green-500 opacity-80" />
            )}

            {(status === 'valid' || status === 'accepting') && (
                <>
                    {inviteDetails?.email ? (
                        <div className="text-sm text-muted-foreground bg-[#2c2c2c] px-4 py-2 rounded-md border border-[#3c3c3c]">
                            Invitation for: <span className="text-white font-medium">{inviteDetails.email}</span>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground bg-[#2c2c2c] px-4 py-2 rounded-md border border-[#3c3c3c]">
                            <span className="text-white font-medium">Public Invite Link</span>
                        </div>
                    )}

                    {!user ? (
                        <div className="w-full space-y-3">
                            <p className="text-sm text-center text-muted-foreground">
                                Please sign in or create an account to accept this invitation.
                            </p>
                            <Button className="w-full" onClick={() => navigate(`/login?redirectTo=/invite/${token}`)}>
                                Sign In
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => navigate(`/signup?redirectTo=/invite/${token}`)}>
                                Create Account
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full">
                            {inviteDetails?.email && user.email !== inviteDetails?.email && (
                                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md text-xs text-yellow-500 text-center">
                                    Warning: You are logged in as {user.email}, but this invite was sent to {inviteDetails?.email}. 
                                    You can still accept it to add {user.email} to the workspace.
                                </div>
                            )}
                            <Button className="w-full" size="lg" onClick={handleAccept} disabled={status === 'accepting'}>
                                {status === 'accepting' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Accept Invitation & Join
                            </Button>
                        </div>
                    )}
                </>
            )}

            {(status === 'invalid' || status === 'error') && (
                 <Button variant="link" onClick={() => navigate('/')}>
                    Return to Home <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
