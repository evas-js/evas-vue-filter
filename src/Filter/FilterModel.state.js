/**
 * Расширение модели поддержкой состоянием.
 * @package evas-vue-filter
 * @author Almaz Farkhutdinov <prodvair.almaz@ya.ru>
 * @license CC-BY-4.0
 */

import { FilterModel } from './FilterModel.js'
import { logger } from 'evas-vue/src/Log.js'
import { Relation } from 'evas-vue/src/Relation.js'

FilterModel.prototype.$state = {}

/**
 * Сохранение состояния записи.
 */
FilterModel.prototype.$saveState = function () {
    this.$state = structuredClone(this)
    delete this.$state.$state
    delete this.$state.$displayGroup
    delete this.$state.$errors
    logger.methodCall(`${this.$entityNameWithId}.$saveState`, arguments)
}

/**
 * Откат изменений записи.
 * @param Array|null имена полей и/или связей
 */
FilterModel.prototype.$rollbackChanges = function (names) {
    const cb = field => {
        this[field.name] = structuredClone(this.$state[field.name])
    }
    this.constructor.eachFields(cb, names)
    this.constructor.eachRelations(cb, names)
}

/**
 * @var Boolean Является ли запись новой.
 */
Object.defineProperty(FilterModel.prototype, '$isNew', {
    get: function () {
        return this.$id ? false : true
    },
})

/**
 * @var Boolean Является ли запись "грязной" (с изменёнными, но не сохранёнными данными)
 */
Object.defineProperty(FilterModel.prototype, '$isDirty', {
    get: function () {
        return this.$dirtyFields().length > 0
    },
})

/**
 * Проверка связанных записей на изменённость.
 * @param String|Number|Relation имя связи или связь
 * @return Boolean
 */
FilterModel.prototype.$isDirtyRelateds = function (relation) {
    if (!(relation instanceof Relation)) relation = this.relation()[relation]
    let { name, local, foreign, multiple } = relation
    if (multiple) {
        if (Array.isArray(this[name])) {
            let res = false
            let ids = []
            this[name].forEach(related => {
                if (related[foreign]) ids.push(related[foreign])
            })
            if (Array.isArray(this.$state[name])) {
                let idsLocal = []
                this.$state[name].forEach(related => {
                    if (related[foreign]) idsLocal.push(related[foreign])
                })
                res = JSON.stringify(ids.sort()) !== JSON.stringify(idsLocal.sort())
            }
            if (res && Array.isArray(this.$state?.[local])) {
                res = JSON.stringify(ids.sort()) !== JSON.stringify(this.$state?.[local].sort())
            }
            return res
        }
    } else {
        let res = this.$state[name]?.[foreign] !== this[name]?.[foreign]
        if (res) {
            return this.$state?.[local] !== this[name]?.[foreign]
        }
    }
}

/**
 * Получение имён изменённых полей и связанных записей.
 * @param Array|null имена полей и/или связей
 * @return String[]
 */
FilterModel.prototype.$dirtyFields = function (names) {
    console.log(names, '!!!')

    let dirty = []
    this.constructor.eachFields(field => {
        if (this.$isDirtyField(field.name)) dirty.push(field.name)
    }, names)
    // this.constructor.eachRelations(relation => {
    //     if (this.$isDirtyRelateds(relation)) dirty.push(relation.name)
    // }, names)
    return dirty
}

/**
 * @var Object изменённые данные {key: val, ...}
 */
Object.defineProperty(FilterModel.prototype, '$dirtyData', {
    get: function () {
        let data = {}
        this.$dirtyFields().forEach(name => (data[name] = this[name]))
        return data
    },
})

/**
 * Проверка поля на изменённость.
 * @param String|Number имя поля
 * @return Boolean
 */
FilterModel.prototype.$isDirtyField = function (name) {
    let defaultValue = this.$field(name).getDefault()
    let value = this[name]
    if (Array.isArray(defaultValue) && Array.isArray(value)) {
        return JSON.stringify(defaultValue.sort()) !== JSON.stringify(value.sort())
    } else if (typeof value === 'object' && ![null, undefined].includes(value)) {
        return JSON.stringify(defaultValue) !== JSON.stringify(value)
    } else if ([null, undefined].includes(value) && value === '') {
        return false
    }
    return defaultValue !== value
}

/**
 * Количество изменённых полей.
 * @param Array имена полей
 * @return Array имена полей
 */
FilterModel.prototype.$dirtyFieldsCount = function (names) {
    return this.$dirtyFields(names?.map(name => (name ?? '').split('->')[0]))?.length || 0
}
