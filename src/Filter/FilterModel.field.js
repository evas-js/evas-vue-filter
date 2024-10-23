import { Field, FieldChild } from '../Field/Field'
import { FieldBuilder, FieldBuilderChild, DEFAULT } from '../Field/FieldBuilder'

export default FilterModel => {
    FilterModel.setFields = function () {
        return []
    }
    FilterModel.parseFieldValue = function (param, field) {
        if (!param) return field.getDefault()
        return field.column === param.column ? param?.[field.valueKey] : field.getDefault()
    }
    FilterModel.groupeFields = {}

    FilterModel.buildFields = function (fields, parentField = null) {
        let resultFields = {}
        for (let key in fields) {
            let field = fields[key]

            if (field instanceof FieldBuilderChild) {
                field = new FieldChild(field.export())
                field.parentField = parentField
            } else {
                field = new Field(field.export())
            }
            if (field?.$children) field.$children = this.buildFields(field.$children, field)

            field.name = name || key
            resultFields[key] = field
        }
        return resultFields
    }

    FilterModel.fields = function () {
        if (this.isRootClass()) return {}
        if (!this._fields) {
            this._fields = {}
            this._fields = this.buildFields(this.setFields())
        }
        return this._fields
    }
    FilterModel.prototype.$fields = function () {
        return this.constructor.fields()
    }

    /**
     * Получение имён полей модели.
     * @return Array
     */
    FilterModel.fieldNames = function () {
        return Object.keys(this.fields())
    }
    FilterModel.prototype.$fieldNames = function () {
        return this.constructor.fieldNames()
    }

    /**
     * Получение поля по имени.
     * @param string имя поля
     * @return Field
     */
    FilterModel.field = function (names, parent = null) {
        if (!Array.isArray(names)) names = [names]
        const currentField = parent?.[names[0]] || this.fields()[names[0]]
        return names.length === 1
            ? currentField
            : this.field(names.shift(), currentField?.$children)
    }
    FilterModel.prototype.$field = function (names) {
        return this.constructor.field(names)
    }

    FilterModel.changedField = function (field, name, value) {
        if (field instanceof Field || field instanceof FieldChild) {
            const changes = Array.isArray(field.$children[name].change)
                ? field.$children[name].change
                : [field.$children[name].change]
            changes.length &&
                changes.forEach(key => {
                    field[key] = value
                })
        }
    }

    FilterModel.impactField = function (ctx, names, value, field = null) {
        if (!Array.isArray(names)) names = [structuredClone(names)]
        else names = structuredClone(names)
        const currentName = names[0]

        if (names.length === 1) {
            if (value !== undefined && ctx[currentName] !== value) {
                ctx[currentName] = value
                if (!field) {
                    field = this.field(currentName)

                    field?.$fields &&
                        Object.entries(field.$fields).forEach(([key, val]) => {
                            if (
                                val &&
                                field.$children[key].inValue === value &&
                                field.$children[key].change
                            )
                                this.changedField(field, key, val)
                            else this.changedField(field, key, DEFAULT)
                        })
                } else this.changedField(field, currentName, value)
            }
            return ctx[currentName]
        }
        names.shift()
        return this.impactField(
            this.field(currentName).$fields,
            names,
            value,
            this.field(currentName)
        )
    }

    FilterModel.prototype.$impactField = function (names, value) {
        return this.constructor.impactField(this, names, value)
    }

    FilterModel.clearFields = function (ctx, fields = null) {
        if (!fields) fields = this.fields()
        for (const key in fields) {
            this.impactField(ctx, key, fields[key].getDefault())
            // ctx[key] = fields[key].getDefault()
            if (fields[key].$fields) this.clearFields(fields[key].$fields, fields[key].$children)
        }
    }

    FilterModel.prototype.$clearFields = function () {
        return this.constructor.clearFields(this)
    }

    /**
     * Итеративная обработка полей колбэком.
     * @param Function колбэк
     * @param Array|null имена полей для обработки или все
     * @return Boolean false - ничего не произошло, true - что-то произошло во время обработки
     */
    FilterModel.eachFields = function (cb, names) {
        if (!names) names = this.fieldNames()
        for (let name of names) {
            let field = this.field(name)
            if (!field) {
                console.warn(`Field "${name}" not registered in model "${this.name}"`)
                continue
            }
            if (cb.apply(this, [field, name])) return true
        }
        return false
    }

    Object.defineProperty(FilterModel.prototype, '$countSelected', {
        get() {
            return this.constructor.fieldNames().filter(name => {
                const check = ![null, undefined, ''].includes(this[name])
                if (Array.isArray(this[name])) return this[name].length
                if (check && 'object' === typeof this[name]) return Object.keys(this[name]).length
                return check
            }).length
        },
    })

    FilterModel.filter = function (_type = 'wheres', _valueKey = null) {
        if (!_valueKey) _valueKey = _type === 'groups' ? 'column' : 'value'
        return new FieldBuilder({ _filter: 'filters', _type, _valueKey })
    }
    FilterModel.page = function () {
        return new FieldBuilder({ _filter: 'page' })
    }
    FilterModel.limit = function () {
        return new FieldBuilder({ _filter: 'limit' })
    }
    FilterModel.other = function (_filter) {
        return new FieldBuilder({ _filter })
    }

    FilterModel.child = function (_inValue) {
        return new FieldBuilderChild({ _inValue }).filter()
    }
}
