import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Minus, Send } from 'lucide-react'
import { useSocket } from '../context/socket'
import { useSelector } from 'react-redux'

export function ChatWindow({ friend, onClose, position, zIndex, onFocus }) {
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const [windowPosition, setWindowPosition] = useState(position || { x: window.innerWidth - 340, y: window.innerHeight - 400 })
    const [isMinimized, setIsMinimized] = useState(false)
    const [message, setMessage] = useState("")
    const [chatHistory, setChatHistory] = useState([])
    const [isOnline, setIsOnline] = useState(false)
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
    const windowRef = useRef(null)
    const hasInitialized = useRef(false)
    const messagesContainerRef = useRef(null)
    const { socket } = useSocket()
    const currentUser = useSelector(state => state.auth.user)

    useEffect(() => {
        if (!hasInitialized.current && position) {
            setWindowPosition(position)
            hasInitialized.current = true
        }
    }, [position])

    const handleMouseDown = (e) => {
        if (windowRef.current) {
            setIsDragging(true)
            setDragOffset({
                x: e.clientX - windowRef.current.offsetLeft,
                y: e.clientY - windowRef.current.offsetTop
            })
        }
    }

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging && windowRef.current) {
                const friendsPanelWidth = 320
                const maxX = window.innerWidth - friendsPanelWidth - windowRef.current.offsetWidth
                const newX = Math.min(Math.max(0, e.clientX - dragOffset.x), maxX)
                const newY = Math.min(
                    Math.max(0, e.clientY - dragOffset.y),
                    window.innerHeight - (isMinimized ? 40 : windowRef.current.offsetHeight)
                )
                setWindowPosition({ x: newX, y: newY })
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, dragOffset, isMinimized])

    useEffect(() => {
        if (windowRef.current) {
            const currentHeight = isMinimized ? 40 : 400
            const maxY = window.innerHeight - currentHeight
            const friendsPanelWidth = 320
            const maxX = window.innerWidth - friendsPanelWidth - windowRef.current.offsetWidth

            if (windowPosition.y > maxY || windowPosition.x > maxX) {
                setWindowPosition(prev => ({
                    x: Math.min(prev.x, maxX),
                    y: Math.min(prev.y, maxY)
                }))
            }
        }
    }, [isMinimized, windowPosition])

    const scrollToBottom = () => {
        if (messagesContainerRef.current && shouldAutoScroll) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            setShouldAutoScroll(distanceFromBottom < 100);
        }
    }

    useEffect(() => {
        if (!socket || !friend.id) return;

        function onChatHistory(history) {
            if (!history.error) {
                setChatHistory(history);
                setTimeout(scrollToBottom, 0);
            }
        }

        function onFriendMessage(data) {
            if (data.senderId === friend.id) {
                setChatHistory(prev => [...prev, data]);
                setTimeout(scrollToBottom, 0);
            }
        }

        function onMessageSent(data) {
            if (data.success) {
                setChatHistory(prev => {
                    const newHistory = [...prev];
                    const lastMessage = newHistory[newHistory.length - 1];
                    if (lastMessage && !lastMessage.messageId) {
                        lastMessage.messageId = data.messageId;
                        lastMessage.timestamp = data.timestamp;
                    }
                    return newHistory;
                });
                setTimeout(scrollToBottom, 0);
            }
        }

        function onFriendStatus(data) {
            if (data.friendId === friend.id) {
                setIsOnline(data.online);
            }
        }

        socket.emit('get-chat-history', { friendId: friend.id });

        socket.on('chat-history', onChatHistory);
        socket.on('friend-message', onFriendMessage);
        socket.on('message-sent', onMessageSent);
        socket.on('friend-status', onFriendStatus);

        return () => {
            socket.off('chat-history', onChatHistory);
            socket.off('friend-message', onFriendMessage);
            socket.off('message-sent', onMessageSent);
            socket.off('friend-status', onFriendStatus);
        };
    }, [socket, friend.id, shouldAutoScroll]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !socket || !currentUser) return;

        const newMessage = {
            senderId: currentUser.userId,
            message: message.trim(),
            timestamp: new Date()
        };

        setChatHistory(prev => [...prev, newMessage]);

        socket.emit('friend-message', {
            receiverId: friend.id,
            message: message.trim()
        });

        setMessage("");
        setShouldAutoScroll(true);
        setTimeout(scrollToBottom, 0);
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    return (
        <div
            ref={windowRef}
            className="fixed bg-background border rounded-lg shadow-lg overflow-hidden flex flex-col"
            style={{
                width: '300px',
                height: isMinimized ? '40px' : '400px',
                left: `${windowPosition.x}px`,
                top: `${windowPosition.y}px`,
                zIndex,
                transition: isMinimized !== undefined ? 'height 0.2s ease-in-out' : 'none'
            }}
            onClick={onFocus}
        >
            <div 
                className="p-2 border-b bg-muted flex items-center justify-between cursor-move"
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="font-semibold">{friend.username}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMinimized(!isMinimized);
                        }}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {!isMinimized && (
                <div className="flex-1 flex flex-col min-h-0">
                    <div 
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-4"
                    >
                        <div className="space-y-4">
                            {chatHistory.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center">
                                    Start of your conversation with {friend.username}
                                </p>
                            ) : (
                                chatHistory.map((msg, index) => (
                                    <div
                                        key={msg.messageId || index}
                                        className={`flex ${msg.senderId === friend.id ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] px-3 py-2 rounded-lg ${
                                                msg.senderId === friend.id
                                                    ? 'bg-muted'
                                                    : 'bg-primary text-primary-foreground'
                                            }`}
                                        >
                                            <p className="text-sm">{msg.message}</p>
                                            <p className="text-xs opacity-70">
                                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t mt-auto">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1"
                            />
                            <Button type="submit" size="icon" disabled={!message.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

