"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SimpleDocumentStore", {
    enumerable: true,
    get: function() {
        return _SimpleDocumentStore.SimpleDocumentStore;
    }
});
_export_star(require("@llamaindex/core/storage/chat-store"), exports);
_export_star(require("@llamaindex/core/storage/doc-store"), exports);
_export_star(require("@llamaindex/core/storage/index-store"), exports);
_export_star(require("@llamaindex/core/storage/kv-store"), exports);
const _SimpleDocumentStore = require("./docStore/SimpleDocumentStore.js");
_export_star(require("./FileSystem.js"), exports);
_export_star(require("./StorageContext.js"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}
