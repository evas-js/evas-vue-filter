export const DEFAULT = 'default'

export class FieldBuilder {
    _filter
    _column
    _value
    _valueKey = 'value'
    _condition = '='
    _option = DEFAULT
    _aggr = DEFAULT
    _desc = false
    _as
    _display = { component: 'StringField', props: {} }
    _default = null
    _layers = []
    _relatedField
    _linkChild = []

    $children
    $fields

    constructor(props) {
        setProps(this, props)
    }

    /**
     *
     * @param {String} value
     * @returns this
     */
    filter(value) {
        if (!value && this?._parentField) this._filter = this._parentField._filter
        else this._filter = value
        return this
    }
    /**
     *
     * @param {String} value
     * @returns this
     */
    column(value) {
        this._column = value
        return this
    }
    /**
     *
     * @param {String|Array|Object|Number} value
     * @returns this
     */
    value(value) {
        this._value = value
        return this
    }

    /**
     *
     * @param {String} value
     * @returns this
     */
    valueKey(value) {
        this._valueKey = value
        return this
    }

    /**
     *
     * @param {String} value
     * @returns this
     */
    condition(value = '=') {
        this._condition = value
        return this
    }
    /**
     *
     * @param {String} value
     * @returns this
     */
    option(value = DEFAULT) {
        this._option = value
        return this
    }
    /**
     *
     * @param {String} value
     * @returns this
     */
    aggr(value = DEFAULT) {
        this._aggr = value
        return this
    }
    /**
     *
     * @param {String} value
     * @returns this
     */
    as(value) {
        this._as = value
        return this
    }
    /**
     *
     * @param {Boolean} value
     * @returns this
     */
    desc(value = false) {
        this._desc = value
        return this
    }
    /**
     *
     * @param {component: String, props: Object} value
     * @returns this
     */
    display(value, text) {
        this._display = { ...value, text }
        return this
    }
    /**
     *
     * @param {String|Array|Object|Number} value
     * @returns this
     */
    default(value = null) {
        this._default = value
        return this
    }
    /**
     *
     * @param {String | String[]} value
     * @returns this
     */
    layers(value = []) {
        if (Array.isArray(value)) {
            value.forEach((val) => {
                this._layers.push(val)
            })
        } else this._layers.push(value)
        return this
    }

    /**
     *
     * @param {Object} value
     * @returns this
     */
    children(value) {
        if (!value && 'object' === typeof value && Array.isArray(value)) return this
        // for (const key in value) {
        //     value[key].parentField(this)
        // }
        this.$children = value
        this.$fields = new Proxy({}, {})
        return this
    }

    /**
     *
     * @param {String} value
     * @returns this
     */
    relatedField(value) {
        this._relatedField = value
        return this
    }

    /**
     *
     * @param {Array} value
     * @returns this
     */
    linkChild(value) {
        this._linkChild = [value].flat()
        return this
    }

    /**
     * Экспорт свойств для поля/вариативного поля.
     * @return Object
     */
    export() {
        let data = {}
        Object.entries(this).forEach(([key, value]) => {
            if (key[0] !== '$') key = key.substring(1)
            data[key] = value
        })
        return data
    }
}

export class FieldBuilderChild extends FieldBuilder {
    _parentField
    _inValue
    _change

    parentField(value) {
        this._parentField = value
        return this
    }
    inValue(value) {
        this._inValue = value
        return this
    }
    change(value) {
        this._change = value
        return this
    }
}

export function setProps(ctx, props) {
    if (props) {
        if (props instanceof FieldBuilder || props instanceof FieldBuilderChild) {
            props = props.export()
        }
        if ('object' === typeof props && !Array.isArray(props)) {
            for (let key in props) {
                ctx[key] = props[key]
            }
        } else {
            console.error(
                'Field props must be an object or an instanceof FieldBuilder,',
                `${typeof props} given`,
                props
            )
        }
    }
}
