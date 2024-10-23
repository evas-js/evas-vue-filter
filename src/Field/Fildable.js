export class Fildable {
    name
    filter
    condition = '='
    default = null

    $children
    $fields

    get isArrayType() {
        return ['in', 'notIn', 'between', 'notBetween'].includes(this.condition)
    }
    get isNumberType() {
        return ['=', '!=', '>', '>=', '<=', '<'].includes(this.condition)
    }
    get isStringType() {
        return ['=', '!=', '%', 'not%'].includes(this.condition) || this.type === 'groupe'
    }
    get isBooleanType() {
        return ['=', '!='].includes(this.condition) || this.type === 'orders'
    }

    /**
     * Получение значения по умолчанию.
     * @return mixed
     */
    getDefault() {
        return 'function' === typeof this.default ? this.default() : this.default
    }

    /**
     * Конвертация типа значения.
     * @param mixed значение
     * @return mixed значение
     */
    convertDataType(value) {
        if (this.isArrayType) return Array.isArray(value) ? Array.from(value) : value
        if (this.isNumberType) {
            let newValue = Number(value)
            if (newValue == value) return isNaN(newValue) ? value : newValue
        }
        if (this.isBooleanType) {
            if (['true', 'false', true, false].includes(value))
                return typeof value === 'boolean' ? value : value === 'true'
        }
        if (this.isStringType) return value == null ? '' : String(value)

        // throw new Error(`Field "${this._name}" has unknown type: ${this._type}`)
        return value
    }

    /**
     * Подучение значения конвертированного типа или дефолтного значения.
     * @param mixed значение
     * @return mixed значение
     */
    convertDataTypeWithDefault(value) {
        return [undefined, null].includes(value) ? this.getDefault() : this.convertDataType(value)
    }

    isEmpty(value) {
        return Array.isArray(value) ? !value.length : [null, undefined, ''].includes(value)
    }
}
