// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { setLeetCodeSession } from './api/auth';
import { getRandomProblemForLanguage } from './api/randomProblem';
import { showProblemWebView } from './ui/problemView';
import { submitSolution } from './api/submit';

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

	// Fetch random problem
	const getRandom = vscode.commands.registerCommand(
	"vscode-leetcode-plus.getRandomProblem",
	async () => {
			const problem = await getRandomProblemForLanguage("python3", context);

			if (!problem) return;

			// Save the problem ID for later submission
			context.globalState.update("lastQuestionId", problem.id);
			context.globalState.update("lastQuestionSlug", problem.slug);
			context.globalState.update("lastQuestionLang", "python3");

			showProblemWebView(problem.title, problem.difficulty, problem.content);

			const doc = await vscode.workspace.openTextDocument({
			content: problem.code,
			language: "python",
			});
			await vscode.window.showTextDocument(doc, vscode.ViewColumn.Two);
		}
	);

	// Submit solution
	const submit = vscode.commands.registerCommand(
		"vscode-leetcode-plus.submitSolution",
		async () => {
			const id = context.globalState.get("lastQuestionId") as string;
			const slug = context.globalState.get("lastQuestionSlug") as string;
			const lang = context.globalState.get("lastQuestionLang") as string;

			if (!slug || !lang) {
				vscode.window.showWarningMessage("⚠️ No active problem found. Fetch one first.");
				return;
			}

			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage("⚠️ Open a code file first.");
				return;
			}

			const code = editor?.document.getText() ?? "";
			await submitSolution(context, id, slug, lang, code);
		}
	);

	context.subscriptions.push(hello, setSession, getRandom, submit);
}

// This method is called when your extension is deactivated
export function deactivate() {}
