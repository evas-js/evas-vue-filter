import FilterField from './FilterModel.field'
import FilterWhere from './FilterModel.where'
import FilterModelOther from './FilterModel.other'
import FilterGroupe from './FilterModel.groupe'
import FilterBuilder from './FilterModel.builder'
import FilterDisplay from './FilterModel.display'
import { QueryURL } from '../Query/QueryURL'

export class FilterModel {
    set(target, key, value) {
        target[key] = value
        return true
    }
    constructor(url, queryUrl) {
        if (queryUrl) this.constructor.$queryUrl = queryUrl
        this.$fill(url)
        return new Proxy(this, this)
    }
    $fill(url) {
        const params = this.constructor.$queryUrl.queryParamsParse(url)

        this.constructor.eachFields(field => {
            var funcName = 'parseOthers'
            if (field.type === 'wheres') funcName = 'parseWheres'
            if (field.type === 'groups') funcName = 'parseGroups'

            this.set(this, field.name, this.constructor[funcName](params?.[field.type], field))

            if (field.$children)
                for (const key in field.$children) {
                    const childField = field.$children[key]
                    field.$fields = new Proxy(field.$fields, this)
                    this.set(
                        field.$fields,
                        childField.name,
                        this.constructor[funcName](params?.[field.type], childField)
                    )
                }
        })
    }
}

FilterModel.$queryUrl = new QueryURL(FilterModel.queryAlias)

FilterModel.isRootClass = function () {
    return this.name === 'FilterModel' // || this.entityName === null
}

FilterField(FilterModel)
FilterDisplay(FilterModel)
FilterModelOther(FilterModel)
FilterWhere(FilterModel)
FilterGroupe(FilterModel)
FilterBuilder(FilterModel)
