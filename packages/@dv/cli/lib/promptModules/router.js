// NOTE: chalk@4 才支持require
const chalk = require('chalk')

module.exports = api => {
  api.injectFeature({
    name: 'Router',
    value: 'router',
    description: '前端路由',
    link: 'https://router.vuejs.org/',
  })

  api.injectPrompt({
    name: 'historyMode',
    when: answer => answer.features.includes('router'),
    type: 'confirm',
    message: `是否要对路由使用 history 模式？${chalk.yellow(`（需要在生产环境对路径指向做合适的服务器配置）`)}`,
    description: `通过利用HTML5的hisory API，网页地址中可以不用再加 '#' 字符`,
    link: 'https://router.vuejs.org/guide/essentials/history-mode.html',
  })
}
