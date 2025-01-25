import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, LinkIcon, Timer, Plus } from 'lucide-react'
import { Layout } from "../components/layout"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { generateRoomCode } from "../utils/roomCode"
import { useSocket } from "../context/socket"
import { useSelector } from "react-redux"

const formSchema = z.object({
  roomCode: z.string().length(8, {
    message: "Room code must be exactly 8 characters.",
  }),
})

export default function HomePage() {
  const [isJoining, setIsJoining] = useState(false)
  const navigate = useNavigate()
  const { socket } = useSocket()
  const user = useSelector(state => state.auth.user)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomCode: "",
    },
  })

  const handleCreateRoom = () => {
    if (!user) {
      return;
    }

    const roomCode = generateRoomCode();
    socket.emit('create-room', roomCode);
    
    navigate(`/game/${roomCode}`);
  }

  function onSubmit(values) {
    if (!user) {
      return;
    }

    socket.emit('join-room', values.roomCode.toUpperCase());
    navigate(`/game/${values.roomCode.toUpperCase()}`);
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <header className="flex items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome to Chess Game</h1>
            <p className="text-muted-foreground">
              Play chess online, improve your skills, and join our community
            </p>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="opacity-75">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Timer className="h-6 w-6" />
                Quick Play
              </CardTitle>
              <CardDescription>
                Jump into a casual game with players of similar skill
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Play vs AI
              </CardTitle>
              <CardDescription>
                Practice and improve your skills against our chess AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <LinkIcon className="h-6 w-6" />
                Create Chess Room
              </CardTitle>
              <CardDescription>
                Create a private room and invite your friends to play
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isJoining ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                    <FormField
                      control={form.control}
                      name="roomCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter room code..."
                                {...field}
                                className="flex-1"
                                maxLength={8}
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              />
                              <Button type="submit" size="icon">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              ) : (
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={handleCreateRoom}
                    disabled={!user}
                  >
                    Create Room
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setIsJoining(true)}
                    disabled={!user}
                  >
                    Already have a room code?
                  </Button>
                </div>
              )}
              {!user && (
                <p className="text-sm text-muted-foreground text-center">
                  Please sign in to create or join a room
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="opacity-75">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learn Chess
              </CardTitle>
              <CardDescription>
                Tutorial system in development
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-8">
              <p className="text-lg font-medium text-muted-foreground">Coming Soon</p>
            </CardContent>
          </Card>

          <Card className="opacity-75">
            <CardHeader>
              <CardTitle>Player Stats</CardTitle>
              <CardDescription>
                Login system in development
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-8">
              <p className="text-lg font-medium text-muted-foreground">Coming Soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

