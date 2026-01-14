import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Mail, Loader2, ArrowRight, Sparkles, Lock, User, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');
const otpSchema = z.string().length(6, 'Code must be 6 digits'); // Supabase usually sends 6 digits

const springTransition = {
  type: "spring",
  stiffness: 260,
  damping: 40,
} as const;

const BrandingPanel = ({ isLogin }: { isLogin: boolean }) => (
  <motion.div 
    layout
    transition={springTransition}
    className="hidden lg:flex lg:w-1/2 bg-foreground p-12 flex-col justify-between relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_25%)]" />
    <div className="relative z-10">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🥷</span>
        <span className="text-2xl font-semibold text-background">Ninjawy</span>
      </div>
    </div>
    
    <div className="relative z-10 space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login-text' : 'signup-text'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <h1 className="text-4xl font-bold text-background leading-tight mb-2">
            {isLogin ? 'Welcome Back!' : 'Join the Squad'}
          </h1>
          <p className="text-lg text-background/70">
            {isLogin 
              ? 'Ready to manage your projects like a pro?' 
              : 'Start organizing your workflow in seconds.'}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
    
    <div className="relative z-10 flex items-center gap-3 text-background/60 text-sm">
      <Sparkles className="h-4 w-4" />
      <span>Trusted by elite teams</span>
    </div>
  </motion.div>
);

interface FormPanelProps {
  isLogin: boolean;
  setIsLogin: (val: boolean) => void;
  authMethod: 'password' | 'otp';
  setAuthMethod: (val: 'password' | 'otp') => void;
  step: 'form' | 'otp_verify';
  setStep: (val: 'form' | 'otp_verify') => void;
  loading: boolean;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  fullName: string;
  setFullName: (val: string) => void;
  otp: string;
  setOtp: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleVerifyOtp: (e: React.FormEvent) => void;
  handleForgotPassword: () => void;
  handleGoogleSignIn: () => void;
}

