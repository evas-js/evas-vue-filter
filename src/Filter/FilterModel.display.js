export default FilterModel => {
    FilterModel.displayFields = function (fields = null) {
        if (!fields) fields = this.fields()
        let displays = {}
        for (const name in fields) {
            const field = fields[name]
            displays[name] = field.display
            if (field?.$children) {
                displays[name].$children = this.displayFields(field.$children)
            }
        }
        return displays
    }

    FilterModel.prototype.$displayFields = function () {
        return this.constructor.displayFields()
    }
}
