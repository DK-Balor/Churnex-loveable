
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AlertCircle, Check, ExternalLink } from 'lucide-react';
import { useToast } from "../ui/use-toast";
import { useAuth } from '../../contexts/AuthContext';
import { connectStripeAccount, getStripeConnectionStatus, disconnectStripeAccount } from '../../utils/integrations/stripe';

interface StripeConnectProps {
  isDisabled?: boolean;
}

export function StripeConnect({ isDisabled = false }: StripeConnectProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [lastSyncDate, setLastSyncDate] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      refreshConnectionStatus();
    }
  }, [user]);

  const refreshConnectionStatus = async () => {
    if (!user) return;
    
    try {
      const status = await getStripeConnectionStatus(user.id);
      setIsConnected(!!status?.connected);
      setAccountId(status?.account_id || null);
      setLastSyncDate(status?.last_sync_at || null);
    } catch (error) {
      console.error("Error checking Stripe connection:", error);
    }
  };

  const handleConnect = async () => {
    if (!user) return;
    
    setIsConnecting(true);
    try {
      const result = await connectStripeAccount(user.id);
      
      if (result.url) {
        // Redirect to Stripe OAuth flow
        window.location.href = result.url;
      } else {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Unable to start Stripe connection process."
        });
      }
    } catch (error) {
      console.error("Error connecting to Stripe:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to Stripe. Please try again."
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user || !accountId) return;
    
    if (confirm("Are you sure you want to disconnect your Stripe account? This will stop all data synchronization.")) {
      try {
        await disconnectStripeAccount(user.id, accountId);
        toast({
          title: "Stripe Disconnected",
          description: "Your Stripe account has been disconnected successfully."
        });
        setIsConnected(false);
        setAccountId(null);
        setLastSyncDate(null);
      } catch (error) {
        console.error("Error disconnecting Stripe:", error);
        toast({
          variant: "destructive",
          title: "Disconnect Error",
          description: "Could not disconnect your Stripe account. Please try again."
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Stripe</CardTitle>
            <CardDescription>
              Connect your Stripe account to automatically import subscription data.
            </CardDescription>
          </div>
          {isConnected && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Check className="h-3 w-3 mr-1" /> Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Connected to Stripe account: <span className="font-mono">{accountId}</span>
            </p>
            {lastSyncDate && (
              <p className="text-sm text-gray-500">
                Last synchronized: {new Date(lastSyncDate).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
            <p>
              Not connected. Connect your Stripe account to automatically import and analyze your subscription data.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isConnected ? (
          <>
            <Button variant="outline" onClick={refreshConnectionStatus} disabled={isDisabled}>
              Refresh Data
            </Button>
            <Button variant="ghost" onClick={handleDisconnect} disabled={isDisabled}>
              Disconnect
            </Button>
          </>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleConnect} 
            disabled={isDisabled || isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Stripe"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
