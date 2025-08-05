const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const connectionString = "mongodb+srv://prabhavsrivastava0403:iaeM2l51Vpr545S8@clustercw.5wp1nge.mongodb.net/?retryWrites=true&w=majority&appName=ClusterCW";

const app = express();
const server = http.createServer(app);

// --- CRITICAL FIX for DEPLOYMENT ---
// This tells our server to allow connections from our live frontend URL.
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://codeweave-c5y0.onrender.com"], // Allow both local and deployed frontend
    methods: ["GET", "POST"]
  }
});
// ------------------------------------

const userColors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#ff8a5c', '#6a7dff'];

const client = new MongoClient(connectionString);
let roomsCollection;

async function connectToDb() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");
    const db = client.db("codeweave_db");
    roomsCollection = db.collection("rooms");
  } catch (err) {
    throw err;
  }
}

io.on('connection', (socket) => {
  socket.on('joinRoom', async (roomId, username = 'Anonymous') => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;
    
    let room = await roomsCollection.findOne({ _id: roomId });
    if (!room) {
      room = { _id: roomId, files: [], code: {}, users: {} };
      await roomsCollection.insertOne(room);
      console.log(`Room ${roomId} created in database.`);
    }
    
    socket.data.color = userColors[Object.keys(room.users || {}).length % userColors.length];
    
    if (!room.users) {
        room.users = {};
    }
    room.users[socket.id] = username;
    
    await roomsCollection.updateOne({ _id: roomId }, { $set: { users: room.users } });
    
    socket.emit('updateFiles', room.files);
    io.in(roomId).emit('updateUserList', Object.values(room.users));
  });

  socket.on('filesChange', async (newFileStructure) => {
    const { roomId } = socket.data;
    if(roomId) {
        await roomsCollection.updateOne({ _id: roomId }, { $set: { files: newFileStructure } });
        io.in(roomId).emit('updateFiles', newFileStructure);
    }
  });

  socket.on('codeChange', async ({ filePath, newCode }) => {
    const { roomId } = socket.data;
    if (roomId) {
        const safeFilePath = filePath.replace(/\./g, '_');
        await roomsCollection.updateOne({ _id: roomId }, { $set: { [`code.${safeFilePath}`]: newCode } });
        socket.to(roomId).emit('codeUpdate', { filePath, newCode });
    }
  });

  socket.on('getCode', async (filePath) => {
    const { roomId } = socket.data;
    if (roomId) {
      const room = await roomsCollection.findOne({ _id: roomId });
      const safeFilePath = filePath.replace(/\./g, '_');
      const code = room?.code?.[safeFilePath] || `// Welcome to ${filePath}\n`;
      socket.emit('codeUpdate', { filePath, newCode: code });
    }
  });
  
  socket.on('cursorChange', (cursorData) => {
    const { roomId, username, color } = socket.data;
    if (roomId) {
      socket.to(roomId).emit('updateCursors', { ...cursorData, userId: socket.id, userName: username, color: color });
    }
  });

  socket.on('terminalCommand', (data) => {
    const { roomId } = socket.data;
    if (roomId) {
      io.in(roomId).emit('terminalUpdate', data);
    }
  });

  socket.on('runCode', ({ code, language, filePath }) => {
    const { roomId } = socket.data;
    if (!roomId) return;

    const lang = language.toLowerCase();

    if (lang === 'javascript') {
      let output = '';
      const originalLog = console.log;
      try {
        console.log = (...args) => {
          output += args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ') + '\n';
        };
        eval(code);
        console.log = originalLog;
        const response = output.trim() || 'Execution finished.';
        io.in(roomId).emit('terminalUpdate', { type: 'output', content: response, filePath });
      } catch (error) {
        console.log = originalLog;
        io.in(roomId).emit('terminalUpdate', { type: 'error', content: error.message, filePath });
      }
    } else if (lang === 'java') {
        const classNameMatch = code.match(/public\s+class\s+([a-zA-Z0-9_]+)/);
        if (!classNameMatch) {
            io.in(roomId).emit('terminalUpdate', { type: 'error', content: "Error: No public class found.", filePath });
            return;
        }
        const className = classNameMatch[1];
        const fileName = `${className}.java`;
        
        const tempDir = path.join(__dirname, 'temp', uuidv4());
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const filePathJava = path.join(tempDir, fileName);

        fs.writeFileSync(filePathJava, code);

        exec(`javac ${filePathJava}`, (compileError, stdout, stderr) => {
            if (compileError || stderr) {
                io.in(roomId).emit('terminalUpdate', { type: 'error', content: stderr || compileError.message, filePath });
                fs.rmSync(tempDir, { recursive: true, force: true });
                return;
            }

            exec(`java -cp ${tempDir} ${className}`, (runError, stdout, stderr) => {
                if (runError || stderr) {
                    io.in(roomId).emit('terminalUpdate', { type: 'error', content: stderr || runError.message, filePath });
                } else {
                    io.in(roomId).emit('terminalUpdate', { type: 'output', content: stdout, filePath });
                }
                fs.rmSync(tempDir, { recursive: true, force: true });
            });
        });

    } else {
      io.in(roomId).emit('terminalUpdate', { type: 'output', content: `Execution for "${language}" is not supported.`, filePath });
    }
  });

  socket.on('disconnect', async () => {
    const { roomId } = socket.data;
    if (roomId) {
      const room = await roomsCollection.findOne({ _id: roomId });
      if (room && room.users && room.users[socket.id]) {
        delete room.users[socket.id];
        await roomsCollection.updateOne({ _id: roomId }, { $set: { users: room.users } });
        io.in(roomId).emit('updateUserList', Object.values(room.users));
      }
    }
  });
});

const PORT = 3001;
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

connectToDb().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Backend server running on http://localhost:${PORT}`);
  });
});
