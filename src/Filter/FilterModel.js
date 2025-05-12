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
        if (field) {
            value = field.convertTypeWithDefault(value)
        }
        target[key] = value
        return true
    }
    constructor(data = {}) {
        if (!data) data = this.constructor.$queryUrl.queryParamsParse()
        this.$fill(data)
        return new Proxy(this, this)
    }

    get $entityName() {
        return this.constructor.entityName
    }
}

/**
 * Заполнение свойств записи.
 * @param Object данные [имя поля/связи => значение]
 */
FilterModel.prototype.$fill = function (data) {
    this.constructor.eachFields(field => {
        // конвертируем тип значения
        // this[field.name] = field.convertTypeWithDefault(data[field.name])
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
            if (!field.hidden) params[field.name] = this[field.name]
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
// require('evas-vue/src/Model/Model.validate.js')
// require('evas-vue/src/Model/Model.state.js')

require('./FilterModel.fields.js')
require('./FilterModel.relations.js')
require('./FilterModel.display.js')
require('./FilterModel.state.js')
require('./FilterModel.contract.js')
