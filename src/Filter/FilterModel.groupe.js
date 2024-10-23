import { FieldChild } from '../Field/Field'
import { DEFAULT } from '../Field/FieldBuilder'

export default FilterModel => {
    FilterModel.parseGroups = function (params, field) {
        var value = field.getDefault()

        if (field instanceof FieldChild) return field.parentField.$fields[field.name] || value
        if ([null, undefined].includes(params)) return value
        if (!Array.isArray(params)) params = [params]

        params.forEach(param => {
            if (param?.as === (field.as || field.name)) {
                value = field.convertDataTypeWithDefault(param.column)
                if (Object.keys(field.$children).length) {
                    for (const key in field.$children) {
                        if (
                            field.$children[key].inValue === value &&
                            param?.aggr &&
                            param.aggr !== DEFAULT
                        ) {
                            field.$fields[key] = param.aggr
                            this.changedField(field, key, param.aggr)
                        }
                    }
                }
            }
        })

        return value
    }
    FilterModel.buildGroups = function (ctx, field) {
        const fieldValue = ctx[field.name]
        let aggr = DEFAULT
        let option = DEFAULT

        if (Object.keys(field.$children).length) {
            for (const key in field.$children) {
                if (field.$children[key].inValue === fieldValue) {
                    aggr = field.aggr
                    option = field.option
                }
            }
        } else {
            aggr = field.aggr || aggr
            option = field.option || option
        }
        return {
            groups: [
                { column: fieldValue, aggr, option, as: field.as || field.name || fieldValue },
            ],
            fields: this.groupeFields,
        }
    }
}
