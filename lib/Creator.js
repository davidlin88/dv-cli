module.exports = class Creator {
  constructor() {
    this.featurePrompt = {
      name: 'features',
      message: '请选择你项目所需的特性',
      pageSize: 10,
      type: 'checkbox',
      choices: [],
    }

    this.injectedPrompts = []
  }
  getFinalPrompts() {
    this.injectedPrompts.forEach(prompt => {
      const originalWhen = prompt.when || (() => true)
      prompt.when = answer => originalWhen(answer)
    })

    const prompts = [this.featurePrompt, ...this.injectedPrompts]

    return prompts
  }
}
