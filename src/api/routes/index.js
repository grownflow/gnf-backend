const express = require("express");
const { MatchHandler } = require("../matchHandler");
const router = express.Router();

// Game match endpoints
router.post("/games/:gameName/create", (req, res) => {
  try {
    const result = MatchHandler.create();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/games/:gameName/:matchID", (req, res) => {
  try {
    const match = MatchHandler.getMatch(req.params.matchID);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    res.json({ G: match.G, ctx: match.ctx });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/games/:gameName/:matchID/move", (req, res) => {
  try {
    const { move, args, playerID } = req.body;
    const result = MatchHandler.makeMove(req.params.matchID, move, args || [], playerID || "0");
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Health check for API
router.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

module.exports = router;