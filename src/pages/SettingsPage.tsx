import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateOnboardingStepStatus } from '../utils/integrations/stripe';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    business_name: '',
    business_description: '',
    email_notifications: true,
    marketing_emails: true
  });
  
  // Load user data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        business_name: profile.business_name || '',
        business_description: profile.business_description || '',
        email_notifications: profile.email_notifications !== false, // default to true
        marketing_emails: profile.marketing_emails !== false // default to true
      });
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [profile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleProfileSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Update user metadata
      const { error } = await supabase
        .from('user_metadata')
        .update({
          full_name: formData.full_name,
          business_name: formData.business_name,
          business_description: formData.business_description,
          email_notifications: formData.email_notifications,
          marketing_emails: formData.marketing_emails,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Refresh profile data
      await refreshProfile();
      
      // Mark profile step as complete
      await updateOnboardingStepStatus(user.id, 'profile', true);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "success",
      });
      
      // Navigate back to dashboard with completion info
      navigate('/dashboard', { state: { from: '/settings' } });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Settings
      </h1>
      <p className="text-gray-600 mb-6">
        Manage your account settings and preferences
      </p>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal and business information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Your Name</Label>
                    <Input 
                      id="full_name" 
                      name="full_name" 
                      placeholder="Enter your full name" 
                      value={formData.full_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input 
                      id="business_name" 
                      name="business_name" 
                      placeholder="Enter your business name" 
                      value={formData.business_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="business_description">Business Description</Label>
                    <Textarea 
                      id="business_description" 
                      name="business_description" 
                      placeholder="Briefly describe your business" 
                      rows={4}
                      value={formData.business_description}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleProfileSave} 
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Profile'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notifications about your account and customers</p>
                    </div>
                    <Switch 
                      checked={formData.email_notifications}
                      onCheckedChange={(checked) => handleSwitchChange('email_notifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Marketing Emails</h3>
                      <p className="text-sm text-gray-500">Receive updates about new features and offers</p>
                    </div>
                    <Switch 
                      checked={formData.marketing_emails}
                      onCheckedChange={(checked) => handleSwitchChange('marketing_emails', checked)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleProfileSave} 
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Current Plan</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-bold">{profile?.subscription_plan ? profile.subscription_plan.charAt(0).toUpperCase() + profile.subscription_plan.slice(1) : 'Free'}</p>
                      <p className="text-sm text-gray-500">
                        {profile?.account_type === 'trial' ? 'Trial Period' : 
                         profile?.account_type === 'paid' ? 'Paid Subscription' : 'Free Account'}
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/checkout')}>
                      {profile?.account_type === 'paid' ? 'Manage Subscription' : 'Upgrade'}
                    </Button>
                  </div>
                </div>
                
                {profile?.trial_ends_at && (
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <h3 className="font-medium text-amber-800 mb-1">Trial Period</h3>
                    <p className="text-amber-700 mb-2">
                      Your trial ends on {new Date(profile.trial_ends_at).toLocaleDateString()}
                    </p>
                    <Button size="sm" onClick={() => navigate('/checkout')}>
                      Subscribe Now
                    </Button>
                  </div>
                )}
                
                {profile?.account_type === 'paid' && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Payment Method</h3>
                    <p className="text-sm text-gray-500">
                      Managed through Stripe. Click below to update your payment details.
                    </p>
                    <Button variant="outline" size="sm">
                      Manage Payment Methods
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