const FormPanel = ({
  isLogin,
  setIsLogin,
  authMethod,
  setAuthMethod,
  step,
  setStep,
  loading,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  otp,
  setOtp,
  handleSubmit,
  handleVerifyOtp,
  handleForgotPassword,
  handleGoogleSignIn
}: FormPanelProps) => (
  <motion.div 
    layout
    transition={springTransition}
    className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-background"
  >
    <div className="w-full max-w-sm">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <span className="text-5xl mb-4 block">🥷</span>
        <h1 className="text-2xl font-bold text-foreground">Ninjawy</h1>
      </div>

      {/* Form Header */}
      <div className="mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step + isLogin}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-foreground">
              {step === 'otp_verify' ? 'Check your inbox' : (isLogin ? 'Sign in' : 'Create Account')}
            </h2>
            <p className="text-muted-foreground mt-2">
              {step === 'otp_verify'
                ? `We sent a code to ${email}`
                : (isLogin ? 'Enter your details to access your account' : 'Enter your details to get started')}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="main-container"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Google Sign In */}
            <Button 
                variant="outline" 
                className="w-full h-11 bg-background hover:bg-muted font-medium"
                onClick={handleGoogleSignIn}
                disabled={loading}
            >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Sign in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sign Up: Full Name */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullname"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                      autoComplete="name"
                      name="fullname"
                    />
                  </div>
                </div>
              )}

              {/* Email (Always visible) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                    autoComplete="email"
                    name="email"
                  />
                </div>
              </div>

              {/* Password (Login: if method=password, SignUp: always) */}
              {( (!isLogin) || (isLogin && authMethod === 'password') ) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                      <button
                         type="button"
                         onClick={handleForgotPassword}
                         className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      name="password"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" disabled={loading} className="w-full h-11">
                 {loading ? <Loader2 className="animate-spin" /> : (
                   <span className="flex items-center gap-2">
                     {isLogin 
                       ? (authMethod === 'password' ? 'Sign In' : 'Send Login Code')
                       : 'Create Account'
                     }
                     <ArrowRight className="h-4 w-4" />
                   </span>
                 )}
              </Button>

              {/* Login Method Toggle */}
              {isLogin && (
                <div className="text-center pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setAuthMethod(authMethod === 'password' ? 'otp' : 'password')}
                  >
                    {authMethod === 'password' ? (
                       <>
                         <KeyRound className="mr-2 h-3 w-3" /> Sign in with Code (OTP)
                       </>
                    ) : (
                       <>
                         <Lock className="mr-2 h-3 w-3" /> Sign in with Password
                       </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </motion.div>
        ) : (
          <motion.form
            key="otp-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleVerifyOtp}
            className="space-y-6"
          >
            <div className="space-y-2 flex flex-col items-center">
              <Label htmlFor="otp" className="sr-only">One-Time Password</Label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="submit" disabled={loading || otp.length !== 6} className="w-full h-11">
              {loading ? <Loader2 className="animate-spin" /> : 'Verify & Go'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Back to login options
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Login/Signup Switcher */}
      <div className="mt-8 pt-6 border-t border-border text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
        </p>
        <Button
          variant="ghost"
          onClick={() => setIsLogin(!isLogin)}
          className="font-medium text-foreground hover:bg-muted"
        >
          {isLogin ? 'Create an account' : 'Sign in to your account'}
        </Button>
      </div>
    </div>
  </motion.div>
);

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'form' | 'otp_verify'>('form');
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, sendOtp, verifyOtp, resetPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Reset state on mode switch
  useEffect(() => {
    setStep('form');
    setAuthMethod('password'); // Default to password
    setOtp('');
    setPassword('');
  }, [isLogin]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Google sign in failed');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
// ... existing logic
    try {
      // Validation
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) throw new Error(emailResult.error.issues[0].message);

      if (isLogin) {
        if (authMethod === 'password') {
          const passResult = passwordSchema.safeParse(password);
          if (!passResult.success) throw new Error(passResult.error.issues[0].message);

          const { error } = await signIn(email, password);
          if (error) throw error;
          
          toast.success('Welcome back!');
          navigate('/'); // Redirect to dashboard explicitly
        } else {
          // OTP Login - Send Code
          const { error } = await sendOtp(email);
          if (error) throw error;
          
          setStep('otp_verify');
          toast.success('Code Sent! Check your email.');
        }
      } else {
        // Sign Up
        const nameResult = nameSchema.safeParse(fullName);
        if (!nameResult.success) throw new Error(nameResult.error.issues[0].message);
        
        const passResult = passwordSchema.safeParse(password);
        if (!passResult.success) throw new Error(passResult.error.issues[0].message);

        const { data, error } = await signUp(email, password, fullName);
        if (error) throw error;

        // If session is null, email confirmation is required.
        // User requested to enter OTP after signup.
        if (data && !data.session) {
           setStep('otp_verify');
           toast.info('Please verify your email via the code sent.');
        } else {
           // Auto-login success set immediately
           toast.success('Account Created! Welcome to Ninjawy.');
           navigate('/'); 
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = otpSchema.safeParse(otp);
      if (!result.success) throw new Error(result.error.issues[0].message);

      // Determine verification type: 'email' (login) or 'signup' (new account)
      const type = isLogin ? 'email' : 'signup';
      const { error } = await verifyOtp(email, otp, type);
      if (error) throw error;

      toast.success(isLogin ? 'Logged in successfully!' : 'Email verified!');
      navigate('/');
    } catch (error) {
      // Handle Token logic
      let message = error instanceof Error ? error.message : 'Invalid code';
      if (message.includes('Token has expired') || message.includes('Signups not allowed')) {
         message = "Invalid or expired code.";
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      toast.success('Check your inbox for password reset instructions.');
    } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <motion.div 
        layout
        transition={springTransition}
        className="hidden lg:flex w-full min-h-screen"
        style={{ flexDirection: isLogin ? 'row' : 'row-reverse' }}
      >
        <BrandingPanel isLogin={isLogin} />
        <FormPanel
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          authMethod={authMethod}
          setAuthMethod={setAuthMethod}
          step={step}
          setStep={setStep}
          loading={loading}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          fullName={fullName}
          setFullName={setFullName}
          otp={otp}
          setOtp={setOtp}
          handleSubmit={handleSubmit}
          handleVerifyOtp={handleVerifyOtp}
          handleForgotPassword={handleForgotPassword}
          handleGoogleSignIn={handleGoogleSignIn}
        />
      </motion.div>

      <div className="lg:hidden flex flex-col min-h-screen">
        <FormPanel
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          authMethod={authMethod}
          setAuthMethod={setAuthMethod}
          step={step}
          setStep={setStep}
          loading={loading}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          fullName={fullName}
          setFullName={setFullName}
          otp={otp}
          setOtp={setOtp}
          handleSubmit={handleSubmit}
          handleVerifyOtp={handleVerifyOtp}
          handleForgotPassword={handleForgotPassword}
          handleGoogleSignIn={handleGoogleSignIn}
        />
      </div>
    </div>
  );
};
