define(["@grafana/data","@grafana/ui","lodash","react"], (__WEBPACK_EXTERNAL_MODULE__grafana_data__, __WEBPACK_EXTERNAL_MODULE__grafana_ui__, __WEBPACK_EXTERNAL_MODULE_lodash__, __WEBPACK_EXTERNAL_MODULE_react__) => { return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../node_modules/arangojs/analyzer.js":
/*!********************************************!*\
  !*** ../node_modules/arangojs/analyzer.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Analyzer = exports.isArangoAnalyzer = void 0;
const error_1 = __webpack_require__(/*! ./error */ "../node_modules/arangojs/error.js");
const codes_1 = __webpack_require__(/*! ./lib/codes */ "../node_modules/arangojs/lib/codes.js");
/**
 * Indicates whether the given value represents an {@link Analyzer}.
 *
 * @param analyzer - A value that might be an Analyzer.
 */
function isArangoAnalyzer(analyzer) {
    return Boolean(analyzer && analyzer.isArangoAnalyzer);
}
exports.isArangoAnalyzer = isArangoAnalyzer;
/**
 * Represents an Analyzer in a {@link database.Database}.
 */
class Analyzer {
    /**
     * @internal
     */
    constructor(db, name) {
        this._db = db;
        this._name = name.normalize("NFC");
    }
    /**
     * @internal
     *
     * Indicates that this object represents an ArangoDB Analyzer.
     */
    get isArangoAnalyzer() {
        return true;
    }
    /**
     * Name of this Analyzer.
     *
     * See also {@link database.Database}.
     */
    get name() {
        return this._name;
    }
    /**
     * Checks whether the Analyzer exists.
     *
     * @example
     * ```js
     * const db = new Database();
     * const analyzer = db.analyzer("some-analyzer");
     * const result = await analyzer.exists();
     * // result indicates whether the Analyzer exists
     * ```
     */
    async exists() {
        try {
            await this.get();
            return true;
        }
        catch (err) {
            if ((0, error_1.isArangoError)(err) && err.errorNum === codes_1.ANALYZER_NOT_FOUND) {
                return false;
            }
            throw err;
        }
    }
    /**
     * Retrieves the Analyzer definition for the Analyzer.
     *
     * @example
     * ```js
     * const db = new Database();
     * const analyzer = db.analyzer("some-analyzer");
     * const definition = await analyzer.get();
     * // definition contains the Analyzer definition
     * ```
     */
    get() {
        return this._db.request({
            path: `/_api/analyzer/${encodeURIComponent(this._name)}`,
        });
    }
    /**
     * Creates a new Analyzer with the given `options` and the instance's name.
     *
     * See also {@link database.Database#createAnalyzer}.
     *
     * @param options - Options for creating the Analyzer.
     *
     * @example
     * ```js
     * const db = new Database();
     * const analyzer = db.analyzer("potatoes");
     * await analyzer.create({ type: "identity" });
     * // the identity Analyzer "potatoes" now exists
     * ```
     */
    create(options) {
        return this._db.request({
            method: "POST",
            path: "/_api/analyzer",
            body: { name: this._name, ...options },
        });
    }
    /**
     * Deletes the Analyzer from the database.
     *
     * @param force - Whether the Analyzer should still be deleted even if it
     * is currently in use.
     *
     * @example
     * ```js
     * const db = new Database();
     * const analyzer = db.analyzer("some-analyzer");
     * await analyzer.drop();
     * // the Analyzer "some-analyzer" no longer exists
     * ```
     */
    drop(force = false) {
        return this._db.request({
            method: "DELETE",
            path: `/_api/analyzer/${encodeURIComponent(this._name)}`,
            qs: { force },
        });
    }
}
exports.Analyzer = Analyzer;
//# sourceMappingURL=analyzer.js.map

/***/ }),

/***/ "../node_modules/arangojs/aql.js":
/*!***************************************!*\
  !*** ../node_modules/arangojs/aql.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.join = exports.literal = exports.aql = exports.isAqlLiteral = exports.isGeneratedAqlQuery = exports.isAqlQuery = void 0;
/**
 * ```js
 * import { aql } from "arangojs/aql";
 * ```
 *
 * The "aql" module provides the {@link aql} template string handler and
 * helper functions, as well as associated types and interfaces for TypeScript.
 *
 * The aql function and namespace is also re-exported by the "index" module.
 *
 * @packageDocumentation
 */
const analyzer_1 = __webpack_require__(/*! ./analyzer */ "../node_modules/arangojs/analyzer.js");
const collection_1 = __webpack_require__(/*! ./collection */ "../node_modules/arangojs/collection.js");
const graph_1 = __webpack_require__(/*! ./graph */ "../node_modules/arangojs/graph.js");
const view_1 = __webpack_require__(/*! ./view */ "../node_modules/arangojs/view.js");
/**
 * Indicates whether the given value is an {@link AqlQuery}.
 *
 * @param query - A value that might be an `AqlQuery`.
 */
function isAqlQuery(query) {
    return Boolean(query && typeof query.query === "string" && query.bindVars);
}
exports.isAqlQuery = isAqlQuery;
/**
 * Indicates whether the given value is a {@link GeneratedAqlQuery}.
 *
 * @param query - A value that might be a `GeneratedAqlQuery`.
 *
 * @internal
 */
function isGeneratedAqlQuery(query) {
    return isAqlQuery(query) && typeof query._source === "function";
}
exports.isGeneratedAqlQuery = isGeneratedAqlQuery;
/**
 * Indicates whether the given value is an {@link AqlLiteral}.
 *
 * @param literal - A value that might be an `AqlLiteral`.
 */
function isAqlLiteral(literal) {
    return Boolean(literal && typeof literal.toAQL === "function");
}
exports.isAqlLiteral = isAqlLiteral;
/**
 * Template string handler (template tag) for AQL queries.
 *
 * The `aql` tag can be used to write complex AQL queries as multi-line strings
 * without having to worry about `bindVars` and the distinction between
 * collections and regular parameters.
 *
 * Tagged template strings will return an {@link AqlQuery} object with
 * `query` and `bindVars` attributes reflecting any interpolated values.
 *
 * Any {@link collection.ArangoCollection} instance used in a query string will
 * be recognized as a collection reference and generate an AQL collection bind
 * parameter instead of a regular AQL value bind parameter.
 *
 * **Note**: you should always use the `aql` template tag when writing
 * dynamic AQL queries instead of using untagged (normal) template strings.
 * Untagged template strings will inline any interpolated values and return
 * a plain string as result. The `aql` template tag will only inline references
 * to the interpolated values and produce an AQL query object containing both
 * the query and the values. This prevents most injection attacks when using
 * untrusted values in dynamic queries.
 *
 * @example
 * ```js
 * // Some user-supplied string that may be malicious
 * const untrustedValue = req.body.email;
 *
 * // Without aql tag: BAD! DO NOT DO THIS!
 * const badQuery = `
 *   FOR user IN users
 *   FILTER user.email == "${untrustedValue}"
 *   RETURN user
 * `;
 * // e.g. if untrustedValue is '" || user.admin == true || "':
 * // Query:
 * //   FOR user IN users
 * //   FILTER user.email == "" || user.admin == true || ""
 * //   RETURN user
 *
 * // With the aql tag: GOOD! MUCH SAFER!
 * const betterQuery = aql`
 *   FOR user IN users
 *   FILTER user.email == ${untrustedValue}
 *   RETURN user
 * `;
 * // Query:
 * //   FOR user IN users
 * //   FILTER user.email == @value0
 * //   RETURN user
 * // Bind parameters:
 * //   value0 -> untrustedValue
 * ```
 *
 * @example
 * ```js
 * const collection = db.collection("some-collection");
 * const minValue = 23;
 * const result = await db.query(aql`
 *   FOR d IN ${collection}
 *   FILTER d.num > ${minValue}
 *   RETURN d
 * `);
 *
 * // Equivalent raw query object
 * const result2 = await db.query({
 *   query: `
 *     FOR d IN @@collection
 *     FILTER d.num > @minValue
 *     RETURN d
 *   `,
 *   bindVars: {
 *     "@collection": collection.name,
 *     minValue: minValue
 *   }
 * });
 * ```
 *
 * @example
 * ```js
 * const collection = db.collection("some-collection");
 * const color = "green";
 * const filter = aql`FILTER d.color == ${color}'`;
 * const result = await db.query(aql`
 *   FOR d IN ${collection}
 *   ${filter}
 *   RETURN d
 * `);
 * ```
 */
function aql(templateStrings, ...args) {
    const strings = [...templateStrings];
    const bindVars = {};
    const bindValues = [];
    let query = strings[0];
    for (let i = 0; i < args.length; i++) {
        const rawValue = args[i];
        let value = rawValue;
        if (isGeneratedAqlQuery(rawValue)) {
            const src = rawValue._source();
            if (src.args.length) {
                query += src.strings[0];
                args.splice(i, 1, ...src.args);
                strings.splice(i, 2, strings[i] + src.strings[0], ...src.strings.slice(1, src.args.length), src.strings[src.args.length] + strings[i + 1]);
            }
            else {
                query += rawValue.query + strings[i + 1];
                args.splice(i, 1);
                strings.splice(i, 2, strings[i] + rawValue.query + strings[i + 1]);
            }
            i -= 1;
            continue;
        }
        if (rawValue === undefined) {
            query += strings[i + 1];
            continue;
        }
        if (isAqlLiteral(rawValue)) {
            query += `${rawValue.toAQL()}${strings[i + 1]}`;
            continue;
        }
        const index = bindValues.indexOf(rawValue);
        const isKnown = index !== -1;
        let name = `value${isKnown ? index : bindValues.length}`;
        if ((0, collection_1.isArangoCollection)(rawValue) ||
            (0, graph_1.isArangoGraph)(rawValue) ||
            (0, view_1.isArangoView)(rawValue) ||
            (0, analyzer_1.isArangoAnalyzer)(rawValue)) {
            name = `@${name}`;
            value = rawValue.name;
        }
        if (!isKnown) {
            bindValues.push(rawValue);
            bindVars[name] = value;
        }
        query += `@${name}${strings[i + 1]}`;
    }
    return {
        query,
        bindVars,
        _source: () => ({ strings, args }),
    };
}
exports.aql = aql;
/**
 * Marks an arbitrary scalar value (i.e. a string, number or boolean) as
 * safe for being inlined directly into AQL queries when used in an `aql`
 * template string, rather than being converted into a bind parameter.
 *
 * **Note**: Nesting `aql` template strings is a much safer alternative for
 * most use cases. This low-level helper function only exists to help with
 * rare edge cases where a trusted AQL query fragment must be read from a
 * string (e.g. when reading query fragments from JSON) and should only be
 * used as a last resort.
 *
 * @example
 * ```js
 * // BAD! DO NOT DO THIS!
 * const sortDirection = literal('ASC');
 *
 * // GOOD! DO THIS INSTEAD!
 * const sortDirection = aql`ASC`;
 * ```
 *
 * @example
 * ```js
 * // BAD! DO NOT DO THIS!
 * const filterColor = literal('FILTER d.color == "green"');
 * const result = await db.query(aql`
 *   FOR d IN some-collection
 *   ${filterColor}
 *   RETURN d
 * `);
 *
 * // GOOD! DO THIS INSTEAD!
 * const color = "green";
 * const filterColor = aql`FILTER d.color === ${color}`;
 * const result = await db.query(aql`
 *   FOR d IN some-collection
 *   ${filterColor}
 *   RETURN d
 * `);
 * ```
 *
 * @example
 * ```js
 * // WARNING: We explicitly trust the environment variable to be safe!
 * const filter = literal(process.env.FILTER_STATEMENT);
 * const users = await db.query(aql`
 *   FOR user IN users
 *   ${filter}
 *   RETURN user
 * `);
 * ```
 */
function literal(value) {
    if (isAqlLiteral(value)) {
        return value;
    }
    return {
        toAQL() {
            if (value === undefined) {
                return "";
            }
            return String(value);
        },
    };
}
exports.literal = literal;
/**
 * Constructs {@link AqlQuery} objects from an array of arbitrary values.
 *
 * **Note**: Nesting `aql` template strings is a much safer alternative
 * for most use cases. This low-level helper function only exists to
 * complement the `aql` tag when constructing complex queries from dynamic
 * arrays of query fragments.
 *
 * @param values - Array of values to join. These values will behave exactly
 * like values interpolated in an `aql` template string.
 * @param sep - Seperator to insert between values. This value will behave
 * exactly like a value passed to {@link literal}, i.e. it will be
 * inlined as-is, rather than being converted into a bind parameter.
 *
 * @example
 * ```js
 * const users = db.collection("users");
 * const filters = [];
 * if (adminsOnly) filters.push(aql`FILTER user.admin`);
 * if (activeOnly) filters.push(aql`FILTER user.active`);
 * const result = await db.query(aql`
 *   FOR user IN ${users}
 *   ${join(filters)}
 *   RETURN user
 * `);
 * ```
 *
 * @example
 * ```js
 * const users = db.collection("users");
 * const keys = ["jreyes", "ghermann"];
 *
 * // BAD! NEEDLESSLY COMPLEX!
 * const docs = keys.map(key => aql`DOCUMENT(${users}, ${key}`));
 * const result = await db.query(aql`
 *   FOR user IN [
 *     ${join(docs, ", ")}
 *   ]
 *   RETURN user
 * `);
 * // Query:
 * //   FOR user IN [
 * //     DOCUMENT(@@value0, @value1), DOCUMENT(@@value0, @value2)
 * //   ]
 * //   RETURN user
 * // Bind parameters:
 * //   @value0 -> "users"
 * //   value1 -> "jreyes"
 * //   value2 -> "ghermann"
 *
 * // GOOD! MUCH SIMPLER!
 * const result = await db.query(aql`
 *   FOR key IN ${keys}
 *   LET user = DOCUMENT(${users}, key)
 *   RETURN user
 * `);
 * // Query:
 * //   FOR user IN @value0
 * //   LET user = DOCUMENT(@@value1, key)
 * //   RETURN user
 * // Bind parameters:
 * //   value0 -> ["jreyes", "ghermann"]
 * //   @value1 -> "users"
 * ```
 */
function join(values, sep = " ") {
    if (!values.length) {
        return aql ``;
    }
    if (values.length === 1) {
        return aql `${values[0]}`;
    }
    return aql(["", ...Array(values.length - 1).fill(sep), ""], ...values);
}
exports.join = join;
//# sourceMappingURL=aql.js.map

/***/ }),

/***/ "../node_modules/arangojs/collection.js":
/*!**********************************************!*\
  !*** ../node_modules/arangojs/collection.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Collection = exports.CollectionStatus = exports.CollectionType = exports.collectionToString = exports.isArangoCollection = void 0;
/**
 * ```ts
 * import type {
 *   DocumentCollection,
 *   EdgeCollection,
 * } from "arangojs/collection";
 * ```
 *
 * The "collection" module provides collection related types and interfaces
 * for TypeScript.
 *
 * @packageDocumentation
 */
const aql_1 = __webpack_require__(/*! ./aql */ "../node_modules/arangojs/aql.js");
const cursor_1 = __webpack_require__(/*! ./cursor */ "../node_modules/arangojs/cursor.js");
const documents_1 = __webpack_require__(/*! ./documents */ "../node_modules/arangojs/documents.js");
const error_1 = __webpack_require__(/*! ./error */ "../node_modules/arangojs/error.js");
const indexes_1 = __webpack_require__(/*! ./indexes */ "../node_modules/arangojs/indexes.js");
const codes_1 = __webpack_require__(/*! ./lib/codes */ "../node_modules/arangojs/lib/codes.js");
/**
 * Indicates whether the given value represents an {@link ArangoCollection}.
 *
 * @param collection - A value that might be a collection.
 */
function isArangoCollection(collection) {
    return Boolean(collection && collection.isArangoCollection);
}
exports.isArangoCollection = isArangoCollection;
/**
 * Coerces the given collection name or {@link ArangoCollection} object to
 * a string representing the collection name.
 *
 * @param collection - Collection name or {@link ArangoCollection} object.
 */
function collectionToString(collection) {
    if (isArangoCollection(collection)) {
        return String(collection.name);
    }
    else
        return String(collection).normalize("NFC");
}
exports.collectionToString = collectionToString;
/**
 * Integer values indicating the collection type.
 */
var CollectionType;
(function (CollectionType) {
    CollectionType[CollectionType["DOCUMENT_COLLECTION"] = 2] = "DOCUMENT_COLLECTION";
    CollectionType[CollectionType["EDGE_COLLECTION"] = 3] = "EDGE_COLLECTION";
})(CollectionType = exports.CollectionType || (exports.CollectionType = {}));
/**
 * Integer values indicating the collection loading status.
 */
var CollectionStatus;
(function (CollectionStatus) {
    CollectionStatus[CollectionStatus["NEWBORN"] = 1] = "NEWBORN";
    CollectionStatus[CollectionStatus["UNLOADED"] = 2] = "UNLOADED";
    CollectionStatus[CollectionStatus["LOADED"] = 3] = "LOADED";
    CollectionStatus[CollectionStatus["UNLOADING"] = 4] = "UNLOADING";
    CollectionStatus[CollectionStatus["DELETED"] = 5] = "DELETED";
    CollectionStatus[CollectionStatus["LOADING"] = 6] = "LOADING";
})(CollectionStatus = exports.CollectionStatus || (exports.CollectionStatus = {}));
/**
 * @internal
 */
