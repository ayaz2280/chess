"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedEventEmitter = void 0;
const events_1 = require("events");
class TypedEventEmitter {
    emitter = new events_1.EventEmitter();
    on(eventName, listener) {
        this.emitter.on(eventName, listener);
    }
    off(eventName, listener) {
        this.emitter.off(eventName, listener);
    }
    emit(eventName, ...args) {
        this.emitter.emit(eventName, ...args);
    }
}
exports.TypedEventEmitter = TypedEventEmitter;
//# sourceMappingURL=TypedEventEmitter.js.map