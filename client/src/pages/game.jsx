import { useState, useCallback, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Chessboard } from "react-chessboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Flag, MessageSquare, HistoryIcon, Send } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Layout } from "@/components/layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useSocket } from "../context/socket"
import { useSelector } from "react-redux"
import { Chess } from 'chess.js';
import { RematchDialog } from "@/components/rematch-dialog"

export default function GamePage() {
    const { roomCode } = useParams()
    const navigate = useNavigate()
    const { socket } = useSocket()
    const user = useSelector(state => state.auth.user)
    const [boardWidth, setBoardWidth] = useState(400)
    const [gameState, setGameState] = useState({
        fen: 'start',
        turn: 'w',
        gameOver: false,
        check: false,
        checkmate: false,
        draw: false
    })
    const [moveHistory, setMoveHistory] = useState([])
    const [players, setPlayers] = useState([])
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [countdown, setCountdown] = useState(null)
    const [gameStarted, setGameStarted] = useState(false)
    const messagesContainerRef = useRef(null)
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [possibleMoves, setPossibleMoves] = useState([]);
    const [showRematchDialog, setShowRematchDialog] = useState(false)
    const [rematchStatus, setRematchStatus] = useState(null)
    const [winner, setWinner] = useState(null)
    const [gameEndReason, setGameEndReason] = useState(null)

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        socket.emit('join-room', roomCode);

        socket.on('room-updated', ({ players, messages, gameStarted, countdown }) => {
            setPlayers(players);
            setMessages(messages);
            setGameStarted(gameStarted);
            setCountdown(countdown);

            if (gameStarted && !countdown) {
                socket.emit('get-game-state', roomCode);
            }
        });

        socket.on('new-match-message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        socket.on('move-made', ({ move, fen, gameOver, turn, check, checkmate, draw }) => {
          setGameState({ fen, turn, gameOver, check, checkmate, draw });
          if (move) {
              setMoveHistory(prev => [...prev, move]);
          }
          setSelectedSquare(null);
          setPossibleMoves([]);
          
          if (checkmate) {
              const winnerIndex = turn === 'w' ? 1 : 0;
              setWinner(players[winnerIndex]?.username);
              setGameEndReason('checkmate');
              setShowRematchDialog(true);
          } else if (draw) {
              setWinner(null);
              const game = new Chess(fen);
              if (game.isStalemate()) {
                  setGameEndReason('stalemate');
              } else if (game.isInsufficientMaterial()) {
                  setGameEndReason('insufficient');
              } else if (game.isThreefoldRepetition()) {
                  setGameEndReason('threefold');
              } else if (game.isDraw()) {
                  setGameEndReason('fifty-moves');
              }
              setShowRematchDialog(true);
          }
      });

        socket.on('game-over', ({ winner: winnerName, reason }) => {
            setWinner(winnerName);
            setGameEndReason(reason);
            setShowRematchDialog(true);
            setGameState(prev => ({
                ...prev,
                gameOver: true
            }));
        });

        socket.on('game-reset', ({ fen }) => {
            setGameState({ fen, turn: 'w', gameOver: false, check: false, checkmate: false, draw: false });
            setMoveHistory([]);
        });

        socket.on('move-undone', ({ fen, turn, check, gameOver }) => {
            setGameState({ fen, turn, gameOver, check });
            setMoveHistory(prev => prev.slice(0, -1));
        });

        socket.on('game-state', (state) => {
            setGameState(state);
        });

        socket.on('room-error', ({ message }) => {
            alert(message);
            navigate('/');
        });

        socket.on('rematch-requested', () => {
            setRematchStatus('received');
            setShowRematchDialog(true);
        });

        socket.on('rematch-declined', () => {
            setRematchStatus(null);
            setShowRematchDialog(false);
        });

        socket.on('rematch-accepted', () => {
            setRematchStatus('accepted');
        });

        socket.on('game-rematch', ({ fen, players }) => {
            setGameState({
                fen,
                turn: 'w',
                gameOver: false,
                check: false,
                checkmate: false,
                draw: false
            });
            setPlayers(players);
            setMoveHistory([]);
            setShowRematchDialog(false);
            setRematchStatus(null);
            setWinner(null);
        });


        return () => {
            socket.off('room-updated');
            socket.off('new-match-message');
            socket.off('move-made');
            socket.off('game-reset');
            socket.off('move-undone');
            socket.off('game-state');
            socket.off('room-error');
            socket.off('rematch-requested');
            socket.off('rematch-declined');
            socket.off('rematch-accepted');
            socket.off('game-rematch');
            socket.off('game-over');
        };
    }, [socket, roomCode, navigate, user]);

    useEffect(() => {
        const updateDimensions = () => {
            const container = document.getElementById('board-container')
            if (container) {
                const containerWidth = container.offsetWidth - 32
                const containerHeight = window.innerHeight * 0.6
                const size = Math.min(containerWidth, containerHeight, 600)
                setBoardWidth(size)
            }
        }

        window.addEventListener('resize', updateDimensions)
        updateDimensions()
        return () => window.removeEventListener('resize', updateDimensions)
    }, [])

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
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        socket.emit('match-message', newMessage.trim());
        setNewMessage("");
        setShouldAutoScroll(true);
        setTimeout(scrollToBottom, 0);
    };

    const calculatePossibleMoves = (square) => {
        const tempGame = new Chess(gameState.fen);
        
        const moves = tempGame.moves({ square, verbose: true });
        
        return moves.map(move => move.to);
    };

    const onSquareClick = (square) => {
        if (!gameStarted) return;

        const playerIndex = players.findIndex(p => p.id === user.userId);
        const isPlayerTurn = (gameState.turn === 'w' && playerIndex === 0) || 
                           (gameState.turn === 'b' && playerIndex === 1);

        if (!isPlayerTurn) return;

        if (selectedSquare) {
            if (possibleMoves.includes(square)) {
                socket.emit('make-move', {
                    from: selectedSquare,
                    to: square,
                    promotion: 'q',
                    roomCode
                });
                setSelectedSquare(null);
                setPossibleMoves([]);
            } else {
                const tempGame = new Chess(gameState.fen);
                const piece = tempGame.get(square);
                if (piece && piece.color === gameState.turn) {
                    setSelectedSquare(square);
                    setPossibleMoves(calculatePossibleMoves(square));
                } else {
                    setSelectedSquare(null);
                    setPossibleMoves([]);
                }
            }
        } else {
            const tempGame = new Chess(gameState.fen);
            const piece = tempGame.get(square);
            if (piece && piece.color === gameState.turn) {
                setSelectedSquare(square);
                setPossibleMoves(calculatePossibleMoves(square));
            }
        }
    };

    const onDrop = (sourceSquare, targetSquare, piece) => {
        if (!gameStarted) return false;
        
        const playerIndex = players.findIndex(p => p.id === user.userId);
        const isPlayerTurn = (gameState.turn === 'w' && playerIndex === 0) || 
                           (gameState.turn === 'b' && playerIndex === 1);

        if (!isPlayerTurn) return false;

        const promotion = piece ? piece[1].toLowerCase() : undefined;

        socket.emit('make-move', {
            from: sourceSquare,
            to: targetSquare,
            promotion,
            roomCode
        });

        setSelectedSquare(null);
        setPossibleMoves([]);

        return true;
    };


    const whitePlayer = players[0]?.username || 'Waiting...';
    const blackPlayer = players[1]?.username || 'Waiting...';

    const customSquareStyles = {
        ...(selectedSquare && {
            [selectedSquare]: {
                background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
            },
        }),
        ...possibleMoves.reduce((styles, square) => {
            const tempGame = new Chess(gameState.fen);
            const piece = tempGame.get(square);
            styles[square] = piece ? {
                boxShadow: 'inset 0 0 0 3px rgba(0,0,0,.2)',
                borderRadius: '50%'
            } : {
                background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)'
            };
            return styles;
        }, {}),
    };

    const handleRematchRequest = () => {
        socket.emit('request-rematch', roomCode);
        setRematchStatus('pending');
    };

    const handleRematchAccept = () => {
        socket.emit('accept-rematch', roomCode);
        setRematchStatus('accepted');
    };

    const handleRematchDecline = () => {
        socket.emit('decline-rematch', roomCode);
        setRematchStatus(null);
        setShowRematchDialog(false);
        navigate('/');
    };

    const handleResign = () => {
        if (window.confirm('Are you sure you want to resign?')) {
            socket.emit('resign-game', roomCode);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto p-4 min-h-screen">
                <header className="flex items-center mb-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">Chess Game</h1>
                        <p className="text-sm text-muted-foreground">Room: {roomCode}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            disabled={!gameStarted || gameState.gameOver}
                            onClick={handleResign}
                        >
                            <Flag className="h-4 w-4 mr-2" />
                            Resign
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
                    <div className="space-y-4">
                        {players.findIndex(p => p.id === user?.userId) === 1 ? (
                            <>
                                <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Avatar>
                                            <AvatarFallback>{whitePlayer[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{whitePlayer}</div>
                                            <div className="text-sm text-muted-foreground">White Player</div>
                                        </div>
                                    </div>
                                </div>

                                <Card className="h-fit flex justify-center">
                                    <CardContent className="p-4 w-full flex justify-center" id="board-container">
                                        <div className="flex justify-center items-center">
                                            {!gameStarted ? (
                                                <div className="text-center p-8">
                                                    <h2 className="text-2xl font-bold mb-4">Waiting for Players</h2>
                                                    <p className="text-muted-foreground mb-2">
                                                        {players.length === 1 
                                                            ? "Waiting for opponent to join..." 
                                                            : "Game starting soon!"}
                                                    </p>
                                                    {countdown !== null && (
                                                        <p className="text-xl font-bold text-primary">
                                                            Starting in {countdown} seconds...
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <Chessboard 
                                                    position={gameState.fen}
                                                    onPieceDrop={onDrop}
                                                    onSquareClick={onSquareClick}
                                                    customSquareStyles={customSquareStyles}
                                                    boardWidth={boardWidth}
                                                    animationDuration={100}
                                                    boardOrientation={players.findIndex(p => p.id === user?.userId) === 1 ? 'black' : 'white'}
                                                    onPromotionPieceSelect={(piece) => piece}
                                                />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Avatar>
                                            <AvatarFallback>{blackPlayer[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{blackPlayer}</div>
                                            <div className="text-sm text-muted-foreground">Black Player</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Avatar>
                                            <AvatarFallback>{blackPlayer[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{blackPlayer}</div>
                                            <div className="text-sm text-muted-foreground">Black Player</div>
                                        </div>
                                    </div>
                                </div>

                                <Card className="h-fit flex justify-center">
                                    <CardContent className="p-4 w-full flex justify-center" id="board-container">
                                        <div className="flex justify-center items-center">
                                            {!gameStarted ? (
                                                <div className="text-center p-8">
                                                    <h2 className="text-2xl font-bold mb-4">Waiting for Players</h2>
                                                    <p className="text-muted-foreground mb-2">
                                                        {players.length === 1 
                                                            ? "Waiting for opponent to join..." 
                                                            : "Game starting soon!"}
                                                    </p>
                                                    {countdown !== null && (
                                                        <p className="text-xl font-bold text-primary">
                                                            Starting in {countdown} seconds...
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <Chessboard 
                                                    position={gameState.fen}
                                                    onPieceDrop={onDrop}
                                                    onSquareClick={onSquareClick}
                                                    customSquareStyles={customSquareStyles}
                                                    boardWidth={boardWidth}
                                                    animationDuration={100}
                                                    boardOrientation={players.findIndex(p => p.id === user?.userId) === 1 ? 'black' : 'white'}
                                                    onPromotionPieceSelect={(piece) => piece}
                                                />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Avatar>
                                            <AvatarFallback>{whitePlayer[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{whitePlayer}</div>
                                            <div className="text-sm text-muted-foreground">White Player</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                    </div>

                    <Card className="lg:h-[calc(100vh-8rem)] h-[400px] flex flex-col">
                        <CardContent className="p-4 flex-1 flex flex-col overflow-hidden">
                            <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-4">
                                    <TabsList>
                                        <TabsTrigger value="moves" className="flex items-center gap-2">
                                            <HistoryIcon className="h-4 w-4" />
                                            Moves
                                        </TabsTrigger>
                                        <TabsTrigger value="chat" className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Chat
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="moves" className="flex-1 mt-0 min-h-0">
                                    <div className="h-full overflow-y-auto border rounded-md">
                                        <div className="p-4">
                                            <table className="w-full">
                                                <tbody>
                                                    {gameState.check && <div className="text-yellow-500 mb-2">Check!</div>}
                                                    {gameState.checkmate && <div className="text-red-500 mb-2">Checkmate!</div>}
                                                    {gameState.draw && <div className="text-blue-500 mb-2">Draw!</div>}
                                                    {moveHistory.reduce((pairs, move, i) => {
                                                        if (i % 2 === 0) {
                                                            pairs.push({
                                                                white: move.san,
                                                                black: moveHistory[i + 1]?.san
                                                            });
                                                        }
                                                        return pairs;
                                                    }, []).map((pair, i) => (
                                                        <tr key={i} className="h-8">
                                                            <td className="w-8 text-sm text-muted-foreground">{i + 1}.</td>
                                                            <td className="px-2">
                                                                <span className="text-sm font-mono">{pair.white}</span>
                                                            </td>
                                                            <td className="px-2">
                                                                <span className="text-sm font-mono">{pair.black || '...'}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="chat" className="flex-1 mt-0 min-h-0">
                                    <div className="h-full flex flex-col border rounded-md">
                                        <div className="border-b p-4">
                                            <h2 className="font-semibold mb-2">Players:</h2>
                                            <div className="space-y-2">
                                                {players.map((player, index) => (
                                                    <div 
                                                        key={player.id}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                        <span>
                                                            {player.username} {player.id === user?.userId && "(You)"}
                                                        </span>
                                                    </div>
                                                ))}
                                                {players.length === 1 && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                                                        <span className="text-muted-foreground">
                                                            Waiting for player...
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div 
                                            ref={messagesContainerRef}
                                            onScroll={handleScroll}
                                            className="flex-1 overflow-y-auto p-4 min-h-0"
                                        >
                                            <div className="space-y-4">
                                                {messages.map((message, index) => (
                                                    <div key={index} className="space-y-1">
                                                        {message.type === 'system' ? (
                                                            <p className="text-sm text-muted-foreground text-center">
                                                                {message.content}
                                                            </p>
                                                        ) : (
                                                            <div className="flex items-start gap-2">
                                                                <span className="font-medium">
                                                                    {message.username}:
                                                                </span>
                                                                <span>{message.content}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-4 border-t">
                                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                                <Input
                                                    placeholder="Type a message..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    className="flex-1"
                                                />
                                                <Button type="submit" size="icon">
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <RematchDialog 
                open={showRematchDialog}
                onOpenChange={setShowRematchDialog}
                winner={winner}
                gameEndReason={gameEndReason}
                onAccept={rematchStatus === 'received' ? handleRematchAccept : handleRematchRequest}
                onDecline={handleRematchDecline}
                rematchStatus={rematchStatus}
            />
        </Layout>
    );
}

