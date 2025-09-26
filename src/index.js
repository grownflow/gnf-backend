const { app, bgioServer} = require("./app");
const PORT = process.env.PORT || 4000;

// API routes for user management, leaderboards, etc
app.listen(PORT, () => {
  console.log(`Server at http://localhost:${PORT}`);
});

// Board game io server that powers Grow N' Flow
bgioServer.run(8000, () => {
  console.log(`Boardgame.io server at http://localhost:8000`);
})