class Collection {
    //#endregion
    /**
     * @internal
     */
    constructor(db, name) {
        this._name = name.normalize("NFC");
        this._db = db;
    }
    //#region metadata
    get isArangoCollection() {
        return true;
    }
    get name() {
        return this._name;
    }
    get() {
        return this._db.request({
            path: `/_api/collection/${encodeURIComponent(this._name)}`,
        });
    }
    async exists() {
        try {
            await this.get();
            return true;
        }
        catch (err) {
            if ((0, error_1.isArangoError)(err) && err.errorNum === codes_1.COLLECTION_NOT_FOUND) {
                return false;
            }
            throw err;
        }
    }
    create(options = {}) {
        const { waitForSyncReplication = undefined, enforceReplicationFactor = undefined, ...opts } = options;
        if (opts.computedValues) {
            opts.computedValues = opts.computedValues.map((computedValue) => {
                if ((0, aql_1.isAqlLiteral)(computedValue.expression)) {
                    return {
                        ...computedValue,
                        expression: computedValue.expression.toAQL(),
                    };
                }
                if ((0, aql_1.isAqlQuery)(computedValue.expression)) {
                    return {
                        ...computedValue,
                        expression: computedValue.expression.query,
                    };
                }
                return computedValue;
            });
        }
        const qs = {};
        if (typeof waitForSyncReplication === "boolean") {
            qs.waitForSyncReplication = waitForSyncReplication ? 1 : 0;
        }
        if (typeof enforceReplicationFactor === "boolean") {
            qs.enforceReplicationFactor = enforceReplicationFactor ? 1 : 0;
        }
        return this._db.request({
            method: "POST",
            path: "/_api/collection",
            qs,
            body: {
                ...opts,
                name: this._name,
            },
        });
    }
    properties(properties) {
        if (!properties) {
            return this._db.request({
                path: `/_api/collection/${encodeURIComponent(this._name)}/properties`,
            });
        }
        return this._db.request({
            method: "PUT",
            path: `/_api/collection/${encodeURIComponent(this._name)}/properties`,
            body: properties,
        });
    }
    count() {
        return this._db.request({
            path: `/_api/collection/${encodeURIComponent(this._name)}/count`,
        });
    }
    async recalculateCount() {
        return this._db.request({
            method: "PUT",
            path: `/_api/collection/${encodeURIComponent(this._name)}/recalculateCount`,
        }, (res) => res.body.result);
    }
    figures(details = false) {
        return this._db.request({
            path: `/_api/collection/${encodeURIComponent(this._name)}/figures`,
            qs: { details },
        });
    }
    revision() {
        return this._db.request({
            path: `/_api/collection/${encodeURIComponent(this._name)}/revision`,
        });
    }
    checksum(options) {
        return this._db.request({
            path: `/_api/collection/${encodeURIComponent(this._name)}/checksum`,
            qs: options,
        });
    }
    async loadIndexes() {
        return this._db.request({
            method: "PUT",
            path: `/_api/collection/${encodeURIComponent(this._name)}/loadIndexesIntoMemory`,
        }, (res) => res.body.result);
    }
    async rename(newName) {
        const result = await this._db.renameCollection(this._name, newName);
        this._name = newName.normalize("NFC");
        return result;
    }
    truncate() {
        return this._db.request({
            method: "PUT",
            path: `/_api/collection/${this._name}/truncate`,
        });
    }
    drop(options) {
        return this._db.request({
            method: "DELETE",
            path: `/_api/collection/${encodeURIComponent(this._name)}`,
            qs: options,
        });
    }
    //#endregion
    //#region crud
    getResponsibleShard(document) {
        return this._db.request({
            method: "PUT",
            path: `/_api/collection/${encodeURIComponent(this._name)}/responsibleShard`,
            body: document,
        }, (res) => res.body.shardId);
    }
    documentId(selector) {
        return (0, documents_1._documentHandle)(selector, this._name);
    }
    async documentExists(selector, options = {}) {
        const { ifMatch = undefined, ifNoneMatch = undefined } = options;
        const headers = {};
        if (ifMatch)
            headers["if-match"] = ifMatch;
        if (ifNoneMatch)
            headers["if-none-match"] = ifNoneMatch;
        try {
            return await this._db.request({
                method: "HEAD",
                path: `/_api/document/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
                headers,
            }, (res) => {
                if (ifNoneMatch && res.statusCode === 304) {
                    throw new error_1.HttpError(res);
                }
                return true;
            });
        }
        catch (err) {
            if (err.code === 404) {
                return false;
            }
            throw err;
        }
    }
    documents(selectors, options = {}) {
        const { allowDirtyRead = undefined } = options;
        return this._db.request({
            method: "PUT",
            path: `/_api/document/${encodeURIComponent(this._name)}`,
            qs: { onlyget: true },
            allowDirtyRead,
            body: selectors,
        });
    }
    async document(selector, options = {}) {
        if (typeof options === "boolean") {
            options = { graceful: options };
        }
        const { allowDirtyRead = undefined, graceful = false, ifMatch = undefined, ifNoneMatch = undefined, } = options;
        const headers = {};
        if (ifMatch)
            headers["if-match"] = ifMatch;
        if (ifNoneMatch)
            headers["if-none-match"] = ifNoneMatch;
        const result = this._db.request({
            path: `/_api/document/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            headers,
            allowDirtyRead,
        }, (res) => {
            if (ifNoneMatch && res.statusCode === 304) {
                throw new error_1.HttpError(res);
            }
            return res.body;
        });
        if (!graceful)
            return result;
        try {
            return await result;
        }
        catch (err) {
            if ((0, error_1.isArangoError)(err) && err.errorNum === codes_1.DOCUMENT_NOT_FOUND) {
                return null;
            }
            throw err;
        }
    }
    save(data, options) {
        return this._db.request({
            method: "POST",
            path: `/_api/document/${encodeURIComponent(this._name)}`,
            body: data,
            qs: options,
        }, (res) => (options?.silent ? undefined : res.body));
    }
    saveAll(data, options) {
        return this._db.request({
            method: "POST",
            path: `/_api/document/${encodeURIComponent(this._name)}`,
            body: data,
            qs: options,
        }, (res) => (options?.silent ? undefined : res.body));
    }
    replace(selector, newData, options = {}) {
        const { ifMatch = undefined, ...opts } = options;
        const headers = {};
        if (ifMatch)
            headers["if-match"] = ifMatch;
        return this._db.request({
            method: "PUT",
            path: `/_api/document/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            headers,
            body: newData,
            qs: opts,
        }, (res) => (options?.silent ? undefined : res.body));
    }
    replaceAll(newData, options) {
        return this._db.request({
            method: "PUT",
            path: `/_api/document/${encodeURIComponent(this._name)}`,
            body: newData,
            qs: options,
        }, (res) => (options?.silent ? undefined : res.body));
    }
    update(selector, newData, options = {}) {
        const { ifMatch = undefined, ...opts } = options;
        const headers = {};
        if (ifMatch)
            headers["if-match"] = ifMatch;
        return this._db.request({
            method: "PATCH",
            path: `/_api/document/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            headers,
            body: newData,
            qs: opts,
        }, (res) => (options?.silent ? undefined : res.body));
    }
    updateAll(newData, options) {
        return this._db.request({
            method: "PATCH",
            path: `/_api/document/${encodeURIComponent(this._name)}`,
            body: newData,
            qs: options,
        }, (res) => (options?.silent ? undefined : res.body));
    }
    remove(selector, options = {}) {
        const { ifMatch = undefined, ...opts } = options;
        const headers = {};
        if (ifMatch)
            headers["if-match"] = ifMatch;
        return this._db.request({
            method: "DELETE",
            path: `/_api/document/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            headers,
            qs: opts,
        }, (res) => (options?.silent ? undefined : res.body));
    }
    removeAll(selectors, options) {
        return this._db.request({
            method: "DELETE",
            path: `/_api/document/${encodeURIComponent(this._name)}`,
            body: selectors,
            qs: options,
        }, (res) => (options?.silent ? undefined : res.body));
    }
    import(data, options = {}) {
        const qs = { ...options, collection: this._name };
        if (Array.isArray(data)) {
            qs.type = Array.isArray(data[0]) ? undefined : "documents";
            const lines = data;
            data = lines.map((line) => JSON.stringify(line)).join("\r\n") + "\r\n";
        }
        return this._db.request({
            method: "POST",
            path: "/_api/import",
            body: data,
            isBinary: true,
            qs,
        });
    }
    //#endregion
    //#region edges
    _edges(selector, options, direction) {
        const { allowDirtyRead = undefined } = options;
        return this._db.request({
            path: `/_api/edges/${encodeURIComponent(this._name)}`,
            allowDirtyRead,
            qs: {
                direction,
                vertex: (0, documents_1._documentHandle)(selector, this._name, false),
            },
        });
    }
    edges(vertex, options) {
        return this._edges(vertex, options);
    }
    inEdges(vertex, options) {
        return this._edges(vertex, options, "in");
    }
    outEdges(vertex, options) {
        return this._edges(vertex, options, "out");
    }
    traversal(startVertex, options) {
        return this._db.request({
            method: "POST",
            path: "/_api/traversal",
            body: {
                ...options,
                startVertex,
                edgeCollection: this._name,
            },
        }, (res) => res.body.result);
    }
    //#endregion
    //#region simple queries
    list(type = "id") {
        return this._db.request({
            method: "PUT",
            path: "/_api/simple/all-keys",
            body: { type, collection: this._name },
        }, (res) => new cursor_1.BatchedArrayCursor(this._db, res.body, res.arangojsHostUrl).items);
    }
    all(options) {
        return this._db.request({
            method: "PUT",
            path: "/_api/simple/all",
            body: {
                ...options,
                collection: this._name,
            },
        }, (res) => new cursor_1.BatchedArrayCursor(this._db, res.body, res.arangojsHostUrl).items);
    }
    any() {
        return this._db.request({
            method: "PUT",
            path: "/_api/simple/any",
            body: { collection: this._name },
        }, (res) => res.body.document);
    }
    byExample(example, options) {
        return this._db.request({
            method: "PUT",
            path: "/_api/simple/by-example",
            body: {
                ...options,
                example,
                collection: this._name,
            },
        }, (res) => new cursor_1.BatchedArrayCursor(this._db, res.body, res.arangojsHostUrl).items);
    }
    firstExample(example) {
        return this._db.request({
            method: "PUT",
            path: "/_api/simple/first-example",
            body: {
                example,
                collection: this._name,
            },
        }, (res) => res.body.document);
    }
    removeByExample(example, options) {
        return this._db.request({
            method: "PUT",
            path: "/_api/simple/remove-by-example",
            body: {
                ...options,
                example,
                collection: this._name,
            },
        });
    }
    replaceByExample(example, newValue, options) {
        return this._db.request({
            method: "PUT",
            path: "/_api/simple/replace-by-example",
            body: {
                ...options,
                example,
                newValue,
                collection: this._name,
            },
        });
    }
    updateByExample(example, newValue, options) {
        return this._db.request({
            method: "PUT",
            path: "/_api/simple/update-by-example",
            body: {
                ...options,
                example,
                newValue,
                collection: this._name,
            },
        });
    }
    lookupByKeys(keys) {
        return this._db.request({
            method: "PUT",
            path: "/_api/simple/lookup-by-keys",
            body: {
                keys,
                collection: this._name,
            },
        }, (res) => res.body.documents);
    }
    removeByKeys(keys, options) {
        return this._db.request({
            method: "PUT",
            path: "/_api/simple/remove-by-keys",
            body: {
                options: options,
                keys,
                collection: this._name,
            },
        });
    }
    //#endregion
    //#region indexes
    indexes() {
        return this._db.request({
            path: "/_api/index",
            qs: { collection: this._name },
        }, (res) => res.body.indexes);
    }
    index(selector) {
        return this._db.request({
            path: `/_api/index/${encodeURI((0, indexes_1._indexHandle)(selector, this._name))}`,
        });
    }
    ensureIndex(options) {
        return this._db.request({
            method: "POST",
            path: "/_api/index",
            body: options,
            qs: { collection: this._name },
        });
    }
    dropIndex(selector) {
        return this._db.request({
            method: "DELETE",
            path: `/_api/index/${encodeURI((0, indexes_1._indexHandle)(selector, this._name))}`,
        });
    }
    fulltext(attribute, query, { index, ...options } = {}) {
        return this._db.request({
            method: "PUT",
            path: "/_api/simple/fulltext",
            body: {
                ...options,
                index: index ? (0, indexes_1._indexHandle)(index, this._name) : undefined,
                attribute,
                query,
                collection: this._name,
            },
        }, (res) => new cursor_1.BatchedArrayCursor(this._db, res.body, res.arangojsHostUrl).items);
    }
    compact() {
        return this._db.request({
            method: "PUT",
            path: `/_api/collection/${this._name}/compact`,
        }, (res) => res.body);
    }
}
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map

/***/ }),

/***/ "../node_modules/arangojs/connection.js":
/*!**********************************************!*\
  !*** ../node_modules/arangojs/connection.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Connection = exports.isArangoConnection = void 0;
const x3_linkedlist_1 = __webpack_require__(/*! x3-linkedlist */ "../node_modules/x3-linkedlist/dist/index.js");
const error_1 = __webpack_require__(/*! ./error */ "../node_modules/arangojs/error.js");
const btoa_1 = __webpack_require__(/*! ./lib/btoa */ "../node_modules/arangojs/lib/btoa.web.js");
const codes_1 = __webpack_require__(/*! ./lib/codes */ "../node_modules/arangojs/lib/codes.js");
const normalizeUrl_1 = __webpack_require__(/*! ./lib/normalizeUrl */ "../node_modules/arangojs/lib/normalizeUrl.js");
const querystringify_1 = __webpack_require__(/*! ./lib/querystringify */ "../node_modules/arangojs/lib/querystringify.js");
const request_1 = __webpack_require__(/*! ./lib/request */ "../node_modules/arangojs/lib/request.web.js");
const MIME_JSON = /\/(json|javascript)(\W|$)/;
const LEADER_ENDPOINT_HEADER = "x-arango-endpoint";
function isBearerAuth(auth) {
    return auth.hasOwnProperty("token");
}
/**
 * @internal
 */
function generateStackTrace() {
    let err = new Error();
    if (!err.stack) {
        try {
            throw err;
        }
        catch (e) {
            err = e;
        }
    }
    return err;
}
/**
 * Indicates whether the given value represents a {@link Connection}.
 *
 * @param connection - A value that might be a connection.
 *
 * @internal
 */
function isArangoConnection(connection) {
    return Boolean(connection && connection.isArangoConnection);
}
exports.isArangoConnection = isArangoConnection;
/**
 * Represents a connection pool shared by one or more databases.
 *
 * @internal
 */
class Connection {
    /**
     * @internal
     *
     * Creates a new `Connection` instance.
     *
     * @param config - An object with configuration options.
     *
     */
    constructor(config = {}) {
        this._activeTasks = 0;
        this._arangoVersion = 30900;
        this._queue = new x3_linkedlist_1.LinkedList();
        this._databases = new Map();
        this._hosts = [];
        this._hostUrls = [];
        this._transactionId = null;
        this._queueTimes = new x3_linkedlist_1.LinkedList();
        const URLS = config.url
            ? Array.isArray(config.url)
                ? config.url
                : [config.url]
            : ["http://127.0.0.1:8529"];
        const MAX_SOCKETS = 3 * (config.loadBalancingStrategy === "ROUND_ROBIN" ? URLS.length : 1);
        if (config.arangoVersion !== undefined) {
            this._arangoVersion = config.arangoVersion;
        }
        this._agent = config.agent;
        this._agentOptions = request_1.isBrowser
            ? { maxSockets: MAX_SOCKETS, ...config.agentOptions }
            : {
                maxSockets: MAX_SOCKETS,
                keepAlive: true,
                keepAliveMsecs: 1000,
                scheduling: "lifo",
                ...config.agentOptions,
            };
        this._maxTasks = this._agentOptions.maxSockets;
        this._headers = { ...config.headers };
        this._loadBalancingStrategy = config.loadBalancingStrategy ?? "NONE";
        this._precaptureStackTraces = Boolean(config.precaptureStackTraces);
        this._responseQueueTimeSamples = config.responseQueueTimeSamples ?? 10;
        this._retryOnConflict = config.retryOnConflict ?? 0;
        if (this._responseQueueTimeSamples < 0) {
            this._responseQueueTimeSamples = Infinity;
        }
        if (config.maxRetries === false) {
            this._maxRetries = false;
        }
        else {
            this._maxRetries = Number(config.maxRetries ?? 0);
        }
        this.addToHostList(URLS);
        if (config.auth) {
            if (isBearerAuth(config.auth)) {
                this.setBearerAuth(config.auth);
            }
            else {
                this.setBasicAuth(config.auth);
            }
        }
        if (this._loadBalancingStrategy === "ONE_RANDOM") {
            this._activeHostUrl =
                this._hostUrls[Math.floor(Math.random() * this._hostUrls.length)];
            this._activeDirtyHostUrl =
                this._hostUrls[Math.floor(Math.random() * this._hostUrls.length)];
        }
        else {
            this._activeHostUrl = this._hostUrls[0];
            this._activeDirtyHostUrl = this._hostUrls[0];
        }
    }
    /**
     * @internal
     *
     * Indicates that this object represents an ArangoDB connection.
     */
    get isArangoConnection() {
        return true;
    }
    get queueTime() {
        return {
            getLatest: () => this._queueTimes.last?.value[1],
            getValues: () => Array.from(this._queueTimes.values()),
            getAvg: () => {
                let avg = 0;
                for (const [, [, value]] of this._queueTimes) {
                    avg += value / this._queueTimes.length;
                }
                return avg;
            },
        };
    }
    _runQueue() {
        if (!this._queue.length || this._activeTasks >= this._maxTasks)
            return;
        const task = this._queue.shift();
        let hostUrl = this._activeHostUrl;
        if (task.hostUrl !== undefined) {
            hostUrl = task.hostUrl;
        }
        else if (task.allowDirtyRead) {
            hostUrl = this._activeDirtyHostUrl;
            this._activeDirtyHostUrl =
                this._hostUrls[(this._hostUrls.indexOf(this._activeDirtyHostUrl) + 1) %
                    this._hostUrls.length];
            task.options.headers["x-arango-allow-dirty-read"] = "true";
        }
        else if (this._loadBalancingStrategy === "ROUND_ROBIN") {
            this._activeHostUrl =
                this._hostUrls[(this._hostUrls.indexOf(this._activeHostUrl) + 1) %
                    this._hostUrls.length];
        }
        this._activeTasks += 1;
        const callback = (err, res) => {
            this._activeTasks -= 1;
            if (!err && res) {
                if (res.statusCode === 503 && res.headers[LEADER_ENDPOINT_HEADER]) {
                    const url = res.headers[LEADER_ENDPOINT_HEADER];
                    const [cleanUrl] = this.addToHostList(url);
                    task.hostUrl = cleanUrl;
                    if (this._activeHostUrl === hostUrl) {
                        this._activeHostUrl = cleanUrl;
                    }
                    this._queue.push(task);
                }
                else {
                    res.arangojsHostUrl = hostUrl;
                    const contentType = res.headers["content-type"];
                    const queueTime = res.headers["x-arango-queue-time-seconds"];
                    if (queueTime) {
                        this._queueTimes.push([Date.now(), Number(queueTime)]);
                        while (this._responseQueueTimeSamples < this._queueTimes.length) {
                            this._queueTimes.shift();
                        }
                    }
                    let parsedBody = undefined;
                    if (res.body.length && contentType && contentType.match(MIME_JSON)) {
                        try {
                            parsedBody = res.body;
                            parsedBody = JSON.parse(parsedBody);
                        }
                        catch (e) {
                            if (!task.options.expectBinary) {
                                if (typeof parsedBody !== "string") {
                                    parsedBody = res.body.toString("utf-8");
                                }
                                e.res = res;
                                if (task.stack) {
                                    e.stack += task.stack();
                                }
                                callback(e);
                                return;
                            }
                        }
                    }
                    else if (res.body && !task.options.expectBinary) {
                        parsedBody = res.body.toString("utf-8");
                    }
                    else {
                        parsedBody = res.body;
                    }
                    if ((0, error_1.isArangoErrorResponse)(parsedBody)) {
                        res.body = parsedBody;
                        err = new error_1.ArangoError(res);
                    }
                    else if (res.statusCode && res.statusCode >= 400) {
                        res.body = parsedBody;
                        err = new error_1.HttpError(res);
                    }
                    else {
                        if (!task.options.expectBinary)
                            res.body = parsedBody;
                        task.resolve(task.transform ? task.transform(res) : res);
                    }
                }
            }
            if (err) {
                if (!task.allowDirtyRead &&
                    this._hosts.length > 1 &&
                    this._activeHostUrl === hostUrl &&
                    this._loadBalancingStrategy !== "ROUND_ROBIN") {
                    this._activeHostUrl =
                        this._hostUrls[(this._hostUrls.indexOf(this._activeHostUrl) + 1) %
                            this._hostUrls.length];
                }
                if ((0, error_1.isArangoError)(err) &&
                    err.errorNum === codes_1.ERROR_ARANGO_CONFLICT &&
                    task.retryOnConflict > 0) {
                    task.retryOnConflict -= 1;
                    this._queue.push(task);
                }
                else if ((((0, error_1.isSystemError)(err) &&
                    err.syscall === "connect" &&
                    err.code === "ECONNREFUSED") ||
                    ((0, error_1.isArangoError)(err) &&
                        err.errorNum === codes_1.ERROR_ARANGO_MAINTENANCE_MODE)) &&
                    task.hostUrl === undefined &&
                    this._maxRetries !== false &&
                    task.retries < (this._maxRetries || this._hosts.length - 1)) {
                    task.retries += 1;
                    this._queue.push(task);
                }
                else {
                    if (task.stack) {
                        err.stack += task.stack();
                    }
                    task.reject(err);
                }
            }
            this._runQueue();
        };
        try {
            this._hosts[this._hostUrls.indexOf(hostUrl)](task.options, callback);
        }
        catch (e) {
            callback(e);
        }
    }
    _buildUrl({ basePath, path, qs }) {
        const pathname = `${basePath || ""}${path || ""}`;
        let search;
        if (qs) {
            if (typeof qs === "string")
                search = `?${qs}`;
            else
                search = `?${(0, querystringify_1.querystringify)(qs)}`;
        }
        return search ? { pathname, search } : { pathname };
    }
    setBearerAuth(auth) {
        this.setHeader("authorization", `Bearer ${auth.token}`);
    }
    setBasicAuth(auth) {
        this.setHeader("authorization", `Basic ${(0, btoa_1.base64Encode)(`${auth.username}:${auth.password}`)}`);
    }
    setResponseQueueTimeSamples(responseQueueTimeSamples) {
        if (responseQueueTimeSamples < 0) {
            responseQueueTimeSamples = Infinity;
        }
        this._responseQueueTimeSamples = responseQueueTimeSamples;
        while (this._responseQueueTimeSamples < this._queueTimes.length) {
            this._queueTimes.shift();
        }
    }
    database(databaseName, database) {
        if (database === null) {
            this._databases.delete(databaseName);
            return undefined;
        }
        if (!database) {
            return this._databases.get(databaseName);
        }
        this._databases.set(databaseName, database);
        return database;
    }
    /**
     * @internal
     *
     * Replaces the host list with the given URLs.
     *
     * See {@link Connection#acquireHostList}.
     *
     * @param urls - URLs to use as host list.
     */
    setHostList(urls) {
        const cleanUrls = urls.map((url) => (0, normalizeUrl_1.normalizeUrl)(url));
        this._hosts.splice(0, this._hosts.length, ...cleanUrls.map((url) => {
            const i = this._hostUrls.indexOf(url);
            if (i !== -1)
                return this._hosts[i];
            return (0, request_1.createRequest)(url, this._agentOptions, this._agent);
        }));
        this._hostUrls.splice(0, this._hostUrls.length, ...cleanUrls);
    }
    /**
     * @internal
     *
     * Adds the given URL or URLs to the host list.
     *
     * See {@link Connection#acquireHostList}.
     *
     * @param urls - URL or URLs to add.
     */
    addToHostList(urls) {
        const cleanUrls = (Array.isArray(urls) ? urls : [urls]).map((url) => (0, normalizeUrl_1.normalizeUrl)(url));
        const newUrls = cleanUrls.filter((url) => this._hostUrls.indexOf(url) === -1);
        this._hostUrls.push(...newUrls);
        this._hosts.push(...newUrls.map((url) => (0, request_1.createRequest)(url, this._agentOptions, this._agent)));
        return cleanUrls;
    }
    /**
     * @internal
     *
     * Sets the connection's active `transactionId`.
     *
     * While set, all requests will use this ID, ensuring the requests are executed
     * within the transaction if possible. Setting the ID manually may cause
     * unexpected behavior.
     *
     * See also {@link Connection#clearTransactionId}.
     *
     * @param transactionId - ID of the active transaction.
     */
    setTransactionId(transactionId) {
        this._transactionId = transactionId;
    }
    /**
     * @internal
     *
     * Clears the connection's active `transactionId`.
     */
    clearTransactionId() {
        this._transactionId = null;
    }
    /**
     * @internal
     *
     * Sets the header `headerName` with the given `value` or clears the header if
     * `value` is `null`.
     *
     * @param headerName - Name of the header to set.
     * @param value - Value of the header.
     */
    setHeader(headerName, value) {
        if (value === null) {
            delete this._headers[headerName];
        }
        else {
            this._headers[headerName] = value;
        }
    }
    /**
     * @internal
     *
     * Closes all open connections.
     *
     * See {@link database.Database#close}.
     */
    close() {
        for (const host of this._hosts) {
            if (host.close)
                host.close();
        }
    }
    /**
     * @internal
     *
     * Waits for propagation.
     *
     * See {@link database.Database#waitForPropagation}.
     *
     * @param request - Request to perform against each coordinator.
     * @param timeout - Maximum number of milliseconds to wait for propagation.
     */
    async waitForPropagation(request, timeout = Infinity) {
        const numHosts = this._hosts.length;
        const propagated = [];
        const started = Date.now();
        let index = 0;
        while (true) {
            if (propagated.length === numHosts) {
                return;
            }
            while (propagated.includes(this._hostUrls[index])) {
                index = (index + 1) % numHosts;
            }
            const hostUrl = this._hostUrls[index];
            try {
                await this.request({ ...request, hostUrl });
            }
            catch (e) {
                if (started + timeout < Date.now()) {
                    throw e;
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
                continue;
            }
            if (!propagated.includes(hostUrl)) {
                propagated.push(hostUrl);
            }
        }
    }
    /**
     * @internal
     *
     * Performs a request using the arangojs connection pool.
     */
    request({ hostUrl, method = "GET", body, expectBinary = false, isBinary = false, allowDirtyRead = false, retryOnConflict = this._retryOnConflict, timeout = 0, headers, ...urlInfo }, transform) {
        return new Promise((resolve, reject) => {
            let contentType = "text/plain";
            if (isBinary) {
                contentType = "application/octet-stream";
            }
            else if (body) {
                if (typeof body === "object") {
                    body = JSON.stringify(body);
                    contentType = "application/json";
                }
                else {
                    body = String(body);
                }
            }
            const extraHeaders = {
                ...this._headers,
                "content-type": contentType,
                "x-arango-version": String(this._arangoVersion),
            };
            if (this._transactionId) {
                extraHeaders["x-arango-trx-id"] = this._transactionId;
            }
            const task = {
                retries: 0,
                hostUrl,
                allowDirtyRead,
                retryOnConflict,
                options: {
                    url: this._buildUrl(urlInfo),
                    headers: { ...extraHeaders, ...headers },
                    timeout,
                    method,
                    expectBinary,
                    body,
                },
                reject,
                resolve,
                transform,
            };
            if (this._precaptureStackTraces) {
                if (typeof Error.captureStackTrace === "function") {
                    const capture = {};
                    Error.captureStackTrace(capture);
                    task.stack = () => `\n${capture.stack.split("\n").slice(3).join("\n")}`;
                }
                else {
                    const capture = generateStackTrace();
                    if (Object.prototype.hasOwnProperty.call(capture, "stack")) {
                        task.stack = () => `\n${capture.stack.split("\n").slice(4).join("\n")}`;
                    }
                }
            }
            this._queue.push(task);
            this._runQueue();
        });
    }
}
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map

/***/ }),

/***/ "../node_modules/arangojs/cursor.js":
/*!******************************************!*\
  !*** ../node_modules/arangojs/cursor.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ArrayCursor = exports.BatchedArrayCursor = void 0;
/**
 * ```ts
 * import type { ArrayCursor, BatchedArrayCursor } from "arangojs/cursor";
 * ```
 *
 * The "cursor" module provides cursor-related interfaces for TypeScript.
 *
 * @packageDocumentation
 */
const x3_linkedlist_1 = __webpack_require__(/*! x3-linkedlist */ "../node_modules/x3-linkedlist/dist/index.js");
/**
 * The `BatchedArrayCursor` provides a batch-wise API to an {@link ArrayCursor}.
 *
 * When using TypeScript, cursors can be cast to a specific item type in order
 * to increase type safety.
 *
 * @param T - Type to use for each item. Defaults to `any`.
 *
 * @example
 * ```ts
 * const db = new Database();
 * const query = aql`FOR x IN 1..5 RETURN x`;
 * const cursor = await db.query(query) as ArrayCursor<number>;
 * const batches = cursor.batches;
 * ```
 *
 * @example
 * ```js
 * const db = new Database();
 * const query = aql`FOR x IN 1..10000 RETURN x`;
 * const cursor = await db.query(query, { batchSize: 10 });
 * for await (const batch of cursor.batches) {
 *   // Process all values in a batch in parallel
 *   await Promise.all(batch.map(
 *     value => asyncProcessValue(value)
 *   ));
 * }
 * ```
 */
class BatchedArrayCursor {
    /**
     * @internal
     */
    constructor(db, body, hostUrl, allowDirtyRead) {
        const batches = new x3_linkedlist_1.LinkedList(body.result.length ? [new x3_linkedlist_1.LinkedList(body.result)] : []);
        this._db = db;
        this._batches = batches;
        this._id = body.id;
        this._hasMore = Boolean(body.id && body.hasMore);
        this._hostUrl = hostUrl;
        this._count = body.count;
        this._extra = body.extra;
        this._allowDirtyRead = allowDirtyRead;
        this._itemsCursor = new ArrayCursor(this, {
            get isEmpty() {
                return !batches.length;
            },
            more: () => this._more(),
            shift: () => {
                let batch = batches.first?.value;
                while (batch && !batch.length) {
                    batches.shift();
                    batch = batches.first?.value;
                }
                if (!batch)
                    return undefined;
                const value = batch.shift();
                if (!batch.length)
                    batches.shift();
                return value;
            },
        });
    }
    async _more() {
        if (!this.hasMore)
            return;
        const body = await this._db.request({
            method: "PUT",
            path: `/_api/cursor/${encodeURIComponent(this._id)}`,
            hostUrl: this._hostUrl,
            allowDirtyRead: this._allowDirtyRead,
        });
        this._batches.push(new x3_linkedlist_1.LinkedList(body.result));
        this._hasMore = body.hasMore;
    }
    /**
     * An {@link ArrayCursor} providing item-wise access to the cursor result set.
     *
     * See also {@link ArrayCursor#batches}.
     */
    get items() {
        return this._itemsCursor;
    }
    /**
     * Additional information about the cursor.
     */
    get extra() {
        return this._extra;
    }
    /**
     * Total number of documents in the query result. Only available if the
     * `count` option was used.
     */
    get count() {
        return this._count;
    }
    /**
     * Whether the cursor has any remaining batches that haven't yet been
     * fetched. If set to `false`, all batches have been fetched and no
     * additional requests to the server will be made when consuming any
     * remaining batches from this cursor.
     */
    get hasMore() {
        return this._hasMore;
    }
    /**
     * Whether the cursor has more batches. If set to `false`, the cursor has
     * already been depleted and contains no more batches.
     */
    get hasNext() {
        return this.hasMore || Boolean(this._batches.length);
    }
    /**
     * Enables use with `for await` to deplete the cursor by asynchronously
     * yielding every batch in the cursor's remaining result set.
     *
     * **Note**: If the result set spans multiple batches, any remaining batches
     * will only be fetched on demand. Depending on the cursor's TTL and the
     * processing speed, this may result in the server discarding the cursor
     * before it is fully depleted.
     *
     * @example
     * ```js
     * const cursor = await db.query(aql`
     *   FOR user IN users
     *   FILTER user.isActive
     *   RETURN user
     * `);
     * for await (const users of cursor.batches) {
     *   for (const user of users) {
     *     console.log(user.email, user.isAdmin);
     *   }
     * }
     * ```
     */
    async *[Symbol.asyncIterator]() {
        while (this.hasNext) {
            yield this.next();
        }
        return undefined;
    }
    /**
     * Loads all remaining batches from the server.
     *
     * **Warning**: This may impact memory use when working with very large
     * query result sets.
     *
     * @example
     * ```js
     * const cursor = await db.query(
     *   aql`FOR x IN 1..5 RETURN x`,
     *   { batchSize: 1 }
     * );
     * console.log(cursor.hasMore); // true
     * await cursor.batches.loadAll();
     * console.log(cursor.hasMore); // false
     * console.log(cursor.hasNext); // true
     * for await (const item of cursor) {
     *   console.log(item);
     *   // No server roundtrips necessary any more
     * }
     * ```
     */
    async loadAll() {
        while (this._hasMore) {
            await this._more();
        }
    }
    /**
     * Depletes the cursor, then returns an array containing all batches in the
     * cursor's remaining result list.
     *
     * @example
     * ```js
     * const cursor = await db.query(
     *   aql`FOR x IN 1..5 RETURN x`,
     *   { batchSize: 2 }
     * );
     * const result = await cursor.batches.all(); // [[1, 2], [3, 4], [5]]
     * console.log(cursor.hasNext); // false
     * ```
     */
    async all() {
        return this.map((batch) => batch);
    }
    /**
     * Advances the cursor and returns all remaining values in the cursor's
     * current batch. If the current batch has already been exhausted, fetches
     * the next batch from the server and returns it, or `undefined` if the
     * cursor has been depleted.
     *
     * **Note**: If the result set spans multiple batches, any remaining batches
     * will only be fetched on demand. Depending on the cursor's TTL and the
     * processing speed, this may result in the server discarding the cursor
     * before it is fully depleted.
     *
     * @example
     * ```js
     * const cursor = await db.query(
     *   aql`FOR i IN 1..10 RETURN i`,
     *   { batchSize: 5 }
     * );
     * const firstBatch = await cursor.batches.next(); // [1, 2, 3, 4, 5]
     * await cursor.next(); // 6
     * const lastBatch = await cursor.batches.next(); // [7, 8, 9, 10]
     * console.log(cursor.hasNext); // false
     * ```
     */
    async next() {
        while (!this._batches.length && this.hasNext) {
            await this._more();
        }
        if (!this._batches.length) {
            return undefined;
        }
        const batch = this._batches.shift();
        if (!batch)
            return undefined;
        const values = [...batch.values()];
        batch.clear(true);
        return values;
    }
    /**
     * Advances the cursor by applying the `callback` function to each item in
     * the cursor's remaining result list until the cursor is depleted or
     * `callback` returns the exact value `false`. Returns a promise that
     * evalues to `true` unless the function returned `false`.
     *
     * **Note**: If the result set spans multiple batches, any remaining batches
     * will only be fetched on demand. Depending on the cursor's TTL and the
     * processing speed, this may result in the server discarding the cursor
     * before it is fully depleted.
     *
     * See also:
     * [`Array.prototype.forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach).
     *
     * @param callback - Function to execute on each element.
     *
     * @example
     * ```js
     * const cursor = await db.query(
     *   aql`FOR x IN 1..5 RETURN x`,
     *   { batchSize: 2 }
     * );
     * const result = await cursor.batches.forEach((currentBatch) => {
     *   for (const value of currentBatch) {
     *     console.log(value);
     *   }
     * });
     * console.log(result) // true
     * console.log(cursor.hasNext); // false
     * ```
     *
     * @example
     * ```js
     * const cursor = await db.query(
     *   aql`FOR x IN 1..5 RETURN x`,
     *   { batchSize: 2 }
     * );
     * const result = await cursor.batches.forEach((currentBatch) => {
     *   for (const value of currentBatch) {
     *     console.log(value);
     *   }
     *   return false; // stop after the first batch
     * });
     * console.log(result); // false
     * console.log(cursor.hasNext); // true
     * ```
     */
    async forEach(callback) {
        let index = 0;
        while (this.hasNext) {
            const currentBatch = await this.next();
            const result = callback(currentBatch, index, this);
            index++;
            if (result === false)
                return result;
            if (this.hasNext)
                await this._more();
        }
        return true;
    }
    /**
     * Depletes the cursor by applying the `callback` function to each batch in
     * the cursor's remaining result list. Returns an array containing the
     * return values of `callback` for each batch.
     *
     * **Note**: This creates an array of all return values, which may impact
     * memory use when working with very large query result sets. Consider using
     * {@link BatchedArrayCursor#forEach}, {@link BatchedArrayCursor#reduce} or
     * {@link BatchedArrayCursor#flatMap} instead.
     *
     * See also:
     * [`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).
     *
     * @param R - Return type of the `callback` function.
     * @param callback - Function to execute on each element.
     *
     * @example
     * ```js
     * const cursor = await db.query(
     *   aql`FOR x IN 1..5 RETURN x`,
     *   { batchSize: 2 }
     * );
     * const squares = await cursor.batches.map((currentBatch) => {
     *   return currentBatch.map((value) => value ** 2);
     * });
     * console.log(squares); // [[1, 4], [9, 16], [25]]
     * console.log(cursor.hasNext); // false
     * ```
     */
    async map(callback) {
        let index = 0;
        const result = [];
        while (this.hasNext) {
            const currentBatch = await this.next();
            result.push(callback(currentBatch, index, this));
            index++;
        }
        return result;
    }
    /**
     * Depletes the cursor by applying the `callback` function to each batch in
     * the cursor's remaining result list. Returns an array containing the
     * return values of `callback` for each batch, flattened to a depth of 1.
     *
     * **Note**: If the result set spans multiple batches, any remaining batches
     * will only be fetched on demand. Depending on the cursor's TTL and the
     * processing speed, this may result in the server discarding the cursor
     * before it is fully depleted.
     *
     * See also:
     * [`Array.prototype.flatMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap).
     *
     * @param R - Return type of the `callback` function.
     * @param callback - Function to execute on each element.
     *
     * @example
     * ```js
     * const cursor = await db.query(
     *   aql`FOR x IN 1..5 RETURN x`,
     *   { batchSize: 2 }
     * );
     * const squares = await cursor.batches.flatMap((currentBatch) => {
     *   return currentBatch.map((value) => value ** 2);
     * });
     * console.log(squares); // [1, 1, 2, 4, 3, 9, 4, 16, 5, 25]
     * console.log(cursor.hasNext); // false
     * ```
     *
     * @example
     * ```js
     * const cursor = await db.query(
     *   aql`FOR x IN 1..5 RETURN x`,
     *   { batchSize: 1 }
     * );
     * const odds = await cursor.batches.flatMap((currentBatch) => {
     *   if (currentBatch[0] % 2 === 0) {
     *     return []; // empty array flattens into nothing
     *   }
     *   return currentBatch;
     * });
     * console.logs(odds); // [1, 3, 5]
     * ```
     */
    async flatMap(callback) {
        let index = 0;
        const result = [];
        while (this.hasNext) {
            const currentBatch = await this.next();
            const value = callback(currentBatch, index, this);
            if (Array.isArray(value)) {
                result.push(...value);
            }
            else {
                result.push(value);
            }
            index++;
        }
        return result;
    }
    async reduce(reducer, initialValue) {
        let index = 0;
        if (!this.hasNext)
            return initialValue;
        if (initialValue === undefined) {
            initialValue = (await this.next());
            index += 1;
        }
        let value = initialValue;
        while (this.hasNext) {
            const currentBatch = await this.next();
            value = reducer(value, currentBatch, index, this);
            index++;
        }
        return value;
    }
    /**
     * Drains the cursor and frees up associated database resources.
     *
     * This method has no effect if all batches have already been consumed.
     *
     * @example
     * ```js
     * const cursor1 = await db.query(aql`FOR x IN 1..5 RETURN x`);
     * console.log(cursor1.hasMore); // false
     * await cursor1.kill(); // no effect
     *
     * const cursor2 = await db.query(
     *   aql`FOR x IN 1..5 RETURN x`,
     *   { batchSize: 2 }
     * );
     * console.log(cursor2.hasMore); // true
     * await cursor2.kill(); // cursor is depleted
     * ```
     */
    async kill() {
        if (this._batches.length) {
            for (const batch of this._batches.values()) {
                batch.clear();
            }
            this._batches.clear();
        }
        if (!this.hasNext)
            return undefined;
        return this._db.request({
            method: "DELETE",
            path: `/_api/cursor/${encodeURIComponent(this._id)}`,
        }, () => {
            this._hasMore = false;
            return undefined;
        });
    }
}
exports.BatchedArrayCursor = BatchedArrayCursor;
/**
 * The `ArrayCursor` type represents a cursor returned from a
 * {@link database.Database#query}.
 *
 * When using TypeScript, cursors can be cast to a specific item type in order
 * to increase type safety.
 *
 * See also {@link BatchedArrayCursor}.
 *
 * @param T - Type to use for each item. Defaults to `any`.
 *
 * @example
 * ```ts
 * const db = new Database();
 * const query = aql`FOR x IN 1..5 RETURN x`;
 * const result = await db.query(query) as ArrayCursor<number>;
 * ```
 *
 * @example
 * ```js
 * const db = new Database();
 * const query = aql`FOR x IN 1..10 RETURN x`;
 * const cursor = await db.query(query);
 * for await (const value of cursor) {
 *   // Process each value asynchronously
 *   await processValue(value);
 * }
 * ```
 */
class ArrayCursor {
    /**
     * @internal
     */
    constructor(batchedCursor, view) {
        this._batches = batchedCursor;
        this._view = view;
    }
    /**
     * A {@link BatchedArrayCursor} providing batch-wise access to the cursor
     * result set.
     *
     * See also {@link BatchedArrayCursor#items}.
     */
    get batches() {
        return this._batches;
    }
    /**
     * Additional information about the cursor.
     */
    get extra() {
        return this.batches.extra;
    }
    /**
     * Total number of documents in the query result. Only available if the
     * `count` option was used.
     */
    get count() {
        return this.batches.count;
    }
    /**
     * Whether the cursor has more values. If set to `false`, the cursor has
     * already been depleted and contains no more items.
     */
    get hasNext() {
        return this.batches.hasNext;
    }
    /**
     * Enables use with `for await` to deplete the cursor by asynchronously
     * yielding every value in the cursor's remaining result set.
     *
     * **Note**: If the result set spans multiple batches, any remaining batches
     * will only be fetched on demand. Depending on the cursor's TTL and the
     * processing speed, this may result in the server discarding the cursor
     * before it is fully depleted.
     *
     * @example
     * ```js
     * const cursor = await db.query(aql`
     *   FOR user IN users
     *   FILTER user.isActive
     *   RETURN user
     * `);
     * for await (const user of cursor) {
     *   console.log(user.email, user.isAdmin);
     * }
     * ```
     */
    async *[Symbol.asyncIterator]() {
        while (this.hasNext) {
            yield this.next();
        }
        return undefined;
    }
    /**
     * Depletes the cursor, then returns an array containing all values in the
     * cursor's remaining result list.
     *
     * @example
     * ```js
     * const cursor = await db.query(aql`FOR x IN 1..5 RETURN x`);
     * const result = await cursor.all(); // [1, 2, 3, 4, 5]
     * console.log(cursor.hasNext); // false
     * ```
     */
    async all() {
        return this.batches.flatMap((v) => v);
    }
    /**
     * Advances the cursor and returns the next value in the cursor's remaining
     * result list, or `undefined` if the cursor has been depleted.
     *
     * **Note**: If the result set spans multiple batches, any remaining batches
     * will only be fetched on demand. Depending on the cursor's TTL and the
     * processing speed, this may result in the server discarding the cursor
     * before it is fully depleted.
     *
     * @example
     * ```js
     * const cursor = await db.query(aql`FOR x IN 1..3 RETURN x`);
     * const one = await cursor.next(); // 1
     * const two = await cursor.next(); // 2
     * const three = await cursor.next(); // 3
     * const empty = await cursor.next(); // undefined
     * ```
     */
    async next() {
        while (this._view.isEmpty && this.batches.hasMore) {
            await this._view.more();
        }
        if (this._view.isEmpty) {
            return undefined;
        }
        return this._view.shift();
    }
    /**
     * Advances the cursor by applying the `callback` function to each item in
     * the cursor's remaining result list until the cursor is depleted or
     * `callback` returns the exact value `false`. Returns a promise that
     * evalues to `true` unless the function returned `false`.
     *
     * **Note**: If the result set spans multiple batches, any remaining batches
     * will only be fetched on demand. Depending on the cursor's TTL and the
     * processing speed, this may result in the server discarding the cursor
     * before it is fully depleted.
     *
     * See also:
     * [`Array.prototype.forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach).
     *
     * @param callback - Function to execute on each element.
     *
     * @example
     * ```js
     * const cursor = await db.query(aql`FOR x IN 1..5 RETURN x`);
     * const result = await cursor.forEach((currentValue) => {
     *   console.log(currentValue);
     * });
     * console.log(result) // true
     * console.log(cursor.hasNext); // false
     * ```
     *
     * @example
     * ```js
     * const cursor = await db.query(aql`FOR x IN 1..5 RETURN x`);
     * const result = await cursor.forEach((currentValue) => {
     *   console.log(currentValue);
     *   return false; // stop after the first item
     * });
     * console.log(result); // false
     * console.log(cursor.hasNext); // true
     * ```
     */
    async forEach(callback) {
        let index = 0;
        while (this.hasNext) {
            const value = await this.next();
            const result = callback(value, index, this);
            index++;
            if (result === false)
                return result;
        }
        return true;
    }
    /**
     * Depletes the cursor by applying the `callback` function to each item in
     * the cursor's remaining result list. Returns an array containing the
     * return values of `callback` for each item.
     *
     * **Note**: This creates an array of all return values, which may impact
     * memory use when working with very large query result sets. Consider using
     * {@link ArrayCursor#forEach}, {@link ArrayCursor#reduce} or
     * {@link ArrayCursor#flatMap} instead.
     *
     * See also:
     * [`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).
     *
     * @param R - Return type of the `callback` function.
     * @param callback - Function to execute on each element.
     *
     * @example
     * ```js
     * const cursor = await db.query(aql`FOR x IN 1..5 RETURN x`);
     * const squares = await cursor.map((currentValue) => {
     *   return currentValue ** 2;
     * });
     * console.log(squares); // [1, 4, 9, 16, 25]
     * console.log(cursor.hasNext); // false
     * ```
     */
    async map(callback) {
        let index = 0;
        const result = [];
        while (this.hasNext) {
            const value = await this.next();
            result.push(callback(value, index, this));
            index++;
        }
        return result;
    }
    /**
     * Depletes the cursor by applying the `callback` function to each item in
     * the cursor's remaining result list. Returns an array containing the
     * return values of `callback` for each item, flattened to a depth of 1.
     *
     * **Note**: If the result set spans multiple batches, any remaining batches
     * will only be fetched on demand. Depending on the cursor's TTL and the
     * processing speed, this may result in the server discarding the cursor
     * before it is fully depleted.
     *
     * See also:
     * [`Array.prototype.flatMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap).
     *
     * @param R - Return type of the `callback` function.
     * @param callback - Function to execute on each element.
     *
     * @example
     * ```js
     * const cursor = await db.query(aql`FOR x IN 1..5 RETURN x`);
     * const squares = await cursor.flatMap((currentValue) => {
     *   return [currentValue, currentValue ** 2];
     * });
     * console.log(squares); // [1, 1, 2, 4, 3, 9, 4, 16, 5, 25]
     * console.log(cursor.hasNext); // false
     * ```
     *
     * @example
     * ```js
     * const cursor = await db.query(aql`FOR x IN 1..5 RETURN x`);
     * const odds = await cursor.flatMap((currentValue) => {
     *   if (currentValue % 2 === 0) {
     *     return []; // empty array flattens into nothing
     *   }
     *   return currentValue; // or [currentValue]
     * });
     * console.logs(odds); // [1, 3, 5]
     * ```
     */
    async flatMap(callback) {
        let index = 0;
        const result = [];
        while (this.hasNext) {
            const value = await this.next();
            const item = callback(value, index, this);
            if (Array.isArray(item)) {
                result.push(...item);
            }
            else {
                result.push(item);
            }
            index++;
        }
        return result;
    }
    async reduce(reducer, initialValue) {
        let index = 0;
        if (!this.hasNext)
            return initialValue;
        if (initialValue === undefined) {
            const value = (await this.next());
            initialValue = value;
            index += 1;
        }
        let value = initialValue;
        while (this.hasNext) {
            const item = await this.next();
            value = reducer(value, item, index, this);
            index++;
        }
        return value;
    }
    /**
     * Kills the cursor and frees up associated database resources.
     *
     * This method has no effect if all batches have already been fetched.
     *
     * @example
     * ```js
     * const cursor1 = await db.query(aql`FOR x IN 1..5 RETURN x`);
     * console.log(cursor1.hasMore); // false
     * await cursor1.kill(); // no effect
     *
     * const cursor2 = await db.query(
     *   aql`FOR x IN 1..5 RETURN x`,
     *   { batchSize: 2 }
     * );
     * console.log(cursor2.hasMore); // true
     * await cursor2.kill(); // cursor is depleted
     * ```
     */
    async kill() {
        return this.batches.kill();
    }
}
exports.ArrayCursor = ArrayCursor;
//# sourceMappingURL=cursor.js.map

/***/ }),

/***/ "../node_modules/arangojs/database.js":
/*!********************************************!*\
  !*** ../node_modules/arangojs/database.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Database = exports.isArangoDatabase = void 0;
const analyzer_1 = __webpack_require__(/*! ./analyzer */ "../node_modules/arangojs/analyzer.js");
const aql_1 = __webpack_require__(/*! ./aql */ "../node_modules/arangojs/aql.js");
const collection_1 = __webpack_require__(/*! ./collection */ "../node_modules/arangojs/collection.js");
const connection_1 = __webpack_require__(/*! ./connection */ "../node_modules/arangojs/connection.js");
const cursor_1 = __webpack_require__(/*! ./cursor */ "../node_modules/arangojs/cursor.js");
const error_1 = __webpack_require__(/*! ./error */ "../node_modules/arangojs/error.js");
const graph_1 = __webpack_require__(/*! ./graph */ "../node_modules/arangojs/graph.js");
const codes_1 = __webpack_require__(/*! ./lib/codes */ "../node_modules/arangojs/lib/codes.js");
const multipart_1 = __webpack_require__(/*! ./lib/multipart */ "../node_modules/arangojs/lib/multipart.web.js");
const route_1 = __webpack_require__(/*! ./route */ "../node_modules/arangojs/route.js");
const transaction_1 = __webpack_require__(/*! ./transaction */ "../node_modules/arangojs/transaction.js");
const view_1 = __webpack_require__(/*! ./view */ "../node_modules/arangojs/view.js");
/**
 * Indicates whether the given value represents a {@link Database}.
 *
 * @param database - A value that might be a database.
 */
