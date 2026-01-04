/**
 * Event emitter utility
 * Simple event emitter for game events
 */

type EventCallback = (...args: any[]) => void

class Emitter {
  private events: Map<string, EventCallback[]> = new Map()

  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  once(event: string, callback: EventCallback): void {
    const onceCallback = (...args: any[]) => {
      callback(...args)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }
}

export const emitter = new Emitter()


