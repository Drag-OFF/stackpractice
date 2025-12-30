"use client";

import { Key, Trash2 } from "lucide-react";
import { useState } from "react";
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

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/profile', { method: 'DELETE' });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to delete account');
      }
      toast.success('Account deleted', { position: 'bottom-right' });
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      toast.error(message, { position: 'bottom-right' });
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
  
  const form = useForm({
    defaultValues: {
      firstName: user?.name ?? user?.username ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      jobTitle: "",
      company: "",
      bio: "",
      location: ""
    }
  });

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
                <Label htmlFor="firstName">Name</Label>
                <Input id="firstName" defaultValue={form.getValues("firstName") || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={form.getValues("email") || ""} />
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
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input id="jobTitle" defaultValue={form.getValues("jobTitle") || ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" defaultValue={form.getValues("location") || ""} />
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

    </>
  );
}
