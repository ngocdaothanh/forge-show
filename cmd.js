// Based on forge-e2e

const {spawn} = require('child_process')

const parseCmd = (cmd) => {
  const args = cmd.split(' ')

  const command = args[0]
  args.shift()

  return [command, args]
}

const run = async (cmd, options) => {
  console.log(`${cmd}\n`)
  const [command, args] = parseCmd(cmd)

  const cmdProcess = spawn(command, args, {
    shell: true,
    stdio: 'pipe',
    env: process.env
  })

  const requestKill = () => {
    cmdProcess.kill('SIGINT')
  }

  return new Promise((resolve, reject) => {
    let output = ''
    const captureOutput = async (buffer) => {
      const newOutput = buffer.toString()
      process.stdout.write(newOutput)
      output += newOutput

      if (options && options.onOutput) {
        try {
          await options.onOutput(output, requestKill)
        } catch (error) {
          requestKill()  // Let cmdProcess clean up
          reject(error)
        }
      }
    }

    cmdProcess.stdout.on('data', captureOutput)
    cmdProcess.stderr.on('data', captureOutput)

    if (options && options.input) {
      cmdProcess.stdin.write(options.input)
      cmdProcess.stdin.end()
    }

    cmdProcess.on('exit', (code) => {
      // 0: exited normally
      // null: terminated due to a signal
      if (code === 0 || code === null) {
        resolve(output)
      } else {
        const error = new Error(`${cmd} exited with code ${code}`)
        error.stack = output
        reject(error)
      }
    })
  })
}

module.exports = {
  run
}
