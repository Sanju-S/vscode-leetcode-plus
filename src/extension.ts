// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { setLeetCodeSession } from './api/auth';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('LeetCode Plus extension activated!');

	// Hello world
	const hello = vscode.commands.registerCommand('vscode-leetcode-plus.helloWorld', () => {
		vscode.window.showInformationMessage('Hello from LeetCode Plus!');
	});

	// Set Session
	const setSession = vscode.commands.registerCommand("vscode-leetcode-plus.setSession", () => 
		setLeetCodeSession(context)
	);

	context.subscriptions.push(hello, setSession);
}

// This method is called when your extension is deactivated
export function deactivate() {}
