import { FieldChild } from '../Field/Field'

export default FilterModel => {
    FilterModel.parseOthers = function (params, field) {
        var value = field.getDefault()
        if (field instanceof FieldChild)
            return {
                value: field.parentField.$fields[field.name] || value,
                params,
            }
        if ([null, undefined].includes(params)) return { value, params }
        if (Object.keys(field.$children).length) {
            for (const key in field.$children) {
                if (params?.[key]) {
                    field.$fields[key] = this.impactField(
                        field.$fields,
                        key,
                        params[key] || field.$children[key].getDefault(),
                        field
                    )
                    delete params?.[key]
                }
            }
        }
        return { value, params }
    }
    FilterModel.buildOthers = function (ctx, field) {
        let fieldValue = ctx[field.name]
        if (Object.keys(field.$children).length) {
            fieldValue = {}
            for (const key in field.$children) {
                fieldValue[key] = field.$fields[key]
            }
        }
        return fieldValue
    }
}
