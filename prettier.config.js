/** @type {import("prettier").Options} */
// https://prettier.io/docs/en/options.html#print-width
const config = {
    arrowParens: 'avoid', // скобки вокруг единственного параметра стрелочной функции
    bracketSpacing: true, // пробелы между скобками в литералах объектов
    endOfLine: 'lf', // окончания строк
    htmlWhitespaceSensitivity: 'css', // форматирование html с учетом пробелов
    insertPragma: false, // вставлять спец.комментарий в начало файла
    jsxBracketSameLine: false, // где будет завершающий > многострочного jsx-элемента
    jsxSingleQuote: false, // использовать в jsx одинарные кавычки вместо двойных
    printWidth: 100, // на какой позиции выполнять перенос строки
    proseWrap: 'preserve', // как обрабатывать markdown файлы
    quoteProps: 'as-needed', // свойства объекта в кавычках или без кавычек
    requirePragma: false, // форматировать только файлы со спец.комментарием в начале
    semi: false, // точка с запятой в конце операторов
    singleQuote: true, // использовать одинарные кавычки вместо двойных
    tabWidth: 4, // заменять табуляцию на 4 пробела
    trailingComma: 'es5', // конечные запятые в объектах и массивах
    useTabs: false, // делать отступы с помощью табуляции
    vueIndentScriptAndStyle: false, // отступ внутри <script> и <style> в vue файлах
    embeddedLanguageFormatting: 'auto', // форматировать встроенный код

    // Переопределение для отдельных файлов
    // overrides: [
    //     {
    //         files: '*.test.js',
    //         options: {
    //             semi: true,
    //         },
    //     },
    //     {
    //         files: ['*.html', 'legacy/**/*.js'],
    //         options: {
    //             tabWidth: 4,
    //         },
    //     },
    // ],
}

module.exports = config
