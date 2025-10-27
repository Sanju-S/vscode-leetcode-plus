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
import { changeDifficulty } from './api/difficultyManager';

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
			const problem = await getRandomProblemForLanguage(context);

			if (!problem) return;

			showProblemWebView(problem.title, problem.difficulty, problem.content);

			// Create a filename based on slug + language extension
			const fileExt = lang === "python3" ? "py"
			: lang === "cpp" ? "cpp"
			: lang === "java" ? "java"
			: lang === "javascript" ? "js"
			: lang === "typescript" ? "ts"
			: "txt";

			// Prepare difficulty folder name
			const difficulty =
			problem.difficulty?.toLowerCase() || "unsorted"; // Easy, Medium, Hard
			const folderName =
			difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

			// Determine base workspace folder or fallback
			let baseFolder: string;
			if (
			vscode.workspace.workspaceFolders &&
			vscode.workspace.workspaceFolders.length > 0
			) {
			baseFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
			} else {
			baseFolder = path.join(require("os").homedir(), "leetcode");
			if (!fs.existsSync(baseFolder)) {fs.mkdirSync(baseFolder);}
			}

			// Create difficulty subfolder if it doesn’t exist
			const folderPath = path.join(baseFolder, folderName);
			if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath, { recursive: true });
			}

			// Build file name and full path
			const fileName = `${problem.slug}.${fileExt}`;
			const filePath = path.join(folderPath, fileName);

			// Write file to disk (overwrite or create new)
			if (!fs.existsSync(filePath)) {
			fs.writeFileSync(filePath, problem.code, { encoding: "utf-8" });
			} else {
			vscode.window.showWarningMessage(
				`${fileName} already exists — opening existing file.`
			);
			}

			// Open in VS Code and auto-save
			const doc = await vscode.workspace.openTextDocument(filePath);
			const editor = await vscode.window.showTextDocument(
			doc,
			vscode.ViewColumn.Two
			);

			const autoSave = vscode.workspace
			.getConfiguration("leetcodePlus")
			.get("autoSaveOnFetch") as boolean;

			if (autoSave) {await doc.save();}

			vscode.window.showInformationMessage(
			`📘 ${problem.title} (${problem.difficulty}) opened in ${folderName}/`
			);
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

	const updateDifficulty = vscode.commands.registerCommand(
	"vscode-leetcode-plus.changeDifficulty",
	async () => {
		await changeDifficulty(context);
	}
	);


	context.subscriptions.push(hello, setSession, getRandom, submit, changeLang, updateDifficulty);
}

// This method is called when your extension is deactivated
export function deactivate() {}
