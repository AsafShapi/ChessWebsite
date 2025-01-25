import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useDispatch, useSelector } from "react-redux"
import { fetchUser } from "../store/slices/authSlice"
import axios from "../api/axios"

const formSchema = z.object({
    username: z
        .string()
        .min(3, {
            message: "Username must be at least 3 characters.",
        })
        .regex(/^[a-zA-Z0-9_]+$/, {
            message: "Username can only contain letters, numbers, and underscores.",
        }),
})

export function SetUsernameDialog() {
    const [error, setError] = useState("")
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        if (user?.needsUsername) {
            setOpen(true)
        }
    }, [user])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    })

    async function onSubmit(values) {
        try {
            await axios.post("/auth/username", values)
            await dispatch(fetchUser())
            setOpen(false)
            setError("")
        } catch (error) {
            const serverError = error.response?.data?.error
            setError(serverError || "An error occurred while setting username")
        }
    }

    if (!user?.needsUsername) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[400px] text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center font-bold text-foreground">Choose Your Username</DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        Please choose a username for your account
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {error && <div className="text-sm text-red-500 text-center">{error}</div>}
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-foreground">Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your username"
                                            className="text-foreground placeholder:text-muted-foreground"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />
                        <Button className="w-full" type="submit">
                            Set Username
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

