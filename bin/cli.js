#!/usr/bin/env node

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { exec } from 'child_process';
import { readConfig, writeConfig } from '../server/config.js';
import { generateCompletion } from '../server/providers.js';

// Header ASCII Art
const header = `
${chalk.cyan('┌────────────────────────────────────────────────────────┐')}
${chalk.cyan('│')}  ${chalk.bold.blue('⚡ IRN-OS CLI')} ${chalk.dim('- Premium Multi-Provider AI Hub')}     ${chalk.cyan('│')}
${chalk.cyan('└────────────────────────────────────────────────────────┘')}
`;

async function main() {
  console.clear();
  console.log(header);
  
  const config = readConfig();
  const activeProvider = config.settings.activeProvider;
  const activeModel = config.settings.defaultModel;

  console.log(`${chalk.bold('Status:')}
  Active Provider: ${chalk.green(activeProvider)}
  Active Model:    ${chalk.green(activeModel)}
  Web UI Server:   ${chalk.yellow(`http://localhost:${config.settings.port || 4567}`)}
  `);

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'What would you like to do?',
      choices: [
        { name: '💬  Quick Chat in Terminal', value: 'chat' },
        { name: '🔌  Manage API Keys / Providers', value: 'providers' },
        { name: '🎯  Switch Active Provider & Model', value: 'switch' },
        { name: '📊  View Usage Statistics', value: 'stats' },
        { name: '🖥️  Start Web Dashboard & Backend', value: 'server' },
        { name: '❌  Exit', value: 'exit' }
      ]
    }
  ]);

  switch (choice) {
    case 'chat':
      await runChat();
      break;
    case 'providers':
      await manageProviders();
      break;
    case 'switch':
      await switchModel();
      break;
    case 'stats':
      await viewStats();
      break;
    case 'server':
      await startServer();
      break;
    case 'exit':
      console.log(chalk.blue('\nShutting down IRN-OS CLI... ⚡\n'));
      process.exit(0);
  }
}

async function runChat() {
  console.clear();
  console.log(chalk.bold.blue('⚡ IRN-OS QUICK CHAT'));
  console.log(chalk.dim('Type "exit" to go back to the main menu.\n'));
  
  const config = readConfig();
  const provider = config.settings.activeProvider;
  const model = config.settings.defaultModel;

  const messages = [];

  while (true) {
    const { prompt } = await inquirer.prompt([
      {
        type: 'input',
        name: 'prompt',
        message: chalk.cyan('You >')
      }
    ]);

    if (prompt.trim().toLowerCase() === 'exit') {
      break;
    }

    if (!prompt.trim()) continue;

    messages.push({ role: 'user', content: prompt });
    const spinner = ora('Generating AI response...').start();

    try {
      const result = await generateCompletion({
        provider,
        model,
        messages
      });
      spinner.stop();
      console.log(`\n${chalk.green.bold('IRN-OS (' + model + ') >')} \n${result.text}\n`);
      messages.push({ role: 'assistant', content: result.text });
    } catch (err) {
      spinner.stop();
      console.log(chalk.red(`\nError: ${err.message}\n`));
    }
  }
  
  await main();
}

async function manageProviders() {
  const config = readConfig();
  const providers = Object.keys(config.providers);
  
  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select provider to manage:',
      choices: [...providers, 'Go Back']
    }
  ]);

  if (provider === 'Go Back') {
    return main();
  }

  const keys = config.providers[provider] || [];
  console.log(chalk.bold(`\nCurrent Keys for ${provider}:`));
  if (keys.length === 0) {
    console.log(chalk.dim('No keys configured.'));
  } else {
    keys.forEach((k, idx) => {
      const status = k.rateLimitedUntil && k.rateLimitedUntil > Date.now() 
        ? chalk.red(`Limited until ${new Date(k.rateLimitedUntil).toLocaleTimeString()}`) 
        : chalk.green('Ready');
      console.log(`  ${idx + 1}. [${k.name}] - Key: ...${k.key?.slice(-6) || 'N/A'} (${status})`);
    });
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Action:',
      choices: ['Add Key', 'Remove Key', 'Go Back']
    }
  ]);

  if (action === 'Add Key') {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Name this key (e.g. Account1):'
      },
      {
        type: 'password',
        name: 'key',
        message: 'Enter API Key:'
      }
    ]);

    if (answers.name && answers.key) {
      config.providers[provider].push({
        name: answers.name,
        key: answers.key,
        rateLimitedUntil: null
      });
      writeConfig(config);
      console.log(chalk.green('Key added successfully!'));
    }
  } else if (action === 'Remove Key' && keys.length > 0) {
    const { keyIdx } = await inquirer.prompt([
      {
        type: 'list',
        name: 'keyIdx',
        message: 'Select key to remove:',
        choices: keys.map((k, idx) => ({ name: k.name, value: idx }))
      }
    ]);
    config.providers[provider].splice(keyIdx, 1);
    writeConfig(config);
    console.log(chalk.green('Key removed successfully!'));
  }

  await manageProviders();
}

async function switchModel() {
  const config = readConfig();
  
  const { provider } = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Select Active Provider:',
      choices: ['gemini', 'anthropic', 'openai', 'ollama', 'Go Back']
    }
  ]);

  if (provider === 'Go Back') {
    return main();
  }

  const models = {
    gemini: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.5-flash', 'gemini-2.0-flash'],
    anthropic: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    ollama: ['llama3', 'mistral', 'codegemma', 'phi3']
  };

  const { model } = await inquirer.prompt([
    {
      type: 'list',
      name: 'model',
      message: 'Select Default Model:',
      choices: models[provider]
    }
  ]);

  config.settings.activeProvider = provider;
  config.settings.defaultModel = model;
  writeConfig(config);
  
  console.log(chalk.green(`Switched active model to ${provider} / ${model}`));
  
  setTimeout(main, 1500);
}

async function viewStats() {
  const config = readConfig();
  console.clear();
  console.log(chalk.bold.blue('⚡ IRN-OS USAGE METRICS\n'));

  const dates = Object.keys(config.usage || {});
  if (dates.length === 0) {
    console.log(chalk.dim('No usage data recorded yet.'));
  } else {
    dates.sort().reverse().forEach(date => {
      console.log(chalk.bold.underline(date));
      const dayData = config.usage[date];
      Object.keys(dayData).forEach(provider => {
        const { tokens, requests } = dayData[provider];
        console.log(`  ${chalk.cyan(provider.toUpperCase())}: ${chalk.yellow(tokens)} tokens across ${chalk.yellow(requests)} requests`);
      });
      console.log('');
    });
  }

  await inquirer.prompt([{ type: 'input', name: 'pressEnter', message: 'Press Enter to return...' }]);
  await main();
}

async function startServer() {
  console.log(chalk.cyan('\nStarting Express backend and Vite client...'));
  
  const serverProc = exec('npm run dev', { cwd: '/home/aziza/projects/irn-os' });
  
  serverProc.stdout.on('data', (data) => {
    console.log(chalk.dim(`[Server] ${data.trim()}`));
  });

  serverProc.stderr.on('data', (data) => {
    console.log(chalk.red(`[Error] ${data.trim()}`));
  });

  console.log(chalk.green('\nServer launched! Open your browser at http://localhost:4567 to view the UI.'));
  console.log(chalk.dim('Press Ctrl+C to stop the process and exit.'));
}

main().catch(console.error);
