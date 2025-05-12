/**
 * Базовый класс для сборщика поля и сборщика вариативного поля.
 * @package evas-vue-filter
 * @author Almaz Farkhutdinov <prodvair.almaz@ya.ru>
 * @license CC-BY-4.0
 */

import { FieldableBuilder as MainFieldableBuilder } from 'evas-vue/src/Field'

export class FieldableBuilder extends MainFieldableBuilder {
    /** @var { Boolean } обязательность значения */
    _required = false

    /**
     * Экспорт свойств для поля/вариативного поля.
     * @return { Object }
     */
    export() {
        return Object.fromEntries(Object.entries(this).map(([key, val]) => [key.substring(1), val]))
    }
}
