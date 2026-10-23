import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

// localStorage keys
const GUEST_ID_KEY = 'zb_guest_id';
const PLAYER_TOKEN_KEY = 'zb_player_token';
const PLAYER_KEY = 'zb_player';

export function getGuestId() {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = 'g-' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

export function getPlayerToken() {
  return localStorage.getItem(PLAYER_TOKEN_KEY);
}

export function setPlayerSession(token, player) {
  localStorage.setItem(PLAYER_TOKEN_KEY, token);
  localStorage.setItem(PLAYER_KEY, JSON.stringify(player));
}

export function getPlayer() {
  try {
    const raw = localStorage.getItem(PLAYER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutPlayer() {
  localStorage.removeItem(PLAYER_TOKEN_KEY);
  localStorage.removeItem(PLAYER_KEY);
}

function authHeaders() {
  const t = getPlayerToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function submitGameEvent({ game_id, score, won = false, duration_ms = 0, player_name }) {
  const body = { game_id, score, won, duration_ms };
  if (!getPlayerToken()) {
    body.guest_id = getGuestId();
    if (player_name) body.player_name = player_name;
  }
  const { data } = await axios.post(`${API}/api/player/event`, body, { headers: authHeaders() });
  return data;
}

export async function fetchProgress() {
  const params = !getPlayerToken() ? { guest_id: getGuestId() } : {};
  const { data } = await axios.get(`${API}/api/player/progress`, {
    headers: authHeaders(),
    params,
  });
  return data;
}

export async function registerPlayer({ email, password, name }) {
  const body = { email, password, name };
  if (!getPlayerToken()) body.guest_id = getGuestId();
  const { data } = await axios.post(`${API}/api/player/register`, body);
  setPlayerSession(data.access_token, data.player);
  return data;
}

export async function loginPlayer({ email, password }) {
  const { data } = await axios.post(`${API}/api/player/login`, { email, password });
  setPlayerSession(data.access_token, data.player);
  return data;
}

export async function redeemReward({ achievement_key, email, name, phone, company, message }) {
  const body = { achievement_key, email, name, phone, company, message };
  const params = !getPlayerToken() ? `?guest_id=${encodeURIComponent(getGuestId())}` : '';
  const { data } = await axios.post(`${API}/api/player/redeem-reward${params}`, body, {
    headers: authHeaders(),
  });
  return data;
}

export async function fetchGlobalLeaderboard(limit = 20) {
  const { data } = await axios.get(`${API}/api/games/leaderboard`, { params: { limit } });
  return data;
}
