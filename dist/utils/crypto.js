"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = hash;
const crypto = require("crypto");
function hash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
}
//# sourceMappingURL=crypto.js.map