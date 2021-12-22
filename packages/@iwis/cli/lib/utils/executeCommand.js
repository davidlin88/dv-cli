const execa = require('execa')

module.exports = function (command, arguments, cwd) {
  return new Promise(async (resolve, reject) => {
    try {
      const child = execa(command, arguments, {
        cwd,
        stdio: ['inherit', 'pipe', 'inherit'],
      })
      child.stdout.on('data', buffer => {
        const str = buffer.toString()
        if (/warning/.test(str)) {
          return
        }
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