function isArangoDatabase(database) {
    return Boolean(database && database.isArangoDatabase);
}
exports.isArangoDatabase = isArangoDatabase;
/**
 * @internal
 */
function coerceTransactionCollections(collections) {
    if (typeof collections === "string") {
        return { write: [collections] };
    }
    if (Array.isArray(collections)) {
        return { write: collections.map(collection_1.collectionToString) };
    }
    if ((0, collection_1.isArangoCollection)(collections)) {
        return { write: (0, collection_1.collectionToString)(collections) };
    }
    const cols = {};
    if (collections) {
        if (collections.allowImplicit !== undefined) {
            cols.allowImplicit = collections.allowImplicit;
        }
        if (collections.read) {
            cols.read = Array.isArray(collections.read)
                ? collections.read.map(collection_1.collectionToString)
                : (0, collection_1.collectionToString)(collections.read);
        }
        if (collections.write) {
            cols.write = Array.isArray(collections.write)
                ? collections.write.map(collection_1.collectionToString)
                : (0, collection_1.collectionToString)(collections.write);
        }
        if (collections.exclusive) {
            cols.exclusive = Array.isArray(collections.exclusive)
                ? collections.exclusive.map(collection_1.collectionToString)
                : (0, collection_1.collectionToString)(collections.exclusive);
        }
    }
    return cols;
}
/**
 * An object representing a single ArangoDB database. All arangojs collections,
 * cursors, analyzers and so on are linked to a `Database` object.
 */
