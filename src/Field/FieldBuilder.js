/**
 * Сборщик поля.
 * @package evas-vue-filter
 * @author Almaz Farkhutdinov <prodvair.almaz@ya.ru>
 * @license CC-BY-4.0
 */

import { Field } from './Field.js'
import { FieldBuilder as MainFieldBuilder } from 'evas-vue/src/Field'

export const addParamBuilder = (ctx, name, defaultValue = null) => {
    const key = `_${name}`
    ctx[key] = defaultValue
    ctx[name] = function (value = defaultValue) {
        ctx[key] = value
        return ctx
    }
}

export class FieldBuilder extends MainFieldBuilder {
    /** @var { String } тип фильтра */
    _filter
    /** @var { Function } Маска фильтра */
    _filterBuilder
    /** @var { Boolean } Показать/Скерыть из queryParams */
    _queryable = true

    /**
     * @param { Object|null } props свойства поля
     */
    constructor(props) {
        super()
        this._required = false
        this.setProps(props)
    }

    queryable(value = true) {
        this._queryable = value
        return this
    }

    wheres() {
        this._filter = 'wheres'

        addParamBuilder(this, 'column', this._name)
        addParamBuilder(this, 'condition', this._type === 'array' ? 'in' : '=')

        this._filterBuilder = (ctx, name) => ({
            column: ctx.$field(name).column || name,
            condition: ctx.$field(name).condition,
            value: ctx[name],
        })

        return this
    }
    globalSearch() {
        this._filter = 'globalSearch'

        this._filterBuilder = (ctx, name) => ({
            query: ctx.$field(`${name}->query`).convertTypeWithDefault(ctx[name].query) ?? '',
            columns: ctx.$field(`${name}->columns`).convertTypeWithDefault(ctx[name].columns) ?? [],
        })

        return this
    }
    groups(as = null) {
        this._filter = 'groups'

        addParamBuilder(this, 'aggr', 'default')
        addParamBuilder(this, 'as', as)

        this._filterBuilder = (ctx, name) => {
            const field = ctx.$field(name)
            if (!field.as) return
            const result = {}
            if (field.itemOf.groups) {
                if (!ctx[name].groups) return
                result.groups = ctx[name].groups.map(item => {
                    const aggr = item?.aggr || field.aggr
                    const column = item?.column ?? item?.key ?? item
                    const as = item?.as ?? field.as ?? name
                    return { column, aggr, option: aggr, as }
                })
            }
            if (field.itemOf.fields) {
                const value = field.itemOf.fields.convertTypeWithDefault(ctx[name].fields)
                if (!value) return
                result.fields = value
            }
            return result
        }

        return this
    }
    orders() {
        this._filter = 'orders'

        addParamBuilder(this, 'column', this._name)

        this._filterBuilder = (ctx, name) => ({
            column: ctx.$field(name).column || name,
            desc: ctx[name],
        })

        return this
    }
    page() {
        this._filter = 'page'

        this._filterBuilder = (ctx, name) => Number(ctx[name])

        return this
    }
    limit() {
        this._filter = 'limit'

        this._filterBuilder = (ctx, name) => Number(ctx[name])

        return this
    }
    other() {
        this._filter = 'other'

        this._filterBuilder = (ctx, name) => ctx[name]

        return this
    }
    filterBuilder(value) {
        this._filterBuilder = value
        return this
    }

    build(name, model) {
        // if (!this._filter) {
        //     console.warn('The Field is not have filter type')
        //     return
        // }
        // if ('function' !== typeof this._filterBuilder) {
        //     console.warn('The Field is not have filter mask or filter mask is not function')
        //     return
        // }
        return this.recursiveBuild(name, model, new Field(this), 'itemOf')
    }
}
