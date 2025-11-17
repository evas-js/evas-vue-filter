/**
 * Модель фильтров.
 * @package evas-vue-filter
 * @author Almaz Farkhutdinov <prodvair.almaz@ya.ru>
 * @license CC-BY-4.0
 */

import { URLQueryParams } from '@prodvair/url-query-params'

export class FilterModel {
    static entityName = null
    static queryAlias = {}

    set(target, key, value) {
        const field = target.constructor?.field(key)
        if (field) value = field.convertTypeWithDefault(value)
        target[key] = value
        return true
    }
    constructor(data = {}, setQuery = false) {
        this.$fill(data)
        if (setQuery) this.$setQueryDataIfExist()
        return new Proxy(this, this)
    }

    get $entityName() {
        return this.constructor.entityName
    }
}

FilterModel.prototype.$setQueryDataIfExist = function () {
    const queryData = this.constructor.$queryUrl.queryParamsParse()
    if (!queryData) return
    let fieldTypeData = {}
    Object.keys(queryData).forEach(fieldName => {
        const field = this.$field(fieldName)
        if (!field) return
        if (!fieldTypeData[field.filter]) fieldTypeData[field.filter] = {}
        fieldTypeData[field.filter][fieldName] = queryData[fieldName]
    })
    Object.keys(fieldTypeData).forEach(type => this.$resetFieldsByType(type, fieldTypeData[type]))
}

/**
 * Заполнение свойств записи.
 * @param Object данные [имя поля/связи => значение]
 */
FilterModel.prototype.$fill = function (data) {
    const queryData = this.constructor.$queryUrl.queryParamsParse()
    this.constructor.eachFields(field => {
        // конвертируем тип значения
        this.set(this, field.name, field.convertTypeWithDefault(data?.[field.name]))
    })
}

FilterModel.$queryUrl = new URLQueryParams(FilterModel.queryAlias)

/**
 * Вывод Query параметров
 */
Object.defineProperty(FilterModel.prototype, '$queryParams', {
    get: function () {
        let params = {}
        this.constructor.eachFields(field => {
            let value = this[field.name]
            'object' === field.type &&
                !['globalSearch', 'groups'].includes(field.filter) &&
                value &&
                Object.keys(field.itemOf).forEach(key => {
                    if (field.isEmptyValue(this[field.name]?.[key])) value = null
                })
            if (field.queryable) params[field.name] = value
        })
        return this.constructor.$queryUrl.queryParamsBuild(params)
    },
})

FilterModel.isRootModel = function () {
    return this.name === 'FilterModel' // || this.entityName === null
}

// Расширения модели
// require('evas-vue/src/Model/Model.fields.js')
// require('evas-vue/src/Model/Model.fields.display.js')
// require('evas-vue/src/Model/Model.relations.js')
// require('evas-vue/src/Model/Model.state.js')

require('./FilterModel.fields.js')
require('./FilterModel.relations.js')
require('./FilterModel.display.js')
require('./FilterModel.state.js')
require('./FilterModel.contract.js')
require('./FilterModel.validate.js')
