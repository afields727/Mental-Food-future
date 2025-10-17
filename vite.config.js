import { defineConfig } from 'vite'

let plugins = []
try {
  // only include react plugin if available in this workspace
  // this keeps the config resilient for test runs where plugin is not installed
  // eslint-disable-next-line no-undef
  const maybe = await import('@vitejs/plugin-react').then(m=>m.default)
  if (maybe) plugins.push(maybe())
} catch(e) {
  // ignore - plugin not installed in test environment
}

// https://vite.dev/config/
export default defineConfig({
  plugins
})
