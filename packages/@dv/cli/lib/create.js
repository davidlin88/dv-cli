const path = require('path')
const inquirer = require('inquirer')
const PromptModuleAPI = require('./PromptModuleAPI')
const Creator = require('./Creator')
const Generator = require('./Generator')
const clearConsole = require('./utils/clearConsole')
const fs = require('fs-extra')
const chalk = require('chalk')
const { saveOptions, savePreset, rcPath } = require('./utils/options')
const { log } = require('./utils/logger')
const packageManager = require('./PackageManager')

async function create(name) {
  const targetDir = path.join(process.cwd(), name)
  if (fs.existsSync(targetDir)) {
    clearConsole()

    // TODO 发现中文提示语在terminal有无法清空message的问题
    const { action } = await inquirer.prompt([
      {
        name: 'action',
        type: 'list',
        message: `目标目录 ${chalk.cyan(targetDir)} 已存在，请选择行为:`,
        choices: [
          {
            name: '覆盖目录',
            value: 'overwrite',
          },
          { name: '合并新老目录', value: 'merge' },
        ],
      },
    ])
    if (action === 'overwrite') {
      console.log(`\n正在移除目录 ${chalk.cyan(targetDir)}`)
    }
  }
  // creator实例，用于存储：「备选插件」主提示 + 插件配置提示
  const creator = new Creator()
  // 「备选插件」的相关提示注入模块，接受注入api
  const promptModules = getPromptModules()
  // 暴露注入提示的api
  const promptAPI = new PromptModuleAPI(creator)
  // 注入『备选插件』的相关提示
  promptModules.forEach(m => m(promptAPI))

  // 清空控制台
  clearConsole()

  // 弹窗交互提示语并获取用户选择
  const answer = await inquirer.prompt(creator.getFinalPrompts())

  if (answer.preset !== '__manual__') {
    const preset = creator.getPresets()[answer.preset]
    Object.keys(preset).forEach(key => {
      answer[key] = preset[key]
    })
  }

  if (answer.packageManager) {
    saveOptions({
      packageManager: answer.packageManager,
    })
  }

  if (answer.save && answer.saveName) {
    savePreset(answer.saveName, answer)
    log()
    log(`配置 ${chalk.yellow(answer.saveName)} 保存在了 ${chalk.yellow(rcPath)}`)
  }

  const pm = new packageManager(targetDir, answer.packageManager)

  // package.json 文件内容
  const pkg = {
    name,
    version: '0.1.0',
    dependencies: {},
    devDependencies: {},
  }

  const generator = new Generator(pkg, targetDir)
  // 插入必选特性
  answer.features.unshift('vue', 'webpack')

  // 遍历选中特性，调用生成器、
  // pkg注入配置、依赖；main.js注入import；生成模板文件
  answer.features.forEach(feature => {
    require(`@dv/cli-plugin-${feature}/generator`)(generator, answer)
  })

  await generator.generate()

  // 下载依赖
  await pm.install()
  console.log(`\n依赖下载完成! 执行下列命令开始开发: \n`)
  console.log(`cd ${name}`)
  console.log(`${pm.bin === 'npm' ? 'npm run' : 'yarn'} dev`)
}

function getPromptModules() {
  return ['babel', 'router', 'vuex', 'linter'].map(file => require(`./promptModules/${file}`))
}

module.exports = create
