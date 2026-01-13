import { AuthForm } from '../components/AuthForm';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50">
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="text-2xl font-bold">Ninjawy</span>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