class Database {
    constructor(configOrDatabase = {}, name) {
        this._analyzers = new Map();
        this._collections = new Map();
        this._graphs = new Map();
        this._views = new Map();
        if (isArangoDatabase(configOrDatabase)) {
            const connection = configOrDatabase._connection;
            const databaseName = (name || configOrDatabase.name).normalize("NFC");
            this._connection = connection;
            this._name = databaseName;
            const database = connection.database(databaseName);
            if (database)
                return database;
        }
        else {
            const config = configOrDatabase;
            const { databaseName, ...options } = typeof config === "string" || Array.isArray(config)
                ? { databaseName: name, url: config }
                : config;
            this._connection = new connection_1.Connection(options);
            this._name = databaseName?.normalize("NFC") || "_system";
        }
    }
    //#region misc
    /**
     * @internal
     *
     * Indicates that this object represents an ArangoDB database.
     */
    get isArangoDatabase() {
        return true;
    }
    /**
     * Name of the ArangoDB database this instance represents.
     */
    get name() {
        return this._name;
    }
    /**
     * Fetches version information from the ArangoDB server.
     *
     * @param details - If set to `true`, additional information about the
     * ArangoDB server will be available as the `details` property.
     *
     * @example
     * ```js
     * const db = new Database();
     * const version = await db.version();
     * // the version object contains the ArangoDB version information.
     * // license: "community" or "enterprise"
     * // version: ArangoDB version number
     * // server: description of the server
     * ```
     */
    version(details) {
        return this.request({
            method: "GET",
            path: "/_api/version",
            qs: { details },
        });
    }
    /**
     * Returns a new {@link route.Route} instance for the given path (relative to the
     * database) that can be used to perform arbitrary HTTP requests.
     *
     * @param path - The database-relative URL of the route. Defaults to the
     * database API root.
     * @param headers - Default headers that should be sent with each request to
     * the route.
     *
     * @example
     * ```js
     * const db = new Database();
     * const myFoxxService = db.route("my-foxx-service");
     * const response = await myFoxxService.post("users", {
     *   username: "admin",
     *   password: "hunter2"
     * });
     * // response.body is the result of
     * // POST /_db/_system/my-foxx-service/users
     * // with JSON request body '{"username": "admin", "password": "hunter2"}'
     * ```
     */
    route(path, headers) {
        return new route_1.Route(this, path, headers);
    }
    request({ absolutePath = false, basePath, ...opts }, transform = (res) => res.body) {
        if (!absolutePath) {
            basePath = `/_db/${encodeURIComponent(this._name)}${basePath || ""}`;
        }
        return this._connection.request({ basePath, ...opts }, transform || undefined);
    }
    /**
     * Updates the URL list by requesting a list of all coordinators in the
     * cluster and adding any endpoints not initially specified in the
     * {@link connection.Config}.
     *
     * For long-running processes communicating with an ArangoDB cluster it is
     * recommended to run this method periodically (e.g. once per hour) to make
     * sure new coordinators are picked up correctly and can be used for
     * fail-over or load balancing.
     *
     * @param overwrite - If set to `true`, the existing host list will be
     * replaced instead of extended.
     *
     * @example
     * ```js
     * const db = new Database();
     * const interval = setInterval(
     *   () => db.acquireHostList(),
     *   5 * 60 * 1000 // every 5 minutes
     * );
     *
     * // later
     * clearInterval(interval);
     * system.close();
     * ```
     */
    async acquireHostList(overwrite = false) {
        const urls = await this.request({ path: "/_api/cluster/endpoints" }, (res) => res.body.endpoints.map((endpoint) => endpoint.endpoint));
        if (urls.length > 0) {
            if (overwrite)
                this._connection.setHostList(urls);
            else
                this._connection.addToHostList(urls);
        }
    }
    /**
     * Closes all active connections of this database instance.
     *
     * Can be used to clean up idling connections during longer periods of
     * inactivity.
     *
     * **Note**: This method currently has no effect in the browser version of
     * arangojs.
     *
     * @example
     * ```js
     * const db = new Database();
     * const sessions = db.collection("sessions");
     * // Clean up expired sessions once per hour
     * setInterval(async () => {
     *   await db.query(aql`
     *     FOR session IN ${sessions}
     *     FILTER session.expires < DATE_NOW()
     *     REMOVE session IN ${sessions}
     *   `);
     *   // Making sure to close the connections because they're no longer used
     *   system.close();
     * }, 1000 * 60 * 60);
     * ```
     */
    close() {
        this._connection.close();
    }
    async waitForPropagation({ basePath, ...request }, timeout) {
        await this._connection.waitForPropagation({
            ...request,
            basePath: `/_db/${encodeURIComponent(this._name)}${basePath || ""}`,
        }, timeout);
    }
    /**
     * Methods for accessing the server-reported queue times of the mostly
     * recently received responses.
     */
    get queueTime() {
        return this._connection.queueTime;
    }
    /**
     * Sets the limit for the number of values of the most recently received
     * server-reported queue times that can be accessed using
     * {@link Database#queueTime}.
     *
     * @param responseQueueTimeSamples - Number of values to maintain.
     */
    setResponseQueueTimeSamples(responseQueueTimeSamples) {
        this._connection.setResponseQueueTimeSamples(responseQueueTimeSamples);
    }
    //#endregion
    //#region auth
    /**
     * Updates the underlying connection's `authorization` header to use Basic
     * authentication with the given `username` and `password`, then returns
     * itself.
     *
     * @param username - The username to authenticate with.
     * @param password - The password to authenticate with.
     *
     * @example
     * ```js
     * const db = new Database();
     * db.useBasicAuth("admin", "hunter2");
     * // with the username "admin" and password "hunter2".
     * ```
     */
    useBasicAuth(username = "root", password = "") {
        this._connection.setBasicAuth({ username, password });
        return this;
    }
    /**
     * Updates the underlying connection's `authorization` header to use Bearer
     * authentication with the given authentication `token`, then returns itself.
     *
     * @param token - The token to authenticate with.
     *
     * @example
     * ```js
     * const db = new Database();
     * db.useBearerAuth("keyboardcat");
     * // The database instance now uses Bearer authentication.
     * ```
     */
    useBearerAuth(token) {
        this._connection.setBearerAuth({ token });
        return this;
    }
    /**
     * Validates the given database credentials and exchanges them for an
     * authentication token, then uses the authentication token for future
     * requests and returns it.
     *
     * @param username - The username to authenticate with.
     * @param password - The password to authenticate with.
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.login("admin", "hunter2");
     * // with an authentication token for the "admin" user.
     * ```
     */
    login(username = "root", password = "") {
        return this.request({
            method: "POST",
            path: "/_open/auth",
            body: { username, password },
        }, (res) => {
            this.useBearerAuth(res.body.jwt);
            return res.body.jwt;
        });
    }
    //#endregion
    //#region databases
    /**
     * Creates a new `Database` instance for the given `databaseName` that
     * shares this database's connection pool.
     *
     * See also {@link Database:constructor}.
     *
     * @param databaseName - Name of the database.
     *
     * @example
     * ```js
     * const systemDb = new Database();
     * const myDb = system.database("my_database");
     * ```
     */
    database(databaseName) {
        return new Database(this, databaseName);
    }
    /**
     * Fetches the database description for the active database from the server.
     *
     * @example
     * ```js
     * const db = new Database();
     * const info = await db.get();
     * // the database exists
     * ```
     */
    get() {
        return this.request({ path: "/_api/database/current" }, (res) => res.body.result);
    }
    /**
     * Checks whether the database exists.
     *
     * @example
     * ```js
     * const db = new Database();
     * const result = await db.exists();
     * // result indicates whether the database exists
     * ```
     */
    async exists() {
        try {
            await this.get();
            return true;
        }
        catch (err) {
            if ((0, error_1.isArangoError)(err) && err.errorNum === codes_1.DATABASE_NOT_FOUND) {
                return false;
            }
            throw err;
        }
    }
    createDatabase(databaseName, usersOrOptions = {}) {
        const { users, ...options } = Array.isArray(usersOrOptions)
            ? { users: usersOrOptions }
            : usersOrOptions;
        return this.request({
            method: "POST",
            path: "/_api/database",
            body: { name: databaseName.normalize("NFC"), users, options },
        }, () => this.database(databaseName));
    }
    /**
     * Fetches all databases from the server and returns an array of their names.
     *
     * See also {@link Database#databases} and
     * {@link Database#listUserDatabases}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const names = await db.listDatabases();
     * // databases is an array of database names
     * ```
     */
    listDatabases() {
        return this.request({ path: "/_api/database" }, (res) => res.body.result);
    }
    /**
     * Fetches all databases accessible to the active user from the server and
     * returns an array of their names.
     *
     * See also {@link Database#userDatabases} and
     * {@link Database#listDatabases}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const names = await db.listUserDatabases();
     * // databases is an array of database names
     * ```
     */
    listUserDatabases() {
        return this.request({ path: "/_api/database/user" }, (res) => res.body.result);
    }
    /**
     * Fetches all databases from the server and returns an array of `Database`
     * instances for those databases.
     *
     * See also {@link Database#listDatabases} and
     * {@link Database#userDatabases}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const names = await db.databases();
     * // databases is an array of databases
     * ```
     */
    databases() {
        return this.request({ path: "/_api/database" }, (res) => res.body.result.map((databaseName) => this.database(databaseName)));
    }
    /**
     * Fetches all databases accessible to the active user from the server and
     * returns an array of `Database` instances for those databases.
     *
     * See also {@link Database#listUserDatabases} and
     * {@link Database#databases}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const names = await db.userDatabases();
     * // databases is an array of databases
     * ```
     */
    userDatabases() {
        return this.request({ path: "/_api/database/user" }, (res) => res.body.result.map((databaseName) => this.database(databaseName)));
    }
    /**
     * Deletes the database with the given `databaseName` from the server.
     *
     * @param databaseName - Name of the database to delete.
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.dropDatabase("mydb");
     * // database "mydb" no longer exists
     * ```
     */
    dropDatabase(databaseName) {
        databaseName = databaseName.normalize("NFC");
        return this.request({
            method: "DELETE",
            path: `/_api/database/${encodeURIComponent(databaseName)}`,
        }, (res) => res.body.result);
    }
    //#endregion
    //#region collections
    /**
     * Returns a `Collection` instance for the given collection name.
     *
     * In TypeScript the collection implements both the
     * {@link collection.DocumentCollection} and {@link collection.EdgeCollection}
     * interfaces and can be cast to either type to enforce a stricter API.
     *
     * @param T - Type to use for document data. Defaults to `any`.
     * @param collectionName - Name of the edge collection.
     *
     * @example
     * ```js
     * const db = new Database();
     * const collection = db.collection("potatoes");
     * ```
     *
     * @example
     * ```ts
     * interface Person {
     *   name: string;
     * }
     * const db = new Database();
     * const persons = db.collection<Person>("persons");
     * ```
     *
     * @example
     * ```ts
     * interface Person {
     *   name: string;
     * }
     * interface Friend {
     *   startDate: number;
     *   endDate?: number;
     * }
     * const db = new Database();
     * const documents = db.collection("persons") as DocumentCollection<Person>;
     * const edges = db.collection("friends") as EdgeCollection<Friend>;
     * ```
     */
    collection(collectionName) {
        collectionName = collectionName.normalize("NFC");
        if (!this._collections.has(collectionName)) {
            this._collections.set(collectionName, new collection_1.Collection(this, collectionName));
        }
        return this._collections.get(collectionName);
    }
    async createCollection(collectionName, options) {
        const collection = this.collection(collectionName);
        await collection.create(options);
        return collection;
    }
    /**
     * Creates a new edge collection with the given `collectionName` and
     * `options`, then returns an {@link collection.EdgeCollection} instance for the new
     * edge collection.
     *
     * This is a convenience method for calling {@link Database#createCollection}
     * with `options.type` set to `EDGE_COLLECTION`.
     *
     * @param T - Type to use for edge document data. Defaults to `any`.
     * @param collectionName - Name of the new collection.
     * @param options - Options for creating the collection.
     *
     * @example
     * ```js
     * const db = new Database();
     * const edges = db.createEdgeCollection("friends");
     * ```
     *
     * @example
     * ```ts
     * interface Friend {
     *   startDate: number;
     *   endDate?: number;
     * }
     * const db = new Database();
     * const edges = db.createEdgeCollection<Friend>("friends");
     * ```
     */
    async createEdgeCollection(collectionName, options) {
        return this.createCollection(collectionName, {
            ...options,
            type: collection_1.CollectionType.EDGE_COLLECTION,
        });
    }
    /**
     * Renames the collection `collectionName` to `newName`.
     *
     * Additionally removes any stored `Collection` instance for
     * `collectionName` from the `Database` instance's internal cache.
     *
     * **Note**: Renaming collections may not be supported when ArangoDB is
     * running in a cluster configuration.
     *
     * @param collectionName - Current name of the collection.
     * @param newName - The new name of the collection.
     */
    async renameCollection(collectionName, newName) {
        collectionName = collectionName.normalize("NFC");
        const result = await this.request({
            method: "PUT",
            path: `/_api/collection/${encodeURIComponent(collectionName)}/rename`,
            body: { name: newName.normalize("NFC") },
        });
        this._collections.delete(collectionName);
        return result;
    }
    /**
     * Fetches all collections from the database and returns an array of
     * collection descriptions.
     *
     * See also {@link Database#collections}.
     *
     * @param excludeSystem - Whether system collections should be excluded.
     *
     * @example
     * ```js
     * const db = new Database();
     * const collections = await db.listCollections();
     * // collections is an array of collection descriptions
     * // not including system collections
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const collections = await db.listCollections(false);
     * // collections is an array of collection descriptions
     * // including system collections
     * ```
     */
    listCollections(excludeSystem = true) {
        return this.request({
            path: "/_api/collection",
            qs: { excludeSystem },
        }, (res) => res.body.result);
    }
    /**
     * Fetches all collections from the database and returns an array of
     * `Collection` instances.
     *
     * In TypeScript these instances implement both the
     * {@link collection.DocumentCollection} and {@link collection.EdgeCollection}
     * interfaces and can be cast to either type to enforce a stricter API.
     *
     * See also {@link Database#listCollections}.
     *
     * @param excludeSystem - Whether system collections should be excluded.
     *
     * @example
     * ```js
     * const db = new Database();
     * const collections = await db.collections();
     * // collections is an array of DocumentCollection and EdgeCollection
     * // instances not including system collections
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const collections = await db.collections(false);
     * // collections is an array of DocumentCollection and EdgeCollection
     * // instances including system collections
     * ```
     */
    async collections(excludeSystem = true) {
        const collections = await this.listCollections(excludeSystem);
        return collections.map((data) => this.collection(data.name));
    }
    //#endregion
    //#region graphs
    /**
     * Returns a {@link graph.Graph} instance representing the graph with the given
     * `graphName`.
     *
     * @param graphName - Name of the graph.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * ```
     */
    graph(graphName) {
        graphName = graphName.normalize("NFC");
        if (!this._graphs.has(graphName)) {
            this._graphs.set(graphName, new graph_1.Graph(this, graphName));
        }
        return this._graphs.get(graphName);
    }
    /**
     * Creates a graph with the given `graphName` and `edgeDefinitions`, then
     * returns a {@link graph.Graph} instance for the new graph.
     *
     * @param graphName - Name of the graph to be created.
     * @param edgeDefinitions - An array of edge definitions.
     * @param options - An object defining the properties of the graph.
     */
    async createGraph(graphName, edgeDefinitions, options) {
        const graph = this.graph(graphName.normalize("NFC"));
        await graph.create(edgeDefinitions, options);
        return graph;
    }
    /**
     * Fetches all graphs from the database and returns an array of graph
     * descriptions.
     *
     * See also {@link Database#graphs}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graphs = await db.listGraphs();
     * // graphs is an array of graph descriptions
     * ```
     */
    listGraphs() {
        return this.request({ path: "/_api/gharial" }, (res) => res.body.graphs);
    }
    /**
     * Fetches all graphs from the database and returns an array of {@link graph.Graph}
     * instances for those graphs.
     *
     * See also {@link Database#listGraphs}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graphs = await db.graphs();
     * // graphs is an array of Graph instances
     * ```
     */
    async graphs() {
        const graphs = await this.listGraphs();
        return graphs.map((data) => this.graph(data._key));
    }
    //#endregion
    //#region views
    /**
     * Returns a {@link view.View} instance for the given `viewName`.
     *
     * @param viewName - Name of the ArangoSearch or SearchAlias View.
     *
     * @example
     * ```js
     * const db = new Database();
     * const view = db.view("potatoes");
     * ```
     */
    view(viewName) {
        viewName = viewName.normalize("NFC");
        if (!this._views.has(viewName)) {
            this._views.set(viewName, new view_1.View(this, viewName));
        }
        return this._views.get(viewName);
    }
    /**
     * Creates a new View with the given `viewName` and `options`, then returns a
     * {@link view.View} instance for the new View.
     *
     * @param viewName - Name of the View.
     * @param options - An object defining the properties of the View.
     *
     * @example
     * ```js
     * const db = new Database();
     * const view = await db.createView("potatoes", { type: "arangosearch" });
     * // the ArangoSearch View "potatoes" now exists
     * ```
     */
    async createView(viewName, options) {
        const view = this.view(viewName.normalize("NFC"));
        await view.create(options);
        return view;
    }
    /**
     * Renames the view `viewName` to `newName`.
     *
     * Additionally removes any stored {@link view.View} instance for `viewName` from
     * the `Database` instance's internal cache.
     *
     * **Note**: Renaming views may not be supported when ArangoDB is running in
     * a cluster configuration.
     *
     * @param viewName - Current name of the view.
     * @param newName - The new name of the view.
     */
    async renameView(viewName, newName) {
        viewName = viewName.normalize("NFC");
        const result = await this.request({
            method: "PUT",
            path: `/_api/view/${encodeURIComponent(viewName)}/rename`,
            body: { name: newName.normalize("NFC") },
        });
        this._views.delete(viewName);
        return result;
    }
    /**
     * Fetches all Views from the database and returns an array of View
     * descriptions.
     *
     * See also {@link Database#views}.
     *
     * @example
     * ```js
     * const db = new Database();
     *
     * const views = await db.listViews();
     * // views is an array of View descriptions
     * ```
     */
    listViews() {
        return this.request({ path: "/_api/view" }, (res) => res.body.result);
    }
    /**
     * Fetches all Views from the database and returns an array of
     * {@link view.View} instances
     * for the Views.
     *
     * See also {@link Database#listViews}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const views = await db.views();
     * // views is an array of ArangoSearch View instances
     * ```
     */
    async views() {
        const views = await this.listViews();
        return views.map((data) => this.view(data.name));
    }
    //#endregion
    //#region analyzers
    /**
     * Returns an {@link analyzer.Analyzer} instance representing the Analyzer with the
     * given `analyzerName`.
     *
     * @example
     * ```js
     * const db = new Database();
     * const analyzer = db.analyzer("some-analyzer");
     * const info = await analyzer.get();
     * ```
     */
    analyzer(analyzerName) {
        analyzerName = analyzerName.normalize("NFC");
        if (!this._analyzers.has(analyzerName)) {
            this._analyzers.set(analyzerName, new analyzer_1.Analyzer(this, analyzerName));
        }
        return this._analyzers.get(analyzerName);
    }
    /**
     * Creates a new Analyzer with the given `analyzerName` and `options`, then
     * returns an {@link analyzer.Analyzer} instance for the new Analyzer.
     *
     * @param analyzerName - Name of the Analyzer.
     * @param options - An object defining the properties of the Analyzer.
     *
     * @example
     * ```js
     * const db = new Database();
     * const analyzer = await db.createAnalyzer("potatoes", { type: "identity" });
     * // the identity Analyzer "potatoes" now exists
     * ```
     */
    async createAnalyzer(analyzerName, options) {
        const analyzer = this.analyzer(analyzerName);
        await analyzer.create(options);
        return analyzer;
    }
    /**
     * Fetches all Analyzers visible in the database and returns an array of
     * Analyzer descriptions.
     *
     * See also {@link Database#analyzers}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const analyzers = await db.listAnalyzers();
     * // analyzers is an array of Analyzer descriptions
     * ```
     */
    listAnalyzers() {
        return this.request({ path: "/_api/analyzer" }, (res) => res.body.result);
    }
    /**
     * Fetches all Analyzers visible in the database and returns an array of
     * {@link analyzer.Analyzer} instances for those Analyzers.
     *
     * See also {@link Database#listAnalyzers}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const analyzers = await db.analyzers();
     * // analyzers is an array of Analyzer instances
     * ```
     */
    async analyzers() {
        const analyzers = await this.listAnalyzers();
        return analyzers.map((data) => this.analyzer(data.name));
    }
    //#endregion
    //#region users
    /**
     * Fetches all ArangoDB users visible to the authenticated user and returns
     * an array of user objects.
     *
     * @example
     * ```js
     * const db = new Database();
     * const users = await db.listUsers();
     * // users is an array of user objects
     * ```
     */
    listUsers() {
        return this.request({
            absolutePath: true,
            path: "/_api/user",
        });
    }
    /**
     * Fetches the user data of a single ArangoDB user.
     *
     * @param username - Name of the ArangoDB user to fetch.
     *
     * @example
     * ```js
     * const db = new Database();
     * const user = await db.getUser("steve");
     * // user is the user object for the user named "steve"
     * ```
     */
    getUser(username) {
        return this.request({
            absolutePath: true,
            path: `/_api/user/${encodeURIComponent(username)}`,
        });
    }
    createUser(username, options) {
        if (typeof options === "string") {
            options = { passwd: options };
        }
        return this.request({
            absolutePath: true,
            method: "POST",
            path: "/_api/user",
            body: { user: username, ...options },
        }, (res) => res.body);
    }
    updateUser(username, options) {
        if (typeof options === "string") {
            options = { passwd: options };
        }
        return this.request({
            absolutePath: true,
            method: "PATCH",
            path: `/api/user/${encodeURIComponent(username)}`,
            body: options,
        }, (res) => res.body);
    }
    /**
     * Replaces the ArangoDB user's option with the new options.
     *
     * @param username - Name of the ArangoDB user to modify.
     * @param options - New options to replace the user's existing options.
     *
     * @example
     * ```js
     * const db = new Database();
     * const user = await db.replaceUser("steve", { passwd: "", active: false });
     * // The user "steve" has been set to inactive with an empty password
     * ```
     */
    replaceUser(username, options) {
        if (typeof options === "string") {
            options = { passwd: options };
        }
        return this.request({
            absolutePath: true,
            method: "PUT",
            path: `/api/user/${encodeURIComponent(username)}`,
            body: options,
        }, (res) => res.body);
    }
    /**
     * Removes the ArangoDB user with the given username from the server.
     *
     * @param username - Name of the ArangoDB user to remove.
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.removeUser("steve");
     * // The user "steve" has been removed
     * ```
     */
    removeUser(username) {
        return this.request({
            absolutePath: true,
            method: "DELETE",
            path: `/_api/user/${encodeURIComponent(username)}`,
        }, (res) => res.body);
    }
    /**
     * Fetches the given ArangoDB user's access level for the database, or the
     * given collection in the given database.
     *
     * @param username - Name of the ArangoDB user to fetch the access level for.
     * @param database - Database to fetch the access level for.
     * @param collection - Collection to fetch the access level for.
     *
     * @example
     * ```js
     * const db = new Database();
     * const accessLevel = await db.getUserAccessLevel("steve");
     * // The access level of the user "steve" has been fetched for the current
     * // database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const accessLevel = await db.getUserAccessLevel("steve", {
     *   database: "staging"
     * });
     * // The access level of the user "steve" has been fetched for the "staging"
     * // database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const accessLevel = await db.getUserAccessLevel("steve", {
     *   collection: "pokemons"
     * });
     * // The access level of the user "steve" has been fetched for the
     * // "pokemons" collection in the current database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const accessLevel = await db.getUserAccessLevel("steve", {
     *   database: "staging",
     *   collection: "pokemons"
     * });
     * // The access level of the user "steve" has been fetched for the
     * // "pokemons" collection in the "staging" database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const staging = db.database("staging");
     * const accessLevel = await db.getUserAccessLevel("steve", {
     *   database: staging
     * });
     * // The access level of the user "steve" has been fetched for the "staging"
     * // database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const staging = db.database("staging");
     * const accessLevel = await db.getUserAccessLevel("steve", {
     *   collection: staging.collection("pokemons")
     * });
     * // The access level of the user "steve" has been fetched for the
     * // "pokemons" collection in database "staging".
     * ```
     */
    getUserAccessLevel(username, { database, collection }) {
        const databaseName = isArangoDatabase(database)
            ? database.name
            : database?.normalize("NFC") ??
                ((0, collection_1.isArangoCollection)(collection)
                    ? collection._db.name
                    : this._name);
        const suffix = collection
            ? `/${encodeURIComponent((0, collection_1.isArangoCollection)(collection)
                ? collection.name
                : collection.normalize("NFC"))}`
            : "";
        return this.request({
            absolutePath: true,
            path: `/_api/user/${encodeURIComponent(username)}/database/${encodeURIComponent(databaseName)}${suffix}`,
        }, (res) => res.body.result);
    }
    /**
     * Sets the given ArangoDB user's access level for the database, or the
     * given collection in the given database.
     *
     * @param username - Name of the ArangoDB user to set the access level for.
     * @param database - Database to set the access level for.
     * @param collection - Collection to set the access level for.
     * @param grant - Access level to set for the given user.
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.setUserAccessLevel("steve", { grant: "rw" });
     * // The user "steve" now has read-write access to the current database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.setUserAccessLevel("steve", {
     *   database: "staging",
     *   grant: "rw"
     * });
     * // The user "steve" now has read-write access to the "staging" database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.setUserAccessLevel("steve", {
     *   collection: "pokemons",
     *   grant: "rw"
     * });
     * // The user "steve" now has read-write access to the "pokemons" collection
     * // in the current database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.setUserAccessLevel("steve", {
     *   database: "staging",
     *   collection: "pokemons",
     *   grant: "rw"
     * });
     * // The user "steve" now has read-write access to the "pokemons" collection
     * // in the "staging" database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const staging = db.database("staging");
     * await db.setUserAccessLevel("steve", {
     *   database: staging,
     *   grant: "rw"
     * });
     * // The user "steve" now has read-write access to the "staging" database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const staging = db.database("staging");
     * await db.setUserAccessLevel("steve", {
     *   collection: staging.collection("pokemons"),
     *   grant: "rw"
     * });
     * // The user "steve" now has read-write access to the "pokemons" collection
     * // in database "staging".
     * ```
     */
    setUserAccessLevel(username, { database, collection, grant, }) {
        const databaseName = isArangoDatabase(database)
            ? database.name
            : database?.normalize("NFC") ??
                ((0, collection_1.isArangoCollection)(collection)
                    ? collection._db.name
                    : this._name);
        const suffix = collection
            ? `/${encodeURIComponent((0, collection_1.isArangoCollection)(collection)
                ? collection.name
                : collection.normalize("NFC"))}`
            : "";
        return this.request({
            absolutePath: true,
            method: "PUT",
            path: `/_api/user/${encodeURIComponent(username)}/database/${encodeURIComponent(databaseName)}${suffix}`,
            body: { grant },
        }, (res) => res.body);
    }
    /**
     * Clears the given ArangoDB user's access level for the database, or the
     * given collection in the given database.
     *
     * @param username - Name of the ArangoDB user to clear the access level for.
     * @param database - Database to clear the access level for.
     * @param collection - Collection to clear the access level for.
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.clearUserAccessLevel("steve");
     * // The access level of the user "steve" has been cleared for the current
     * // database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.clearUserAccessLevel("steve", { database: "staging" });
     * // The access level of the user "steve" has been cleared for the "staging"
     * // database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.clearUserAccessLevel("steve", { collection: "pokemons" });
     * // The access level of the user "steve" has been cleared for the
     * // "pokemons" collection in the current database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.clearUserAccessLevel("steve", {
     *   database: "staging",
     *   collection: "pokemons"
     * });
     * // The access level of the user "steve" has been cleared for the
     * // "pokemons" collection in the "staging" database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const staging = db.database("staging");
     * await db.clearUserAccessLevel("steve", { database: staging });
     * // The access level of the user "steve" has been cleared for the "staging"
     * // database.
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const staging = db.database("staging");
     * await db.clearUserAccessLevel("steve", {
     *   collection: staging.collection("pokemons")
     * });
     * // The access level of the user "steve" has been cleared for the
     * // "pokemons" collection in database "staging".
     * ```
     */
    clearUserAccessLevel(username, { database, collection }) {
        const databaseName = isArangoDatabase(database)
            ? database.name
            : database?.normalize("NFC") ??
                ((0, collection_1.isArangoCollection)(collection)
                    ? collection._db.name
                    : this._name);
        const suffix = collection
            ? `/${encodeURIComponent((0, collection_1.isArangoCollection)(collection)
                ? collection.name
                : collection.normalize("NFC"))}`
            : "";
        return this.request({
            absolutePath: true,
            method: "DELETE",
            path: `/_api/user/${encodeURIComponent(username)}/database/${encodeURIComponent(databaseName)}${suffix}`,
        }, (res) => res.body);
    }
    getUserDatabases(username, full) {
        return this.request({
            absolutePath: true,
            path: `/_api/user/${encodeURIComponent(username)}/database`,
            qs: { full },
        }, (res) => res.body.result);
    }
    executeTransaction(collections, action, options = {}) {
        const { allowDirtyRead = undefined, ...opts } = options;
        return this.request({
            method: "POST",
            path: "/_api/transaction",
            allowDirtyRead,
            body: {
                collections: coerceTransactionCollections(collections),
                action,
                ...opts,
            },
        }, (res) => res.body.result);
    }
    /**
     * Returns a {@link transaction.Transaction} instance for an existing streaming
     * transaction with the given `id`.
     *
     * See also {@link Database#beginTransaction}.
     *
     * @param id - The `id` of an existing stream transaction.
     *
     * @example
     * ```js
     * const trx1 = await db.beginTransaction(collections);
     * const id = trx1.id;
     * // later
     * const trx2 = db.transaction(id);
     * await trx2.commit();
     * ```
     */
    transaction(transactionId) {
        return new transaction_1.Transaction(this, transactionId);
    }
    beginTransaction(collections, options = {}) {
        const { allowDirtyRead = undefined, ...opts } = options;
        return this.request({
            method: "POST",
            path: "/_api/transaction/begin",
            allowDirtyRead,
            body: {
                collections: coerceTransactionCollections(collections),
                ...opts,
            },
        }, (res) => new transaction_1.Transaction(this, res.body.result.id));
    }
    /**
     * Fetches all active transactions from the database and returns an array of
     * transaction descriptions.
     *
     * See also {@link Database#transactions}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const transactions = await db.listTransactions();
     * // transactions is an array of transaction descriptions
     * ```
     */
    listTransactions() {
        return this._connection.request({ path: "/_api/transaction" }, (res) => res.body.transactions);
    }
    /**
     * Fetches all active transactions from the database and returns an array of
     * {@link transaction.Transaction} instances for those transactions.
     *
     * See also {@link Database#listTransactions}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const transactions = await db.transactions();
     * // transactions is an array of transactions
     * ```
     */
    async transactions() {
        const transactions = await this.listTransactions();
        return transactions.map((data) => this.transaction(data.id));
    }
    query(query, bindVars, options = {}) {
        if ((0, aql_1.isAqlQuery)(query)) {
            options = bindVars ?? {};
            bindVars = query.bindVars;
            query = query.query;
        }
        else if ((0, aql_1.isAqlLiteral)(query)) {
            query = query.toAQL();
        }
        const { allowDirtyRead, retryOnConflict, count, batchSize, cache, memoryLimit, ttl, timeout, ...opts } = options;
        return this.request({
            method: "POST",
            path: "/_api/cursor",
            body: {
                query,
                bindVars,
                count,
                batchSize,
                cache,
                memoryLimit,
                ttl,
                options: opts,
            },
            allowDirtyRead,
            retryOnConflict,
            timeout,
        }, (res) => new cursor_1.BatchedArrayCursor(this, res.body, res.arangojsHostUrl, allowDirtyRead).items);
    }
    explain(query, bindVars, options) {
        if ((0, aql_1.isAqlQuery)(query)) {
            options = bindVars;
            bindVars = query.bindVars;
            query = query.query;
        }
        else if ((0, aql_1.isAqlLiteral)(query)) {
            query = query.toAQL();
        }
        return this.request({
            method: "POST",
            path: "/_api/explain",
            body: { query, bindVars, options },
        });
    }
    /**
     * Parses the given query and returns the result.
     *
     * See the {@link aql!aql} template string handler for information about how
     * to create a query string without manually defining bind parameters nor
     * having to worry about escaping variables.
     *
     * @param query - An AQL query string or an object containing an AQL query
     * string and bind parameters, e.g. the object returned from an {@link aql!aql}
     * template string.
     *
     * @example
     * ```js
     * const db = new Database();
     * const collection = db.collection("some-collection");
     * const ast = await db.parse(aql`
     *   FOR doc IN ${collection}
     *   FILTER doc.flavor == "strawberry"
     *   RETURN doc._key
     * `);
     * ```
     */
    parse(query) {
        if ((0, aql_1.isAqlQuery)(query)) {
            query = query.query;
        }
        else if ((0, aql_1.isAqlLiteral)(query)) {
            query = query.toAQL();
        }
        return this.request({
            method: "POST",
            path: "/_api/query",
            body: { query },
        });
    }
    /**
     * Fetches the available optimizer rules.
     *
     * @example
     * ```js
     * const db = new Database();
     * const rules = await db.queryRules();
     * for (const rule of rules) {
     *   console.log(rule.name);
     * }
     * ```
     */
    queryRules() {
        return this.request({
            path: "/_api/query/rules",
        });
    }
    queryTracking(options) {
        return this.request(options
            ? {
                method: "PUT",
                path: "/_api/query/properties",
                body: options,
            }
            : {
                method: "GET",
                path: "/_api/query/properties",
            });
    }
    /**
     * Fetches a list of information for all currently running queries.
     *
     * See also {@link Database#listSlowQueries} and {@link Database#killQuery}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const queries = await db.listRunningQueries();
     * ```
     */
    listRunningQueries() {
        return this.request({
            method: "GET",
            path: "/_api/query/current",
        });
    }
    /**
     * Fetches a list of information for all recent slow queries.
     *
     * See also {@link Database#listRunningQueries} and
     * {@link Database#clearSlowQueries}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const queries = await db.listSlowQueries();
     * // Only works if slow query tracking is enabled
     * ```
     */
    listSlowQueries() {
        return this.request({
            method: "GET",
            path: "/_api/query/slow",
        });
    }
    /**
     * Clears the list of recent slow queries.
     *
     * See also {@link Database#listSlowQueries}.
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.clearSlowQueries();
     * // Slow query list is now cleared
     * ```
     */
    clearSlowQueries() {
        return this.request({
            method: "DELETE",
            path: "/_api/query/slow",
        }, () => undefined);
    }
    /**
     * Kills a running query with the given `queryId`.
     *
     * See also {@link Database#listRunningQueries}.
     *
     * @param queryId - The ID of a currently running query.
     *
     * @example
     * ```js
     * const db = new Database();
     * const queries = await db.listRunningQueries();
     * await Promise.all(queries.map(
     *   async (query) => {
     *     if (query.state === "executing") {
     *       await db.killQuery(query.id);
     *     }
     *   }
     * ));
     * ```
     */
    killQuery(queryId) {
        return this.request({
            method: "DELETE",
            path: `/_api/query/${encodeURIComponent(queryId)}`,
        }, () => undefined);
    }
    //#endregion
    //#region functions
    /**
     * Fetches a list of all AQL user functions registered with the database.
     *
     * @example
     * ```js
     * const db = new Database();
     * const functions = await db.listFunctions();
     * const names = functions.map(fn => fn.name);
     * ```
     */
    listFunctions() {
        return this.request({ path: "/_api/aqlfunction" }, (res) => res.body.result);
    }
    /**
     * Creates an AQL user function with the given _name_ and _code_ if it does
     * not already exist or replaces it if a function with the same name already
     * existed.
     *
     * @param name - A valid AQL function name. The function name must consist
     * of at least two alphanumeric identifiers separated with double colons.
     * @param code - A string evaluating to a JavaScript function (not a
     * JavaScript function object).
     * @param isDeterministic - If set to `true`, the function is expected to
     * always return the same result for equivalent inputs. This option currently
     * has no effect but may allow for optimizations in the future.
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.createFunction(
     *   "ACME::ACCOUNTING::CALCULATE_VAT",
     *   "(price) => price * 0.19"
     * );
     * // Use the new function in an AQL query with template handler:
     * const cursor = await db.query(aql`
     *   FOR product IN products
     *   RETURN MERGE(
     *     { vat: ACME::ACCOUNTING::CALCULATE_VAT(product.price) },
     *     product
     *   )
     * `);
     * // cursor is a cursor for the query result
     * ```
     */
    createFunction(name, code, isDeterministic = false) {
        return this.request({
            method: "POST",
            path: "/_api/aqlfunction",
            body: { name, code, isDeterministic },
        });
    }
    /**
     * Deletes the AQL user function with the given name from the database.
     *
     * @param name - The name of the user function to drop.
     * @param group - If set to `true`, all functions with a name starting with
     * `name` will be deleted, otherwise only the function with the exact name
     * will be deleted.
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.dropFunction("ACME::ACCOUNTING::CALCULATE_VAT");
     * // the function no longer exists
     * ```
     */
    dropFunction(name, group = false) {
        return this.request({
            method: "DELETE",
            path: `/_api/aqlfunction/${encodeURIComponent(name)}`,
            qs: { group },
        });
    }
    //#endregion
    //#region services
    /**
     * Fetches a list of all installed service.
     *
     * @param excludeSystem - Whether system services should be excluded.
     *
     * @example
     * ```js
     * const db = new Database();
     * const services = await db.listServices();
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * const services = await db.listServices(false); // all services
     * ```
     */
    listServices(excludeSystem = true) {
        return this.request({
            path: "/_api/foxx",
            qs: { excludeSystem },
        });
    }
    /**
     * Installs a new service.
     *
     * @param mount - The service's mount point, relative to the database.
     * @param source - The service bundle to install.
     * @param options - Options for installing the service.
     *
     * @example
     * ```js
     * const db = new Database();
     * // Using a node.js file stream as source
     * const source = fs.createReadStream("./my-foxx-service.zip");
     * const info = await db.installService("/hello", source);
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * // Using a node.js Buffer as source
     * const source = fs.readFileSync("./my-foxx-service.zip");
     * const info = await db.installService("/hello", source);
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * // Using a File (Blob) from a browser file input
     * const element = document.getElementById("my-file-input");
     * const source = element.files[0];
     * const info = await db.installService("/hello", source);
     * ```
     */
    async installService(mount, source, options = {}) {
        const { configuration, dependencies, ...qs } = options;
        const req = await (0, multipart_1.toForm)({
            configuration,
            dependencies,
            source,
        });
        return await this.request({
            ...req,
            method: "POST",
            path: "/_api/foxx",
            isBinary: true,
            qs: { ...qs, mount },
        });
    }
    /**
     * Replaces an existing service with a new service by completely removing the
     * old service and installing a new service at the same mount point.
     *
     * @param mount - The service's mount point, relative to the database.
     * @param source - The service bundle to install.
     * @param options - Options for replacing the service.
     *
     * @example
     * ```js
     * const db = new Database();
     * // Using a node.js file stream as source
     * const source = fs.createReadStream("./my-foxx-service.zip");
     * const info = await db.replaceService("/hello", source);
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * // Using a node.js Buffer as source
     * const source = fs.readFileSync("./my-foxx-service.zip");
     * const info = await db.replaceService("/hello", source);
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * // Using a File (Blob) from a browser file input
     * const element = document.getElementById("my-file-input");
     * const source = element.files[0];
     * const info = await db.replaceService("/hello", source);
     * ```
     */
    async replaceService(mount, source, options = {}) {
        const { configuration, dependencies, ...qs } = options;
        const req = await (0, multipart_1.toForm)({
            configuration,
            dependencies,
            source,
        });
        return await this.request({
            ...req,
            method: "PUT",
            path: "/_api/foxx/service",
            isBinary: true,
            qs: { ...qs, mount },
        });
    }
    /**
     * Replaces an existing service with a new service while retaining the old
     * service's configuration and dependencies.
     *
     * @param mount - The service's mount point, relative to the database.
     * @param source - The service bundle to install.
     * @param options - Options for upgrading the service.
     *
     * @example
     * ```js
     * const db = new Database();
     * // Using a node.js file stream as source
     * const source = fs.createReadStream("./my-foxx-service.zip");
     * const info = await db.upgradeService("/hello", source);
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * // Using a node.js Buffer as source
     * const source = fs.readFileSync("./my-foxx-service.zip");
     * const info = await db.upgradeService("/hello", source);
     * ```
     *
     * @example
     * ```js
     * const db = new Database();
     * // Using a File (Blob) from a browser file input
     * const element = document.getElementById("my-file-input");
     * const source = element.files[0];
     * const info = await db.upgradeService("/hello", source);
     * ```
     */
    async upgradeService(mount, source, options = {}) {
        const { configuration, dependencies, ...qs } = options;
        const req = await (0, multipart_1.toForm)({
            configuration,
            dependencies,
            source,
        });
        return await this.request({
            ...req,
            method: "PATCH",
            path: "/_api/foxx/service",
            isBinary: true,
            qs: { ...qs, mount },
        });
    }
    /**
     * Completely removes a service from the database.
     *
     * @param mount - The service's mount point, relative to the database.
     * @param options - Options for uninstalling the service.
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.uninstallService("/my-foxx");
     * ```
     */
    uninstallService(mount, options) {
        return this.request({
            method: "DELETE",
            path: "/_api/foxx/service",
            qs: { ...options, mount },
        }, () => undefined);
    }
    /**
     * Retrieves information about a mounted service.
     *
     * @param mount - The service's mount point, relative to the database.
     *
     * @example
     * ```js
     * const db = new Database();
     * const info = await db.getService("/my-service");
     * // info contains detailed information about the service
     * ```
     */
    getService(mount) {
        return this.request({
            path: "/_api/foxx/service",
            qs: { mount },
        });
    }
    getServiceConfiguration(mount, minimal = false) {
        return this.request({
            path: "/_api/foxx/configuration",
            qs: { mount, minimal },
        });
    }
    replaceServiceConfiguration(mount, cfg, minimal = false) {
        return this.request({
            method: "PUT",
            path: "/_api/foxx/configuration",
            body: cfg,
            qs: { mount, minimal },
        });
    }
    updateServiceConfiguration(mount, cfg, minimal = false) {
        return this.request({
            method: "PATCH",
            path: "/_api/foxx/configuration",
            body: cfg,
            qs: { mount, minimal },
        });
    }
    getServiceDependencies(mount, minimal = false) {
        return this.request({
            path: "/_api/foxx/dependencies",
            qs: { mount, minimal },
        });
    }
    replaceServiceDependencies(mount, deps, minimal = false) {
        return this.request({
            method: "PUT",
            path: "/_api/foxx/dependencies",
            body: deps,
            qs: { mount, minimal },
        });
    }
    updateServiceDependencies(mount, deps, minimal = false) {
        return this.request({
            method: "PATCH",
            path: "/_api/foxx/dependencies",
            body: deps,
            qs: { mount, minimal },
        });
    }
    /**
     * Enables or disables development mode for the given service.
     *
     * @param mount - The service's mount point, relative to the database.
     * @param enabled - Whether development mode should be enabled or disabled.
     *
     * @example
     * ```js
     * const db = new Database();
     * await db.setServiceDevelopmentMode("/my-service", true);
     * // the service is now in development mode
     * await db.setServiceDevelopmentMode("/my-service", false);
     * // the service is now in production mode
     * ```
     */
    setServiceDevelopmentMode(mount, enabled = true) {
        return this.request({
            method: enabled ? "POST" : "DELETE",
            path: "/_api/foxx/development",
            qs: { mount },
        });
    }
    /**
     * Retrieves a list of scripts defined in the service manifest's "scripts"
     * section mapped to their human readable representations.
     *
     * @param mount - The service's mount point, relative to the database.
     *
     * @example
     * ```js
     * const db = new Database();
     * const scripts = await db.listServiceScripts("/my-service");
     * for (const [name, title] of Object.entries(scripts)) {
     *   console.log(`${name}: ${title}`);
     * }
     * ```
     */
    listServiceScripts(mount) {
        return this.request({
            path: "/_api/foxx/scripts",
            qs: { mount },
        });
    }
    /**
     * Executes a service script and retrieves its result exposed as
     * `module.exports` (if any).
     *
     * @param mount - The service's mount point, relative to the database.
     * @param name - Name of the service script to execute as defined in the
     * service manifest.
     * @param params - Arbitrary value that will be exposed to the script as
     * `argv[0]` in the service context (e.g. `module.context.argv[0]`).
     * Must be serializable to JSON.
     *
     * @example
     * ```js
     * const db = new Database();
     * const result = await db.runServiceScript(
     *   "/my-service",
     *   "create-user",
     *   {
     *     username: "service_admin",
     *     password: "hunter2"
     *   }
     * );
     * ```
     */
    runServiceScript(mount, name, params) {
        return this.request({
            method: "POST",
            path: `/_api/foxx/scripts/${encodeURIComponent(name)}`,
            body: params,
            qs: { mount },
        });
    }
    runServiceTests(mount, options) {
        return this.request({
            method: "POST",
            path: "/_api/foxx/tests",
            qs: {
                ...options,
                mount,
            },
        });
    }
    /**
     * Retrieves the text content of the service's `README` or `README.md` file.
     *
     * Returns `undefined` if no such file could be found.
     *
     * @param mount - The service's mount point, relative to the database.
     *
     * @example
     * ```js
     * const db = new Database();
     * const readme = await db.getServiceReadme("/my-service");
     * if (readme !== undefined) console.log(readme);
     * else console.warn(`No README found.`)
     * ```
     */
    getServiceReadme(mount) {
        return this.request({
            path: "/_api/foxx/readme",
            qs: { mount },
        });
    }
    /**
     * Retrieves an Open API compatible Swagger API description object for the
     * service installed at the given mount point.
     *
     * @param mount - The service's mount point, relative to the database.
     *
     * @example
     * ```js
     * const db = new Database();
     * const spec = await db.getServiceDocumentation("/my-service");
     * // spec is a Swagger API description of the service
     * ```
     */
    getServiceDocumentation(mount) {
        return this.request({
            path: "/_api/foxx/swagger",
            qs: { mount },
        });
    }
    /**
     * Retrieves a zip bundle containing the service files.
     *
     * Returns a `Buffer` in node.js or `Blob` in the browser.
     *
     * @param mount - The service's mount point, relative to the database.
     *
     * @example
     * ```js
     * const db = new Database();
     * const serviceBundle = await db.downloadService("/my-foxx");
     * ```
     */
    downloadService(mount) {
        return this.request({
            method: "POST",
            path: "/_api/foxx/download",
            qs: { mount },
            expectBinary: true,
        });
    }
    /**
     * Writes all locally available services to the database and updates any
     * service bundles missing in the database.
     *
     * @param replace - If set to `true`, outdated services will also be
     * committed. This can be used to solve some consistency problems when
     * service bundles are missing in the database or were deleted manually.
     *
     * @example
     * ```js
     * await db.commitLocalServiceState();
     * // all services available on the coordinator have been written to the db
     * ```
     *
     * @example
     * ```js
     * await db.commitLocalServiceState(true);
     * // all service conflicts have been resolved in favor of this coordinator
     * ```
     */
    commitLocalServiceState(replace = false) {
        return this.request({
            method: "POST",
            path: "/_api/foxx/commit",
            qs: { replace },
        }, () => undefined);
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map

/***/ }),

/***/ "../node_modules/arangojs/documents.js":
/*!*********************************************!*\
  !*** ../node_modules/arangojs/documents.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * ```ts
 * import type { Document, Edge } from "arangojs/documents";
 * ```
 *
 * The "documents" module provides document/edge related types for TypeScript.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports._documentHandle = void 0;
/**
 * @internal
 */
function _documentHandle(selector, collectionName, strict = true) {
    if (typeof selector !== "string") {
        if (selector._id) {
            return _documentHandle(selector._id, collectionName);
        }
        if (selector._key) {
            return _documentHandle(selector._key, collectionName);
        }
        throw new Error("Document handle must be a string or an object with a _key or _id attribute");
    }
    if (selector.includes("/")) {
        const [head, ...tail] = selector.split("/");
        const normalizedHead = head.normalize("NFC");
        if (strict && normalizedHead !== collectionName) {
            throw new Error(`Document ID "${selector}" does not match collection name "${collectionName}"`);
        }
        return [normalizedHead, ...tail].join("/");
    }
    return `${collectionName}/${selector}`;
}
exports._documentHandle = _documentHandle;
//# sourceMappingURL=documents.js.map

/***/ }),

/***/ "../node_modules/arangojs/error.js":
/*!*****************************************!*\
  !*** ../node_modules/arangojs/error.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * ```ts
 * import type { ArangoError, HttpError } from "arangojs/error";
 * ```
 *
 * The "error" module provides types and interfaces for TypeScript related
 * to arangojs error handling.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpError = exports.ArangoError = exports.isSystemError = exports.isArangoErrorResponse = exports.isArangoError = void 0;
const messages = {
    0: "Network Error",
    304: "Not Modified",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "Request-URI Too Long",
    415: "Unsupported Media Type",
    416: "Requested Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    444: "Connection Closed Without Response",
    451: "Unavailable For Legal Reasons",
    499: "Client Closed Request",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
    599: "Network Connect Timeout Error",
};
const nativeErrorKeys = [
    "fileName",
    "lineNumber",
    "columnNumber",
    "stack",
    "description",
    "number",
];
/**
 * Indicates whether the given value represents an {@link ArangoError}.
 *
 * @param error - A value that might be an `ArangoError`.
 */
function isArangoError(error) {
    return Boolean(error && error.isArangoError);
}
exports.isArangoError = isArangoError;
/**
 * Indicates whether the given value represents an ArangoDB error response.
 *
 * @internal
 */
function isArangoErrorResponse(body) {
    return (body &&
        body.hasOwnProperty("error") &&
        body.hasOwnProperty("code") &&
        body.hasOwnProperty("errorMessage") &&
        body.hasOwnProperty("errorNum"));
}
exports.isArangoErrorResponse = isArangoErrorResponse;
/**
 * Indicates whether the given value represents a Node.js `SystemError`.
 */
function isSystemError(err) {
    return (Object.getPrototypeOf(err) === Error.prototype &&
        err.hasOwnProperty("code") &&
        err.hasOwnProperty("errno") &&
        err.hasOwnProperty("syscall"));
}
exports.isSystemError = isSystemError;
/**
 * Represents an error returned by ArangoDB.
 */
