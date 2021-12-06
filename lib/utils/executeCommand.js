const execa = require('execa')

module.exports = function (command,arguments, cwd) {
  return new Promise(async (resolve, reject) => {
    try {
      const child = execa(command, arguments, {
        cwd,
      })
      child.stdout.on('data', buffer => {
        process.stdout.write(buffer)
      })

      child.on('close', code => {
        if (code !== 0) {
          reject(new Error(`command failed: ${command}`))
          return
        }
        resolve()
      })
    } catch (err) {
      reject(err)
    }
  })
}
