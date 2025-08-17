CodeWeave 🚀
The ultimate collaborative tool for real-time code editing and project management.
Table of Contents
About The Project
Key Features
Getting Started
Prerequisites
Installation
Usage
Technology Stack
Contributing
Contact
Acknowledgments
About The Project
CodeWeave is a web-based collaborative development environment designed to help software teams write and review code together in real-time. In today's remote-first world, developers often struggle with disjointed tools for communication and coding. CodeWeave addresses this by providing a seamless, intuitive platform that combines a powerful code editor with integrated communication tools, all in one place.
Whether you're pair programming, conducting a technical interview, or teaching a coding class, CodeWeave weaves together every aspect of the collaborative coding experience.
Key Features
✨ Real-Time Collaboration: See changes from your teammates live, with multiple cursors and seamless synchronization.
🧩 Integrated Chat & Video: Communicate with your team via text or video chat directly within the editor. No need to switch between apps.
✅ Multi-Language Support: Enjoy robust syntax highlighting and support for dozens of programming languages out of the box.
🚀 Shared Terminal: Work in a shared terminal instance to run commands, install packages, and test your application together.
Getting Started
Follow these simple steps to get a local copy up and running.
Prerequisites
You will need the following software installed on your machine:
npm
npm install npm@latest -g



Node.js (v18.x or later)
TypeScript
npm install -g typescript


MongoDB (Ensure you have a running instance or a connection string from a service like MongoDB Atlas)
Installation
Clone the repo
git clone https://github.com/Prabhav0403/CodeWeave.git



Navigate to the project directory
cd CodeWeave



Install NPM packages
npm install



Set up environment variables
Create a .env file in the root directory and add your configuration:
# Example
PORT = 5000
MONGO_URI = 'YOUR_MONGODB_CONNECTION_STRING'
JWT_SECRET = 'YOUR_SECRET_KEY'



Build the TypeScript code
npm run build


Run the application
npm start



Usage
Once the application is running, open your browser and navigate to http://localhost:5000. You can start by creating a new project, which will generate a unique session URL. Share this URL with your collaborators to invite them to your real-time coding session.
Example Code Block:
// CodeWeave's editor is intuitive and requires no special setup.
// Just start typing in your language of choice.

function helloWorld(message: string): void {
  console.log(message);
}

helloWorld("Hello, collaborative world!");



Technology Stack
This project is built with a modern and robust tech stack:
Core Language: TypeScript
Frontend: React, Redux, Socket.IO Client
Backend: Node.js, Express.js, Socket.IO
Database: MongoDB with Mongoose
Styling: Tailwind CSS
Deployment: Render
Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.
If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Fork the Project
Create your Feature Branch (git checkout -b feature/AmazingFeature)
Commit your Changes (git commit -m 'Add some AmazingFeature')
Push to the Branch (git push origin feature/AmazingFeature)
Open a Pull Request
Contact
Prabhav - prabhavsrivastava0403@gmail.com
Project Link: https://github.com/Prabhav0403/CodeWeave
