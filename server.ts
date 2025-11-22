import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import './models/User';
import './models/Ad';
import './models/Conversation';
import './models/Message';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        socket.on('send_message', (data) => {
            // Broadcast to everyone in the room INCLUDING sender (simplifies optimistic UI)
            // Or exclude sender if frontend handles it. Let's include for safety/sync.
            console.log('Broadcasting message to room:', data.conversation);
            io.to(data.conversation).emit('receive_message', data);
        });

        socket.on('delete_message', (data) => {
            console.log('Received delete_message event:', data);
            console.log('Broadcasting message deletion to room:', data.conversationId);
            console.log('Message ID to delete:', data.messageId);
            io.to(data.conversationId).emit('message_deleted', data.messageId);
            console.log('Broadcasted message_deleted event');
        });

        socket.on('messages_read', (data) => {
            console.log('Broadcasting messages read to room:', data.conversationId);
            io.to(data.conversationId).emit('messages_read', data);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
