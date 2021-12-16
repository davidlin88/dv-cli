module.exports = api => {
  api.injectFeature({
    name: 'Babel',
    value: 'babel',
    short: 'Babel',
    description: '将现代JS转译成老版本代码（为了兼容性）',
    link: 'https://babeljs.io/',
    checked: true,
  })
}
