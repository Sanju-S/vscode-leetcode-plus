// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { setLeetCodeSession } from './api/auth';
import { getRandomProblemForLanguage } from './api/randomProblem';
import { showProblemWebView } from './ui/problemView';

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

	// Get Random Problem
	const getRandom = vscode.commands.registerCommand(
    	"vscode-leetcode-plus.getRandomProblem",
		async () => {
			const problem = await getRandomProblemForLanguage("python3");

			if (!problem) {
				vscode.window.showErrorMessage("❌ Failed to load problem.");
				return;
			}

			// Show WebView with description
			showProblemWebView(problem.title, problem.difficulty, problem.content);

			// Open code editor with starter code
			const doc = await vscode.workspace.openTextDocument({
				content: problem.code,
				language: "python",
			});
			await vscode.window.showTextDocument(doc, vscode.ViewColumn.Two);
		}
	);

	context.subscriptions.push(hello, setSession, getRandom);
}

// This method is called when your extension is deactivated
export function deactivate() {}
