#!/usr/bin/env node
const { execSync } = require('child_process')
const pathUtil = require('path')
const fs = require('fs')
const { Command } = require('commander')

const program = new Command()
const { version } = require('./package.json')

program
  .name('elizaos')
  .description('elizaOS CLI - Manage your plugins')
  .version(version);

const plugins = new Command()
  .name('plugins')
  .description('manage elizaOS plugins')

async function getPlugins() {
  const resp = await fetch('https://raw.githubusercontent.com/elizaos-plugins/registry/refs/heads/main/index.json')
  return await resp.json();
}

plugins
  .command('list')
  .alias('l')
  .alias('ls')
  .description('list available plugins')
  .option("-t, --type <type>", "filter by type (adapter, client, plugin)")
  .action(async (opts) => {
    try {
      const plugins = await getPlugins()
      const pluginNames = Object.keys(plugins)
        .filter(name => !opts.type || name.includes(opts.type))
        .sort()

      console.info("\nAvailable plugins:")
      for (const plugin of pluginNames) {
        console.info(`  ${plugin}`)
      }
      console.info("")
    } catch (error) {
      console.error(error)
    }
  })

plugins
  .command('add')
  .alias('install')
  .description('add a plugin')
  .argument('<plugin>', 'plugin name')
  .action(async (plugin, opts) => {
    // ensure git is installed
    try {
      const gitVersion = execSync('git --version', { stdio: 'pipe' }).toString().trim();
      console.log('using', gitVersion)
    } catch(e) {
      console.error('Please install git to use this utility')
      return
    }

    const plugins = await getPlugins()
    const repoData = plugins[plugin]?.split(':')
    if (!repoData) {
      console.error('Plugin', plugin, 'not found')
      return
    }
    // repo type
    if (repoData[0] !== 'github') {
      console.error('Plugin', plugin, 'uses', repoData[0], ' but this utility only currently support github')
      return
    }
    const parts = repoData[1].split('/')
    const elizaOSroot = pathUtil.resolve(__dirname, '../..')
    const pkgPath = elizaOSroot + '/packages/' + parts[1]

    // add to packages
    if (!fs.existsSync(pkgPath)) {
      // clone it
      console.log('cloning', parts[1], 'to', pkgPath)
      const gitOutput = execSync('git clone https://github.com/' + repoData[1] + ' ' + pkgPath, { stdio: 'pipe' }).toString().trim();
    }

    // add core to plugin
    // # pnpm add @elizaos/core@workspace:* --filter ./packages/client-twitter
    console.log('Making sure plugin has access to @elizaos/core')
    const pluginAddCoreOutput = execSync('pnpm add @elizaos/core@workspace:* --filter ./packages/' + parts[1], { cwd: elizaOSroot, stdio: 'pipe' }).toString().trim();

    // Read the current package.json
    const packageJsonPath = pkgPath + '/package.json'
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    if (packageJson.name !== '@elizaos-plugins/' + parts[1]) {
      // Update the name field
      packageJson.name = '@elizaos-plugins/' + parts[1]
      console.log('Updating plugins package.json name to', packageJson.name)

      // Write the updated package.json back to disk
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    }

    // add to agent
    console.log('Adding plugin', plugin, 'to agent/package.json')
    try {
      const pluginAddAgentOutput = execSync('pnpm add ' + plugin + '@workspace:* --filter ./agent', { cwd: elizaOSroot, stdio: 'pipe' }).toString().trim();
      //console.log('pluginAddAgentOutput', pluginAddAgentOutput)
    } catch (e) {
      console.error('error', e)
    }

    console.log(plugin, 'attempted installation is complete')
    // can't add to char file because we don't know which character
    console.log('Remember to add it to your character file\'s plugin field: ["' + plugin + '"]')
  })

plugins
  .command('remove')
  .alias('delete')
  .alias('del')
  .alias('rm')
  .description('remove a plugin')
  .argument("<plugin>", "plugin name")
  .action(async (plugin, opts) => {
    // ensure prefix
    const pluginName = '@elizaos-plugins/' + plugin.replace(/^@elizaos-plugins\//, '')
    const plugins = await getPlugins()
    //console.log('loaded', plugins.length, plugins)
    const repoData = plugins[pluginName]?.split(':')
    if (!repoData) {
      console.error('Plugin', pluginName, 'not found')
      return
    }
    const parts = repoData[1].split('/')
    const elizaOSroot = pathUtil.resolve(__dirname, '../..')
    const pkgPath = elizaOSroot + '/packages/' + parts[1]

    // remove from agent: pnpm remove some-plugin --filter ./agent
    try {
      console.log('Removing plugin from agent')
      const pluginRemoveAgentOutput = execSync('pnpm remove ' + pluginName + ' --filter ./agent', { cwd: elizaOSroot, stdio: 'pipe' }).toString().trim();
    } catch (e) {
      console.error('removal from agent, error', e)
    }

    if (fs.existsSync(pkgPath)) {
      // rm -fr packages/path
      console.log('deleting', pkgPath)
      //const gitOutput = execSync('git clone https://github.com/' + repoData[1] + ' ' + pkgPath, { stdio: 'pipe' }).toString().trim();
      try {
        fs.rmSync(pkgPath, { recursive: true, force: true });
      } catch (err) {
        console.error('Error removing package plugin directory:', err);
      }
    }
    console.log(plugin, 'attempted plugin removal is complete')
  })


program.addCommand(plugins)

program.parse(process.argv)
