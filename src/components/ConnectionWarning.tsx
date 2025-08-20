import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ConnectionWarningProps {
  show: boolean;
  onDismiss: () => void;
}

const ConnectionWarning = ({ show, onDismiss }: ConnectionWarningProps) => {
  if (!show) return null;

  return (
    <Alert className="mb-4 border-destructive bg-destructive/10">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Connection Blocked</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>The multiplayer connection is being blocked by your ad blocker or privacy filter.</p>
        <div className="text-sm">
          <strong>To fix this:</strong>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>Disable ad blocker (uBlock Origin, AdGuard, Brave Shields) for this site</li>
            <li>Or allowlist: <code className="bg-muted px-1 rounded">joinplayroom.com</code> and <code className="bg-muted px-1 rounded">ws.joinplayroom.com</code></li>
            <li>Or try incognito mode or a different browser</li>
          </ul>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs underline hover:no-underline"
        >
          Dismiss
        </button>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionWarning;