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

    /** @var { Boolean } Скрыть из queryParams */
    hidden = false

    /**
     * @param { Object|null } props свойства поля
     */
    constructor(props) {
        super()
        this.setProps(props)
    }
}
