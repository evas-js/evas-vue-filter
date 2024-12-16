export default FilterModel => {
    FilterModel.parseOrders = function (params, field) {
        var value = field.getDefault()
        if ([null, undefined].includes(params)) return { value, params }
        if (!Array.isArray(params)) params = [params]
        console.log(params)

        params = params
            .map(param => {
                if (field.desc !== param?.desc) return param

                if (!Array.isArray(value)) value = [value]
                if (param?.column) value.push(param.column)
                return
            })
            .filter(param => ![null, undefined].includes(param))
        value = value.filter(val => ![null, undefined].includes(val))
        if (!value.length) value = field.getDefault()
        return { value, params }
    }
    FilterModel.buildOrders = function (ctx, field, orders) {
        if (!orders) orders = []
        let fieldValue = ctx[field.name]
        if (field.isEmpty(fieldValue)) return orders
        if (!Array.isArray(fieldValue)) fieldValue = [fieldValue]
        return fieldValue.map(column => ({ column, desc: field.desc }))
    }
}
