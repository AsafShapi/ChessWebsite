import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Icons } from "./icons"
import { SignUpDialog } from "./signup-dialog"
import { useDispatch } from "react-redux"
import { fetchUser } from "../store/slices/authSlice"
import axios from "../api/axios"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

export function LoginDialog({ children }) {
  const [showSignUp, setShowSignUp] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [error, setError] = useState("")
  const dispatch = useDispatch()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values) {
    try {
      await axios.post("/auth/local/login", values)
      await dispatch(fetchUser())
      setShowLogin(false)
      setError("")
    } catch (error) {
      setError("Invalid email or password")
    }
  }

  const handleSwitchToSignUp = () => {
    setShowLogin(false)
    setShowSignUp(true)
  }

  const handleSwitchToLogin = () => {
    setShowSignUp(false)
    setShowLogin(true)
  }

  return (
      <>
        <Dialog open={showLogin} onOpenChange={setShowLogin}>
          <DialogTrigger asChild>
            {children || (
                <Button variant="outline" size="sm">
                  Login
                </Button>
            )}
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] text-foreground">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center font-bold text-foreground">Welcome back</DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                Enter your email to sign in to your account
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {error && <div className="text-sm text-red-500 text-center">{error}</div>}
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Email</FormLabel>
                          <FormControl>
                            <Input
                                placeholder="m@example.com"
                                type="email"
                                className="text-foreground placeholder:text-muted-foreground"
                                {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Password</FormLabel>
                          <FormControl>
                            <Input
                                placeholder="Enter your password"
                                type="password"
                                className="text-foreground placeholder:text-muted-foreground"
                                {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-destructive" />
                        </FormItem>
                    )}
                />
                <Button className="w-full" type="submit">
                  Sign In
                </Button>
              </form>
            </Form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                  variant="outline"
                  type="button"
                  className="w-full text-foreground hover:text-foreground"
                  onClick={() => (window.location.href = "/auth/google")}
              >
                <Icons.google className="mr-2 h-4 w-4" />
                Google
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Don{"'"}t have an account?{" "}
              <Button
                  variant="link"
                  className="p-0 h-auto text-primary hover:text-primary"
                  onClick={handleSwitchToSignUp}
              >
                Sign up
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <SignUpDialog open={showSignUp} onOpenChange={setShowSignUp} onSwitchToLogin={handleSwitchToLogin} />
      </>
  )
}

