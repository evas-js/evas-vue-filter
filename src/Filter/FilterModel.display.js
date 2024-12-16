export default FilterModel => {
    FilterModel.rulesForVariableDisplayOfFields = {}

    FilterModel.displayFields = function (ctx) {
        const fieldList = this.fields()
        let fields = {}

        Object.keys(fieldList).forEach(key => {
            const rule = this.rulesForVariableDisplayOfFields?.[key]

            if (Array.isArray(rule)) {
                let value = ctx?.[rule[0]]
                if (!Array.isArray(value)) value = [value]
                if (value.includes(rule[1])) fields[key] = fieldList[key]
            } else fields[key] = fieldList[key]
        })

        return fields
    }
    FilterModel.prototype.$displayFields = function () {
        return this.constructor.displayFields(this)
    }
}
