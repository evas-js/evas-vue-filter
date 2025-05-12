/**
 * Создание контрактов.
 * @package evas-vue-filter
 * @author Almaz Farkhutdinov <prodvair.almaz@ya.ru>
 * @license CC-BY-4.0
 */
import { FilterModel } from './FilterModel.js'

export const buildDefault = (ctx, fieldNames) => {
    if (!fieldNames?.length) return
    const name = fieldNames[0]
    const field = ctx.$field(name)
    return field.filterBuilder(ctx, name)
}

export const buildArray = (ctx, fieldNames) =>
    fieldNames && fieldNames.map(name => ctx.$field(name).filterBuilder(ctx, name)).flat(Infinity)

export const buildObject = (ctx, fieldNames) =>
    fieldNames &&
    fieldNames.reduce((result, name) => {
        const field = ctx.$field(name)
        let value = ctx?.[name]
        if (field.itemOf) {
            Object.keys(field.itemOf).forEach(key => {
                const childField = ctx.$field(`${name}->${key}`)
                if (childField.filterBuilder) result[key] = value?.[key] ?? childField.getDefault()
            }, {})
        } else result[name] = field.filterBuilder(ctx, name)
        return result
    }, {})

const DEFAULT_CONTRACTS = {
    globalSearch: (body, ctx, fieldNames) => {
        const defaultResult = { query: '', columns: [] }
        body.globalSearch = fieldNames?.length
            ? buildDefault(ctx, fieldNames) || defaultResult
            : defaultResult
    },
    groups: (body, ctx, fieldNames) => {
        body.groups = fieldNames?.length ? buildDefault(ctx, fieldNames) || null : null
    },
    orders: (body, ctx, fieldNames) => {
        if (!body?.orders) body.orders = []
        if (fieldNames?.length) body.orders = [...body.orders, ...buildArray(ctx, fieldNames)]
    },
    wheres: (body, ctx, fieldNames) => {
        if (!body?.wheres) body.wheres = []
        if (fieldNames?.length) body.wheres = [...body.wheres, ...buildArray(ctx, fieldNames)]
    },
    page: (body, ctx, fieldNames) => {
        body.page = fieldNames?.length ? buildDefault(ctx, fieldNames) : 1
    },
    limit: (body, ctx, fieldNames) => {
        body.limit = fieldNames?.length ? buildDefault(ctx, fieldNames) : 1
    },
    with: body => {
        body.with = null
    },
    other: (body, ctx, fieldNames) => {
        if (!body?.[fieldName]) body[fieldName] = {}
        if (fieldNames?.length)
            body[fieldName] = { ...body[fieldName], ...buildObject(ctx, fieldNames) }
    },
}

FilterModel.customContract = {}

FilterModel.bodyRules = {
    filters: {
        globalSearch: 'globalSearch',
        groups: 'groups',
        orders: 'orders',
        wheres: 'wheres',
    },
    page: 'page',
    limit: 'limit',
    with: 'with',
}

Object.defineProperty(FilterModel, '$contracts', {
    get: function () {
        return { ...DEFAULT_CONTRACTS, ...this.customContract }
    },
})

Object.defineProperty(FilterModel, '$contractsNames', {
    get: function () {
        return Object.keys(this.$contracts)
    },
})

FilterModel.$fieldsByTypeOfContract = function (ctx, checkValid = false) {
    let filedNamesByType = {}
    this.eachFields(field => {
        if (!filedNamesByType?.[field.filter]) filedNamesByType[field.filter] = []
        if (
            this.$contracts[field.filter] &&
            (!checkValid || field.isValid(ctx[field.name])) &&
            !field.isEmptyValue(ctx[field.name])
        ) {
            filedNamesByType[field.filter].push(field.name)
        }
    })
    return filedNamesByType
}

FilterModel.getBody = function (ctx, filedNamesByType, rules = {}, body = new Proxy({}, {})) {
    Object.keys(rules).forEach(key => {
        const ruleOrName = rules[key]
        if ('string' !== typeof ruleOrName) {
            body[key] = new Proxy({}, {})
            this.getBody(ctx, filedNamesByType, ruleOrName, body[key])
        } else {
            this.$contracts?.[ruleOrName]?.(body, ctx, filedNamesByType[ruleOrName])
        }
    })
    return body
}

FilterModel.prototype.$createRequestBody = function () {
    return this.constructor.getBody(
        this,
        this.constructor.$fieldsByTypeOfContract(this, true),
        this.constructor.bodyRules
    )
}
