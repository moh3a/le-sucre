type Listener = () => void;

interface NetworkStore {
  on_timeout: Listener | null;
  on_backend_unavailable: Listener | null;
  on_request_failed: Listener | null;
  on_reconnect: Listener | null;
  on_go_offline: Listener | null;
}

const store: NetworkStore = {
  on_timeout: null,
  on_backend_unavailable: null,
  on_request_failed: null,
  on_reconnect: null,
  on_go_offline: null,
};

export function set_network_listeners(listeners: Partial<NetworkStore>) {
  if (listeners.on_timeout !== undefined) store.on_timeout = listeners.on_timeout ?? null;
  if (listeners.on_backend_unavailable !== undefined)
    store.on_backend_unavailable = listeners.on_backend_unavailable ?? null;
  if (listeners.on_request_failed !== undefined)
    store.on_request_failed = listeners.on_request_failed ?? null;
  if (listeners.on_reconnect !== undefined) store.on_reconnect = listeners.on_reconnect ?? null;
  if (listeners.on_go_offline !== undefined) store.on_go_offline = listeners.on_go_offline ?? null;
}

export function emit_network_event(event: keyof NetworkStore) {
  store[event]?.();
}

export function get_network_listeners() {
  return { ...store };
}
