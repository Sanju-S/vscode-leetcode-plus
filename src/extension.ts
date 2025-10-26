// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from "path";
import * as fs from "fs";
import { setLeetCodeSession } from './api/auth';
import { getRandomProblemForLanguage } from './api/randomProblem';
import { showProblemWebView } from './ui/problemView';
import { submitSolution } from './api/submit';
import { SUPPORTED_LANGUAGES } from './config/languages';
import { getPreferredLanguage, changeLanguage } from "./api/languageManager";

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
			const lang = await getPreferredLanguage(context);
			const problem = await getRandomProblemForLanguage(lang, context);

			if (!problem) return;

			showProblemWebView(problem.title, problem.difficulty, problem.content);

			// Create a filename based on slug + language extension
			const fileExt = lang === "python3" ? "py"
			: lang === "cpp" ? "cpp"
			: lang === "java" ? "java"
			: lang === "javascript" ? "js"
			: lang === "typescript" ? "ts"
			: "txt";

			const fileName = `${problem.slug}.${fileExt}`;

			// Use workspace folder (or temp folder if none)
			let folderPath: string;
			if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
			folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
			} else {
			folderPath = path.join(require("os").homedir(), "leetcode");
			if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath);
			}

			const filePath = path.join(folderPath, fileName);

			// Write code to disk (overwrite if exists)
			fs.writeFileSync(filePath, problem.code, { encoding: "utf-8" });

			// Open it in the editor
			const doc = await vscode.workspace.openTextDocument(filePath);
			await vscode.window.showTextDocument(doc, vscode.ViewColumn.Two);

			vscode.window.showInformationMessage(`📘 Opened ${fileName}`);
		}
	);

	// Change preferred language
	const changeLang = vscode.commands.registerCommand(
		"vscode-leetcode-plus.changeLanguage",
		async () => {
			const selection = await vscode.window.showQuickPick(
				SUPPORTED_LANGUAGES.map((l) => l.label),
				{ placeHolder: "Select your new preferred language" }
			);

			if (!selection) return;
			const chosen = SUPPORTED_LANGUAGES.find((l) => l.label === selection);
			if (!chosen) return;

			await context.globalState.update("preferredLanguage", chosen.slug);
			vscode.window.showInformationMessage(`✅ Preferred language updated to ${selection}.`);
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

	context.subscriptions.push(hello, setSession, getRandom, submit, changeLang);
}

// This method is called when your extension is deactivated
export function deactivate() {}
