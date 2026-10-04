// Not crypto.randomUUID: that only exists in secure contexts, and the dev server can be opened over plain HTTP on the network.
export function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
