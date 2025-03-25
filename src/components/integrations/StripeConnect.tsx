
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CreditCard, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from "../ui/use-toast";
import { useAuth } from '../../contexts/AuthContext';
import { connectStripeAccount, disconnectStripeAccount, syncStripeData, getStripeConnectionStatus, updateOnboardingStepStatus } from '../../utils/integrations/stripe';

export interface StripeConnectProps {
  isDisabled?: boolean;
}

export function StripeConnect({ isDisabled = false }: StripeConnectProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkConnectionStatus(user.id);
    }
  }, [user]);
  
  const checkConnectionStatus = async (userId: string) => {
    try {
      const status = await getStripeConnectionStatus(userId);
      setIsConnected(status.connected);
      setAccountId(status.account_id);
      setLastSyncTime(status.last_sync_at);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking Stripe connection:', error);
      setIsLoading(false);
    }
  };
  
  const handleConnectStripe = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await connectStripeAccount(user.id);
    } catch (error) {
      console.error('Error connecting Stripe:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Stripe. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const handleDisconnectStripe = async () => {
    if (!user || !accountId) return;
    
    setIsLoading(true);
    try {
      await disconnectStripeAccount(user.id, accountId);
      
      // After successful disconnect, update the connection status
      setIsConnected(false);
      setAccountId(null);
      setLastSyncTime(null);
      
      toast({
        title: "Stripe Disconnected",
        description: "Your Stripe account has been disconnected.",
      });
    } catch (error) {
      console.error('Error disconnecting Stripe:', error);
      toast({
        title: "Disconnect Failed",
        description: "Could not disconnect your Stripe account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSyncData = async () => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      await syncStripeData(user.id);
      
      // Mark the connect_data step as completed after successful sync
      await updateOnboardingStepStatus(user.id, 'connect_data', true);
      
      // Update the last sync time display
      const status = await getStripeConnectionStatus(user.id);
      setLastSyncTime(status.last_sync_at);
      
      toast({
        title: "Data Synced",
        description: "Your Stripe data has been successfully synced.",
      });
      
      // Navigate back to dashboard after successful connection and sync
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error syncing Stripe data:', error);
      toast({
        title: "Sync Failed",
        description: "Could not sync your Stripe data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <Card className={isDisabled ? "opacity-50" : ""}>
      <CardHeader>
        <CardTitle>Stripe</CardTitle>
        <CardDescription>
          Connect your Stripe account to automatically import subscription data
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
          </div>
        ) : isConnected ? (
          <div>
            <div className="flex items-center mb-4 bg-green-50 p-3 rounded-md">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Stripe Connected</p>
                <p className="text-sm text-green-700">Account: {accountId}</p>
                {lastSyncTime && (
                  <p className="text-xs text-green-600 mt-1">
                    Last synced: {new Date(lastSyncTime).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleSyncData} 
                variant="outline" 
                className="flex-1"
                disabled={isSyncing || isDisabled}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Data'}
              </Button>
              
              <Button 
                onClick={handleDisconnectStripe} 
                variant="outline" 
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                disabled={isDisabled}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleConnectStripe} 
            className="w-full" 
            disabled={isDisabled}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Connect Stripe
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
