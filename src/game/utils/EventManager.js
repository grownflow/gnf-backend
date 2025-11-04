// Event Manager - handles triggering and managing game events
const { EVENTS, EVENT_TYPES } = require('../data/events');

class EventManager {
  /**
   * Check if a random event should trigger this turn
   * @param {Object} G - Game state
   * @returns {Object|null} Event that triggered, or null
   */
  static checkForRandomEvent(G) {
    // Don't trigger new events if one is already active
    if (G.activeEvent && G.activeEvent.turnsRemaining > 0) {
      return null;
    }

    // Roll for each possible event
    const eventKeys = Object.keys(EVENTS);
    for (const key of eventKeys) {
      const event = EVENTS[key];
      if (Math.random() < event.probability) {
        return this.triggerEvent(G, event.id);
      }
    }

    return null;
  }

  /**
   * Manually trigger a specific event
   * @param {Object} G - Game state
   * @param {string} eventId - ID of event to trigger
   * @returns {Object} Triggered event with turn info
   */
  static triggerEvent(G, eventId) {
    const event = EVENTS[eventId];
    if (!event) {
      throw new Error(`Unknown event: ${eventId}`);
    }

    G.activeEvent = {
      ...event,
      turnsRemaining: event.duration,
      triggeredAt: G.gameTime
    };

    // Initialize event history if needed
    if (!G.eventHistory) {
      G.eventHistory = [];
    }

    G.eventHistory.push({
      eventId: event.id,
      triggeredAt: G.gameTime,
      duration: event.duration
    });

    return G.activeEvent;
  }

  /**
   * Apply active event effects to game state
   * Called each turn to enforce event consequences
   * @param {Object} G - Game state
   */
  static applyEventEffects(G) {
    if (!G.activeEvent || G.activeEvent.turnsRemaining <= 0) {
      // Clear effects if no active event
      if (G.eventEffects) {
        G.eventEffects = {};
      }
      return;
    }

    const event = G.activeEvent;
    const effects = event.effects;

    // Initialize effects object
    if (!G.eventEffects) {
      G.eventEffects = {};
    }

    // Apply technical effects
    if (event.type === EVENT_TYPES.TECHNICAL) {
      if (effects.lightsDisabled !== undefined) {
        G.eventEffects.lightsDisabled = effects.lightsDisabled;
      }
    }

    // Apply social/economic effects
    if (event.type === EVENT_TYPES.SOCIAL) {
      if (effects.transportCost !== undefined) {
        G.eventEffects.transportCost = effects.transportCost;
      }
    }
  }

  /**
   * Progress active event by one turn
   * @param {Object} G - Game state
   */
  static progressEvent(G) {
    if (!G.activeEvent) {
      return;
    }

    G.activeEvent.turnsRemaining -= 1;

    // Event expired - clean up
    if (G.activeEvent.turnsRemaining <= 0) {
      G.activeEvent = null;
      G.eventEffects = {};
    }
  }

  /**
   * Get current event status for display
   * @param {Object} G - Game state
   * @returns {Object|null} Current event info or null
   */
  static getCurrentEvent(G) {
    if (!G.activeEvent || G.activeEvent.turnsRemaining <= 0) {
      return null;
    }

    return {
      name: G.activeEvent.name,
      description: G.activeEvent.description,
      cause: G.activeEvent.cause,
      turnsRemaining: G.activeEvent.turnsRemaining,
      type: G.activeEvent.type,
      severity: G.activeEvent.severity
    };
  }
}

module.exports = { EventManager };