class ArangoError extends Error {
    /**
     * @internal
     */
    constructor(response) {
        super();
        this.name = "ArangoError";
        this.response = response;
        this.message = response.body.errorMessage;
        this.errorNum = response.body.errorNum;
        this.code = response.body.code;
        const err = new Error(this.message);
        err.name = this.name;
        for (const key of nativeErrorKeys) {
            if (err[key])
                this[key] = err[key];
        }
    }
    /**
     * @internal
     *
     * Indicates that this object represents an ArangoDB error.
     */
    get isArangoError() {
        return true;
    }
    toJSON() {
        return {
            error: true,
            errorMessage: this.message,
            errorNum: this.errorNum,
            code: this.code,
        };
    }
}
exports.ArangoError = ArangoError;
/**
 * Represents a plain HTTP error response.
 */
class HttpError extends Error {
    /**
     * @internal
     */
    constructor(response) {
        super();
        this.name = "HttpError";
        this.response = response;
        this.code = response.statusCode || 500;
        this.message = messages[this.code] || messages[500];
        const err = new Error(this.message);
        err.name = this.name;
        for (const key of nativeErrorKeys) {
            if (err[key])
                this[key] = err[key];
        }
    }
    toJSON() {
        return {
            error: true,
            code: this.code,
        };
    }
}
exports.HttpError = HttpError;
//# sourceMappingURL=error.js.map

/***/ }),

/***/ "../node_modules/arangojs/graph.js":
/*!*****************************************!*\
  !*** ../node_modules/arangojs/graph.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Graph = exports.GraphEdgeCollection = exports.GraphVertexCollection = exports.isArangoGraph = void 0;
/**
 * ```ts
 * import type {
 *   Graph,
 *   GraphVertexCollection,
 *   GraphEdgeCollection,
 * } from "arangojs/graph";
 * ```
 *
 * The "graph" module provides graph related types and interfaces
 * for TypeScript.
 *
 * @packageDocumentation
 */
const collection_1 = __webpack_require__(/*! ./collection */ "../node_modules/arangojs/collection.js");
const documents_1 = __webpack_require__(/*! ./documents */ "../node_modules/arangojs/documents.js");
const error_1 = __webpack_require__(/*! ./error */ "../node_modules/arangojs/error.js");
const codes_1 = __webpack_require__(/*! ./lib/codes */ "../node_modules/arangojs/lib/codes.js");
/**
 * Indicates whether the given value represents a {@link graph.Graph}.
 *
 * @param graph - A value that might be a Graph.
 */
function isArangoGraph(graph) {
    return Boolean(graph && graph.isArangoGraph);
}
exports.isArangoGraph = isArangoGraph;
/**
 * @internal
 */
function mungeGharialResponse(body, prop) {
    const { new: newDoc, old: oldDoc, [prop]: doc, ...meta } = body;
    const result = { ...meta, ...doc };
    if (typeof newDoc !== "undefined")
        result.new = newDoc;
    if (typeof oldDoc !== "undefined")
        result.old = oldDoc;
    return result;
}
/**
 * @internal
 */
function coerceEdgeDefinition(options) {
    const edgeDefinition = {};
    edgeDefinition.collection = (0, collection_1.collectionToString)(options.collection);
    edgeDefinition.from = Array.isArray(options.from)
        ? options.from.map(collection_1.collectionToString)
        : [(0, collection_1.collectionToString)(options.from)];
    edgeDefinition.to = Array.isArray(options.to)
        ? options.to.map(collection_1.collectionToString)
        : [(0, collection_1.collectionToString)(options.to)];
    return edgeDefinition;
}
/**
 * Represents a {@link collection.DocumentCollection} of vertices in a {@link graph.Graph}.
 *
 * @param T - Type to use for document data. Defaults to `any`.
 */
class GraphVertexCollection {
    /**
     * @internal
     */
    constructor(db, name, graph) {
        this._db = db;
        this._collection = db.collection(name);
        this._name = this._collection.name;
        this._graph = graph;
    }
    /**
     * @internal
     *
     * Indicates that this object represents an ArangoDB collection.
     */
    get isArangoCollection() {
        return true;
    }
    /**
     * Name of the collection.
     */
    get name() {
        return this._name;
    }
    /**
     * A {@link collection.DocumentCollection} instance for this vertex collection.
     */
    get collection() {
        return this._collection;
    }
    /**
     * The {@link graph.Graph} instance this vertex collection is bound to.
     */
    get graph() {
        return this._graph;
    }
    /**
     * Checks whether a vertex matching the given key or id exists in this
     * collection.
     *
     * Throws an exception when passed a vertex or `_id` from a different
     * collection.
     *
     * @param selector - Document `_key`, `_id` or object with either of those
     * properties (e.g. a vertex from this collection).
     *
     * @example
     * ```js
     * const graph = db.graph("some-graph");
     * const collection = graph.vertexCollection("vertices");
     * const exists = await collection.vertexExists("abc123");
     * if (!exists) {
     *   console.log("Vertex does not exist");
     * }
     * ```
     */
    async vertexExists(selector) {
        try {
            return await this._db.request({
                method: "HEAD",
                path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/vertex/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            }, () => true);
        }
        catch (err) {
            if (err.code === 404) {
                return false;
            }
            throw err;
        }
    }
    async vertex(selector, options = {}) {
        if (typeof options === "boolean") {
            options = { graceful: options };
        }
        const { allowDirtyRead = undefined, graceful = false, rev, ...qs } = options;
        const headers = {};
        if (rev)
            headers["if-match"] = rev;
        const result = this._db.request({
            path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/vertex/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            headers,
            qs,
            allowDirtyRead,
        }, (res) => res.body.vertex);
        if (!graceful)
            return result;
        try {
            return await result;
        }
        catch (err) {
            if ((0, error_1.isArangoError)(err) && err.errorNum === codes_1.DOCUMENT_NOT_FOUND) {
                return null;
            }
            throw err;
        }
    }
    save(data, options) {
        return this._db.request({
            method: "POST",
            path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/vertex/${encodeURIComponent(this._name)}`,
            body: data,
            qs: options,
        }, (res) => mungeGharialResponse(res.body, "vertex"));
    }
    replace(selector, newValue, options = {}) {
        if (typeof options === "string") {
            options = { rev: options };
        }
        const { rev, ...qs } = options;
        const headers = {};
        if (rev)
            headers["if-match"] = rev;
        return this._db.request({
            method: "PUT",
            path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/vertex/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            body: newValue,
            qs,
            headers,
        }, (res) => mungeGharialResponse(res.body, "vertex"));
    }
    update(selector, newValue, options = {}) {
        if (typeof options === "string") {
            options = { rev: options };
        }
        const headers = {};
        const { rev, ...qs } = options;
        if (rev)
            headers["if-match"] = rev;
        return this._db.request({
            method: "PATCH",
            path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/vertex/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            body: newValue,
            qs,
            headers,
        }, (res) => mungeGharialResponse(res.body, "vertex"));
    }
    remove(selector, options = {}) {
        if (typeof options === "string") {
            options = { rev: options };
        }
        const headers = {};
        const { rev, ...qs } = options;
        if (rev)
            headers["if-match"] = rev;
        return this._db.request({
            method: "DELETE",
            path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/vertex/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            qs,
            headers,
        }, (res) => mungeGharialResponse(res.body, "removed"));
    }
}
exports.GraphVertexCollection = GraphVertexCollection;
/**
 * Represents a {@link collection.EdgeCollection} of edges in a {@link graph.Graph}.
 *
 * @param T - Type to use for document data. Defaults to `any`.
 */
class GraphEdgeCollection {
    /**
     * @internal
     */
    constructor(db, name, graph) {
        this._db = db;
        this._collection = db.collection(name);
        this._name = this._collection.name;
        this._graph = graph;
    }
    /**
     * @internal
     *
     * Indicates that this object represents an ArangoDB collection.
     */
    get isArangoCollection() {
        return true;
    }
    /**
     * Name of the collection.
     */
    get name() {
        return this._name;
    }
    /**
     * A {@link collection.EdgeCollection} instance for this edge collection.
     */
    get collection() {
        return this._collection;
    }
    /**
     * The {@link graph.Graph} instance this edge collection is bound to.
     */
    get graph() {
        return this._graph;
    }
    /**
     * Checks whether a edge matching the given key or id exists in this
     * collection.
     *
     * Throws an exception when passed a edge or `_id` from a different
     * collection.
     *
     * @param selector - Document `_key`, `_id` or object with either of those
     * properties (e.g. a edge from this collection).
     *
     * @example
     * ```js
     * const graph = db.graph("some-graph");
     * const collection = graph.edgeCollection("friends")
     * const exists = await collection.edgeExists("abc123");
     * if (!exists) {
     *   console.log("Edge does not exist");
     * }
     * ```
     */
    async edgeExists(selector) {
        try {
            return await this._db.request({
                method: "HEAD",
                path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/edge/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            }, () => true);
        }
        catch (err) {
            if (err.code === 404) {
                return false;
            }
            throw err;
        }
    }
    async edge(selector, options = {}) {
        if (typeof options === "boolean") {
            options = { graceful: options };
        }
        const { allowDirtyRead = undefined, graceful = false, rev, ...qs } = options;
        const headers = {};
        if (rev)
            headers["if-match"] = rev;
        const result = this._db.request({
            path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/edge/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            qs,
            allowDirtyRead,
        }, (res) => res.body.edge);
        if (!graceful)
            return result;
        try {
            return await result;
        }
        catch (err) {
            if ((0, error_1.isArangoError)(err) && err.errorNum === codes_1.DOCUMENT_NOT_FOUND) {
                return null;
            }
            throw err;
        }
    }
    save(data, options) {
        return this._db.request({
            method: "POST",
            path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/edge/${encodeURIComponent(this._name)}`,
            body: data,
            qs: options,
        }, (res) => mungeGharialResponse(res.body, "edge"));
    }
    replace(selector, newValue, options = {}) {
        if (typeof options === "string") {
            options = { rev: options };
        }
        const { rev, ...qs } = options;
        const headers = {};
        if (rev)
            headers["if-match"] = rev;
        return this._db.request({
            method: "PUT",
            path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/edge/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            body: newValue,
            qs,
            headers,
        }, (res) => mungeGharialResponse(res.body, "edge"));
    }
    update(selector, newValue, options = {}) {
        if (typeof options === "string") {
            options = { rev: options };
        }
        const { rev, ...qs } = options;
        const headers = {};
        if (rev)
            headers["if-match"] = rev;
        return this._db.request({
            method: "PATCH",
            path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/edge/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            body: newValue,
            qs,
            headers,
        }, (res) => mungeGharialResponse(res.body, "edge"));
    }
    remove(selector, options = {}) {
        if (typeof options === "string") {
            options = { rev: options };
        }
        const { rev, ...qs } = options;
        const headers = {};
        if (rev)
            headers["if-match"] = rev;
        return this._db.request({
            method: "DELETE",
            path: `/_api/gharial/${encodeURIComponent(this.graph.name)}/edge/${encodeURI((0, documents_1._documentHandle)(selector, this._name))}`,
            qs,
            headers,
        }, (res) => mungeGharialResponse(res.body, "removed"));
    }
}
exports.GraphEdgeCollection = GraphEdgeCollection;
/**
 * Represents a graph in a {@link database.Database}.
 */
class Graph {
    /**
     * @internal
     */
    constructor(db, name) {
        this._name = name.normalize("NFC");
        this._db = db;
    }
    /**
     * @internal
     *
     * Indicates that this object represents an ArangoDB Graph.
     */
    get isArangoGraph() {
        return true;
    }
    /**
     * Name of the graph.
     */
    get name() {
        return this._name;
    }
    /**
     * Checks whether the graph exists.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * const result = await graph.exists();
     * // result indicates whether the graph exists
     * ```
     */
    async exists() {
        try {
            await this.get();
            return true;
        }
        catch (err) {
            if ((0, error_1.isArangoError)(err) && err.errorNum === codes_1.GRAPH_NOT_FOUND) {
                return false;
            }
            throw err;
        }
    }
    /**
     * Retrieves general information about the graph.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * const data = await graph.get();
     * // data contains general information about the graph
     * ```
     */
    get() {
        return this._db.request({ path: `/_api/gharial/${encodeURIComponent(this._name)}` }, (res) => res.body.graph);
    }
    /**
     * Creates a graph with the given `edgeDefinitions` and `options` for this
     * graph's name.
     *
     * @param edgeDefinitions - Definitions for the relations of the graph.
     * @param options - Options for creating the graph.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * const info = await graph.create([
     *   {
     *     collection: "edges",
     *     from: ["start-vertices"],
     *     to: ["end-vertices"],
     *   },
     * ]);
     * // graph now exists
     * ```
     */
    create(edgeDefinitions, options = {}) {
        const { orphanCollections, satellites, waitForSync, isSmart, isDisjoint, ...opts } = options;
        return this._db.request({
            method: "POST",
            path: "/_api/gharial",
            body: {
                orphanCollections: orphanCollections &&
                    (Array.isArray(orphanCollections)
                        ? orphanCollections.map(collection_1.collectionToString)
                        : [(0, collection_1.collectionToString)(orphanCollections)]),
                edgeDefinitions: edgeDefinitions.map(coerceEdgeDefinition),
                isSmart,
                isDisjoint,
                name: this._name,
                options: { ...opts, satellites: satellites?.map(collection_1.collectionToString) },
            },
            qs: { waitForSync },
        }, (res) => res.body.graph);
    }
    /**
     * Deletes the graph from the database.
     *
     * @param dropCollections - If set to `true`, the collections associated with
     * the graph will also be deleted.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * await graph.drop();
     * // the graph "some-graph" no longer exists
     * ```
     */
    drop(dropCollections = false) {
        return this._db.request({
            method: "DELETE",
            path: `/_api/gharial/${encodeURIComponent(this._name)}`,
            qs: { dropCollections },
        }, (res) => res.body.removed);
    }
    /**
     * Returns a {@link graph.GraphVertexCollection} instance for the given collection
     * name representing the collection in this graph.
     *
     * @param T - Type to use for document data. Defaults to `any`.
     * @param collection - Name of the vertex collection.
     */
    vertexCollection(collection) {
        return new GraphVertexCollection(this._db, (0, collection_1.collectionToString)(collection), this);
    }
    /**
     * Fetches all vertex collections of this graph from the database and returns
     * an array of their names.
     *
     * See also {@link graph.Graph#vertexCollections}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * const info = await graph.create([
     *   {
     *     collection: "edges",
     *     from: ["start-vertices"],
     *     to: ["end-vertices"],
     *   },
     * ]);
     * const vertexCollectionNames = await graph.listVertexCollections();
     * // ["start-vertices", "end-vertices"]
     * ```
     */
    listVertexCollections() {
        return this._db.request({ path: `/_api/gharial/${encodeURIComponent(this._name)}/vertex` }, (res) => res.body.collections);
    }
    /**
     * Fetches all vertex collections of this graph from the database and returns
     * an array of {@link graph.GraphVertexCollection} instances.
     *
     * See also {@link graph.Graph#listVertexCollections}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * const info = await graph.create([
     *   {
     *     collection: "edges",
     *     from: ["start-vertices"],
     *     to: ["end-vertices"],
     *   },
     * ]);
     * const vertexCollections = await graph.vertexCollections();
     * for (const vertexCollection of vertexCollections) {
     *   console.log(vertexCollection.name);
     *   // "start-vertices"
     *   // "end-vertices"
     * }
     * ```
     */
    async vertexCollections() {
        const names = await this.listVertexCollections();
        return names.map((name) => new GraphVertexCollection(this._db, name, this));
    }
    /**
     * Adds the given collection to this graph as a vertex collection.
     *
     * @param collection - Collection to add to the graph.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * await graph.addVertexCollection("more-vertices");
     * // The collection "more-vertices" has been added to the graph
     * const extra = db.collection("extra-vertices");
     * await graph.addVertexCollection(extra);
     * // The collection "extra-vertices" has been added to the graph
     * ```
     */
    addVertexCollection(collection, options = {}) {
        const { satellites, ...opts } = options;
        return this._db.request({
            method: "POST",
            path: `/_api/gharial/${encodeURIComponent(this._name)}/vertex`,
            body: {
                collection: (0, collection_1.collectionToString)(collection),
                options: { ...opts, satellites: satellites?.map(collection_1.collectionToString) },
            },
        }, (res) => res.body.graph);
    }
    /**
     * Removes the given collection from this graph as a vertex collection.
     *
     * @param collection - Collection to remove from the graph.
     * @param dropCollection - If set to `true`, the collection will also be
     * deleted from the database.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * const info = await graph.create([
     *   {
     *     collection: "edges",
     *     from: ["start-vertices"],
     *     to: ["end-vertices"],
     *   },
     * ]);
     * await graph.removeVertexCollection("start-vertices");
     * // The collection "start-vertices" is no longer part of the graph.
     * ```
     */
    removeVertexCollection(collection, dropCollection = false) {
        return this._db.request({
            method: "DELETE",
            path: `/_api/gharial/${encodeURIComponent(this._name)}/vertex/${encodeURIComponent((0, collection_1.collectionToString)(collection))}`,
            qs: {
                dropCollection,
            },
        }, (res) => res.body.graph);
    }
    /**
     * Returns a {@link graph.GraphEdgeCollection} instance for the given collection
     * name representing the collection in this graph.
     *
     * @param T - Type to use for document data. Defaults to `any`.
     * @param collection - Name of the edge collection.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * const info = await graph.create([
     *   {
     *     collection: "edges",
     *     from: ["start-vertices"],
     *     to: ["end-vertices"],
     *   },
     * ]);
     * const graphEdgeCollection = graph.edgeCollection("edges");
     * // Access the underlying EdgeCollection API:
     * const edgeCollection = graphEdgeCollection.collection;
     * ```
     */
    edgeCollection(collection) {
        return new GraphEdgeCollection(this._db, (0, collection_1.collectionToString)(collection), this);
    }
    /**
     * Fetches all edge collections of this graph from the database and returns
     * an array of their names.
     *
     * See also {@link graph.Graph#edgeCollections}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * const info = await graph.create([
     *   {
     *     collection: "edges",
     *     from: ["start-vertices"],
     *     to: ["end-vertices"],
     *   },
     * ]);
     * const edgeCollectionNames = await graph.listEdgeCollections();
     * // ["edges"]
     * ```
     */
    listEdgeCollections() {
        return this._db.request({ path: `/_api/gharial/${encodeURIComponent(this._name)}/edge` }, (res) => res.body.collections);
    }
    /**
     * Fetches all edge collections of this graph from the database and returns
     * an array of {@link graph.GraphEdgeCollection} instances.
     *
     * See also {@link graph.Graph#listEdgeCollections}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * const info = await graph.create([
     *   {
     *     collection: "edges",
     *     from: ["start-vertices"],
     *     to: ["end-vertices"],
     *   },
     * ]);
     * const graphEdgeCollections = await graph.edgeCollections();
     * for (const collection of graphEdgeCollection) {
     *   console.log(collection.name);
     *   // "edges"
     * }
     * ```
     */
    async edgeCollections() {
        const names = await this.listEdgeCollections();
        return names.map((name) => new GraphEdgeCollection(this._db, name, this));
    }
    /**
     * Adds an edge definition to this graph.
     *
     * @param edgeDefinition - Definition of a relation in this graph.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * await graph.addEdgeDefinition({
     *   collection: "edges",
     *   from: ["start-vertices"],
     *   to: ["end-vertices"],
     * });
     * // The edge definition has been added to the graph
     * ```
     */
    addEdgeDefinition(edgeDefinition, options = {}) {
        const { satellites, ...opts } = options;
        return this._db.request({
            method: "POST",
            path: `/_api/gharial/${encodeURIComponent(this._name)}/edge`,
            body: {
                ...coerceEdgeDefinition(edgeDefinition),
                options: { ...opts, satellites: satellites?.map(collection_1.collectionToString) },
            },
        }, (res) => res.body.graph);
    }
    replaceEdgeDefinition(collectionOrEdgeDefinitionOptions, edgeDefinitionOrOptions, options = {}) {
        let collection = collectionOrEdgeDefinitionOptions;
        let edgeDefinition = edgeDefinitionOrOptions;
        if (edgeDefinitionOrOptions &&
            !edgeDefinitionOrOptions.hasOwnProperty("collection")) {
            options = edgeDefinitionOrOptions;
            edgeDefinitionOrOptions = undefined;
        }
        if (!edgeDefinitionOrOptions) {
            edgeDefinition =
                collectionOrEdgeDefinitionOptions;
            collection = edgeDefinition.collection;
        }
        const { satellites, ...opts } = options;
        return this._db.request({
            method: "PUT",
            path: `/_api/gharial/${encodeURIComponent(this._name)}/edge/${encodeURIComponent((0, collection_1.collectionToString)(collection))}`,
            body: {
                ...coerceEdgeDefinition(edgeDefinition),
                options: { ...opts, satellites: satellites?.map(collection_1.collectionToString) },
            },
        }, (res) => res.body.graph);
    }
    /**
     * Removes the edge definition for the given edge collection from this graph.
     *
     * @param collection - Edge collection for which to remove the definition.
     * @param dropCollection - If set to `true`, the collection will also be
     * deleted from the database.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("some-graph");
     * const info = await graph.create([
     *   {
     *     collection: "edges",
     *     from: ["start-vertices"],
     *     to: ["end-vertices"],
     *   },
     * ]);
     * await graph.removeEdgeDefinition("edges");
     * // The edge definition for "edges" has been replaced
     * ```
     */
    removeEdgeDefinition(collection, dropCollection = false) {
        return this._db.request({
            method: "DELETE",
            path: `/_api/gharial/${encodeURIComponent(this._name)}/edge/${encodeURIComponent((0, collection_1.collectionToString)(collection))}`,
            qs: {
                dropCollection,
            },
        }, (res) => res.body.graph);
    }
    /**
     * Performs a traversal starting from the given `startVertex` and following
     * edges contained in this graph.
     *
     * See also {@link collection.EdgeCollection#traversal}.
     *
     * @param startVertex - Document `_id` of a vertex in this graph.
     * @param options - Options for performing the traversal.
     *
     * @deprecated Simple Queries have been deprecated in ArangoDB 3.4 and can be
     * replaced with AQL queries.
     *
     * @example
     * ```js
     * const db = new Database();
     * const graph = db.graph("my-graph");
     * const collection = graph.edgeCollection("edges").collection;
     * await collection.import([
     *   ["_key", "_from", "_to"],
     *   ["x", "vertices/a", "vertices/b"],
     *   ["y", "vertices/b", "vertices/c"],
     *   ["z", "vertices/c", "vertices/d"],
     * ]);
     * const startVertex = "vertices/a";
     * const cursor = await db.query(aql`
     *   FOR vertex IN OUTBOUND ${startVertex} GRAPH ${graph}
     *   RETURN vertex._key
     * `);
     * const result = await cursor.all();
     * console.log(result); // ["a", "b", "c", "d"]
     * ```
     */
    traversal(startVertex, options) {
        return this._db.request({
            method: "POST",
            path: `/_api/traversal`,
            body: {
                ...options,
                startVertex,
                graphName: this._name,
            },
        }, (res) => res.body.result);
    }
}
exports.Graph = Graph;
//# sourceMappingURL=graph.js.map

/***/ }),

/***/ "../node_modules/arangojs/index.js":
/*!*****************************************!*\
  !*** ../node_modules/arangojs/index.js ***!
  \*****************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Database = exports.aql = exports.arangojs = void 0;
const database_1 = __webpack_require__(/*! ./database */ "../node_modules/arangojs/database.js");
module.exports = exports = arangojs;
function arangojs(config, name) {
    if (typeof config === "string" || Array.isArray(config)) {
        const url = config;
        return new database_1.Database(url, name);
    }
    return new database_1.Database(config);
}
exports.arangojs = arangojs;
exports["default"] = arangojs;
var aql_1 = __webpack_require__(/*! ./aql */ "../node_modules/arangojs/aql.js");
Object.defineProperty(exports, "aql", ({ enumerable: true, get: function () { return aql_1.aql; } }));
var database_2 = __webpack_require__(/*! ./database */ "../node_modules/arangojs/database.js");
Object.defineProperty(exports, "Database", ({ enumerable: true, get: function () { return database_2.Database; } }));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../node_modules/arangojs/indexes.js":
/*!*******************************************!*\
  !*** ../node_modules/arangojs/indexes.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * ```ts
 * import type {
 *   FulltextIndex,
 *   GeoIndex,
 *   PersistentIndex,
 *   PrimaryIndex,
 *   TtlIndex,
 *   ZkdIndex,
 * } from "arangojs/indexes";
 * ```
 *
 * The "indexes" module provides index-related types for TypeScript.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports._indexHandle = void 0;
/**
 * @internal
 */
function _indexHandle(selector, collectionName) {
    if (typeof selector !== "string") {
        if (selector.id) {
            return _indexHandle(selector.id, collectionName);
        }
        throw new Error("Index handle must be a string or an object with an id attribute");
    }
    if (selector.includes("/")) {
        const [head, ...tail] = selector.split("/");
        const normalizedHead = head.normalize("NFC");
        if (normalizedHead !== collectionName) {
            throw new Error(`Index ID "${selector}" does not match collection name "${collectionName}"`);
        }
        return [normalizedHead, ...tail].join("/");
    }
    return `${collectionName}/${selector}`;
}
exports._indexHandle = _indexHandle;
//# sourceMappingURL=indexes.js.map

/***/ }),

/***/ "../node_modules/arangojs/lib/btoa.web.js":
/*!************************************************!*\
  !*** ../node_modules/arangojs/lib/btoa.web.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Wrapper around browser `btoa` function to allow substituting a
 * Node.js-specific implementation.
 *
 * @packageDocumentation
 * @internal
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.base64Encode = void 0;
/**
 * @internal
 */
function base64Encode(str) {
    return btoa(str);
}
exports.base64Encode = base64Encode;
//# sourceMappingURL=btoa.web.js.map

/***/ }),

/***/ "../node_modules/arangojs/lib/codes.js":
/*!*********************************************!*\
  !*** ../node_modules/arangojs/lib/codes.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Error codes handled by arangojs.
 *
 * See also [ArangoDB error documentation](https://www.arangodb.com/docs/stable/appendix-error-codes.html).
 *
 * @packageDocumentation
 * @internal
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GRAPH_NOT_FOUND = exports.DATABASE_NOT_FOUND = exports.VIEW_NOT_FOUND = exports.COLLECTION_NOT_FOUND = exports.DOCUMENT_NOT_FOUND = exports.ANALYZER_NOT_FOUND = exports.ERROR_ARANGO_CONFLICT = exports.ERROR_ARANGO_MAINTENANCE_MODE = exports.TRANSACTION_NOT_FOUND = void 0;
exports.TRANSACTION_NOT_FOUND = 10;
exports.ERROR_ARANGO_MAINTENANCE_MODE = 503;
exports.ERROR_ARANGO_CONFLICT = 1200;
exports.ANALYZER_NOT_FOUND = 1202;
exports.DOCUMENT_NOT_FOUND = 1202;
exports.COLLECTION_NOT_FOUND = 1203;
exports.VIEW_NOT_FOUND = 1203;
exports.DATABASE_NOT_FOUND = 1228;
exports.GRAPH_NOT_FOUND = 1924;
//# sourceMappingURL=codes.js.map

/***/ }),

/***/ "../node_modules/arangojs/lib/multipart.web.js":
/*!*****************************************************!*\
  !*** ../node_modules/arangojs/lib/multipart.web.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Utility function for constructing a multipart form in the browser.
 *
 * @packageDocumentation
 * @internal
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toForm = void 0;
/**
 * @internal
 */
function toForm(fields, callback) {
    let form;
    try {
        form = new FormData();
        for (const key of Object.keys(fields)) {
            let value = fields[key];
            if (value === undefined)
                continue;
            if (!(value instanceof Blob) &&
                (typeof value === "object" || typeof value === "function")) {
                value = JSON.stringify(value);
            }
            form.append(key, value);
        }
    }
    catch (e) {
        callback(e);
        return;
    }
    callback(null, { body: form });
}
exports.toForm = toForm;
//# sourceMappingURL=multipart.web.js.map

/***/ }),

/***/ "../node_modules/arangojs/lib/normalizeUrl.js":
/*!****************************************************!*\
  !*** ../node_modules/arangojs/lib/normalizeUrl.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Utility function for normalizing URLs.
 *
 * @packageDocumentation
 * @internal
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.normalizeUrl = void 0;
/**
 * @internal
 */
function normalizeUrl(url) {
    const raw = url.match(/^(tcp|ssl|tls)((?::|\+).+)/);
    if (raw)
        url = (raw[1] === "tcp" ? "http" : "https") + raw[2];
    const unix = url.match(/^(?:(http|https)\+)?unix:\/\/(\/.+)/);
    if (unix)
        url = `${unix[1] || "http"}://unix:${unix[2]}`;
    return url;
}
exports.normalizeUrl = normalizeUrl;
//# sourceMappingURL=normalizeUrl.js.map

/***/ }),

/***/ "../node_modules/arangojs/lib/omit.js":
/*!********************************************!*\
  !*** ../node_modules/arangojs/lib/omit.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Utility function for omitting properties by key.
 *
 * @packageDocumentation
 * @internal
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.omit = void 0;
/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function omit(obj, keys) {
    const result = {};
    for (const key of Object.keys(obj)) {
        if (keys.includes(key))
            continue;
        result[key] = obj[key];
    }
    return result;
}
exports.omit = omit;
//# sourceMappingURL=omit.js.map

/***/ }),

/***/ "../node_modules/arangojs/lib/querystringify.js":
/*!******************************************************!*\
  !*** ../node_modules/arangojs/lib/querystringify.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.querystringify = void 0;
const querystring_1 = __webpack_require__(/*! querystring */ "../../../node_modules/querystring/index.js");
// eslint-disable-next-line @typescript-eslint/ban-types
function clean(obj) {
    const result = {};
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        if (value === undefined)
            continue;
        result[key] = value;
    }
    return result;
}
function querystringify(obj) {
    return (0, querystring_1.stringify)(clean(obj));
}
exports.querystringify = querystringify;
//# sourceMappingURL=querystringify.js.map

/***/ }),

/***/ "../node_modules/arangojs/lib/request.web.js":
/*!***************************************************!*\
  !*** ../node_modules/arangojs/lib/request.web.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/// <reference lib="dom" />
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createRequest = exports.isBrowser = void 0;
const btoa_1 = __webpack_require__(/*! ./btoa */ "../node_modules/arangojs/lib/btoa.web.js");
const omit_1 = __webpack_require__(/*! ./omit */ "../node_modules/arangojs/lib/omit.js");
const xhr_1 = __webpack_require__(/*! ./xhr */ "../node_modules/arangojs/lib/xhr.js");
exports.isBrowser = true;
/**
 * @internal
 */
