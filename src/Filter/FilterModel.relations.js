/**
 * Расширение модели поддержкой связей.
 * @package evas-vue
 * @author Egor Vasyakin <egor@evas-php.com>
 * @license CC-BY-4.0
 */

import { FilterModel } from './FilterModel.js'
import { Relation } from 'evas-vue/src/Relation'

/**
 * Установка связей модели.
 * @return Array
 */
FilterModel.setRelations = function () {
    return []
}

/**
 * Получение установленных связей модели.
 * @return Object Relation by names
 */
FilterModel.relations = function () {
    if (this.isRootModel()) return []
    if (!this._relations) {
        this._relations = {}
        let relations = this.setRelations()
        for (let name in relations) {
            let relation = relations[name]
            if (relation instanceof Relation) {
                relation.name = name
                this._relations[name] = relation
            }
        }
    }
    return this._relations
}

/**
 * Получение имён свяязей модели.
 * @return Array
 */
FilterModel.relationNames = function () {
    return Object.keys(this.relations())
}

/**
 * Получение связи по имени.
 * @param string имя связи
 * @return Field
 */
FilterModel.relation = function (name) {
    return this.relations()[name]
}

/**
 * Итеративная обработка связей колбэком.
 * @param Function колбэк
 * @param Array|null имена связей для обработки или все
 * @return Boolean false - ничего не произошло, true - что-то произошло во время обработки
 */
FilterModel.eachRelations = function (cb, names) {
    if (!names) names = this.relationNames()
    for (let name of names) {
        let field = this.relation(name)
        if (!field) {
            console.warn(`Relation field "${name}" not registered in model "${this.$name}"`)
        }
        if (cb.apply(this, [field, name])) return true
    }
    return false
}


// Установка связей

FilterModel.belongsTo = function (model, local, foreign) {
    return new Relation('belongsTo', {
        model: this,
        local,
        foreign,
        foreignModel: model,
    })
}
FilterModel.hasOne = function (model, foreign, local) {
    return new Relation('hasOne', {
        model: this,
        local,
        foreign,
        foreignModel: model,
    })
}
FilterModel.hasMany = function (model, foreign, local) {
    return new Relation('hasMany', {
        model: this,
        local,
        foreign,
        foreignModel: model,
    })
}
FilterModel.hasManyToMany = function (
    model,
    foreign,
    local,
    { model: modelLink, foreign: foreignLink, local: localLink }
) {
    return new Relation('hasManyToMany', {
        model: this,
        local,
        foreign,
        foreignModel: model,
        link: {
            foreignModel: modelLink,
            foreign: foreignLink,
            local: localLink,
        },
    })
}
FilterModel.hasManyList = function (model, foreign, local) {
    return new Relation('hasManyList', {
        model: this,
        local,
        foreign,
        foreignModel: model,
    })
}
