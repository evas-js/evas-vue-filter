/**
 * Поле.
 * @package evas-vue-filter
 * @author Almaz Farkhutdinov <prodvair.almaz@ya.ru>
 * @license CC-BY-4.0
 */

import { Field as MainField } from 'evas-vue'

export class Field extends MainField {
    /** @var { String } тип фильтра */
    filter
    /** @var { Object|Array } тип фильтра */
    filterBuilder
    /** @var { Boolean } Показать/Скерыть из queryParams */
    queryable = true

    /**
     * @param { Object|null } props свойства поля
     */
    constructor(props) {
        super()
        this.setProps(props)
    }

    get labelOrName() {
        return this.label || this.column || this.name
    }

    /**
     * Получение значения по умолчанию.
     * @return { any }
     */
    getDefault() {
        const defaultValue = 'function' === typeof this.default ? this.default() : this.default
        return 'object' === typeof defaultValue && defaultValue
            ? structuredClone(defaultValue)
            : defaultValue
    }
}
