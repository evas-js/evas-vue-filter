import { FieldChild } from '../Field/Field'

export default FilterModel => {
    FilterModel.parseOthers = function (params, field) {
        var value = field.getDefault()
        if (field instanceof FieldChild) return field.parentField.$fields[field.name] || value
        if ([null, undefined].includes(params)) return value
        if (Object.keys(field.$children).length) {
            for (const key in field.$children) {
                if (params?.[key])
                    field.$fields[key] = field.$children[key].convertDataTypeWithDefault(
                        params[key]
                    )
            }
        }
        return value
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
