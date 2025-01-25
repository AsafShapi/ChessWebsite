import { createContext, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const user = useSelector(state => state.auth.user);
    const socket = io('/', {
        autoConnect: false,
        withCredentials: true
    });

    useEffect(() => {
        function onConnect() {
            console.log('Connected to socket server');
            if (user?.userId) {
                socket.emit('authenticate', user.userId);
            }
        }

        function onDisconnect() {
            console.log('Disconnected from socket server');
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        if (user?.userId) {
            socket.connect();
        } else {
            socket.disconnect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.disconnect();
        };
    }, [socket, user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

