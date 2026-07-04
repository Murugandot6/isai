"use client";

import DOMPurify from 'dompurify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileProps {
  inviteCode: string;
  user: any;
}

export const Profile = ({ inviteCode, user }: ProfileProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-zinc-500 font-medium">
              {DOMPurify.sanitize(user?.email || 'No email')}
            </p>
          </div>
          <div>
            <p className="text-sm text-zinc-500 font-medium">
              Invite Code: <span className="font-mono bg-accent/5 px-2 py-1 rounded">{DOMPurify.sanitize(inviteCode)}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};