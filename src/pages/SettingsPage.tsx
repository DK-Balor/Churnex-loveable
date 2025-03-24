
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { 
  getCurrentSubscription, 
  updatePaymentMethod,
  cancelSubscription 
} from '../utils/stripe';
import { 
  BadgeCheck, 
  User, 
  Building, 
  CreditCard,
  Bell,
  Mail,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    notifications: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        businessName: profile.business_name || '',
        email: user?.email || '',
        notifications: true
      });
    }
  }, [profile, user]);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        try {
          setIsLoading(true);
          const subscriptionData = await getCurrentSubscription(user.id);
          setSubscription(subscriptionData);
        } catch (error) {
          console.error('Error fetching subscription:', error);
          toast({
            title: "Error",
            description: "Failed to load subscription information. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSubscription();
  }, [user, toast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await updateProfile({
        full_name: formData.fullName,
        business_name: formData.businessName
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!user) return;
    
    try {
      setIsUpdating(true);
      await updatePaymentMethod(user.id);
      // This will redirect to Stripe, so no need for a success toast
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive",
      });
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    
    if (!window.confirm("Are you sure you want to cancel your subscription? This will take effect at the end of your current billing period.")) {
      return;
    }
    
    try {
      setIsUpdating(true);
      const result = await cancelSubscription(user.id);
      
      if (result.success) {
        toast({
          title: "Subscription Canceled",
          description: result.message,
        });
        
        // Update the local subscription state
        setSubscription(prev => ({
          ...prev,
          isCanceled: true
        }));
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel subscription. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPlanName = (plan) => {
    if (!plan) return 'No Plan';
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  const getStatusBadge = () => {
    if (!subscription) return null;
    
    if (subscription.status === 'active') {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Active</span>;
    } else if (subscription.isTrialing) {
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Trial</span>;
    } else if (subscription.isCanceled) {
      return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">Canceled</span>;
    } else {
      return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Inactive</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Account Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-brand-green h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <ul className="space-y-1">
                <li>
                  <a href="#profile" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 font-medium">
                    <User className="h-4 w-4 mr-3 text-gray-500" />
                    Profile
                  </a>
                </li>
                <li>
                  <a href="#subscription" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 font-medium">
                    <BadgeCheck className="h-4 w-4 mr-3 text-gray-500" />
                    Subscription
                  </a>
                </li>
                <li>
                  <a href="#billing" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 font-medium">
                    <CreditCard className="h-4 w-4 mr-3 text-gray-500" />
                    Billing
                  </a>
                </li>
                <li>
                  <a href="#notifications" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100 font-medium">
                    <Bell className="h-4 w-4 mr-3 text-gray-500" />
                    Notifications
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Profile Section */}
          <div id="profile" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Profile Information</h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <div className="flex">
                      <div className="w-8 flex items-center justify-center mr-2">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <div className="flex">
                      <div className="w-8 flex items-center justify-center mr-2">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your company name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="flex">
                      <div className="w-8 flex items-center justify-center mr-2">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Contact support to change your email address</p>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className={`px-4 py-2 rounded-md text-white font-medium ${
                        isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-green hover:bg-brand-green-600'
                      }`}
                    >
                      {isUpdating ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {/* Subscription Section */}
          <div id="subscription" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Subscription Plan</h2>
                {getStatusBadge()}
              </div>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin h-6 w-6 border-4 border-brand-green border-t-transparent rounded-full"></div>
                </div>
              ) : subscription?.status === 'active' || subscription?.isTrialing ? (
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Current Plan</span>
                    <span className="font-medium">{formatPlanName(subscription.plan)}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium">
                      {subscription.isTrialing ? 'Trial' : 
                       subscription.isCanceled ? 'Canceled (Expires soon)' : 'Active'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-gray-600">
                      {subscription.isTrialing ? 'Trial Ends' : 'Renews On'}
                    </span>
                    <span className="font-medium">
                      {getFormattedDate(subscription.currentPeriodEnd)}
                    </span>
                  </div>
                  
                  <div className="pt-2 flex flex-col space-y-3">
                    {subscription.isCanceled ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium text-amber-800 mb-1">Subscription Canceled</h3>
                            <p className="text-amber-700 text-sm">
                              Your subscription has been canceled and will end on {getFormattedDate(subscription.currentPeriodEnd)}.
                              You can reactivate your subscription before this date to continue using our services.
                            </p>
                            <a 
                              href="/checkout" 
                              className="text-sm text-amber-800 font-medium hover:text-amber-900 mt-2 inline-flex items-center"
                            >
                              Reactivate Subscription
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleUpdatePayment}
                          disabled={isUpdating}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                        >
                          Update Payment Method
                        </button>
                        
                        <button
                          onClick={handleCancelSubscription}
                          disabled={isUpdating}
                          className="px-4 py-2 border border-red-300 rounded-md text-red-600 hover:bg-red-50 font-medium"
                        >
                          Cancel Subscription
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">You don't have an active subscription.</p>
                  <a 
                    href="/checkout" 
                    className="block w-full text-center px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green-600 font-medium"
                  >
                    Choose a Plan
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Billing Section */}
          <div id="billing" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Billing & Invoices</h2>
            </div>
            
            <div className="p-6">
              <button
                onClick={handleUpdatePayment}
                disabled={isUpdating}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium mb-4"
              >
                Manage Billing
              </button>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Invoices</h3>
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin h-6 w-6 border-4 border-brand-green border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 text-xs font-medium text-gray-700 uppercase tracking-wider">
                      <div className="grid grid-cols-4">
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Status</div>
                        <div className="text-right">Invoice</div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {subscription?.status === 'active' ? (
                        <div className="px-4 py-3 text-sm">
                          <div className="grid grid-cols-4">
                            <div>{getFormattedDate(subscription.currentPeriodEnd)}</div>
                            <div>$119.00</div>
                            <div>
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                                Paid
                              </span>
                            </div>
                            <div className="text-right">
                              <a href="#" className="text-blue-600 hover:text-blue-800">Download</a>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-sm text-center text-gray-500">
                          No invoices found
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Notifications Section */}
          <div id="notifications" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Notification Preferences</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive emails about account activity and billing</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="notifications"
                      checked={formData.notifications}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <button
                  className="px-4 py-2 bg-brand-green text-white rounded-md hover:bg-brand-green-600 font-medium"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
