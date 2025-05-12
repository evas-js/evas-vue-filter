import { URLQueryParams } from '@prodvair/url-query-params'
import { reactive } from 'vue'

export { FilterModel } from './src/Filter/FilterModel'
export { Collapse } from './src/Filter/FieldGroupping'
export { Field, VariableField } from './src/Field'
export { CONDITION, AGGREGATE } from './src/Field/Help'
export { buildDefault, buildArray, buildObject } from './src/Filter/FilterModel.contract'

const EvasVueFilter = new (function () {
    this.filters = reactive({})
    this.queryURL = new URLQueryParams()

    this.install = (app, options) => {
        if (options) {
            if (options.queryAlias) this.queryURL.constructor.queryAlias = options.queryAlias
            if (options.filters) this.setFilters(options.filters, options?.queryAlias)
        }
        app.config.globalProperties.$queryURL = this.queryURL
        app.config.globalProperties.$filters = this.filters
        app.config.globalProperties.$replaceUrlParams = query =>
            app.$router.replace(`${app.$route.path}?${query}`)
    }

    this.setFilters = (filters, queryAlias) => {
        Object.entries(filters).forEach(([name, filter]) => {
            filter.queryAlias = queryAlias || {}
            filter.entityName = name
            this.filter[name] = filter
        })
    }
})()

export { EvasVueFilter }
