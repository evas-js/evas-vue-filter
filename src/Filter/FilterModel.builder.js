export default (FilterModel) => {
    FilterModel.buildFilter = function (ctx, params = {}) {
        var result = params || {}
        this.eachFields((field) => {
            if (!result[field.filter]) result[field.filter] = {}

            if (field.type === 'wheres') {
                result[field.filter][field.type] = this.buildWheres(
                    ctx,
                    field,
                    result[field.filter][field.type]
                )
                return
            }
            if (field.isEmpty(ctx[field.name])) return
            if (field.type === 'groups') {
                result[field.filter][field.type] = this.buildGroups(ctx, field)
                return
            }
            result[field.filter][field.name] = this.buildOthers(ctx, field)
        })
        return result
    }

    FilterModel.prototype.$buildFilter = function (params = {}) {
        return this.constructor.buildFilter(this, params)
    }
}
