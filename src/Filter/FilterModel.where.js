export default (FilterModel) => {
    FilterModel.parseWheres = function (params, field) {
        if ([null, undefined].includes(params)) return { value: field.getDefault(), params }
        if (!Array.isArray(params)) params = [params]
        return this.getLayer(structuredClone(field.layers), params, field)
    }

    FilterModel.getLayer = function (layers, params, field) {
        var value = field.getDefault()
        const conditionKey = field.valueKey === 'value' ? 'condition' : 'value'
        const thisKey = layers[0]
        layers.shift()

        params = params
            .map((param) => {
                if (thisKey && param?.[thisKey]) {
                    let res = this.getLayer(layers, param[thisKey], field)
                    value = res.value
                    return res.params
                } else if (
                    param.column === field.name &&
                    param[conditionKey] === field[conditionKey]
                ) {
                    value = field.convertDataTypeWithDefault(param[field.valueKey])
                    return
                }
                return param
            })
            .filter((param) => ![null, undefined].includes(param))
        return { value, params }
    }

    FilterModel.setWheresLayer = function (layers, wheres, field) {
        const thisKey = layers ? Object.keys(layers)[0] : layers
        const conditionKey = field.valueKey === 'value' ? 'condition' : 'value'
        if (!['or', 'and'].includes(thisKey)) {
            const index = wheres.findIndex(
                (where) =>
                    where?.column === layers?.column &&
                    where?.[conditionKey] === layers?.[conditionKey]
            )
            if (index > -1) wheres.splice(index, 1)
            if (!field.isEmpty(layers?.[field.valueKey])) wheres.push(layers)
            return wheres
        }
        const newWheres = []
        let hasKey = false

        if (wheres.length)
            wheres = wheres.map((where) => {
                if (where[thisKey]) {
                    where[thisKey] = this.setWheresLayer(layers[thisKey][0], where[thisKey], field)
                    hasKey = true
                }
                return where
            })
        if (!hasKey) newWheres.push(layers)
        return wheres.concat(newWheres)
    }

    FilterModel.buildWheres = function (ctx, field, wheres) {
        if (!wheres) wheres = []
        const fieldValue = ctx[field.name]
        let layerWhere = {
            column: field.column || field.name,
            condition: field.condition,
            value: field.value,
        }
        layerWhere[field.valueKey] = fieldValue

        if (field.layers.length)
            field.layers.reverse().forEach((layer) => {
                layerWhere = { [layer]: [layerWhere] }
            })

        wheres = this.setWheresLayer(layerWhere, wheres, field)
        return wheres
    }
}
