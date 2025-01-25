import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, UserPlus, Search, Check, XIcon as XMark } from "lucide-react"
import { ChatWindow } from "./chat-window"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  fetchFriends,
  searchUsers,
  sendFriendRequest,
  respondToFriendRequest,
  clearSearchResults,
} from "../store/slices/friendsSlice"
import { useSocket } from "../context/socket"

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
})

export function FriendsPanel({ isOpen, onClose }) {
  const [activeChats, setActiveChats] = useState([])
  const [chatZIndexes, setChatZIndexes] = useState({})
  const [isSearching, setIsSearching] = useState(false)
  const baseZIndex = 40

  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { friends, searchResults, loading } = useSelector((state) => state.friends)
  const { socket } = useSocket()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })

  useEffect(() => {
    if (isOpen && user) {
      dispatch(fetchFriends())
    }
  }, [isOpen, user, dispatch])

  useEffect(() => {
    if (!socket || !user) return

    socket.on("friend-request-received", () => {
      dispatch(fetchFriends())
    })

    socket.on("friend-request-updated", () => {
      dispatch(fetchFriends())
    })

    return () => {
      socket.off("friend-request-received")
      socket.off("friend-request-updated")
    }
  }, [socket, user, dispatch])

  const openChat = (friend) => {
    if (!activeChats.find((chat) => chat.id === friend.id)) {
      setActiveChats((prev) => [...prev, friend])
      setChatZIndexes((prev) => ({
        ...prev,
        [friend.id]: baseZIndex + Object.keys(prev).length,
      }))
    }
  }

  const closeChat = (friendId) => {
    setActiveChats((prev) => prev.filter((chat) => chat.id !== friendId))
    setChatZIndexes((prev) => {
      const { [friendId]: _, ...rest } = prev
      return rest
    })
  }

  const bringToFront = (friendId) => {
    const maxZ = Math.max(...Object.values(chatZIndexes), baseZIndex)
    setChatZIndexes((prev) => ({
      ...prev,
      [friendId]: maxZ + 1,
    }))
  }

  const getChatPosition = (index) => {
    const friendsPanelWidth = 320
    return {
      x: window.innerWidth - friendsPanelWidth - 320 - index * 20,
      y: window.innerHeight - 400,
    }
  }

  async function onSubmit(values) {
    const results = await dispatch(searchUsers(values.username))
    if (!results.error) {
      setIsSearching(true)
    }
  }

  const handleFriendRequest = async (friendId) => {
    await dispatch(sendFriendRequest(friendId))
    socket.emit("friend-request-sent", { friendId })
    dispatch(clearSearchResults())
    form.reset()
    setIsSearching(false)
  }

  const handleFriendResponse = async (requestId, action) => {
    const result = await dispatch(respondToFriendRequest({ requestId, action }))
    if (!result.error) {
      const request = friends.find((f) => f.requestId === requestId)
      if (request) {
        socket.emit("friend-request-responded", {
          friendId: request.friend.id,
        })
      }
    }
  }

  const acceptedFriends = friends ? friends.filter((f) => f.status === "accepted") : []
  const pendingRequests = friends ? friends.filter((f) => f.status === "pending") : []

  return (
    <>
      {isOpen && (
        <div
          className="fixed right-0 bottom-0 w-80 bg-background border-l border-t shadow-lg z-50 flex flex-col"
          style={{
            maxHeight: "50vh",
            borderTopLeftRadius: "0.5rem",
          }}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Friends</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 border-b space-y-4">
            {isSearching ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input placeholder="Search username..." {...field} className="flex-1" />
                            <Button type="submit" size="icon">
                              <Search className="h-4 w-4" />
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
              <Button className="w-full" variant="outline" onClick={() => setIsSearching(true)}>
                <Search className="h-4 w-4 mr-2" />
                Find Friends
              </Button>
            )}

            {isSearching && searchResults && searchResults.length > 0 && (
              <ScrollArea className="h-40 w-full rounded-md border">
                <div className="p-4 space-y-2">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <span className="text-sm font-medium">{user.username}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleFriendRequest(user.id)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Tabs defaultValue="friends" className="flex-1">
            <div className="px-4 pt-2">
              <TabsList className="w-full">
                <TabsTrigger value="friends" className="flex-1">
                  Friends
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex-1">
                  Requests
                  {pendingRequests.length > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground px-2 rounded-full text-xs">
                      {pendingRequests.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="friends" className="flex-1 mt-0">
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {acceptedFriends.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">No friends yet. Start by adding some!</p>
                  ) : (
                    acceptedFriends.map(({ friend }) => (
                      <Button
                        key={friend.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => openChat(friend)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          {friend.username}
                        </div>
                      </Button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="requests" className="flex-1 mt-0">
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {pendingRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">No pending friend requests</p>
                  ) : (
                    pendingRequests.map(({ requestId, friend, type }) => (
                      <div
                        key={requestId}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{friend.username}</span>
                          <span className="text-xs text-muted-foreground">
                            ({type === "received" ? "Received" : "Sent"})
                          </span>
                        </div>
                        {type === "received" ? (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-100"
                              onClick={() => handleFriendResponse(requestId, "accept")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-100"
                              onClick={() => handleFriendResponse(requestId, "reject")}
                            >
                              <XMark className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleFriendResponse(requestId, "cancel")}
                          >
                            <XMark className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {activeChats.map((friend, index) => (
        <ChatWindow
          key={friend.id}
          friend={friend}
          onClose={() => closeChat(friend.id)}
          position={getChatPosition(index)}
          zIndex={chatZIndexes[friend.id]}
          onFocus={() => bringToFront(friend.id)}
        />
      ))}
    </>
  )
}

