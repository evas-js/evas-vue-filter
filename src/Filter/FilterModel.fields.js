/**
 * Расширение модели поддержкой полей.
 * @package evas-vue-filter
 * @author Almaz Farkhutdinov <prodvair.almaz@ya.ru>
 * @license CC-BY-4.0
 */

import { FilterModel } from './FilterModel'
import { Fieldable, FieldableBuilder, FieldBuilder, VariableFieldBuilder } from '../Field'

/**
 * Установка полей модели.
 * @return { Array } поля для установки
 */
FilterModel.setFields = function () {
    return []
}

/** @var { Array } alwaysSend поля, отправляемые в любом случае, даже если не менялись */
FilterModel.alwaysSend = null

/**
 * Получение установленных полей модели.
 * @return { Object } Field by names
 */
FilterModel.fields = function () {
    if (this.isRootModel()) return {}
    if (!this._fields || this._fields === this.__proto__._fields) {
        this._fields = {}
        this._fields = this.buildFields(this.setFields())
        // this.displayRules()
    }
    return this._fields
}
FilterModel.prototype.$fields = function () {
    // this.$displayRules()
    return this.constructor.fields()
}

/**
 * Вспомогательный метод для установки полей.
 * @param { Array } fields поля или сборщики полей
 * @param { String|null } name имя группы полей
 * @return { Object } маппинг полей по именам
 */
FilterModel.buildFields = function (fields, name = null) {
    return Object.entries(fields).reduce((filtered, [key, val]) => {
        if (val instanceof FieldableBuilder || val instanceof FieldBuilder)
            filtered[key] = val.build(key, this)
        return filtered
    }, {})
    // let resultFields = {}
    // for (let key in fields) {
    //     let field = fields[key]

    //     if (field instanceof VariableFieldBuilder) {
    //         field = new VariableField(field.export())
    //     }

    //     if (field instanceof VariableField) {
    //         field.fields = this.buildFields(field.fields, key)
    //     }

    //     if (field instanceof FieldBuilder) {
    //         field = new Field(field.export())

    //         if (field.itemOf) {
    //             if (field.itemOf instanceof FieldBuilder) {
    //                 field.itemOf = new Field(field.itemOf.export())
    //             }

    //             if (field.itemOf instanceof VariableFieldBuilder) {
    //                 field.itemOf = new VariableField(field.itemOf.export())
    //             }

    //             if (field.itemOf instanceof VariableField) {
    //                 field.itemOf.fields = this.buildFields(field.itemOf.fields, key)
    //             }

    //             if (field.itemOf instanceof Field || field.itemOf instanceof VariableField) {
    //                 field.itemOf.name = name || key
    //             }
    //         }
    //     }

    //     if (field instanceof Field || field instanceof VariableField) {
    //         field.name = name || key
    //         console.warn('call setModelName', this.entityName)
    //         field.setModelName(this.entityName)
    //         resultFields[key] = field
    //     }
    // }
    // return resultFields
}

/**
 * Получение имён полей модели.
 * @return { Array }
 */
FilterModel.fieldNames = function () {
    return Object.keys(this.fields())
}
FilterModel.prototype.$fieldNames = function () {
    return this.constructor.fieldNames()
}

/**
 * Получение поля по имени.
 * @param { String } name имя поля
 * @return { Field }
 */
FilterModel.field = function (name) {
    // return this.fields()[name]
    let reference = this.fields()
    const path = `${name ?? ''}`.split('->')

    path.forEach(key => {
        while (reference instanceof Fieldable) {
            reference = reference.itemOf
        }
        reference = reference[key]
    })

    return reference instanceof Fieldable ? reference : undefined
}
FilterModel.prototype.$field = function (name) {
    return this.constructor.field(name)
}

/**
 * Получение опций поля.
 * @param { String } name имя поля
 * @return { Object }
 */
FilterModel.fieldOptions = function (name) {
    let options = this.field(name)?.options
    if (!options) return {}
    if (Array.isArray(options)) {
        return Object.fromEntries(options.map(option => [option, option]))
    }
    if ('object' === typeof options) {
        return { ...options }
    }
}
FilterModel.prototype.$fieldOptions = function (name) {
    return this.constructor.fieldOptions(name)
}

/**
 * Итеративная обработка полей колбэком.
 * @param { Function } cb колбэк
 * @param { Array|null} names  имена полей для обработки или все
 * @return { Boolean } false - ничего не произошло, true - что-то произошло во время обработки
 */
FilterModel.eachFields = function (cb, names) {
    if (!names) names = this.fieldNames()
    for (let name of names) {
        let field = this.field(name)
        if (!field) {
            console.warn(`Field "${name}" not registered in model "${this.entityName}"`)
            continue
        }
        if (cb.apply(this, [field, name])) return true
    }
    return false
}

// Установка полей

// обычные поля
FilterModel.attr = function (_default) {
    return new FieldBuilder({ _default })
}
FilterModel.number = function (_default) {
    return new FieldBuilder({ _default, _type: 'number' })
}
FilterModel.string = function (_default) {
    return new FieldBuilder({ _default, _type: 'string' })
}
FilterModel.boolean = function (_default) {
    return new FieldBuilder({ _default, _type: 'boolean' })
}
FilterModel.array = function (_itemOf, _default) {
    return new FieldBuilder({ _itemOf, _default, _type: 'array' })
}
FilterModel.object = function (_itemOf, _default = {}) {
    return new FieldBuilder({ _itemOf, _default, _type: 'object' })
}
FilterModel.null = function () {
    return new FieldBuilder({ _type: 'null' })
}
// FilterModel.uuid = function (_default) {
//     return new FieldBuilder({ _default, _type: 'uuid' })
// }

// вариативные поля
FilterModel.anyOf = function (_fields, _default) {
    return new VariableFieldBuilder({ _type: 'anyOf', _fields, _default })
}

FilterModel.oneOf = function (_fields, _default) {
    return new VariableFieldBuilder({ _type: 'oneOf', _fields, _default })
}

FilterModel.allOf = function (_fields, _default) {
    return new VariableFieldBuilder({ _type: 'allOf', _fields, _default })
}

/**
 * Очистка данных полей.
 * @param Array имена полей
 * @return Array имена полей
 */
FilterModel.prototype.$clearFields = function (fieldNames = null) {
    if (!fieldNames) fieldNames = this.$fieldNames()
    fieldNames.forEach(name => {
        this[name] = this.$field(name).getDefault()
    })
    return fieldNames
}

FilterModel.fieldsByType = function (type, names = null) {
    const fieldNames = []
    this.eachFields(field => {
        if (field.filter === type) fieldNames.push(field)
    }, names)
    return fieldNames
}

FilterModel.prototype.$fieldsByType = function (type, names = null) {
    return this.constructor.fieldsByType(type, names)
}

FilterModel.prototype.$resetFieldsByType = function (type, defaultParam = {}, names = null) {
    this.$fieldsByType(type, names).forEach(field => {
        this[field.name] = field.convertTypeWithDefault(defaultParam?.[field.name])
    })
}