function errorToJSON() {
    return {
        error: true,
        message: this.message,
    };
}
/**
 * Create a function for performing requests against a given host.
 *
 * @param baseUrl - Base URL of the host, i.e. protocol, port and domain name.
 * @param agentOptions - Options to use for performing requests.
 *
 * @param baseUrl
 * @param agentOptions
 *
 * @internal
 */
function createRequest(baseUrl, agentOptions) {
    const base = new URL(baseUrl);
    const auth = (0, btoa_1.base64Encode)(`${base.username || "root"}:${base.password}`);
    base.username = "";
    base.password = "";
    const options = (0, omit_1.omit)(agentOptions, ["maxSockets"]);
    return function request({ method, url: reqUrl, headers, body, timeout, expectBinary, }, cb) {
        const url = new URL(reqUrl.pathname, base);
        if (base.search || reqUrl.search) {
            url.search = reqUrl.search
                ? `${base.search}&${reqUrl.search.slice(1)}`
                : base.search;
        }
        if (!headers["authorization"]) {
            headers["authorization"] = `Basic ${auth}`;
        }
        let callback = (err, res) => {
            callback = () => undefined;
            cb(err, res);
        };
        const req = (0, xhr_1.default)({
            useXDR: true,
            withCredentials: true,
            ...options,
            responseType: expectBinary ? "blob" : "text",
            url: String(url),
            body,
            method,
            headers,
            timeout,
        }, (err, res) => {
            if (!err) {
                const response = res;
                response.request = req;
                if (!response.body)
                    response.body = "";
                if (options.after) {
                    options.after(null, response);
                }
                callback(null, response);
            }
            else {
                const error = err;
                error.request = req;
                error.toJSON = errorToJSON;
                if (options.after) {
                    options.after(error);
                }
                callback(error);
            }
        });
        if (options.before) {
            options.before(req);
        }
    };
}
exports.createRequest = createRequest;
//# sourceMappingURL=request.web.js.map

/***/ }),

/***/ "../node_modules/arangojs/lib/xhr.js":
/*!*******************************************!*\
  !*** ../node_modules/arangojs/lib/xhr.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Wrapper around the `xhr` module for HTTP(S) requests in the browser.
 *
 * @packageDocumentation
 * @internal
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
exports["default"] = __webpack_require__(/*! xhr */ "../node_modules/xhr/index.js");
//# sourceMappingURL=xhr.js.map

/***/ }),

/***/ "../node_modules/arangojs/route.js":
/*!*****************************************!*\
  !*** ../node_modules/arangojs/route.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Route = void 0;
/**
 * Represents an arbitrary route relative to an ArangoDB database.
 */
class Route {
    /**
     * @internal
     */
    constructor(db, path = "", headers = {}) {
        if (!path)
            path = "";
        else if (path.charAt(0) !== "/")
            path = `/${path}`;
        this._db = db;
        this._path = path;
        this._headers = headers;
    }
    /**
     * Creates a new route relative to this route that inherits any of its default
     * HTTP headers.
     *
     * @param path - Path relative to this route.
     * @param headers - Additional headers that will be sent with each request.
     *
     * @example
     * ```js
     * const db = new Database();
     * const foxx = db.route("/my-foxx-service");
     * const users = foxx.route("/users");
     * ```
     */
    route(path, headers) {
        if (!path)
            path = "";
        else if (path.charAt(0) !== "/")
            path = `/${path}`;
        return new Route(this._db, this._path + path, {
            ...this._headers,
            ...headers,
        });
    }
    /**
     * Performs an arbitrary HTTP request relative to this route and returns the
     * server response.
     *
     * @param options - Options for performing the request.
     *
     * @example
     * ```js
     * const db = new Database();
     * const foxx = db.route("/my-foxx-service");
     * const res = await foxx.request({
     *   method: "POST",
     *   path: "/users",
     *   body: {
     *     username: "admin",
     *     password: "hunter2"
     *   }
     * });
     * ```
     */
    request(options) {
        const opts = { ...options };
        if (!opts.path || opts.path === "/")
            opts.path = "";
        else if (!this._path || opts.path.charAt(0) === "/")
            opts.path = opts.path;
        else
            opts.path = `/${opts.path}`;
        opts.basePath = this._path;
        opts.headers = { ...this._headers, ...opts.headers };
        opts.method = opts.method ? opts.method.toUpperCase() : "GET";
        return this._db.request(opts, false);
    }
    delete(...args) {
        const path = typeof args[0] === "string" ? args.shift() : undefined;
        const [qs, headers] = args;
        return this.request({ method: "DELETE", path, qs, headers });
    }
    get(...args) {
        const path = typeof args[0] === "string" ? args.shift() : undefined;
        const [qs, headers] = args;
        return this.request({ method: "GET", path, qs, headers });
    }
    head(...args) {
        const path = typeof args[0] === "string" ? args.shift() : undefined;
        const [qs, headers] = args;
        return this.request({ method: "HEAD", path, qs, headers });
    }
    patch(...args) {
        const path = typeof args[0] === "string" ? args.shift() : undefined;
        const [body, qs, headers] = args;
        return this.request({ method: "PATCH", path, body, qs, headers });
    }
    post(...args) {
        const path = typeof args[0] === "string" ? args.shift() : undefined;
        const [body, qs, headers] = args;
        return this.request({ method: "POST", path, body, qs, headers });
    }
    put(...args) {
        const path = typeof args[0] === "string" ? args.shift() : undefined;
        const [body, qs, headers] = args;
        return this.request({ method: "PUT", path, body, qs, headers });
    }
}
exports.Route = Route;
//# sourceMappingURL=route.js.map

/***/ }),

/***/ "../node_modules/arangojs/transaction.js":
/*!***********************************************!*\
  !*** ../node_modules/arangojs/transaction.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Transaction = exports.isArangoTransaction = void 0;
const error_1 = __webpack_require__(/*! ./error */ "../node_modules/arangojs/error.js");
const codes_1 = __webpack_require__(/*! ./lib/codes */ "../node_modules/arangojs/lib/codes.js");
/**
 * Indicates whether the given value represents a {@link Transaction}.
 *
 * @param transaction - A value that might be a transaction.
 */
function isArangoTransaction(transaction) {
    return Boolean(transaction && transaction.isArangoTransaction);
}
exports.isArangoTransaction = isArangoTransaction;
/**
 * Represents a streaming transaction in a {@link database.Database}.
 */
class Transaction {
    /**
     * @internal
     */
    constructor(db, id) {
        this._db = db;
        this._id = id;
    }
    /**
     * @internal
     *
     * Indicates that this object represents an ArangoDB transaction.
     */
    get isArangoTransaction() {
        return true;
    }
    /**
     * Unique identifier of this transaction.
     *
     * See {@link database.Database#transaction}.
     */
    get id() {
        return this._id;
    }
    /**
     * Checks whether the transaction exists.
     *
     * @example
     * ```js
     * const db = new Database();
     * const trx = db.transaction("some-transaction");
     * const result = await trx.exists();
     * // result indicates whether the transaction exists
     * ```
     */
    async exists() {
        try {
            await this.get();
            return true;
        }
        catch (err) {
            if ((0, error_1.isArangoError)(err) && err.errorNum === codes_1.TRANSACTION_NOT_FOUND) {
                return false;
            }
            throw err;
        }
    }
    /**
     * Retrieves general information about the transaction.
     *
     * @example
     * ```js
     * const db = new Database();
     * const col = db.collection("some-collection");
     * const trx = db.beginTransaction(col);
     * await trx.step(() => col.save({ hello: "world" }));
     * const info = await trx.get();
     * // the transaction exists
     * ```
     */
    get() {
        return this._db.request({
            path: `/_api/transaction/${encodeURIComponent(this.id)}`,
        }, (res) => res.body.result);
    }
    /**
     * Attempts to commit the transaction to the databases.
     *
     * @param options - Options for comitting the transaction.
     *
     * @example
     * ```js
     * const db = new Database();
     * const col = db.collection("some-collection");
     * const trx = db.beginTransaction(col);
     * await trx.step(() => col.save({ hello: "world" }));
     * const result = await trx.commit();
     * // result indicates the updated transaction status
     * ```
     */
    commit(options = {}) {
        const { allowDirtyRead = undefined } = options;
        return this._db.request({
            method: "PUT",
            path: `/_api/transaction/${encodeURIComponent(this.id)}`,
            allowDirtyRead,
        }, (res) => res.body.result);
    }
    /**
     * Attempts to abort the transaction to the databases.
     *
     * @param options - Options for aborting the transaction.
     *
     * @example
     * ```js
     * const db = new Database();
     * const col = db.collection("some-collection");
     * const trx = db.beginTransaction(col);
     * await trx.step(() => col.save({ hello: "world" }));
     * const result = await trx.abort();
     * // result indicates the updated transaction status
     * ```
     */
    abort(options = {}) {
        const { allowDirtyRead = undefined } = options;
        return this._db.request({
            method: "DELETE",
            path: `/_api/transaction/${encodeURIComponent(this.id)}`,
            allowDirtyRead,
        }, (res) => res.body.result);
    }
    /**
     * Executes the given function locally as a single step of the transaction.
     *
     * @param T - Type of the callback's returned promise.
     * @param callback - Callback function returning a promise.
     *
     * **Warning**: The callback function should wrap a single call of an async
     * arangojs method (e.g. a method on a `Collection` object of a collection
     * that is involved in the transaction or the `db.query` method).
     * If the callback function is async, only the first promise-returning (or
     * async) method call will be executed as part of the transaction. See the
     * examples below for how to avoid common mistakes when using this method.
     *
     * **Note**: Avoid defining the callback as an async function if possible
     * as arangojs will throw an error if the callback did not return a promise.
     * Async functions will return an empty promise by default, making it harder
     * to notice if you forgot to return something from the callback.
     *
     * **Note**: Although almost anything can be wrapped in a callback and passed
     * to this method, that does not guarantee ArangoDB can actually do it in a
     * transaction. Refer to the ArangoDB documentation if you are unsure whether
     * a given operation can be executed as part of a transaction. Generally any
     * modification or retrieval of data is eligible but modifications of
     * collections or databases are not.
     *
     * @example
     * ```js
     * const db = new Database();
     * const vertices = db.collection("vertices");
     * const edges = db.collection("edges");
     * const trx = await db.beginTransaction({ write: [vertices, edges] });
     *
     * // The following code will be part of the transaction
     * const left = await trx.step(() => vertices.save({ label: "left" }));
     * const right = await trx.step(() => vertices.save({ label: "right" }));
     *
     * // Results from preceding actions can be used normally
     * await trx.step(() => edges.save({
     *   _from: left._id,
     *   _to: right._id,
     *   data: "potato"
     * }));
     *
     * // Transaction must be committed for changes to take effected
     * // Always call either trx.commit or trx.abort to end a transaction
     * await trx.commit();
     * ```
     *
     * @example
     * ```js
     * // BAD! If the callback is an async function it must only use await once!
     * await trx.step(async () => {
     *   await collection.save(data);
     *   await collection.save(moreData); // WRONG
     * });
     *
     * // BAD! Callback function must use only one arangojs call!
     * await trx.step(() => {
     *  return collection.save(data)
     *    .then(() => collection.save(moreData)); // WRONG
     * });
     *
     * // BETTER: Wrap every arangojs method call that should be part of the
     * // transaction in a separate `trx.step` call
     * await trx.step(() => collection.save(data));
     * await trx.step(() => collection.save(moreData));
     * ```
     *
     * @example
     * ```js
     * // BAD! If the callback is an async function it must not await before
     * // calling an arangojs method!
     * await trx.step(async () => {
     *   await doSomethingElse();
     *   return collection.save(data); // WRONG
     * });
     *
     * // BAD! Any arangojs inside the callback must not happen inside a promise
     * // method!
     * await trx.step(() => {
     *   return doSomethingElse()
     *     .then(() => collection.save(data)); // WRONG
     * });
     *
     * // BETTER: Perform any async logic needed outside the `trx.step` call
     * await doSomethingElse();
     * await trx.step(() => collection.save(data));
     *
     * // OKAY: You can perform async logic in the callback after the arangojs
     * // method call as long as it does not involve additional arangojs method
     * // calls, but this makes it easy to make mistakes later
     * await trx.step(async () => {
     *   await collection.save(data);
     *   await doSomethingDifferent(); // no arangojs method calls allowed
     * });
     * ```
     *
     * @example
     * ```js
     * // BAD! The callback should not use any functions that themselves use any
     * // arangojs methods!
     * async function saveSomeData() {
     *   await collection.save(data);
     *   await collection.save(moreData);
     * }
     * await trx.step(() => saveSomeData()); // WRONG
     *
     * // BETTER: Pass the transaction to functions that need to call arangojs
     * // methods inside a transaction
     * async function saveSomeData(trx) {
     *   await trx.step(() => collection.save(data));
     *   await trx.step(() => collection.save(moreData));
     * }
     * await saveSomeData(); // no `trx.step` call needed
     * ```
     *
     * @example
     * ```js
     * // BAD! You must wait for the promise to resolve (or await on the
     * // `trx.step` call) before calling `trx.step` again!
     * trx.step(() => collection.save(data)); // WRONG
     * await trx.step(() => collection.save(moreData));
     *
     * // BAD! The trx.step callback can not make multiple calls to async arangojs
     * // methods, not even using Promise.all!
     * await trx.step(() => Promise.all([ // WRONG
     *   collection.save(data),
     *   collection.save(moreData),
     * ]));
     *
     * // BAD! Multiple `trx.step` calls can not run in parallel!
     * await Promise.all([ // WRONG
     *   trx.step(() => collection.save(data)),
     *   trx.step(() => collection.save(moreData)),
     * ]));
     *
     * // BETTER: Always call `trx.step` sequentially, one after the other
     * await trx.step(() => collection.save(data));
     * await trx.step(() => collection.save(moreData));
     *
     * // OKAY: The then callback can be used if async/await is not available
     * trx.step(() => collection.save(data))
     *   .then(() => trx.step(() => collection.save(moreData)));
     * ```
     *
     * @example
     * ```js
     * // BAD! The callback will return an empty promise that resolves before
     * // the inner arangojs method call has even talked to ArangoDB!
     * await trx.step(async () => {
     *   collection.save(data); // WRONG
     * });
     *
     * // BETTER: Use an arrow function so you don't forget to return
     * await trx.step(() => collection.save(data));
     *
     * // OKAY: Remember to always return when using a function body
     * await trx.step(() => {
     *   return collection.save(data); // easy to forget!
     * });
     *
     * // OKAY: You do not have to use arrow functions but it helps
     * await trx.step(function () {
     *   return collection.save(data);
     * });
     * ```
     *
     * @example
     * ```js
     * // BAD! You can not pass promises instead of a callback!
     * await trx.step(collection.save(data)); // WRONG
     *
     * // BETTER: Wrap the code in a function and pass the function instead
     * await trx.step(() => collection.save(data));
     * ```
     *
     * @example
     * ```js
     * // WORSE: Calls to non-async arangojs methods don't need to be performed
     * // as part of a transaction
     * const collection = await trx.step(() => db.collection("my-documents"));
     *
     * // BETTER: If an arangojs method is not async and doesn't return promises,
     * // call it without `trx.step`
     * const collection = db.collection("my-documents");
     * ```
     */
    step(callback) {
        const conn = this._db._connection;
        conn.setTransactionId(this.id);
        try {
            const promise = callback();
            if (!promise) {
                throw new Error("Transaction callback was not an async function or did not return a promise!");
            }
            return Promise.resolve(promise);
        }
        finally {
            conn.clearTransactionId();
        }
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=transaction.js.map

/***/ }),

/***/ "../node_modules/arangojs/view.js":
/*!****************************************!*\
  !*** ../node_modules/arangojs/view.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.View = exports.isArangoView = void 0;
const error_1 = __webpack_require__(/*! ./error */ "../node_modules/arangojs/error.js");
const codes_1 = __webpack_require__(/*! ./lib/codes */ "../node_modules/arangojs/lib/codes.js");
/**
 * Indicates whether the given value represents a {@link View}.
 *
 * @param view - A value that might be a View.
 */
function isArangoView(view) {
    return Boolean(view && view.isArangoView);
}
exports.isArangoView = isArangoView;
/**
 * Represents a View in a {@link database.Database}.
 */
class View {
    /**
     * @internal
     */
    constructor(db, name) {
        this._db = db;
        this._name = name.normalize("NFC");
    }
    /**
     * @internal
     *
     * Indicates that this object represents an ArangoDB View.
     */
    get isArangoView() {
        return true;
    }
    /**
     * Name of the View.
     */
    get name() {
        return this._name;
    }
    /**
     * Retrieves general information about the View.
     *
     * @example
     * ```js
     * const db = new Database();
     * const view = db.view("some-view");
     * const data = await view.get();
     * // data contains general information about the View
     * ```
     */
    get() {
        return this._db.request({
            path: `/_api/view/${encodeURIComponent(this._name)}`,
        });
    }
    /**
     * Checks whether the View exists.
     *
     * @example
     * ```js
     * const db = new Database();
     * const view = db.view("some-view");
     * const exists = await view.exists();
     * console.log(exists); // indicates whether the View exists
     * ```
     */
    async exists() {
        try {
            await this.get();
            return true;
        }
        catch (err) {
            if ((0, error_1.isArangoError)(err) && err.errorNum === codes_1.VIEW_NOT_FOUND) {
                return false;
            }
            throw err;
        }
    }
    /**
     * Creates a View with the given `options` and the instance's name.
     *
     * See also {@link database.Database#createView}.
     *
     * @example
     * ```js
     * const db = new Database();
     * const view = db.view("potatoes");
     * await view.create();
     * // the ArangoSearch View "potatoes" now exists
     * ```
     */
    create(options) {
        return this._db.request({
            method: "POST",
            path: "/_api/view",
            body: {
                ...options,
                name: this._name,
            },
        });
    }
    /**
     * Renames the View and updates the instance's `name` to `newName`.
     *
     * Additionally removes the instance from the {@link database.Database}'s internal
     * cache.
     *
     * **Note**: Renaming Views may not be supported when ArangoDB is
     * running in a cluster configuration.
     *
     * @param newName - The new name of the View.
     *
     * @example
     * ```js
     * const db = new Database();
     * const view1 = db.view("some-view");
     * await view1.rename("other-view");
     * const view2 = db.view("some-view");
     * const view3 = db.view("other-view");
     * // Note all three View instances are different objects but
     * // view1 and view3 represent the same ArangoDB view!
     * ```
     */
    async rename(newName) {
        const result = this._db.renameView(this._name, newName);
        this._name = newName.normalize("NFC");
        return result;
    }
    /**
     * Retrieves the View's properties.
     *
     * @example
     * ```js
     * const db = new Database();
     * const view = db.view("some-view");
     * const data = await view.properties();
     * // data contains the View's properties
     * ```
     */
    properties() {
        return this._db.request({
            path: `/_api/view/${encodeURIComponent(this._name)}/properties`,
        });
    }
    /**
     * Updates the properties of the View.
     *
     * @param properties - Properties of the View to update.
     *
     * @example
     * ```js
     * const db = new Database();
     * const view = db.view("some-view");
     * const result = await view.updateProperties({
     *   consolidationIntervalMsec: 234
     * });
     * console.log(result.consolidationIntervalMsec); // 234
     * ```
     */
    updateProperties(properties) {
        return this._db.request({
            method: "PATCH",
            path: `/_api/view/${encodeURIComponent(this._name)}/properties`,
            body: properties ?? {},
        });
    }
    /**
     * Replaces the properties of the View.
     *
     * @param properties - New properties of the View.
     *
     * @example
     * ```js
     * const db = new Database();
     * const view = db.view("some-view");
     * const result = await view.replaceProperties({
     *   consolidationIntervalMsec: 234
     * });
     * console.log(result.consolidationIntervalMsec); // 234
     * ```
     */
    replaceProperties(properties) {
        return this._db.request({
            method: "PUT",
            path: `/_api/view/${encodeURIComponent(this._name)}/properties`,
            body: properties ?? {},
        });
    }
    /**
     * Deletes the View from the database.
     *
     * @example
     *
     * ```js
     * const db = new Database();
     * const view = db.view("some-view");
     * await view.drop();
     * // the View "some-view" no longer exists
     * ```
     */
    drop() {
        return this._db.request({
            method: "DELETE",
            path: `/_api/view/${encodeURIComponent(this._name)}`,
        }, (res) => res.body.result);
    }
}
exports.View = View;
//# sourceMappingURL=view.js.map

/***/ }),

/***/ "./ConfigEditor.tsx":
/*!**************************!*\
  !*** ./ConfigEditor.tsx ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ConfigEditor": () => (/* binding */ ConfigEditor)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _grafana_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @grafana/ui */ "@grafana/ui");
/* harmony import */ var _grafana_ui__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_grafana_ui__WEBPACK_IMPORTED_MODULE_1__);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var _div;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


var FormField = _grafana_ui__WEBPACK_IMPORTED_MODULE_1__.LegacyForms.FormField;
var ConfigEditor = /*#__PURE__*/function (_PureComponent) {
  _inherits(ConfigEditor, _PureComponent);
  var _super = _createSuper(ConfigEditor);
  function ConfigEditor() {
    var _this;
    _classCallCheck(this, ConfigEditor);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "onPropChange", function (propName) {
      return function (event) {
        var _this$props = _this.props,
          onOptionsChange = _this$props.onOptionsChange,
          options = _this$props.options;
        var jsonData = _extends({}, options.jsonData);
        jsonData[propName] = event.target.value;
        onOptionsChange(_extends({}, options, {
          jsonData: jsonData
        }));
      };
    });
    _defineProperty(_assertThisInitialized(_this), "onDbUrlChange", _this.onPropChange('dbUrl'));
    _defineProperty(_assertThisInitialized(_this), "onDbNameChange", _this.onPropChange('dbName'));
    _defineProperty(_assertThisInitialized(_this), "onCollectionsRegexChange", _this.onPropChange('collectionsRegex'));
    return _this;
  }
  _createClass(ConfigEditor, [{
    key: "render",
    value:
    /*
     *     // Secure field (only sent to the backend)
     *     onAPIKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
     *         const { onOptionsChange, options } = this.props;
     *         onOptionsChange({
     *             ...options,
     *             secureJsonData: {
     *                 apiKey: event.target.value,
     *             },
     *         });
     *     };
     *
     *     onResetAPIKey = () => {
     *         const { onOptionsChange, options } = this.props;
     *         onOptionsChange({
     *             ...options,
     *             secureJsonFields: {
     *                 ...options.secureJsonFields,
     *                 apiKey: false,
     *             },
     *             secureJsonData: {
     *                 ...options.secureJsonData,
     *                 apiKey: '',
     *             },
     *         });
     *     };
     *  */

    function render() {
      var options = this.props.options;
      var jsonData = options.jsonData;
      /* const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData; */

      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
        className: "gf-form-group"
      }, _div || (_div = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
        className: "gf-form"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "No authentication support for now."), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, "Connection made from client side."))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
        className: "gf-form"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(FormField, {
        label: "Db url",
        labelWidth: 6,
        inputWidth: 20,
        onChange: this.onDbUrlChange,
        value: jsonData.dbUrl || '',
        placeholder: "http://arango:8529"
      })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
        className: "gf-form"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(FormField, {
        label: "Db name",
        labelWidth: 6,
        inputWidth: 20,
        onChange: this.onDbNameChange,
        value: jsonData.dbName || '',
        placeholder: "test_database"
      })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
        className: "gf-form"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(FormField, {
        label: "collectionsRegex",
        labelWidth: 6,
        inputWidth: 20,
        onChange: this.onCollectionsRegexChange,
        value: jsonData.collectionsRegex || '',
        placeholder: ".*"
      })));
    }
  }]);
  return ConfigEditor;
}(react__WEBPACK_IMPORTED_MODULE_0__.PureComponent);

/***/ }),

/***/ "./QueryEditor.tsx":
/*!*************************!*\
  !*** ./QueryEditor.tsx ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "QueryEditor": () => (/* binding */ QueryEditor)
/* harmony export */ });
/* harmony import */ var lodash_defaults__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash/defaults */ "../node_modules/lodash/defaults.js");
/* harmony import */ var lodash_defaults__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_defaults__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _grafana_ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @grafana/ui */ "@grafana/ui");
/* harmony import */ var _grafana_ui__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_grafana_ui__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./types */ "./types.ts");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
var _InlineFormLabel, _InlineFormLabel2;
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var FormField = _grafana_ui__WEBPACK_IMPORTED_MODULE_2__.LegacyForms.FormField,
  Select = _grafana_ui__WEBPACK_IMPORTED_MODULE_2__.LegacyForms.Select;
var QueryEditor = /*#__PURE__*/function (_PureComponent) {
  _inherits(QueryEditor, _PureComponent);
  var _super = _createSuper(QueryEditor);
  function QueryEditor() {
    var _this;
    _classCallCheck(this, QueryEditor);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "onSelectChange", function (propName) {
      var f = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
        return Promise.resolve();
      };
      return function (value, actionMeta) {
        var _this$props = _this.props,
          onChange = _this$props.onChange,
          query = _this$props.query;
        var newVal = _extends({}, query);
        newVal[propName] = value.value;
        onChange(newVal);
        f(value.value);
      };
    });
    _defineProperty(_assertThisInitialized(_this), "onCollectionChange", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(value, actionMeta) {
        var _this$props2, onChange, query, _yield$_this$props$da, time, number_, newVal;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _this$props2 = _this.props, onChange = _this$props2.onChange, query = _this$props2.query;
                _context.next = 3;
                return _this.props.datasource.loadFieldsOf(value.value);
              case 3:
                _yield$_this$props$da = _context.sent;
                time = _yield$_this$props$da.time;
                number_ = _yield$_this$props$da.number_;
                newVal = _extends({}, query, {
                  collectionName: value.value,
                  allTimeFields: time,
                  allNumberFields: number_
                });
                onChange(newVal);
              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
    _defineProperty(_assertThisInitialized(_this), "onTimestampFieldChange", _this.onSelectChange('timestampField'));
    _defineProperty(_assertThisInitialized(_this), "onValueFieldChange", function (i) {
      return /*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(value, actionMeta) {
          var _query$valueFields, _valueFields$i, _value$value;
          var _this$props3, onChange, query, valueFields, old, newVal;
          return _regeneratorRuntime().wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _this$props3 = _this.props, onChange = _this$props3.onChange, query = _this$props3.query;
                  valueFields = _toConsumableArray((_query$valueFields = query.valueFields) !== null && _query$valueFields !== void 0 ? _query$valueFields : []);
                  old = (_valueFields$i = valueFields[i]) !== null && _valueFields$i !== void 0 ? _valueFields$i : {};
                  old.name = (_value$value = value.value) !== null && _value$value !== void 0 ? _value$value : '';
                  valueFields[i] = old;
                  newVal = _extends({}, query, {
                    valueFields: valueFields
                  });
                  onChange(newVal);
                  console.log(query);
                case 8:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));
        return function (_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }();
    });
    _defineProperty(_assertThisInitialized(_this), "onAddField", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
      var _query$valueFields2;
      var _this$props4, onChange, query, valueFields, newVal;
      return _regeneratorRuntime().wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _this$props4 = _this.props, onChange = _this$props4.onChange, query = _this$props4.query;
              valueFields = _toConsumableArray((_query$valueFields2 = query.valueFields) !== null && _query$valueFields2 !== void 0 ? _query$valueFields2 : []);
              valueFields.push({});
              newVal = _extends({}, query, {
                valueFields: valueFields
              });
              onChange(newVal);
            case 5:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    })));
    _defineProperty(_assertThisInitialized(_this), "onRemoveField", function (i) {
      return /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
        var _query$valueFields3;
        var _this$props5, onChange, query, valueFields, newVal;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _this$props5 = _this.props, onChange = _this$props5.onChange, query = _this$props5.query;
                valueFields = _toConsumableArray((_query$valueFields3 = query.valueFields) !== null && _query$valueFields3 !== void 0 ? _query$valueFields3 : []);
                valueFields.splice(i, 1);
                newVal = _extends({}, query, {
                  valueFields: valueFields
                });
                onChange(newVal);
              case 5:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));
    });
    _defineProperty(_assertThisInitialized(_this), "onPrefixChange", /*#__PURE__*/function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(event) {
        var _this$props6, onChange, query;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _this$props6 = _this.props, onChange = _this$props6.onChange, query = _this$props6.query;
                onChange(_extends({}, query, {
                  prefix: event.target.value
                }));
              case 2:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));
      return function (_x5) {
        return _ref5.apply(this, arguments);
      };
    }());
    return _this;
  }
  _createClass(QueryEditor, [{
    key: "render",
    value: function render() {
      var query = lodash_defaults__WEBPACK_IMPORTED_MODULE_0___default()(this.props.query, _types__WEBPACK_IMPORTED_MODULE_3__.defaultQuery);
      var collectionName = query.collectionName,
        prefix = query.prefix,
        timestampField = query.timestampField,
        valueFields = query.valueFields,
        allTimeFields = query.allTimeFields,
        allNumberFields = query.allNumberFields;
      var fieldLabel = function fieldLabel(f) {
        return f.example ? f.name + ' (' + f.example + ')' : f.name;
      };
      var fields = [];
      for (var i = 0; i < valueFields.length; ++i) {
        var valueField = valueFields[i].name;
        fields.push( /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", {
          className: "gf-form"
        }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_2__.InlineFormLabel, {
          width: 10
        }, "Value field ", i), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(Select, {
          width: 15,
          placeholder: '(none)',
          defaultValue: 0,
          options: allNumberFields.map(function (f) {
            return {
              label: fieldLabel(f),
              value: f.name
            };
          }),
          value: {
            label: valueField,
            value: valueField
          },
          allowCustomValue: false,
          onChange: this.onValueFieldChange(i)
        }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_2__.Button, {
          value: i,
          onClick: this.onRemoveField(i)
        }, "Remove")));
      }
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", {
        className: "gf-form"
      }, _InlineFormLabel || (_InlineFormLabel = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_2__.InlineFormLabel, {
        width: 10
      }, "Collection")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(Select, {
        width: 30,
        placeholder: '(none)',
        defaultValue: 0,
        options: this.props.datasource.collections.map(function (c) {
          return {
            label: c.name,
            value: c.name
          };
        }),
        value: {
          label: collectionName,
          value: collectionName
        },
        allowCustomValue: false,
        onChange: this.onCollectionChange
      })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", {
        className: "gf-form"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(FormField, {
        label: "Prefix",
        labelWidth: 10,
        inputWidth: 30,
        onChange: this.onPrefixChange,
        value: prefix,
        placeholder: "http://arango:8529"
      })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", {
        className: "gf-form"
      }, _InlineFormLabel2 || (_InlineFormLabel2 = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_2__.InlineFormLabel, {
        width: 10
      }, "Timestamp field")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(Select, {
        width: 30,
        placeholder: '(none)',
        defaultValue: 0,
        options: allTimeFields.map(function (f) {
          return {
            label: fieldLabel(f),
            value: f.name
          };
        }),
        value: {
          label: timestampField,
          value: timestampField
        },
        allowCustomValue: true,
        onChange: this.onTimestampFieldChange
      })), fields, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_grafana_ui__WEBPACK_IMPORTED_MODULE_2__.Button, {
        onClick: this.onAddField
      }, "Add field"));
    }
  }]);
  return QueryEditor;
}(react__WEBPACK_IMPORTED_MODULE_1__.PureComponent);

