/**
 * Классы для группировки полей.
 * @package evas-vue-filter
 * @author Almaz Farkhutdinov <prodvair.almaz@ya.ru>
 * @license CC-BY-4.0
 */

import { Group } from 'evas-vue'

export class Collapse extends Group {
    type = 'collapse'
    props = {}
    ctx
    countNames = []

    constructor(name, items, ctx, props = {}) {
        super(name, items)
        this.ctx = ctx
        this.props = props
        this.countNames = items
    }
    setItems(items) {
        this.setItemsInBlock(items)
    }
    get count() {
        return this.ctx.$dirtyFieldsCount(this.countNames)
    }
}
