/* abstract */ class SessionStore {
  findSession(id) {}
}

class InMemorySessionStore extends SessionStore {
  constructor() {
    super();
    this.sessions = new Map();
  }

  findSession(id) {
    return this.sessions.get(id);
  }

  saveSession(id, session) {
    this.sessions.set(id, session);
  }

  findAllSessions() {
    return [...this.sessions.values()];
  }
}

const SESSION_TTL = 24 * 60 * 60;
const CACHE_PREFIX_KEY = "";//"rtcapp_session_";

class RedisSessionStore extends SessionStore {

  constructor(redisClient) {
    super();
    this.redisClient = redisClient;
  }

  findSession(id) {
    const cacheKey = CACHE_PREFIX_KEY + id;
    return this.redisClient
      .get(cacheKey)
      .then(
        (sessionData) => {
          return (!sessionData) ? null : JSON.parse(sessionData);
        }
      );
  }
}
module.exports = {
  InMemorySessionStore,
  RedisSessionStore,
};
