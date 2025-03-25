
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { FileUpload } from "../components/integrations/FileUpload";
import { StripeConnect } from "../components/integrations/StripeConnect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from '../contexts/AuthContext';
import { isReadOnlyUser } from '../utils/stripe/subscription';
import { Loader2 } from 'lucide-react';

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);

  React.useEffect(() => {
    if (user) {
      isReadOnlyUser(user.id).then(readOnly => {
        setIsReadOnly(readOnly);
        setIsLoading(false);
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Data Integrations
        </h1>
        <p className="text-gray-600">
          Connect your subscription data sources to analyze and prevent customer churn.
        </p>
      </div>

      {isReadOnly && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTitle className="text-amber-800">Upgrade your plan to unlock all integrations</AlertTitle>
          <AlertDescription className="text-amber-700">
            You're currently on a limited plan. Upgrade to access all data integration features and prevent churn more effectively.
          </AlertDescription>
          <Button className="mt-2" variant="outline" onClick={() => window.location.href = '/checkout'}>
            Upgrade Now
          </Button>
        </Alert>
      )}

      <Tabs defaultValue="automatic" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="automatic">Automatic Integration</TabsTrigger>
          <TabsTrigger value="manual">Manual Import</TabsTrigger>
        </TabsList>
        
        <TabsContent value="automatic">
          <div className="grid gap-6 md:grid-cols-2">
            <StripeConnect isDisabled={isReadOnly} />
            
            <Card className={`${isReadOnly ? "opacity-50" : ""}`}>
              <CardHeader>
                <CardTitle>Other Payment Providers</CardTitle>
                <CardDescription>
                  Coming soon - connect with PayPal, Braintree, Chargebee and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button disabled variant="outline" className="w-full">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="manual">
          <FileUpload isDisabled={isReadOnly} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
