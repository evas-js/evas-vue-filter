import { QueryURL } from '@prodvair/url-query-params';
import { reactive } from 'vue'

export const EvasFilterVue = new (function () {
    this.filterModels = reactive({})
    this.filterBuildModels = null
    this.queryURL = new QueryURL()
    this.isCleared = false
    this.beforeBuild = null
    this.afterBuild = null

    this.install = (app, options) => {
        if (options) {
            if (options.filters) this.setModels(options.filters)
            if (options.queryAlias) this.queryURL.constructor.queryAlias = options.queryAlias
            if (options.beforeBuild) this.beforeBuild = options.beforeBuild
            if (options.afterBuild) this.afterBuild = options.afterBuild
        }
        app.config.globalProperties.$queryURL = this.queryURL
        app.config.globalProperties.$filter = {
            models: this.filterModels,
            builder: this.filterModelsBuilder,
            clear: this.filterModelsClear,
            setUrlParams: this.setUrlParams,
        }
    }

    this.setModels = filterModels => {
        Object.entries(filterModels).forEach(([name, model]) => {
            this.filterModels[name] = new model()
        })
    }

    this.filterModelsBuilder = (names, defaultParams = {}) => {
        if (!names) return defaultParams
        var result = structuredClone(defaultParams)
        if (!Array.isArray(names)) names = [names]
        if ('function' === typeof this.beforeBuild)
            result = this.beforeBuild(
                this.isCleared,
                result,
                this.queryURL.queryParamsParse(),
                names
            )

        names.forEach(name => {
            result = this.getFilterModel(name).$buildFilter(result)
        })
        if ('function' === typeof this.afterBuild)
            result = this.afterBuild(
                this.isCleared,
                result,
                this.queryURL.queryParamsParse(),
                names
            )

        this.isCleared = false
        return result
    }
    this.filterModelsClear = names => {
        if (!Array.isArray(names)) names = [names]
        names.forEach(name => {
            this.getFilterModel(name).$clearFields()
        })
        this.isCleared = true
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

    this.getFilterModel = filterName => {
        return this.filterModels[filterName]
    }
})()
