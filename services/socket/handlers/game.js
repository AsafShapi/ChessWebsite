const { Chess } = require('chess.js');
const { rooms } = require('../state');

const gameInstances = new Map();

function initializeGame(roomCode) {
    const game = new Chess();
    gameInstances.set(roomCode, game);
    return game;
}

function handleGameEvents(io, socket) {
    socket.on('make-move', ({ from, to, promotion, roomCode }) => {
        if (!socket.user || !roomCode) return;

        const room = rooms.get(roomCode);
        if (!room || !room.gameStarted) return;

        const game = gameInstances.get(roomCode) || initializeGame(roomCode);
        const playerIndex = room.players.findIndex(p => p.id === socket.user.userId);
        const isPlayerTurn = (game.turn() === 'w' && playerIndex === 0) || 
                           (game.turn() === 'b' && playerIndex === 1);

        if (!isPlayerTurn) return;

        try {
            const move = game.move({ from, to, promotion });
            if (move) {
                const gameState = {
                    move,
                    fen: game.fen(),
                    gameOver: game.isGameOver(),
                    turn: game.turn(),
                    check: game.isCheck(),
                    checkmate: game.isCheckmate(),
                    draw: game.isDraw()
                };

                if (game.isCheckmate()) {
                    const winnerIndex = game.turn() === 'w' ? 1 : 0;
                    io.to(roomCode).emit('game-over', {
                        winner: room.players[winnerIndex].username,
                        reason: 'checkmate'
                    });
                }
                else if (game.isDraw()) {
                    let reason = 'fifty-moves';
                    if (game.isStalemate()) reason = 'stalemate';
                    else if (game.isInsufficientMaterial()) reason = 'insufficient';
                    else if (game.isThreefoldRepetition()) reason = 'threefold';

                    io.to(roomCode).emit('game-over', {
                        winner: null,
                        reason
                    });
                }

                io.to(roomCode).emit('move-made', gameState);
            }
        } catch (error) {
            console.error('Invalid move:', error);
        }
    });

    socket.on('reset-game', (roomCode) => {
        if (!socket.user || !roomCode) return;
        
        const room = rooms.get(roomCode);
        if (!room || !room.gameStarted) return;

        const game = new Chess();
        gameInstances.set(roomCode, game);
        
        io.to(roomCode).emit('game-reset', {
            fen: game.fen()
        });
    });

    socket.on('undo-move', (roomCode) => {
        if (!socket.user || !roomCode) return;

        const room = rooms.get(roomCode);
        if (!room || !room.gameStarted) return;

        const game = gameInstances.get(roomCode);
        if (!game) return;

        game.undo();
        
        io.to(roomCode).emit('move-undone', {
            fen: game.fen(),
            turn: game.turn(),
            check: game.isCheck(),
            gameOver: game.isGameOver()
        });
    });

    socket.on('get-game-state', (roomCode) => {
        if (!socket.user || !roomCode) return;

        const game = gameInstances.get(roomCode);
        if (!game) return;

        socket.emit('game-state', {
            fen: game.fen(),
            turn: game.turn(),
            gameOver: game.isGameOver(),
            check: game.isCheck(),
            checkmate: game.isCheckmate(),
            draw: game.isDraw()
        });
    });

    socket.on('resign-game', (roomCode) => {
        if (!socket.user || !roomCode) return;
    
        const room = rooms.get(roomCode);
        if (!room || !room.gameStarted) return;
    
        const playerIndex = room.players.findIndex(p => p.id === socket.user.userId);
        if (playerIndex === -1) return;
    
        const winnerIndex = playerIndex === 0 ? 1 : 0;
        const winner = room.players[winnerIndex];
    
        io.to(roomCode).emit('game-over', {
            winner: winner.username,
            reason: 'resign'
        });
    
        const game = gameInstances.get(roomCode);
        if (game) {
            game.gameOver = true;
            io.to(roomCode).emit('move-made', {
                fen: game.fen(),
                gameOver: true,
                turn: game.turn(),
                check: game.isCheck(),
                checkmate: false,
                draw: false
            });
        }
    });    
}

function handleRematchEvents(io, socket) {
  socket.on('request-rematch', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    socket.to(roomCode).emit('rematch-requested');
  });

  socket.on('accept-rematch', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    io.to(roomCode).emit('rematch-accepted');

    room.players.reverse();

    const game = new Chess();
    gameInstances.set(roomCode, game);

    io.to(roomCode).emit('game-rematch', {
      fen: game.fen(),
      players: room.players
    });
  });

  socket.on('decline-rematch', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    socket.to(roomCode).emit('rematch-declined');
  });
}

module.exports = {
  handleGameEvents,
  initializeGame,
  gameInstances,
  handleRematchEvents
};

