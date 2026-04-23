(function initManagerFlotaSupabase(global) {
  const state = {
    status: "idle",
    config: null,
    client: null,
    error: null,
    ready: null
  };

  async function fetchRuntimeConfig() {
    const response = await fetch("/api/runtime-config", {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Runtime config request failed (${response.status}).`);
    }

    const payload = await response.json();
    return payload && payload.supabase ? payload.supabase : { enabled: false };
  }

  async function createClient() {
    if (state.client) {
      return state.client;
    }

    if (!state.ready) {
      state.ready = (async function bootstrap() {
        state.status = "loading";
        state.error = null;

        const config = await fetchRuntimeConfig();
        state.config = config;

        if (!config.enabled || !config.url || !config.anonKey) {
          state.status = "disabled";
          return null;
        }

        if (!global.supabase || typeof global.supabase.createClient !== "function") {
          throw new Error("Supabase browser library is not available.");
        }

        state.client = global.supabase.createClient(config.url, config.anonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          }
        });

        state.status = "ready";
        global.dispatchEvent(
          new CustomEvent("manager-flota:supabase-ready", {
            detail: {
              enabled: true,
              url: config.url
            }
          })
        );

        return state.client;
      })().catch((error) => {
        state.status = "error";
        state.error = error;
        console.warn("Supabase is not available yet.", error);
        return null;
      });
    }

    return state.ready;
  }

  global.ManagerFlotaSupabase = {
    state,
    init: createClient,
    getClient: createClient,
    async getConfig() {
      await createClient();
      return state.config;
    },
    isEnabled() {
      return Boolean(state.config && state.config.enabled);
    }
  };
})(window);
