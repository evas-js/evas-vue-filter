import { URLQueryParams } from '@prodvair/url-query-params'
import { reactive } from 'vue'
import BuildFilterModels from './BuildFilterModels'

export const EvasFilterVue = new (function () {
    this.filterBuilder = BuildFilterModels(reactive({}))
    this.filters = {}
    this.queryURL = new URLQueryParams()

    this.install = (app, options) => {
        if (options) {
            if (options.filters) this.models = options.filters
            if (options.queryAlias) this.queryURL.constructor.queryAlias = options.queryAlias
        }
        this.filterBuilder = new this.filterBuilder(this.models, this.queryURL.queryParamsParse())
        this.filterBuilder.setUrlParams = this.setUrlParams
        
        app.config.globalProperties.$queryURL = this.queryURL
        app.config.globalProperties.$filter = this.filterBuilder
    }

    this.setUrlParams = (app, params) => {
        if (params?.filters) {
            params = { ...params, ...params.filters }
            delete params.filters
        }
        if (params?.groups) {
            params.groups = params.groups.groups
            delete params.groups.fields
        }

        app.$router.replace(`${app.$route.path}?${this.queryURL.queryParamsBuild(params)}`)
    }
})()
