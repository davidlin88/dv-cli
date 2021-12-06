module.exports = api => {
  api.injectFeature({
    name: 'Linter/Formatter',
    value: 'linter',
    short: 'Linter',
    description: '用Eslint和prettier来检查并确保代码质量',
    link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint',
    checked: true,
  })

  api.injectPrompt({
    name: 'eslintConfig',
    when: ansers => ansers.features.includes('linter'),
    type: 'list',
    message: '选择一个 linter / formatter 配置：',
    description: '用于检查代码错误并保证风格统一',
    choices: () => [
      {
        name: 'ESLint + Airbnb config',
        value: 'airbnb',
        short: 'Airbnb',
      },
      {
        name: 'ESLint + Standard config',
        value: 'standard',
        short: 'Standard',
      },
    ],
  })

  api.injectPrompt({
    name: 'lintOn',
    message: '选择额外的lint特性：',
    when: ansers => ansers.features.includes('linter'),
    type: 'checkbox',
    choices: [
      {
        name: '保存文件时检查',
        value: 'save',
        checked: true,
      },
      {
        name: '提交时检查并修复',
        value: 'commit',
      },
    ],
  })
}
