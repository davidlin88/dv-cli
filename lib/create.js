const path = require('path')
const inquirer = require('inquirer')
const PromptModuleAPI = require('./PromptModuleAPI')
const Creator = require('./Creator')
const Generator = require('./Generator')
const clearConsole = require('./utils/clearConsole')
const executeCommand = require('./utils/executeCommand')

async function create(name) {
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

  // package.json 文件内容
  const pkg = {
    name,
    version: '0.1.0',
    dependencies: {},
    devDependencies: {},
  }

  const generator = new Generator(pkg, path.join(process.cwd(), name))
  // 插入必选特性
  answer.features.unshift('vue', 'webpack')

  // 遍历选中特性，调用生成器，
  // pkg注入配置、依赖；main.js注入import；生成模板文件
  answer.features.forEach(feature => {
    require(`./generator/${feature}`)(generator, answer)
  })

  await generator.generate()
  // console.log('generated 生成后\n')
  // console.log(generator.pkg.scripts)

  // console.log('\n正在下载依赖...\n')
  // // 下载依赖
  // await executeCommand('npm', ['install'], path.join(process.cwd(), name))
  // console.log(`\n依赖下载完成！执行下列命令开始开发：\n`)
  console.log(`cd ${name}`)
  console.log(`npm install`)
  console.log(`npm run dev`)
}

function getPromptModules() {
  return ['babel', 'router', 'vuex', 'linter'].map(file => require(`./promptModules/${file}`))
}

module.exports = create
