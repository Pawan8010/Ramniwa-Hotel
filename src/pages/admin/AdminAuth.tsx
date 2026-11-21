import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { InputField } from '../../components/ui/FormField';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

const ADMIN_SESSION_KEY = 'ramniwas_admin_auth_v1';
const DEMO_USER = 'admin@ramniwas.in';
const DEMO_PASS = 'Ramniwas@1975';

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function AdminLoginPage({ onSuccess }: { onSuccess: () => void }) {
  useDocumentMeta('Staff Admin Login · Hotel Ramniwas', 'Authorized hotel management portal.');

  const [email, setEmail] = useState(DEMO_USER);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === DEMO_USER && password === DEMO_PASS) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
      setError(undefined);
      onSuccess();
    } else {
      setError('Invalid staff email or password. Use demo credentials shown below.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-base paper-grain flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border-subtle shadow-modal space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-surface-base border border-border-subtle flex items-center justify-center">
            <Lock className="w-5 h-5 text-action-primary" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Hotel Ramniwas · Staff Portal
          </h1>
          <p className="text-sm text-text-secondary">
            Sign in to manage bookings, 32-room inventory, housekeeping, and site media.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <InputField
            label="Staff Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            placeholder="Enter staff password"
          />

          <div className="p-3 rounded-lg bg-surface-base border border-border-subtle text-xs text-text-secondary space-y-0.5">
            <p className="font-semibold text-text-primary">Demo Front-Desk Credentials</p>
            <p>Email: <span className="font-mono">admin@ramniwas.in</span></p>
            <p>Password: <span className="font-mono">Ramniwas@1975</span></p>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Sign In to Admin Dashboard
          </Button>
        </form>

        <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
          <Link to="/" className="hover:text-action-primary underline">
            Return to Public Website
          </Link>
          <button
            type="button"
            onClick={() => setPassword(DEMO_PASS)}
            className="text-action-primary hover:underline font-medium cursor-pointer"
          >
            Auto-fill Demo Password
          </button>
        </div>
      </div>
    </div>
  );
}
