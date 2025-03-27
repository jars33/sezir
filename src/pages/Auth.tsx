
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const resetPasswordFormSchema = z.object({
  email: z.string().email(),
})

const updatePasswordFormSchema = z.object({
  password: z.string().min(6),
})

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [isUpdatePasswordLoading, setIsUpdatePasswordLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [showUpdatePassword, setShowUpdatePassword] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Check for password reset hash in URL
  useEffect(() => {
    const checkForResetPasswordHash = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      
      if (type === 'recovery') {
        setShowUpdatePassword(true);
        // Clear the hash to avoid showing reset form on refresh
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
    
    checkForResetPasswordHash();
  }, []);

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const resetForm = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  })

  const updatePasswordForm = useForm<z.infer<typeof updatePasswordFormSchema>>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: {
      password: "",
    },
  })

  async function onLoginSubmit(values: z.infer<typeof loginFormSchema>) {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      
      if (error) throw error
      navigate("/")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onResetSubmit(values: z.infer<typeof resetPasswordFormSchema>) {
    setIsResetLoading(true)
    try {
      // Use window.location.origin + '/auth' for the redirectTo URL to ensure proper redirection
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth`,
      })
      
      if (error) throw error
      
      setResetSent(true)
      toast({
        title: "Reset email sent",
        description: "Check your email for a password reset link",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsResetLoading(false)
    }
  }

  async function onUpdatePasswordSubmit(values: z.infer<typeof updatePasswordFormSchema>) {
    setIsUpdatePasswordLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })
      
      if (error) throw error
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      })
      
      setShowUpdatePassword(false)
      setActiveTab("login")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsUpdatePasswordLoading(false)
    }
  }

  return (
    <div className="container relative flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {showUpdatePassword ? (
            <div>
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Update Your Password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your new password below
                </p>
              </div>
              
              <Form {...updatePasswordForm}>
                <form onSubmit={updatePasswordForm.handleSubmit(onUpdatePasswordSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={updatePasswordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button className="w-full" type="submit" disabled={isUpdatePasswordLoading}>
                    {isUpdatePasswordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            </div>
          ) : (
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="reset">Reset Password</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <div className="flex flex-col space-y-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome back
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your email to sign in to your account
                  </p>
                </div>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 mt-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button className="w-full" type="submit" disabled={isLoading}>
                      {isLoading ? "Loading..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="reset">
                <div className="flex flex-col space-y-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Reset Password
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your email to receive a password reset link
                  </p>
                </div>
                
                {resetSent ? (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-md bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Check your email for a password reset link
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => {
                        setResetSent(false);
                        resetForm.reset();
                      }}
                    >
                      Send another reset link
                    </Button>
                  </div>
                ) : (
                  <Form {...resetForm}>
                    <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4 mt-4">
                      <FormField
                        control={resetForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="name@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button className="w-full" type="submit" disabled={isResetLoading}>
                        {isResetLoading ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </form>
                  </Form>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Contact your administrator if you need access to the system.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
