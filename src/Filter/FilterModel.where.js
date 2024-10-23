export default FilterModel => {
    FilterModel.parseWheres = function (params, field) {
        if ([null, undefined].includes(params)) return field.getDefault()
        if (!Array.isArray(params)) params = [params]
        return this.getLayer(JSON.parse(JSON.stringify(field.layers)), params, field)
    }

    FilterModel.getLayer = function (layers, params, field) {
        var value = field.getDefault()
        const valueKey = field.valueKey === 'value' ? 'condition' : 'value'
        const thisKey = layers[0]
        layers.shift()

        params.forEach(param => {
            if (thisKey && param?.[thisKey]) {
                value = this.getLayer(layers, param[thisKey], field)
                return
            } else {
                if (param.column === field.name && param[valueKey] === field[valueKey]) {
                    value = field.convertDataTypeWithDefault(param[field.valueKey])
                }
            }
        })
        return value
    }

    FilterModel.setLayer = function (layers, wheres, valueKey) {
        const thisKey = Object.keys(layers)[0]
        if (!['or', 'and'].includes(thisKey)) {
            let hasLayer = false
            wheres = wheres.map(where => {
                if (where?.column === layers?.column && where?.[valueKey] === layers?.[valueKey]) {
                    hasLayer = true
                    return layers
                }
                return where
            })
            if (!hasLayer) wheres.push(layers)
            return wheres
        }
        const newWheres = []
        let hasKey = false

        if (wheres.length)
            wheres = wheres.map(where => {
                if (where[thisKey]) {
                    where[thisKey] = this.setLayer(layers[thisKey][0], where[thisKey], valueKey)
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
        const valueKey = field.valueKey === 'value' ? 'condition' : 'value'
        let layerWhere = null
        if (!field.isEmpty(fieldValue)) {
            if (!layerWhere) {
                const result = {
                    column: field.column || field.name,
                    condition: field.condition,
                    value: field.value,
                }
                result[field.valueKey] = fieldValue
                layerWhere = result
            }
            if (field.layers.length)
                field.layers.reverse().forEach(layer => {
                    layerWhere = { [layer]: [layerWhere] }
                })
            wheres = this.setLayer(layerWhere, wheres, valueKey)
        }

        return wheres
    }
}
