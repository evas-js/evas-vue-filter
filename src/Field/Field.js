import { setProps, DEFAULT } from './FieldBuilder'
import { Fildable } from './Fildable'

export class Field extends Fildable {
    column
    value
    valueKey = 'value'
    condition = '='
    option = DEFAULT
    aggr = DEFAULT
    as
    desc = false
    display = { component: 'StringField', props: {} }
    layers
    relatedField
    linkChild = []

    constructor(props) {
        super(props)
        setProps(this, props)
    }
}

export class FieldChild extends Field {
    parentField
    inValue
    change
    constructor(props) {
        super(props)
        setProps(this, props)
    }
}
