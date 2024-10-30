import { FilterModel } from './src/Filter/FilterModel'

const create = (defaultModels = {}) => {
    class BuildFilterModels {
        names = []
        models = defaultModels
        withOtherWheres = null

        constructor(models, params) {
            Object.entries(models).forEach(([name, model]) => {
                this.names.push(name)
                this.models[name] = new model()
            })
            this.withOtherWheres = this.constructor._fillModels(
                this.models,
                structuredClone(params),
                this.names
            )
        }
    }

    Object.defineProperty(BuildFilterModels.prototype, '$hasOtherWheres', {
        get() {
            return !!this.constructor.otherWheres?.length
        },
    })

    BuildFilterModels.otherWheres = []

    BuildFilterModels._fillModels = function (models, params, names) {
        if (!Array.isArray(names)) names = [names]
        this.otherWheres = []
        names.forEach((name) => {
            params = models[name].$fill(params)
        })
        if (params?.wheres?.length) {
            this.otherWheres = params.wheres
            return true
        }
        return null
    }

    BuildFilterModels.prototype.fillModels = function (params, names) {
        this.withOtherWheres = this.constructor._fillModels(
            this.models,
            structuredClone(params),
            names || this.names
        )
    }

    BuildFilterModels._builder = function (
        models,
        names,
        incomingParams = {},
        withOtherWheres = false
    ) {
        if (!names) return incomingParams
        if (!Array.isArray(names)) names = [names]
        var result = structuredClone(incomingParams)
        names.forEach((name) => {
            result = models[name].$buildFilter(result)
        })

        if (withOtherWheres && result?.filters?.wheres)
            result.filters.wheres = result.filters.wheres.concat(this.otherWheres)

        return result
    }

    BuildFilterModels.prototype.builder = function (names, incomingParams = {}) {
        return this.constructor._builder(this.models, names, incomingParams, this.withOtherWheres)
    }

    BuildFilterModels._clear = function (models, names) {
        if (!Array.isArray(names)) names = [names]
        names.forEach((name) => {
            models[name].$clearFields()
        })
    }

    BuildFilterModels.prototype.clear = function (names) {
        this.constructor._clear(this.models, names || this.names)
    }
    return BuildFilterModels
}

export default create

export const BuildFilterModels = create()
