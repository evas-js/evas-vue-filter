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
    display = { component: 'StringField', props: {} }
    layers
    relatedField

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