/***/ }),

/***/ "./datasource.ts":
/*!***********************!*\
  !*** ./datasource.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DataSource": () => (/* binding */ DataSource)
/* harmony export */ });
/* harmony import */ var arangojs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! arangojs */ "../node_modules/arangojs/index.js");
/* harmony import */ var arangojs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(arangojs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! dayjs */ "../node_modules/dayjs/dayjs.min.js");
/* harmony import */ var dayjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(dayjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash */ "lodash");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _grafana_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @grafana/data */ "@grafana/data");
/* harmony import */ var _grafana_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_grafana_data__WEBPACK_IMPORTED_MODULE_3__);
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var method = delegate.iterator[context.method]; if (undefined === method) { if (context.delegate = null, "throw" === context.method) { if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel; context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method"); } return ContinueSentinel; } var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) { if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; } return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) { keys.push(key); } return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) { "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); } }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var customParseFormat = __webpack_require__(/*! dayjs/plugin/customParseFormat */ "../node_modules/dayjs/plugin/customParseFormat.js");
dayjs__WEBPACK_IMPORTED_MODULE_1___default().extend(customParseFormat);
var advancedFormat = __webpack_require__(/*! dayjs/plugin/advancedFormat */ "../node_modules/dayjs/plugin/advancedFormat.js");
dayjs__WEBPACK_IMPORTED_MODULE_1___default().extend(advancedFormat);
function isValidDate(x) {
  var d = dayjs__WEBPACK_IMPORTED_MODULE_1___default()(x);
  return d.isValid() && d.isBefore(dayjs__WEBPACK_IMPORTED_MODULE_1___default()('2099-12-31T23:59:59Z')) && d.isAfter(dayjs__WEBPACK_IMPORTED_MODULE_1___default()('2000-01-01T00:00:00Z'));
}
function isValidUnixTimestamp(x) {
  var d = dayjs__WEBPACK_IMPORTED_MODULE_1___default()(x, 'x', true);
  return d.isValid();
}
var DataSource = /*#__PURE__*/function (_DataSourceApi) {
  _inherits(DataSource, _DataSourceApi);
  var _super = _createSuper(DataSource);
  function DataSource(instanceSettings) {
    var _this;
    _classCallCheck(this, DataSource);
    _this = _super.call(this, instanceSettings);
    _defineProperty(_assertThisInitialized(_this), "arango", void 0);
    _defineProperty(_assertThisInitialized(_this), "collections", []);
    _this.instanceSettings = instanceSettings;
    var _this$instanceSetting = _this.instanceSettings.jsonData,
      url = _this$instanceSetting.dbUrl,
      databaseName = _this$instanceSetting.dbName;
    console.log({
      url: url,
      databaseName: databaseName
    });
    _this.arango = new arangojs__WEBPACK_IMPORTED_MODULE_0__.Database({
      url: url,
      databaseName: databaseName
    });
    void _this.setup();
    return _this;
  }
  _createClass(DataSource, [{
    key: "setup",
    value: function () {
      var _setup = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var collectionsRegex;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                collectionsRegex = this.instanceSettings.jsonData.collectionsRegex;
                _context.next = 3;
                return this.arango.listCollections();
              case 3:
                this.collections = _context.sent.filter(function (c) {
                  return !collectionsRegex || collectionsRegex === '' || c.name.match(collectionsRegex);
                }).sort(function (a, b) {
                  return a.name < b.name ? 1 : -1;
                });
                console.log(this.collections);
              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));
      function setup() {
        return _setup.apply(this, arguments);
      }
      return setup;
    }()
  }, {
    key: "loadFieldsOf",
    value: function () {
      var _loadFieldsOf = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(collection) {
        var res, resObj, fields, ret;
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.collections.find(function (c) {
                  return c.name === collection;
                })) {
                  _context2.next = 2;
                  break;
                }
                return _context2.abrupt("return", {
                  time: [],
                  number_: []
                });
              case 2:
                _context2.next = 4;
                return this.arango.query({
                  query: "FOR doc IN @@collection\n                       LIMIT 1\n                       RETURN doc",
                  bindVars: {
                    '@collection': collection
                  }
                });
              case 4:
                res = _context2.sent;
                _context2.next = 7;
                return res.next();
              case 7:
                resObj = _context2.sent;
                fields = Object.keys(resObj);
                ret = {
                  time: fields.filter(function (fk) {
                    return isValidDate(resObj[fk]);
                  }).map(function (fk) {
                    return {
                      name: fk,
                      example: resObj[fk]
                    };
                  }),
                  number_: fields.filter(function (fk) {
                    return lodash__WEBPACK_IMPORTED_MODULE_2___default().isNumber(resObj[fk]);
                  }).map(function (fk) {
                    return {
                      name: fk,
                      example: resObj[fk]
                    };
                  })
                };
                console.log(ret);
                return _context2.abrupt("return", ret);
              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));
      function loadFieldsOf(_x) {
        return _loadFieldsOf.apply(this, arguments);
      }
      return loadFieldsOf;
    }()
  }, {
    key: "query",
    value: function () {
      var _query = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(options) {
        var _this2 = this;
        var range, from_, to, data, fieldAlias, _iterator, _step, _loop, _ret;
        return _regeneratorRuntime().wrap(function _callee3$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                console.log('ArangoDataSource query called:', {
                  options: options
                });
                range = options.range;
                from_ = range.from.valueOf();
                to = range.to.valueOf(); // Return a constant for each query.
                data = [];
                fieldAlias = function fieldAlias(name, alias, prefix) {
                  var _ref;
                  var al = (_ref = alias !== null && alias !== void 0 ? alias : name) !== null && _ref !== void 0 ? _ref : '';
                  return prefix ? prefix + '_' + al : al;
                };
                _iterator = _createForOfIteratorHelper(options.targets);
                _context4.prev = 7;
                _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
                  var _records$;
                  var args, fieldsQuery, fieldsBinds, _iterator2, _step2, field, name, alias, i, query, result, records, timeSample, times, frame;
                  return _regeneratorRuntime().wrap(function _loop$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          args = _step.value;
                          if (!(!args.collectionName || args.hide)) {
                            _context3.next = 3;
                            break;
                          }
                          return _context3.abrupt("return", "continue");
                        case 3:
                          fieldsQuery = '';
                          fieldsBinds = {};
                          _iterator2 = _createForOfIteratorHelper(args.valueFields);
                          _context3.prev = 6;
                          _iterator2.s();
                        case 8:
                          if ((_step2 = _iterator2.n()).done) {
                            _context3.next = 18;
                            break;
                          }
                          field = _step2.value;
                          name = field.name, alias = field.alias;
                          i = Object.keys(fieldsBinds).length;
                          if (name) {
                            _context3.next = 14;
                            break;
                          }
                          return _context3.abrupt("continue", 16);
                        case 14:
                          fieldsQuery += '`' + fieldAlias(name, alias, args.prefix) + '`:doc[@valueField' + i + '],';
                          fieldsBinds['valueField' + i] = name;
                        case 16:
                          _context3.next = 8;
                          break;
                        case 18:
                          _context3.next = 23;
                          break;
                        case 20:
                          _context3.prev = 20;
                          _context3.t0 = _context3["catch"](6);
                          _iterator2.e(_context3.t0);
                        case 23:
                          _context3.prev = 23;
                          _iterator2.f();
                          return _context3.finish(23);
                        case 26:
                          query = "FOR doc IN @@collection\nFILTER date_timestamp(doc[@timefield]) >= date_timestamp(@from) AND date_timestamp(doc[@timefield]) <= date_timestamp(@to)\nSORT doc[@timefield]\nRETURN  {Time:doc[@timefield], ".concat(fieldsQuery, "}");
                          console.log(query);
                          _context3.next = 30;
                          return _this2.arango.query({
                            query: query,
                            bindVars: _extends({
                              '@collection': args.collectionName,
                              timefield: args.timestampField
                            }, fieldsBinds, {
                              from: from_,
                              to: to
                            })
                          });
                        case 30:
                          result = _context3.sent;
                          _context3.next = 33;
                          return result.all();
                        case 33:
                          records = _context3.sent;
                          timeSample = (_records$ = records[0]) === null || _records$ === void 0 ? void 0 : _records$.Time;
                          times = void 0;
                          if (isValidUnixTimestamp(timeSample)) {
                            times = records.map(function (r) {
                              return r.Time;
                            });
                          } else {
                            times = records.map(function (r) {
                              return dayjs__WEBPACK_IMPORTED_MODULE_1___default()(r.Time).valueOf();
                            });
                          }
                          console.log(isValidUnixTimestamp(timeSample), timeSample);
                          // const values: number[] = records.map((r) => r.Value);
                          frame = new _grafana_data__WEBPACK_IMPORTED_MODULE_3__.MutableDataFrame({
                            refId: args.refId,
                            fields: [{
                              name: 'Time',
                              values: times,
                              type: _grafana_data__WEBPACK_IMPORTED_MODULE_3__.FieldType.time
                            }].concat(_toConsumableArray(args.valueFields.filter(function (f) {
                              return !!f.name;
                            }).map(function (f) {
                              var _f$name;
                              var alias = fieldAlias((_f$name = f.name) !== null && _f$name !== void 0 ? _f$name : 'Value', f.alias, args.prefix);
                              return {
                                name: alias,
                                values: records.map(function (r) {
                                  return r[alias];
                                }),
                                type: _grafana_data__WEBPACK_IMPORTED_MODULE_3__.FieldType.number
                              };
                            })))
                          });
                          data.push(frame);
                        case 40:
                        case "end":
                          return _context3.stop();
                      }
                    }
                  }, _loop, null, [[6, 20, 23, 26]]);
                });
                _iterator.s();
              case 10:
                if ((_step = _iterator.n()).done) {
                  _context4.next = 17;
                  break;
                }
                return _context4.delegateYield(_loop(), "t0", 12);
              case 12:
                _ret = _context4.t0;
                if (!(_ret === "continue")) {
                  _context4.next = 15;
                  break;
                }
                return _context4.abrupt("continue", 15);
              case 15:
                _context4.next = 10;
                break;
              case 17:
                _context4.next = 22;
                break;
              case 19:
                _context4.prev = 19;
                _context4.t1 = _context4["catch"](7);
                _iterator.e(_context4.t1);
              case 22:
                _context4.prev = 22;
                _iterator.f();
                return _context4.finish(22);
              case 25:
                return _context4.abrupt("return", {
                  data: data
                });
              case 26:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee3, null, [[7, 19, 22, 25]]);
      }));
      function query(_x2) {
        return _query.apply(this, arguments);
      }
      return query;
    }()
  }, {
    key: "testDatasource",
    value: function () {
      var _testDatasource = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4() {
        var _this$instanceSetting2, collectionsRegex, url, databaseName, success, arango, dbName, collections;
        return _regeneratorRuntime().wrap(function _callee4$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _this$instanceSetting2 = this.instanceSettings.jsonData, collectionsRegex = _this$instanceSetting2.collectionsRegex, url = _this$instanceSetting2.dbUrl, databaseName = _this$instanceSetting2.dbName; // Implement a health check for your data source.
                success = true; // try {
                arango = new arangojs__WEBPACK_IMPORTED_MODULE_0__.Database({
                  url: url,
                  databaseName: databaseName
                });
                dbName = 'error';
                collections = 'error';
                _context5.prev = 5;
                _context5.next = 8;
                return arango.get();
              case 8:
                dbName = _context5.sent.name;
                _context5.next = 11;
                return arango.listCollections();
              case 11:
                collections = _context5.sent.filter(function (c) {
                  return c.name.match(collectionsRegex);
                }).map(function (c) {
                  return c.name;
                }).slice(0, 5).join(',');
                _context5.next = 18;
                break;
              case 14:
                _context5.prev = 14;
                _context5.t0 = _context5["catch"](5);
                success = false;
                dbName = _context5.t0.message;
              case 18:
                return _context5.abrupt("return", {
                  status: success,
                  message: "db=".concat(dbName, ", collections=[").concat(collections, ",...]")
                });
              case 19:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee4, this, [[5, 14]]);
      }));
      function testDatasource() {
        return _testDatasource.apply(this, arguments);
      }
      return testDatasource;
    }()
  }]);
  return DataSource;
}(_grafana_data__WEBPACK_IMPORTED_MODULE_3__.DataSourceApi);

/***/ }),

/***/ "./types.ts":
/*!******************!*\
  !*** ./types.ts ***!
  \******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "defaultQuery": () => (/* binding */ defaultQuery)
/* harmony export */ });
var defaultQuery = {
  allTimeFields: [],
  allNumberFields: [],
  valueFields: []
};

/**
 * These are options configured for each DataSource instance
 */

/***/ }),

/***/ "../node_modules/dayjs/dayjs.min.js":
/*!******************************************!*\
  !*** ../node_modules/dayjs/dayjs.min.js ***!
  \******************************************/
/***/ (function(module) {

!function(t,e){ true?module.exports=e():0}(this,(function(){"use strict";var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",u="hour",a="day",o="week",f="month",h="quarter",c="year",d="date",l="Invalid Date",$=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,M={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(t){var e=["th","st","nd","rd"],n=t%100;return"["+t+(e[(n-20)%10]||e[n]||e[0])+"]"}},m=function(t,e,n){var r=String(t);return!r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},v={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return(e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return-t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,f),s=n-i<0,u=e.clone().add(r+(s?-1:1),f);return+(-(r+(n-i)/(s?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return{M:f,y:c,w:o,d:a,D:d,h:u,m:s,s:i,ms:r,Q:h}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},g="en",D={};D[g]=M;var p=function(t){return t instanceof _},S=function t(e,n,r){var i;if(!e)return g;if("string"==typeof e){var s=e.toLowerCase();D[s]&&(i=s),n&&(D[s]=n,i=s);var u=e.split("-");if(!i&&u.length>1)return t(u[0])}else{var a=e.name;D[a]=e,i=a}return!r&&i&&(g=i),i||!r&&g},w=function(t,e){if(p(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},O=v;O.l=S,O.i=p,O.w=function(t,e){return w(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function M(t){this.$L=S(t.locale,null,!0),this.parse(t)}var m=M.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(O.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match($);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.$x=t.x||{},this.init()},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds()},m.$utils=function(){return O},m.isValid=function(){return!(this.$d.toString()===l)},m.isSame=function(t,e){var n=w(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return w(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<w(t)},m.$g=function(t,e,n){return O.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!O.u(e)||e,h=O.p(t),l=function(t,e){var i=O.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(a)},$=function(t,e){return O.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},y=this.$W,M=this.$M,m=this.$D,v="set"+(this.$u?"UTC":"");switch(h){case c:return r?l(1,0):l(31,11);case f:return r?l(1,M):l(0,M+1);case o:var g=this.$locale().weekStart||0,D=(y<g?y+7:y)-g;return l(r?m-D:m+(6-D),M);case a:case d:return $(v+"Hours",0);case u:return $(v+"Minutes",1);case s:return $(v+"Seconds",2);case i:return $(v+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,!1)},m.$set=function(t,e){var n,o=O.p(t),h="set"+(this.$u?"UTC":""),l=(n={},n[a]=h+"Date",n[d]=h+"Date",n[f]=h+"Month",n[c]=h+"FullYear",n[u]=h+"Hours",n[s]=h+"Minutes",n[i]=h+"Seconds",n[r]=h+"Milliseconds",n)[o],$=o===a?this.$D+(e-this.$W):e;if(o===f||o===c){var y=this.clone().set(d,1);y.$d[l]($),y.init(),this.$d=y.set(d,Math.min(this.$D,y.daysInMonth())).$d}else l&&this.$d[l]($);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[O.p(t)]()},m.add=function(r,h){var d,l=this;r=Number(r);var $=O.p(h),y=function(t){var e=w(l);return O.w(e.date(e.date()+Math.round(t*r)),l)};if($===f)return this.set(f,this.$M+r);if($===c)return this.set(c,this.$y+r);if($===a)return y(1);if($===o)return y(7);var M=(d={},d[s]=e,d[u]=n,d[i]=t,d)[$]||1,m=this.$d.getTime()+r*M;return O.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return n.invalidDate||l;var r=t||"YYYY-MM-DDTHH:mm:ssZ",i=O.z(this),s=this.$H,u=this.$m,a=this.$M,o=n.weekdays,f=n.months,h=function(t,n,i,s){return t&&(t[n]||t(e,r))||i[n].slice(0,s)},c=function(t){return O.s(s%12||12,t,"0")},d=n.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},$={YY:String(this.$y).slice(-2),YYYY:this.$y,M:a+1,MM:O.s(a+1,2,"0"),MMM:h(n.monthsShort,a,f,3),MMMM:h(f,a),D:this.$D,DD:O.s(this.$D,2,"0"),d:String(this.$W),dd:h(n.weekdaysMin,this.$W,o,2),ddd:h(n.weekdaysShort,this.$W,o,3),dddd:o[this.$W],H:String(s),HH:O.s(s,2,"0"),h:c(1),hh:c(2),a:d(s,u,!0),A:d(s,u,!1),m:String(u),mm:O.s(u,2,"0"),s:String(this.$s),ss:O.s(this.$s,2,"0"),SSS:O.s(this.$ms,3,"0"),Z:i};return r.replace(y,(function(t,e){return e||$[t]||i.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,d,l){var $,y=O.p(d),M=w(r),m=(M.utcOffset()-this.utcOffset())*e,v=this-M,g=O.m(this,M);return g=($={},$[c]=g/12,$[f]=g,$[h]=g/3,$[o]=(v-m)/6048e5,$[a]=(v-m)/864e5,$[u]=v/n,$[s]=v/e,$[i]=v/t,$)[y]||v,l?g:O.a(g)},m.daysInMonth=function(){return this.endOf(f).$D},m.$locale=function(){return D[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=S(t,e,!0);return r&&(n.$L=r),n},m.clone=function(){return O.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},M}(),T=_.prototype;return w.prototype=T,[["$ms",r],["$s",i],["$m",s],["$H",u],["$W",a],["$M",f],["$y",c],["$D",d]].forEach((function(t){T[t[1]]=function(e){return this.$g(e,t[0],t[1])}})),w.extend=function(t,e){return t.$i||(t(e,_,w),t.$i=!0),w},w.locale=S,w.isDayjs=p,w.unix=function(t){return w(1e3*t)},w.en=D[g],w.Ls=D,w.p={},w}));

/***/ }),

/***/ "../node_modules/dayjs/plugin/advancedFormat.js":
/*!******************************************************!*\
  !*** ../node_modules/dayjs/plugin/advancedFormat.js ***!
  \******************************************************/
/***/ (function(module) {

!function(e,t){ true?module.exports=t():0}(this,(function(){"use strict";return function(e,t){var r=t.prototype,n=r.format;r.format=function(e){var t=this,r=this.$locale();if(!this.isValid())return n.bind(this)(e);var s=this.$utils(),a=(e||"YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,(function(e){switch(e){case"Q":return Math.ceil((t.$M+1)/3);case"Do":return r.ordinal(t.$D);case"gggg":return t.weekYear();case"GGGG":return t.isoWeekYear();case"wo":return r.ordinal(t.week(),"W");case"w":case"ww":return s.s(t.week(),"w"===e?1:2,"0");case"W":case"WW":return s.s(t.isoWeek(),"W"===e?1:2,"0");case"k":case"kk":return s.s(String(0===t.$H?24:t.$H),"k"===e?1:2,"0");case"X":return Math.floor(t.$d.getTime()/1e3);case"x":return t.$d.getTime();case"z":return"["+t.offsetName()+"]";case"zzz":return"["+t.offsetName("long")+"]";default:return e}}));return n.bind(this)(a)}}}));

/***/ }),

/***/ "../node_modules/dayjs/plugin/customParseFormat.js":
/*!*********************************************************!*\
  !*** ../node_modules/dayjs/plugin/customParseFormat.js ***!
  \*********************************************************/
/***/ (function(module) {

!function(e,t){ true?module.exports=t():0}(this,(function(){"use strict";var e={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},t=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|YYYY|YY?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,n=/\d\d/,r=/\d\d?/,i=/\d*[^-_:/,()\s\d]+/,o={},s=function(e){return(e=+e)+(e>68?1900:2e3)};var a=function(e){return function(t){this[e]=+t}},f=[/[+-]\d\d:?(\d\d)?|Z/,function(e){(this.zone||(this.zone={})).offset=function(e){if(!e)return 0;if("Z"===e)return 0;var t=e.match(/([+-]|\d\d)/g),n=60*t[1]+(+t[2]||0);return 0===n?0:"+"===t[0]?-n:n}(e)}],h=function(e){var t=o[e];return t&&(t.indexOf?t:t.s.concat(t.f))},u=function(e,t){var n,r=o.meridiem;if(r){for(var i=1;i<=24;i+=1)if(e.indexOf(r(i,0,t))>-1){n=i>12;break}}else n=e===(t?"pm":"PM");return n},d={A:[i,function(e){this.afternoon=u(e,!1)}],a:[i,function(e){this.afternoon=u(e,!0)}],S:[/\d/,function(e){this.milliseconds=100*+e}],SS:[n,function(e){this.milliseconds=10*+e}],SSS:[/\d{3}/,function(e){this.milliseconds=+e}],s:[r,a("seconds")],ss:[r,a("seconds")],m:[r,a("minutes")],mm:[r,a("minutes")],H:[r,a("hours")],h:[r,a("hours")],HH:[r,a("hours")],hh:[r,a("hours")],D:[r,a("day")],DD:[n,a("day")],Do:[i,function(e){var t=o.ordinal,n=e.match(/\d+/);if(this.day=n[0],t)for(var r=1;r<=31;r+=1)t(r).replace(/\[|\]/g,"")===e&&(this.day=r)}],M:[r,a("month")],MM:[n,a("month")],MMM:[i,function(e){var t=h("months"),n=(h("monthsShort")||t.map((function(e){return e.slice(0,3)}))).indexOf(e)+1;if(n<1)throw new Error;this.month=n%12||n}],MMMM:[i,function(e){var t=h("months").indexOf(e)+1;if(t<1)throw new Error;this.month=t%12||t}],Y:[/[+-]?\d+/,a("year")],YY:[n,function(e){this.year=s(e)}],YYYY:[/\d{4}/,a("year")],Z:f,ZZ:f};function c(n){var r,i;r=n,i=o&&o.formats;for(var s=(n=r.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,(function(t,n,r){var o=r&&r.toUpperCase();return n||i[r]||e[r]||i[o].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,(function(e,t,n){return t||n.slice(1)}))}))).match(t),a=s.length,f=0;f<a;f+=1){var h=s[f],u=d[h],c=u&&u[0],l=u&&u[1];s[f]=l?{regex:c,parser:l}:h.replace(/^\[|\]$/g,"")}return function(e){for(var t={},n=0,r=0;n<a;n+=1){var i=s[n];if("string"==typeof i)r+=i.length;else{var o=i.regex,f=i.parser,h=e.slice(r),u=o.exec(h)[0];f.call(t,u),e=e.replace(u,"")}}return function(e){var t=e.afternoon;if(void 0!==t){var n=e.hours;t?n<12&&(e.hours+=12):12===n&&(e.hours=0),delete e.afternoon}}(t),t}}return function(e,t,n){n.p.customParseFormat=!0,e&&e.parseTwoDigitYear&&(s=e.parseTwoDigitYear);var r=t.prototype,i=r.parse;r.parse=function(e){var t=e.date,r=e.utc,s=e.args;this.$u=r;var a=s[1];if("string"==typeof a){var f=!0===s[2],h=!0===s[3],u=f||h,d=s[2];h&&(d=s[2]),o=this.$locale(),!f&&d&&(o=n.Ls[d]),this.$d=function(e,t,n){try{if(["x","X"].indexOf(t)>-1)return new Date(("X"===t?1e3:1)*e);var r=c(t)(e),i=r.year,o=r.month,s=r.day,a=r.hours,f=r.minutes,h=r.seconds,u=r.milliseconds,d=r.zone,l=new Date,m=s||(i||o?1:l.getDate()),M=i||l.getFullYear(),Y=0;i&&!o||(Y=o>0?o-1:l.getMonth());var p=a||0,v=f||0,D=h||0,g=u||0;return d?new Date(Date.UTC(M,Y,m,p,v,D,g+60*d.offset*1e3)):n?new Date(Date.UTC(M,Y,m,p,v,D,g)):new Date(M,Y,m,p,v,D,g)}catch(e){return new Date("")}}(t,a,r),this.init(),d&&!0!==d&&(this.$L=this.locale(d).$L),u&&t!=this.format(a)&&(this.$d=new Date("")),o={}}else if(a instanceof Array)for(var l=a.length,m=1;m<=l;m+=1){s[1]=a[m-1];var M=n.apply(this,s);if(M.isValid()){this.$d=M.$d,this.$L=M.$L,this.init();break}m===l&&(this.$d=new Date(""))}else i.call(this,e)}}}));

/***/ }),

/***/ "../node_modules/global/window.js":
/*!****************************************!*\
  !*** ../node_modules/global/window.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof __webpack_require__.g !== "undefined") {
    win = __webpack_require__.g;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;


/***/ }),

/***/ "../node_modules/is-function/index.js":
/*!********************************************!*\
  !*** ../node_modules/is-function/index.js ***!
  \********************************************/
/***/ ((module) => {

module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  if (!fn) {
    return false
  }
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};


/***/ }),

/***/ "../node_modules/lodash/_Symbol.js":
/*!*****************************************!*\
  !*** ../node_modules/lodash/_Symbol.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var root = __webpack_require__(/*! ./_root */ "../node_modules/lodash/_root.js");

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;


/***/ }),

/***/ "../node_modules/lodash/_apply.js":
/*!****************************************!*\
  !*** ../node_modules/lodash/_apply.js ***!
  \****************************************/
/***/ ((module) => {

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

module.exports = apply;


/***/ }),

/***/ "../node_modules/lodash/_arrayLikeKeys.js":
/*!************************************************!*\
  !*** ../node_modules/lodash/_arrayLikeKeys.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseTimes = __webpack_require__(/*! ./_baseTimes */ "../node_modules/lodash/_baseTimes.js"),
    isArguments = __webpack_require__(/*! ./isArguments */ "../node_modules/lodash/isArguments.js"),
    isArray = __webpack_require__(/*! ./isArray */ "../node_modules/lodash/isArray.js"),
    isBuffer = __webpack_require__(/*! ./isBuffer */ "../node_modules/lodash/isBuffer.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "../node_modules/lodash/_isIndex.js"),
    isTypedArray = __webpack_require__(/*! ./isTypedArray */ "../node_modules/lodash/isTypedArray.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;


/***/ }),

/***/ "../node_modules/lodash/_baseGetTag.js":
/*!*********************************************!*\
  !*** ../node_modules/lodash/_baseGetTag.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Symbol = __webpack_require__(/*! ./_Symbol */ "../node_modules/lodash/_Symbol.js"),
    getRawTag = __webpack_require__(/*! ./_getRawTag */ "../node_modules/lodash/_getRawTag.js"),
    objectToString = __webpack_require__(/*! ./_objectToString */ "../node_modules/lodash/_objectToString.js");

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;


/***/ }),

/***/ "../node_modules/lodash/_baseIsArguments.js":
/*!**************************************************!*\
  !*** ../node_modules/lodash/_baseIsArguments.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "../node_modules/lodash/_baseGetTag.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "../node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;


/***/ }),

/***/ "../node_modules/lodash/_baseIsNative.js":
/*!***********************************************!*\
  !*** ../node_modules/lodash/_baseIsNative.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isFunction = __webpack_require__(/*! ./isFunction */ "../node_modules/lodash/isFunction.js"),
    isMasked = __webpack_require__(/*! ./_isMasked */ "../node_modules/lodash/_isMasked.js"),
    isObject = __webpack_require__(/*! ./isObject */ "../node_modules/lodash/isObject.js"),
    toSource = __webpack_require__(/*! ./_toSource */ "../node_modules/lodash/_toSource.js");

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;


/***/ }),

/***/ "../node_modules/lodash/_baseIsTypedArray.js":
/*!***************************************************!*\
  !*** ../node_modules/lodash/_baseIsTypedArray.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "../node_modules/lodash/_baseGetTag.js"),
    isLength = __webpack_require__(/*! ./isLength */ "../node_modules/lodash/isLength.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "../node_modules/lodash/isObjectLike.js");

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;


/***/ }),

/***/ "../node_modules/lodash/_baseKeysIn.js":
/*!*********************************************!*\
  !*** ../node_modules/lodash/_baseKeysIn.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(/*! ./isObject */ "../node_modules/lodash/isObject.js"),
    isPrototype = __webpack_require__(/*! ./_isPrototype */ "../node_modules/lodash/_isPrototype.js"),
    nativeKeysIn = __webpack_require__(/*! ./_nativeKeysIn */ "../node_modules/lodash/_nativeKeysIn.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeysIn;


/***/ }),

/***/ "../node_modules/lodash/_baseRest.js":
/*!*******************************************!*\
  !*** ../node_modules/lodash/_baseRest.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var identity = __webpack_require__(/*! ./identity */ "../node_modules/lodash/identity.js"),
    overRest = __webpack_require__(/*! ./_overRest */ "../node_modules/lodash/_overRest.js"),
    setToString = __webpack_require__(/*! ./_setToString */ "../node_modules/lodash/_setToString.js");

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;


/***/ }),

