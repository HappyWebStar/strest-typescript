import * as program from 'commander';
import chalk from 'chalk';
import * as handler from './handler';
import * as postman from './postman';

// Initialize the commander.js CLI commands
const initializeCommands = () => {
  // main command
  program
    .version(require('../package.json').version)
    .usage('[targetFileOrDirectory]')
    .option('-p, --print', 'Print out all response data')
    .option('-o, --output <type>', 'Output the test as a specific equivalent')
    .option('-n, --no-exit', `Don't exit with code 1 when a request failed`)
    .option('-b, --bulk', 'Execute Tests and directories defined in the specified yml')
    .option('-m, --postman', 'Convert a v2.1 Postman collection to stREST')
    .action(async (dir, cmd: any) => {
      // use time to inform the user about how long the execution of the test took
      const executionStartedTime = new Date().getTime();
      if(typeof cmd === 'undefined') {
        cmd = dir;
        dir = null;
      }
      // workaround for --no-exit option because options with hyphens can't be read
      cmd.noExit = cmd.rawArgs.includes('-n') || cmd.rawArgs.includes('--no-exit');

      if(cmd.postman){
        handler.writeMessage('Converting Postman collections to stREST')
        console.log();
        const exitCode: any = await postman.convert(dir);
        // exit code does only take values between 0-255 so it's impossible to set the exit code to like 404
        if(exitCode == 0){
          handler.writeMessage('Postman collection converted to stREST')
        }
        process.exit(exitCode);
      }
      const exitCode: any = await handler.start(dir,cmd);

      const executionEndedTime = new Date().getTime();
      const executionTime = (executionEndedTime - executionStartedTime) / 1000;

      if(exitCode !== 0) {
        console.log(handler.colorizeCustomRed(chalk.bold(`[ Strest ] Failed before finishing all requests`)));
        console.log();
        // exit code does only take values between 0-255 so it's impossible to set the exit code to like 404
        process.exit(1);
      } else {
        console.log();
        handler.writeMessage(`✨  Done in ${chalk.bold((executionTime).toString() + 's')}`, false);
        console.log();
        process.exit(0);
      }
    })

  program.parse(process.argv);
}
export default initializeCommands;