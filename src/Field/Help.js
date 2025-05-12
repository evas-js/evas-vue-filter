/**
 * Вспомогательные параметры.
 * @package evas-vue-filter
 * @author Almaz Farkhutdinov <prodvair.almaz@ya.ru>
 * @license CC-BY-4.0
 */

export const CONDITION = {
    in: 'in',
    notIn: 'notIn',
    btw: 'between',
    notBtw: 'notBetween',
    eq: '=',
    notEq: '!=',
    mr: '>',
    ls: '<',
    mrEq: '>=',
    lsEq: '<=',
    like: '%',
    notLike: 'not%',
}

export const AGGREGATE = {
    default: 'default',
    day: 'day',
    week: 'week',
    month: 'month',
    year: 'year',
    range: 'range',
    concat: 'concat',
    count: 'count',
    list: 'list',
    sum: 'sum',
    min: 'min',
    max: 'max',
    avg: 'avg',
    duration: 'duration',
}
