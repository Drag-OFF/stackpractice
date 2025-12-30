"use client";

import { Key, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Notification } from "@/components/ui/notification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldError } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { loginFormSchema } from "@/components/ui/login-form";
import { useRouter } from "next/navigation";
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

export default function ProfileContent({ user }: { user?: any }) {
  const router = useRouter();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // General inline notification state (uses Notification component)
  const [notification, setNotification] = useState<{
    show: boolean;
    type?: "success" | "error" | "warning" | "info";
    title?: string;
    message?: string;
  }>({ show: false });

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/profile', { method: 'DELETE' });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to delete account');
      }

      // Show inline success notification and delay redirect so user can see it
      setNotification({
        show: true,
        type: 'success',
        title: 'Account deleted',
        message: 'Your account was deleted and you have been signed out.',
      });

      setTimeout(() => {
        router.push('/');
      }, 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';

      // Show inline error notification
      setNotification({
        show: true,
        type: 'error',
        title: 'Deletion failed',
        message,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to logout');
      toast.success('Logged out', { position: 'bottom-right' });
      router.push('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      toast.error(message, { position: 'bottom-right' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Save personal information (username, name, email, phone)
  const handleSavePersonal = async (data?: any) => {
    const values = data ?? form.getValues();
    setIsSavingPersonal(true);
    try {
      const email = (values.email || '').trim();
      const emailCheck = loginFormSchema.shape.email.safeParse(email);
      if (!email || !emailCheck.success) {
        setNotification({ show: true, type: 'error', title: 'Invalid email', message: emailCheck.success ? 'Please enter a valid email address.' : emailCheck.error.issues[0].message });
        return;
      }
      if (!values.name || !values.username) {
        setNotification({ show: true, type: 'error', title: 'Missing fields', message: 'Please provide both username and name.' });
        return;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: values.username, name: values.name, email: values.email, phone: values.phone }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to save personal information');
      }

      const updated = await res.json();
      form.reset({ ...form.getValues(), ...updated });
      setNotification({ show: true, type: 'success', title: 'Saved', message: 'Personal information saved.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setNotification({ show: true, type: 'error', title: 'Save failed', message });
    } finally {
      setIsSavingPersonal(false);
    }
  };
  
  type Address = {
    id?: number;
    type?: "SHIPPING" | "BILLING";
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  };

  const [addresses, setAddresses] = useState<{ shipping?: Address; billing?: Address }>({});
  const [shippingFields, setShippingFields] = useState<Address>({});
  const [billingFields, setBillingFields] = useState<Address>({});
  const [isSavingAddress, setIsSavingAddress] = useState<{ shipping?: boolean; billing?: boolean }>({});
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);

  const form = useForm({
    defaultValues: {
      username: user?.username ?? "",
      name: user?.name ?? user?.username ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      jobTitle: "",
      company: "",
      bio: "",
      location: ""
    }
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch('/api/user/addresses');
        if (!res.ok) throw new Error('Failed to fetch addresses');
        const data: Address[] = await res.json();
        const shipping = data.find((a) => a.type === 'SHIPPING');
        const billing = data.find((a) => a.type === 'BILLING');
        setAddresses({ shipping, billing });
        if (shipping) setShippingFields(shipping);
        if (billing) setBillingFields(billing);
      } catch (err) {
        // don't block the page if addresses fail
        console.error(err);
      }
    };

    fetchAddresses();
  }, []);

  const handleSaveAddress = async (which: 'shipping' | 'billing') => {
    const fields = which === 'shipping' ? shippingFields : billingFields;
    const type = which === 'shipping' ? 'SHIPPING' : 'BILLING';

    // basic validation
    if (!fields.street || !fields.city || !fields.zip || !fields.country) {
      setNotification({ show: true, type: 'error', title: 'Missing fields', message: 'All address fields are required.' });
      return;
    }

    setIsSavingAddress((s) => ({ ...s, [which]: true }));

    try {
      if (fields.id) {
        // Update
        const res = await fetch(`/api/user/addresses/${fields.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ street: fields.street, city: fields.city, zip: fields.zip, country: fields.country }),
        });
        if (!res.ok) throw new Error(await res.text());
        const updated = await res.json();
        setAddresses((prev) => ({ ...prev, [which]: updated }));
        setNotification({ show: true, type: 'success', title: 'Address updated', message: `${type.toLowerCase()} address saved.` });
      } else {
        // Create
        const res = await fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, street: fields.street, city: fields.city, zip: fields.zip, country: fields.country }),
        });
        if (!res.ok) throw new Error(await res.text());
        const created = await res.json();
        setAddresses((prev) => ({ ...prev, [which]: created }));
        setShippingFields((s) => (which === 'shipping' ? created : s));
        setBillingFields((b) => (which === 'billing' ? created : b));
        setNotification({ show: true, type: 'success', title: 'Address created', message: `${type.toLowerCase()} address saved.` });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Address save failed';
      setNotification({ show: true, type: 'error', title: 'Save failed', message });
    } finally {
      setIsSavingAddress((s) => ({ ...s, [which]: false }));
    }
  };

  const handlePasswordChange = async () => {
    // Reset errors
    setErrors({});
    
    // Validation
    const newErrors: typeof errors = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    
    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors", {
        position: "bottom-right"
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to change password");
      }

      // Reset form and close dialog
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
      setIsPasswordDialogOpen(false);
      
      // Show success notification
      setShowSuccessNotification(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      
      // Set error on current password field if it's an invalid password error
      if (errorMessage.includes("Invalid current password")) {
        setErrors({ currentPassword: "Current password is incorrect" });
      }
      
      toast.error(errorMessage, {
        position: "bottom-right"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <>
      <Notification 
        show={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        type="success"
        title="Password Changed Successfully!"
        message="Your password has been updated."
      />

      <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>  
      </TabsList>   

      {/* Personal Information */}
      <TabsContent value="personal" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and profile information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...form.register('username', { required: true, minLength: 3 })} />
                {form.formState.errors.username && <p className="text-sm text-red-500">Username is required (min 3 chars)</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...form.register('name', { required: true })} />
                {form.formState.errors.name && <p className="text-sm text-red-500">Name is required</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register('email', { required: 'Email is required', validate: (v) => loginFormSchema.shape.email.safeParse((v || '').trim()).success || 'Enter a valid email (e.g., name@example.com)' })} />
                {form.formState.errors.email && <p className="text-sm text-red-500">{String(form.formState.errors.email?.message || 'Enter a valid email (e.g., name@example.com)')}</p>} 
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
                      <PhoneInput
                        international
                        defaultCountry="HU"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Enter phone number"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </>
                  )}
                />
              </div>
            </div>

            {/* Location (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              {/** Display assembled location from shipping address: "Country, ZIP City Street" */}
              {(() => {
                const locationStr = (() => {
                  if (shippingFields && (shippingFields.country || shippingFields.zip || shippingFields.city || shippingFields.street)) {
                    const country = (shippingFields.country || '').trim();
                    const zipCity = [shippingFields.zip, shippingFields.city].filter(Boolean).join(' ');
                    const street = (shippingFields.street || '').trim();
                    const rest = [zipCity, street].filter(Boolean).join(' ').trim();
                    return [country, rest].filter(Boolean).join(', ');
                  }
                  return form.getValues("location") || "";
                })();

                return <Input id="location" value={locationStr} readOnly aria-readonly="true" />;
              })()}
            </div>

            <div className="mt-3 flex">
              <Button variant="secondary" onClick={form.handleSubmit(handleSavePersonal)} disabled={isSavingPersonal}>
                {isSavingPersonal ? 'Saving...' : 'Save Personal Information'}
              </Button>
            </div>

            {/* Address: Shipping */}
            <div className="mt-6">
              <h3 className="text-lg font-medium">Shipping Address</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="shipping-street">Street</Label>
                  <Input id="shipping-street" value={shippingFields.street || ''} onChange={(e) => setShippingFields({ ...shippingFields, street: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-city">City</Label>
                  <Input id="shipping-city" value={shippingFields.city || ''} onChange={(e) => setShippingFields({ ...shippingFields, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-zip">ZIP</Label>
                  <Input id="shipping-zip" value={shippingFields.zip || ''} onChange={(e) => setShippingFields({ ...shippingFields, zip: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-country">Country</Label>
                  <Input id="shipping-country" value={shippingFields.country || ''} onChange={(e) => setShippingFields({ ...shippingFields, country: e.target.value })} />
                </div>
              </div>
              <div className="mt-3">
                <Button variant="secondary" onClick={() => handleSaveAddress('shipping')} disabled={isSavingAddress.shipping}>
                  {isSavingAddress.shipping ? 'Saving...' : 'Save Shipping Address'}
                </Button>
              </div>
            </div>

            {/* Address: Billing */}
            <div className="mt-6">
              <h3 className="text-lg font-medium">Billing Address</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="billing-street">Street</Label>
                  <Input id="billing-street" value={billingFields.street || ''} onChange={(e) => setBillingFields({ ...billingFields, street: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing-city">City</Label>
                  <Input id="billing-city" value={billingFields.city || ''} onChange={(e) => setBillingFields({ ...billingFields, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing-zip">ZIP</Label>
                  <Input id="billing-zip" value={billingFields.zip || ''} onChange={(e) => setBillingFields({ ...billingFields, zip: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing-country">Country</Label>
                  <Input id="billing-country" value={billingFields.country || ''} onChange={(e) => setBillingFields({ ...billingFields, country: e.target.value })} />
                </div>
              </div>
              <div className="mt-3">
                <Button variant="secondary" onClick={() => handleSaveAddress('billing')} disabled={isSavingAddress.billing}>
                  {isSavingAddress.billing ? 'Saving...' : 'Save Billing Address'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Account Settings */}
      <TabsContent value="account" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences and subscription.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Session</Label>
                <p className="text-neutral-500 text-sm dark:text-neutral-400">Sign out of this device</p>
              </div>
              <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Password</Label>
                <p className="text-neutral-500 text-sm dark:text-neutral-400">Secure string of characters that protects you</p>
              </div>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/50 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-500 dark:text-red-900">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">Delete Account</Label>
                <p className="text-neutral-500 text-sm dark:text-neutral-400">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Orders Settings */}
      <TabsContent value="orders" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Manage your orders and track status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    {/* Change Password Dialog */}
    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <PasswordInput 
              id="current-password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isChangingPassword}
              className={errors.currentPassword ? "border-red-500 dark:border-red-900" : ""}
            />
            {errors.currentPassword && (
              <p className="text-sm text-red-500 dark:text-red-900">{errors.currentPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <PasswordInput 
              id="new-password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isChangingPassword}
              className={errors.newPassword ? "border-red-500 dark:border-red-900" : ""}
            />
            {errors.newPassword && (
              <p className="text-sm text-red-500 dark:text-red-900">{errors.newPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <PasswordInput 
              id="confirm-password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isChangingPassword}
              className={errors.confirmPassword ? "border-red-500 dark:border-red-900" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 dark:text-red-900">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsPasswordDialogOpen(false);
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setErrors({});
            }}
            disabled={isChangingPassword}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePasswordChange}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "Changing..." : "Change Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete Account Confirmation Dialog */}
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action is irreversible. All your data will be permanently deleted. Are you sure you want to continue?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-neutral-700 dark:text-neutral-300">This will permanently remove your account and you will be signed out.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Inline notification for delete success/error (uses Notification component) */}
    <Notification
      show={notification.show}
      onClose={() => setNotification({ ...notification, show: false })}
      type={notification.type}
      title={notification.title}
      message={notification.message}
    />

    </>
  );
}
