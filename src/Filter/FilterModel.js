import FilterField from './FilterModel.field'
import FilterWhere from './FilterModel.where'
import FilterModelOther from './FilterModel.other'
import FilterGroupe from './FilterModel.groupe'
import FilterBuilder from './FilterModel.builder'
import FilterDisplay from './FilterModel.display'
import { URLQueryParams } from '@prodvair/url-query-params'

export class FilterModel {
    set(target, key, value) {
        target[key] = value
        return true
    }
    constructor(params) {
        this.$fill(params)
        return new Proxy(this, this)
    }
    $fill(params) {
        this.constructor.eachFields(field => {
            var funcName = 'parseOthers'
            if (field.type === 'wheres') funcName = 'parseWheres'
            if (field.type === 'groups') funcName = 'parseGroups'

            var res = this.constructor[funcName](params?.[field.type], field)
            if (params?.[field.type]) params[field.type] = res.params
            this.set(this, field.name, res.value)

            if (field.$children)
                for (const key in field.$children) {
                    const childField = field.$children[key]
                    field.$fields = new Proxy(field.$fields, this)
                    res = this.constructor[funcName](params?.[field.type], childField)
                    if (params?.[field.type]) params[field.type] = res.params
                    this.set(field.$fields, childField.name, res.value)
                }
        })
        return params
    }
}

FilterModel.$queryUrl = new URLQueryParams(FilterModel.queryAlias)

FilterModel.isRootClass = function () {
    return this.name === 'FilterModel' // || this.entityName === null
}

FilterField(FilterModel)
FilterDisplay(FilterModel)
FilterModelOther(FilterModel)
FilterWhere(FilterModel)
FilterGroupe(FilterModel)
FilterBuilder(FilterModel)
