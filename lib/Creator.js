const { hasYarn } = require('./utils/env')
const { log } = require('./utils/logger')
const isManualMode = answers => answers.preset === '__manual__'

const { loadOptions, defaults } = require('./utils/options')

class Creator {
  constructor() {
    // 由特性生成器插入的交互问题
    this.injectedPrompts = []
    const { presetPrompt, featurePrompt } = this.getDefaultPrompts()
    // 预设相关交互
    this.presetPrompt = presetPrompt
    // 特性相关交互
    this.featurePrompt = featurePrompt
  }
  getPresets() {
    const savedOptions = loadOptions()
    return {
      ...savedOptions.presets,
      ...defaults.presets,
    }
  }
  getDefaultPrompts() {
    const presets = this.getPresets()
    const presetChoices = Object.entries(presets).map(([name, preset]) => {
      let displayName = name
      return {
        name: `${displayName}(${preset.features})`,
        value: name,
      }
    })

    const presetPrompt = {
      name: 'preset',
      type: 'list',
      message: `请选择一个配置`,
      choices: [
        ...presetChoices,
        {
          name: '手动选择特性',
          value: '__manual__',
        },
      ],
    }

    const featurePrompt = {
      name: 'features',
      when: isManualMode,
      type: 'checkbox',
      message: '请勾选你项目所需的特性：',
      choices: [],
      pageSize: 10,
    }

    return {
      presetPrompt,
      featurePrompt,
    }
  }
  getOtherPrompts() {
    const otherPrompts = [
      {
        name: 'save',
        when: isManualMode,
        type: 'confirm',
        message: '是否将配置保存，以供未来的项目使用？',
        default: false,
      },
      {
        name: 'saveName',
        when: answer => answer.save,
        type: 'input',
        message: '将配置取名为：',
      },
    ]

    const savedOptions = loadOptions()
    if (!savedOptions.packageManager) {
      const packageManagerChoices = []
      if (hasYarn()) {
        packageManagerChoices.push({
          name: '使用 Yarn',
          value: 'yarn',
          short: 'Yarn',
        })
      }

      packageManagerChoices.push({
        name: '使用 NPM',
        value: 'npm',
        short: 'NPM',
      })

      otherPrompts.push({
        name: 'packageManager',
        type: 'list',
        message: '请选择用来安装依赖的包管理器：',
        choices: packageManagerChoices,
      })
    }

    return otherPrompts
  }
  getFinalPrompts() {
    this.injectedPrompts.forEach(prompt => {
      const originalWhen = prompt.when || (() => true)
      prompt.when = answer => isManualMode(answer) && originalWhen(answer)
    })

    const prompts = [this.presetPrompt, this.featurePrompt, ...this.injectedPrompts, ...this.getOtherPrompts()]

    return prompts
  }
}

module.exports = Creator