/***/ "../node_modules/lodash/_baseSetToString.js":
/*!**************************************************!*\
  !*** ../node_modules/lodash/_baseSetToString.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var constant = __webpack_require__(/*! ./constant */ "../node_modules/lodash/constant.js"),
    defineProperty = __webpack_require__(/*! ./_defineProperty */ "../node_modules/lodash/_defineProperty.js"),
    identity = __webpack_require__(/*! ./identity */ "../node_modules/lodash/identity.js");

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

module.exports = baseSetToString;


/***/ }),

/***/ "../node_modules/lodash/_baseTimes.js":
/*!********************************************!*\
  !*** ../node_modules/lodash/_baseTimes.js ***!
  \********************************************/
/***/ ((module) => {

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;


/***/ }),

/***/ "../node_modules/lodash/_baseUnary.js":
/*!********************************************!*\
  !*** ../node_modules/lodash/_baseUnary.js ***!
  \********************************************/
/***/ ((module) => {

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;


/***/ }),

/***/ "../node_modules/lodash/_coreJsData.js":
/*!*********************************************!*\
  !*** ../node_modules/lodash/_coreJsData.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var root = __webpack_require__(/*! ./_root */ "../node_modules/lodash/_root.js");

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;


/***/ }),

/***/ "../node_modules/lodash/_defineProperty.js":
/*!*************************************************!*\
  !*** ../node_modules/lodash/_defineProperty.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getNative = __webpack_require__(/*! ./_getNative */ "../node_modules/lodash/_getNative.js");

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

module.exports = defineProperty;


/***/ }),

/***/ "../node_modules/lodash/_freeGlobal.js":
/*!*********************************************!*\
  !*** ../node_modules/lodash/_freeGlobal.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

module.exports = freeGlobal;


/***/ }),

/***/ "../node_modules/lodash/_getNative.js":
/*!********************************************!*\
  !*** ../node_modules/lodash/_getNative.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsNative = __webpack_require__(/*! ./_baseIsNative */ "../node_modules/lodash/_baseIsNative.js"),
    getValue = __webpack_require__(/*! ./_getValue */ "../node_modules/lodash/_getValue.js");

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;


/***/ }),

/***/ "../node_modules/lodash/_getRawTag.js":
/*!********************************************!*\
  !*** ../node_modules/lodash/_getRawTag.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Symbol = __webpack_require__(/*! ./_Symbol */ "../node_modules/lodash/_Symbol.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;


/***/ }),

/***/ "../node_modules/lodash/_getValue.js":
/*!*******************************************!*\
  !*** ../node_modules/lodash/_getValue.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;


/***/ }),

/***/ "../node_modules/lodash/_isIndex.js":
/*!******************************************!*\
  !*** ../node_modules/lodash/_isIndex.js ***!
  \******************************************/
/***/ ((module) => {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;


/***/ }),

/***/ "../node_modules/lodash/_isIterateeCall.js":
/*!*************************************************!*\
  !*** ../node_modules/lodash/_isIterateeCall.js ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var eq = __webpack_require__(/*! ./eq */ "../node_modules/lodash/eq.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "../node_modules/lodash/isArrayLike.js"),
    isIndex = __webpack_require__(/*! ./_isIndex */ "../node_modules/lodash/_isIndex.js"),
    isObject = __webpack_require__(/*! ./isObject */ "../node_modules/lodash/isObject.js");

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

module.exports = isIterateeCall;


/***/ }),

/***/ "../node_modules/lodash/_isMasked.js":
/*!*******************************************!*\
  !*** ../node_modules/lodash/_isMasked.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var coreJsData = __webpack_require__(/*! ./_coreJsData */ "../node_modules/lodash/_coreJsData.js");

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;


/***/ }),

/***/ "../node_modules/lodash/_isPrototype.js":
/*!**********************************************!*\
  !*** ../node_modules/lodash/_isPrototype.js ***!
  \**********************************************/
/***/ ((module) => {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;


/***/ }),

/***/ "../node_modules/lodash/_nativeKeysIn.js":
/*!***********************************************!*\
  !*** ../node_modules/lodash/_nativeKeysIn.js ***!
  \***********************************************/
/***/ ((module) => {

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

module.exports = nativeKeysIn;


/***/ }),

/***/ "../node_modules/lodash/_nodeUtil.js":
/*!*******************************************!*\
  !*** ../node_modules/lodash/_nodeUtil.js ***!
  \*******************************************/
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "../node_modules/lodash/_freeGlobal.js");

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;


/***/ }),

/***/ "../node_modules/lodash/_objectToString.js":
/*!*************************************************!*\
  !*** ../node_modules/lodash/_objectToString.js ***!
  \*************************************************/
/***/ ((module) => {

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;


/***/ }),

/***/ "../node_modules/lodash/_overRest.js":
/*!*******************************************!*\
  !*** ../node_modules/lodash/_overRest.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var apply = __webpack_require__(/*! ./_apply */ "../node_modules/lodash/_apply.js");

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;


/***/ }),

/***/ "../node_modules/lodash/_root.js":
/*!***************************************!*\
  !*** ../node_modules/lodash/_root.js ***!
  \***************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var freeGlobal = __webpack_require__(/*! ./_freeGlobal */ "../node_modules/lodash/_freeGlobal.js");

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;


/***/ }),

/***/ "../node_modules/lodash/_setToString.js":
/*!**********************************************!*\
  !*** ../node_modules/lodash/_setToString.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseSetToString = __webpack_require__(/*! ./_baseSetToString */ "../node_modules/lodash/_baseSetToString.js"),
    shortOut = __webpack_require__(/*! ./_shortOut */ "../node_modules/lodash/_shortOut.js");

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

module.exports = setToString;


/***/ }),

/***/ "../node_modules/lodash/_shortOut.js":
/*!*******************************************!*\
  !*** ../node_modules/lodash/_shortOut.js ***!
  \*******************************************/
/***/ ((module) => {

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;


/***/ }),

/***/ "../node_modules/lodash/_toSource.js":
/*!*******************************************!*\
  !*** ../node_modules/lodash/_toSource.js ***!
  \*******************************************/
/***/ ((module) => {

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;


/***/ }),

/***/ "../node_modules/lodash/constant.js":
/*!******************************************!*\
  !*** ../node_modules/lodash/constant.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

module.exports = constant;


/***/ }),

/***/ "../node_modules/lodash/defaults.js":
/*!******************************************!*\
  !*** ../node_modules/lodash/defaults.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseRest = __webpack_require__(/*! ./_baseRest */ "../node_modules/lodash/_baseRest.js"),
    eq = __webpack_require__(/*! ./eq */ "../node_modules/lodash/eq.js"),
    isIterateeCall = __webpack_require__(/*! ./_isIterateeCall */ "../node_modules/lodash/_isIterateeCall.js"),
    keysIn = __webpack_require__(/*! ./keysIn */ "../node_modules/lodash/keysIn.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns own and inherited enumerable string keyed properties of source
 * objects to the destination object for all destination properties that
 * resolve to `undefined`. Source objects are applied from left to right.
 * Once a property is set, additional values of the same property are ignored.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaultsDeep
 * @example
 *
 * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
 * // => { 'a': 1, 'b': 2 }
 */
var defaults = baseRest(function(object, sources) {
  object = Object(object);

  var index = -1;
  var length = sources.length;
  var guard = length > 2 ? sources[2] : undefined;

  if (guard && isIterateeCall(sources[0], sources[1], guard)) {
    length = 1;
  }

  while (++index < length) {
    var source = sources[index];
    var props = keysIn(source);
    var propsIndex = -1;
    var propsLength = props.length;

    while (++propsIndex < propsLength) {
      var key = props[propsIndex];
      var value = object[key];

      if (value === undefined ||
          (eq(value, objectProto[key]) && !hasOwnProperty.call(object, key))) {
        object[key] = source[key];
      }
    }
  }

  return object;
});

module.exports = defaults;


/***/ }),

/***/ "../node_modules/lodash/eq.js":
/*!************************************!*\
  !*** ../node_modules/lodash/eq.js ***!
  \************************************/
/***/ ((module) => {

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;


/***/ }),

/***/ "../node_modules/lodash/identity.js":
/*!******************************************!*\
  !*** ../node_modules/lodash/identity.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;


/***/ }),

/***/ "../node_modules/lodash/isArguments.js":
/*!*********************************************!*\
  !*** ../node_modules/lodash/isArguments.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsArguments = __webpack_require__(/*! ./_baseIsArguments */ "../node_modules/lodash/_baseIsArguments.js"),
    isObjectLike = __webpack_require__(/*! ./isObjectLike */ "../node_modules/lodash/isObjectLike.js");

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;


/***/ }),

/***/ "../node_modules/lodash/isArray.js":
/*!*****************************************!*\
  !*** ../node_modules/lodash/isArray.js ***!
  \*****************************************/
/***/ ((module) => {

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;


/***/ }),

/***/ "../node_modules/lodash/isArrayLike.js":
/*!*********************************************!*\
  !*** ../node_modules/lodash/isArrayLike.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isFunction = __webpack_require__(/*! ./isFunction */ "../node_modules/lodash/isFunction.js"),
    isLength = __webpack_require__(/*! ./isLength */ "../node_modules/lodash/isLength.js");

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;


/***/ }),

/***/ "../node_modules/lodash/isBuffer.js":
/*!******************************************!*\
  !*** ../node_modules/lodash/isBuffer.js ***!
  \******************************************/
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
var root = __webpack_require__(/*! ./_root */ "../node_modules/lodash/_root.js"),
    stubFalse = __webpack_require__(/*! ./stubFalse */ "../node_modules/lodash/stubFalse.js");

/** Detect free variable `exports`. */
var freeExports =  true && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && "object" == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;


/***/ }),

/***/ "../node_modules/lodash/isFunction.js":
/*!********************************************!*\
  !*** ../node_modules/lodash/isFunction.js ***!
  \********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseGetTag = __webpack_require__(/*! ./_baseGetTag */ "../node_modules/lodash/_baseGetTag.js"),
    isObject = __webpack_require__(/*! ./isObject */ "../node_modules/lodash/isObject.js");

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;


/***/ }),

/***/ "../node_modules/lodash/isLength.js":
/*!******************************************!*\
  !*** ../node_modules/lodash/isLength.js ***!
  \******************************************/
/***/ ((module) => {

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;


/***/ }),

/***/ "../node_modules/lodash/isObject.js":
/*!******************************************!*\
  !*** ../node_modules/lodash/isObject.js ***!
  \******************************************/
/***/ ((module) => {

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;


/***/ }),

/***/ "../node_modules/lodash/isObjectLike.js":
/*!**********************************************!*\
  !*** ../node_modules/lodash/isObjectLike.js ***!
  \**********************************************/
/***/ ((module) => {

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;


/***/ }),

/***/ "../node_modules/lodash/isTypedArray.js":
/*!**********************************************!*\
  !*** ../node_modules/lodash/isTypedArray.js ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var baseIsTypedArray = __webpack_require__(/*! ./_baseIsTypedArray */ "../node_modules/lodash/_baseIsTypedArray.js"),
    baseUnary = __webpack_require__(/*! ./_baseUnary */ "../node_modules/lodash/_baseUnary.js"),
    nodeUtil = __webpack_require__(/*! ./_nodeUtil */ "../node_modules/lodash/_nodeUtil.js");

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;


/***/ }),

/***/ "../node_modules/lodash/keysIn.js":
/*!****************************************!*\
  !*** ../node_modules/lodash/keysIn.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var arrayLikeKeys = __webpack_require__(/*! ./_arrayLikeKeys */ "../node_modules/lodash/_arrayLikeKeys.js"),
    baseKeysIn = __webpack_require__(/*! ./_baseKeysIn */ "../node_modules/lodash/_baseKeysIn.js"),
    isArrayLike = __webpack_require__(/*! ./isArrayLike */ "../node_modules/lodash/isArrayLike.js");

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;


/***/ }),

/***/ "../node_modules/lodash/stubFalse.js":
/*!*******************************************!*\
  !*** ../node_modules/lodash/stubFalse.js ***!
  \*******************************************/
/***/ ((module) => {

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;


/***/ }),

/***/ "../node_modules/parse-headers/parse-headers.js":
/*!******************************************************!*\
  !*** ../node_modules/parse-headers/parse-headers.js ***!
  \******************************************************/
/***/ ((module) => {

var trim = function(string) {
  return string.replace(/^\s+|\s+$/g, '');
}
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  var headersArr = trim(headers).split('\n')

  for (var i = 0; i < headersArr.length; i++) {
    var row = headersArr[i]
    var index = row.indexOf(':')
    , key = trim(row.slice(0, index)).toLowerCase()
    , value = trim(row.slice(index + 1))

    if (typeof(result[key]) === 'undefined') {
      result[key] = value
    } else if (isArray(result[key])) {
      result[key].push(value)
    } else {
      result[key] = [ result[key], value ]
    }
  }

  return result
}


/***/ }),

/***/ "../node_modules/x3-linkedlist/dist/LinkedList.js":
/*!********************************************************!*\
  !*** ../node_modules/x3-linkedlist/dist/LinkedList.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const LinkedListItem_1 = __webpack_require__(/*! ./LinkedListItem */ "../node_modules/x3-linkedlist/dist/LinkedListItem.js");
/**
 * Implements a linked list structure
 * @typeparam T Type of values within this LinkedList
 */
class LinkedList {
    /**
     * @param values Values to be added upfront into list
     */
    constructor(values) {
        /**
         * Current length of this LinkedList.
         * Note that this does not work anymore if you for some reason add your own LinkedListItems to LinkedList by hand
         */
        this.length = 0;
        /**
         * Given to own LinkedListItem's for following jobs regarding an unlink:
         * - If item is first item, set the next item as first item
         * - If item is last item, set the previous item as last item
         * - Decrease length
         * @param item Item that has been unlinked
         */
        this.unlinkCleanup = (item) => {
            if (this.first === item) {
                this.first = this.first.behind;
            }
            if (this.last === item) {
                this.last = this.last.before;
            }
            this.length--;
        };
        if (values) {
            if (values instanceof LinkedList)
                values = values.values();
            for (const value of values) {
                this.push(value);
            }
        }
    }
    /**
     * Clears this LinkedList.
     * The default complexity is O(1), because it only removes links to the first and last item and resets the length.
     * Note that if any LinkedListItem is still referenced outside the LinkedList, their before and behind fields might
     * still reference the chain, not freeing space.
     * You can set the unchain parameter to true, so every item in the linked list will be unchained,
     * meaning all references to before and behind items will be removed.
     * This increases complexity to O(n), but removes accidental outside references to the full chain.
     * @param unchain If `true`, remove link info from every item. Changes complexity to O(n)!
     */
    clear(unchain = false) {
        if (unchain) {
            while (this.first) {
                this.first.unlink(true);
            }
        }
        this.first = this.last = undefined;
        this.length = 0;
    }
    /**
     * As Array#every() given callback is called for every element until one call returns falsy or all elements had been processed
     * @returns `false` if there was a falsy response from the callback, `true` if all elements have been processed "falselesly"
     * @see Array#every
     */
    every(callback, thisArg) {
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        for (const item of this.keys()) {
            if (!callback(item.value, item, this)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Filters values into a new LinkedList
     * @param callback decides wether given element should be part of new LinkedList
     * @see Array#filter
     */
    filter(callback, thisArg) {
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        const newList = new LinkedList();
        for (const [item, value] of this) {
            if (callback(value, item, this)) {
                newList.push(value);
            }
        }
        return newList;
    }
    /**
     * Returns value for which given callback returns truthy
     * @param callback runs for every value in LinkedList. If it returns truthy, current value is returned.
     * @see Array#find
     */
    find(callback, thisArg) {
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        for (const [item, value] of this) {
            if (callback(value, item, this)) {
                return value;
            }
        }
    }
    /**
     * Returns the LinkedListItem for which given callback returns truthy
     * @param callback runs for every LinkedListItem in LinkedList. If it returns truthy, current LinkedListItem is returned.
     * @see Array#findIndex
     */
    findItem(callback, thisArg) {
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        for (const [item, value] of this) {
            if (callback(value, item, this)) {
                return item;
            }
        }
    }
    /**
     * Iterates this LinkedList's items and values
     * @param callback Gets every value in LinkedList once with corresponding LinkedListItem and LinkedList
     * @param thisArg If given, callback will be bound here
     * @see Array#forEach
     */
    forEach(callback, thisArg) {
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        for (const [item, value] of this) {
            callback(value, item, this);
        }
    }
    /**
     * Checks if value can be found within LinkedList, starting from fromIndex, if given.
     * @param value value to be found in this
     * @param fromIndex Starting index. Supports negative values for which `this.size - 1 + fromIndex` will be used as starting point.
     * @returns true if value could be found in LinkedList (respecting fromIndex), false otherwhise
     * @see Array#includes
     */
    includes(value, fromIndex = 0) {
        let current = this.getItemByIndex(fromIndex);
        while (current) {
            if (current.value === value) {
                return true;
            }
            current = current.behind;
        }
        return false;
    }
    /**
     * Searches forward for given value and returns the first corresponding LinkedListItem found
     * @param searchedValue Value to be found
     * @param fromIndex Index to start from
     * @see Array#indexOf
     */
    itemOf(searchedValue, fromIndex = 0) {
        let current = this.getItemByIndex(fromIndex);
        while (current) {
            if (current.value === searchedValue) {
                return current;
            }
            current = current.behind;
        }
        return;
    }
    /**
     * Searches backwards for given value and returns the first corresponding LinkedListItem found
     * @param searchedValue Value to be found
     * @param fromIndex Index to start from
     * @see Array#indexOf
     */
    lastItemOf(searchedValue, fromIndex = -1) {
        let current = this.getItemByIndex(fromIndex);
        while (current) {
            if (current.value === searchedValue) {
                return current;
            }
            current = current.before;
        }
        return;
    }
    /**
     * Creates a new LinkedList with each of its itesm representing the output of the callback with each item in current LinkedList.
     * @param callback Gets value, LinkedListeItem and LinkedList. The response will be used as value in the new LinkedList
     * @param thisArg If given, callback is bound to thisArg
     * @see Array#map
     */
    map(callback, thisArg) {
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        const newList = new LinkedList();
        for (const [item, value] of this) {
            newList.push(callback(value, item, this));
        }
        return newList;
    }
    reduce(callback, initialValue) {
        let current = this.first;
        if (!current) {
            if (!initialValue) {
                throw new TypeError("Empty accumulator on empty LinkedList is not allowed.");
            }
            return initialValue;
        }
        if (initialValue === undefined) {
            initialValue = current.value;
            if (!current.behind) {
                return initialValue;
            }
            current = current.behind;
        }
        do {
            initialValue = callback(initialValue, current.value, current, this);
            current = current.behind;
        } while (current);
        return initialValue;
    }
    reduceRight(callback, initialValue) {
        let current = this.last;
        if (!current) {
            if (!initialValue) {
                throw new TypeError("Empty accumulator on empty LinkedList is not allowed.");
            }
            return initialValue;
        }
        // let accumulator: V | T;
        if (initialValue === undefined) {
            initialValue = current.value;
            if (!current.before) {
                return initialValue;
            }
            current = current.before;
        }
        do {
            initialValue = callback(initialValue, current.value, current, this);
            current = current.before;
        } while (current);
        return initialValue;
    }
    /**
     * Runs callback for every entry and returns true immediately if call of callback returns truthy.
     * @param callback called for every element. If response is truthy, iteration
     * @param thisArg If set, callback is bound to this
     * @returns `true` once a callback call returns truthy, `false` if none returned truthy.
     */
    some(callback, thisArg) {
        if (thisArg) {
            callback = callback.bind(thisArg);
        }
        for (const [item, value] of this) {
            if (callback(value, item, this)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Joins values within this by given separator. Uses Array#join directly.
     * @param separator separator to be used
     * @see Array#join
     */
    join(separator) {
        return [...this.values()].join(separator);
    }
    /**
     * Concats given values and returns a new LinkedList with all given values.
     * If LinkedList's are given, they will be spread.
     * @param others Other values or lists to be concat'ed together
     * @see Array#concat
     */
    concat(...others) {
        const newList = new LinkedList(this);
        for (const other of others) {
            if (other instanceof LinkedList) {
                newList.push(...other.values());
            }
            else {
                newList.push(other);
            }
        }
        return newList;
    }
    /**
     * Removes the last LinkedListItem and returns its inner value
     */
    pop() {
        if (!this.last) {
            return;
        }
        const item = this.last;
        item.unlink();
        return item.value;
    }
    /**
     * Adds given values on the end of this LinkedList
     * @param values Values to be added
     */
    push(...values) {
        for (const value of values) {
            const item = new LinkedListItem_1.LinkedListItem(value, this.unlinkCleanup);
            if (!this.first || !this.last) {
                this.first = this.last = item;
            }
            else {
                this.last.insertBehind(item);
                this.last = item;
            }
            this.length++;
        }
        return this.length;
    }
    /**
     * Adds given values to the beginning of this LinkedList
     * @param values Values to be added
     */
    unshift(...values) {
        for (const value of values) {
            const item = new LinkedListItem_1.LinkedListItem(value, this.unlinkCleanup);
            if (!this.last || !this.first) {
                this.first = this.last = item;
            }
            else {
                item.insertBehind(this.first);
                this.first = item;
            }
            this.length++;
        }
        return this.length;
    }
    /**
     * Removes first occurrence of value found.
     * @param value value to remove from LinkedList
     */
    remove(value) {
        for (const item of this.keys()) {
            if (item.value === value) {
                item.unlink();
                return true;
            }
        }
        return false;
    }
    /**
     * Removes every occurrance of value within this.
     * @param value value to remove from LinkedList
     */
    removeAllOccurrences(value) {
        let foundSomethingToDelete = false;
        for (const item of this.keys()) {
            if (item.value === value) {
                item.unlink();
                foundSomethingToDelete = true;
            }
        }
        return foundSomethingToDelete;
    }
    /**
     * Returns and removes first element from LinkedList
     */
    shift() {
        if (!this.first) {
            return;
        }
        const item = this.first;
        item.unlink();
        return item.value;
    }
    /**
     * Returns LinkedListItem and value for every entry of this LinkedList
     */
    *[Symbol.iterator]() {
        let current = this.first;
        if (!current) {
            return;
        }
        do {
            yield [current, current.value];
            current = current.behind;
        } while (current);
    }
    /**
     * Returns LinkedListItem and value for every entry of this LinkedList
     * @see LinkedList#Symbol.iterator
     */
    entries() {
        return this[Symbol.iterator]();
    }
    /**
     * Iterates the LinkedListItem's of this LinkedList
     */
    *keys() {
        let current = this.first;
        if (!current) {
            return;
        }
        do {
            yield current;
            current = current.behind;
        } while (current);
    }
    /**
     * Returns a value for every entry of this LinkedList
     */
    *values() {
        let current = this.first;
        if (!current) {
            return;
        }
        do {
            yield current.value;
            current = current.behind;
        } while (current);
    }
    /**
     * Returns the item by given index.
     * Supports negative values and will return the item at `LinkedList.size - 1 + index` in that case.
     * @param index Index of item to get from list
     */
    getItemByIndex(index) {
        if (index === undefined) {
            throw new Error("index must be a number!");
        }
        if (!this.first) {
            return;
        }
        let current;
        if (index > 0) {
            current = this.first;
            while (current && index--) {
                current = current.behind;
            }
        }
        else if (index < 0) {
            current = this.last;
            while (current && ++index) {
                current = current.before;
            }
        }
        else {
            return this.first;
        }
        return current;
    }
}
exports.LinkedList = LinkedList;
//# sourceMappingURL=LinkedList.js.map

/***/ }),

/***/ "../node_modules/x3-linkedlist/dist/LinkedListItem.js":
/*!************************************************************!*\
  !*** ../node_modules/x3-linkedlist/dist/LinkedListItem.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Represents an Item within LinkedList.
 * An item holds a value and the links to other LinkedListItem's
 * LinkedListItem's can only be attached behind.
 * Theirfor, to add one before, before has to add one behind.
 */
class LinkedListItem {
    /**
     * @param value Value to be held
     * @param unlinkCleanup Function to run on unlink() call. Usually used by LinkedList to fix first and last pointers and reduce length.
     */
    constructor(value, 
    /**
     *
     */
    unlinkCleanup) {
        this.value = value;
        this.unlinkCleanup = unlinkCleanup;
    }
    /**
     * This will link given LinkListItem behind this item.
     * If there's already a LinkedListItem linked behind, it will be relinked accordingly
     * @param item LinkListItem to be inserted behind this one
     */
    insertBehind(item) {
        item.insertBefore(this);
        if (this.behind) {
            let itemChainEnd = item;
            while (itemChainEnd.behind)
                itemChainEnd = itemChainEnd.behind;
            this.behind.insertBefore(itemChainEnd);
            itemChainEnd.insertBehind(this.behind);
        }
        this.behind = item;
    }
    /**
     * Unlinks this LinkedListItem and calls unlinkCleanup
     * @param unchain If true, additionally removes the reference to the item before and behind
     * @see LinkedListItem#unlinkCleanup
     */
    unlink(unchain = false) {
        if (this.before)
            this.before.behind = this.behind;
        if (this.behind) {
            this.behind.before = this.before;
        }
        if (this.unlinkCleanup) {
            this.unlinkCleanup(this);
        }
        this.unlinkCleanup = undefined;
        if (unchain) {
            this.before = this.behind = undefined;
        }
    }
    /**
     * Item given will be inserted before this item.
     * unlinkCleanup will be copied if neccessary.
     * This function is protected, because LinkedListItem's can only be attached behind.
     *
     * @param before
     * @see insertBehind
     */
    insertBefore(before) {
        this.before = before;
        if (!this.unlinkCleanup) {
            this.unlinkCleanup = before.unlinkCleanup;
        }
    }
}
exports.LinkedListItem = LinkedListItem;
//# sourceMappingURL=LinkedListItem.js.map

/***/ }),

/***/ "../node_modules/x3-linkedlist/dist/index.js":
/*!***************************************************!*\
  !*** ../node_modules/x3-linkedlist/dist/index.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", ({ value: true }));
__export(__webpack_require__(/*! ./LinkedList */ "../node_modules/x3-linkedlist/dist/LinkedList.js"));
__export(__webpack_require__(/*! ./LinkedListItem */ "../node_modules/x3-linkedlist/dist/LinkedListItem.js"));
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../node_modules/xhr/index.js":
/*!************************************!*\
  !*** ../node_modules/xhr/index.js ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var window = __webpack_require__(/*! global/window */ "../node_modules/global/window.js")
var isFunction = __webpack_require__(/*! is-function */ "../node_modules/is-function/index.js")
var parseHeaders = __webpack_require__(/*! parse-headers */ "../node_modules/parse-headers/parse-headers.js")
var xtend = __webpack_require__(/*! xtend */ "../node_modules/xtend/immutable.js")

module.exports = createXHR
// Allow use of default import syntax in TypeScript
module.exports["default"] = createXHR;
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    if(typeof options.callback === "undefined"){
        throw new Error("callback argument missing")
    }

    var called = false
    var callback = function cbOnce(err, response, body){
        if(!called){
            called = true
            options.callback(err, response, body)
        }
    }

    function readystatechange() {
        if (xhr.readyState === 4) {
            setTimeout(loadFunc, 0)
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else {
            body = xhr.responseText || getXml(xhr)
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        return callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        return callback(err, response, response.body)
    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer
    var failureResponse = {
        body: undefined,
        headers: {},
        statusCode: 0,
        method: method,
        url: uri,
        rawRequest: xhr
    }

    if ("json" in options && options.json !== false) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json === true ? body : options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.onabort = function(){
        aborted = true;
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            if (aborted) return
            aborted = true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    // Microsoft Edge browser sends "undefined" when send is called with undefined value.
    // XMLHttpRequest spec says to pass null as body to indicate no body
    // See https://github.com/naugtur/xhr/issues/100.
    xhr.send(body || null)

    return xhr


}

function getXml(xhr) {
    // xhr.responseXML will throw Exception "InvalidStateError" or "DOMException"
    // See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseXML.
    try {
        if (xhr.responseType === "document") {
            return xhr.responseXML
        }
        var firefoxBugTakenEffect = xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror"
        if (xhr.responseType === "" && !firefoxBugTakenEffect) {
            return xhr.responseXML
        }
    } catch (e) {}

    return null
}

function noop() {}


/***/ }),

/***/ "../node_modules/xtend/immutable.js":
/*!******************************************!*\
  !*** ../node_modules/xtend/immutable.js ***!
  \******************************************/
/***/ ((module) => {

module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}


/***/ }),

/***/ "../../../node_modules/querystring/decode.js":
/*!***************************************************!*\
  !*** ../../../node_modules/querystring/decode.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};


/***/ }),

/***/ "../../../node_modules/querystring/encode.js":
/*!***************************************************!*\
  !*** ../../../node_modules/querystring/encode.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};


/***/ }),

/***/ "../../../node_modules/querystring/index.js":
/*!**************************************************!*\
  !*** ../../../node_modules/querystring/index.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.decode = exports.parse = __webpack_require__(/*! ./decode */ "../../../node_modules/querystring/decode.js");
exports.encode = exports.stringify = __webpack_require__(/*! ./encode */ "../../../node_modules/querystring/encode.js");


/***/ }),

/***/ "@grafana/data":
/*!********************************!*\
  !*** external "@grafana/data" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__grafana_data__;

/***/ }),

/***/ "@grafana/ui":
/*!******************************!*\
  !*** external "@grafana/ui" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__grafana_ui__;

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_lodash__;

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_react__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!*******************!*\
  !*** ./module.ts ***!
  \*******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "plugin": () => (/* binding */ plugin)
/* harmony export */ });
/* harmony import */ var _grafana_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @grafana/data */ "@grafana/data");
/* harmony import */ var _grafana_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_grafana_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _datasource__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./datasource */ "./datasource.ts");
/* harmony import */ var _ConfigEditor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ConfigEditor */ "./ConfigEditor.tsx");
/* harmony import */ var _QueryEditor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./QueryEditor */ "./QueryEditor.tsx");




var plugin = new _grafana_data__WEBPACK_IMPORTED_MODULE_0__.DataSourcePlugin(_datasource__WEBPACK_IMPORTED_MODULE_1__.DataSource).setConfigEditor(_ConfigEditor__WEBPACK_IMPORTED_MODULE_2__.ConfigEditor).setQueryEditor(_QueryEditor__WEBPACK_IMPORTED_MODULE_3__.QueryEditor);
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});;
//# sourceMappingURL=module.js.map