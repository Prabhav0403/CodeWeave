import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// The 'uuid' library is no longer needed for this approach.

// Assuming these are your existing landing page components
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import CTA from "@/components/landing/CTA";

const Index = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  // --- MODIFIED: Function to generate a short, random ID ---
  const generateShortId = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const handleCreateRoom = () => {
    if (!username.trim()) {
      alert("Please enter your name.");
      return;
    }
    const newRoomId = generateShortId(); // Use the new function
    navigate(`/editor/${newRoomId}`, { state: { username } });
  };
  
  const handleJoinRoom = () => {
    if (!roomId.trim() || !username.trim()) {
      alert("Please enter your name and a Room ID.");
      return;
    }
    navigate(`/editor/${roomId}`, { state: { username } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="text-center py-10">
        <div className="bg-glass/30 p-8 rounded-xl max-w-md mx-auto border border-glass-border shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Join or Create a Session</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Enter 6-character Room ID to join"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full bg-background/50 border border-input rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
            <button
              onClick={handleJoinRoom}
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Join Session
            </button>
            <button
              onClick={handleCreateRoom}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Create New Session
            </button>
          </div>
        </div>
      </div>
      <Hero />
      <Features />
      <CTA />
    </div>
  );
};

export default Index;
