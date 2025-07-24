import { EventEmitter } from 'events';

export class TypedEventEmitter<T extends Record<string, (...args: any[]) => void>> {
  private emitter = new EventEmitter();

  on<K extends keyof T>(eventName: K, listener: T[K]) {
    this.emitter.on(eventName as string, listener);
  }

  off<K extends keyof T>(eventName: K, listener: T[K]): void {
    this.emitter.off(eventName as string, listener);
  }

  emit<K extends keyof T>(eventName: K, ...args: Parameters<T[K]>): void {
    this.emitter.emit(eventName as string, ...args);
  }
}