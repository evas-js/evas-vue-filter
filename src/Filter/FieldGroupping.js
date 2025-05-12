/**
 * Классы для группировки полей.
 * @package evas-vue-filter
 * @author Almaz Farkhutdinov <prodvair.almaz@ya.ru>
 * @license CC-BY-4.0
 */

import { Group } from 'evas-vue'

export class Collapse extends Group {
    type = 'collapse'
    count = 0
    // regular = false
    constructor(name, items, count = 0) {
        super(name, items)
        this.setCount(count)
    }
    setItems(items) {
        this.setItemsInBlock(items)
    }
    setCount(count = 0) {
        this.count = count
    }
    // setRegular(value = true) {
    //     this.regular = value
    // }
}
