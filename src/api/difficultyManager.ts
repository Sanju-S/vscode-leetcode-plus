import * as vscode from "vscode";

const DIFF_KEY = "preferredDifficulty";

/**
 * Prompts the user to pick a difficulty and saves it globally.
 */
export async function pickAndSaveDifficulty(context: vscode.ExtensionContext): Promise<string | undefined> {
  const options = [
    "Easy",
    "Medium",
    "Hard",
    "Random (Easy, Medium, Hard)",
    "Random (Easy, Medium)",
    "Random (Medium, Hard)"
  ];

  const selected = await vscode.window.showQuickPick(options, {
    placeHolder: "Select preferred difficulty level",
  });

  if (selected) {
    await context.globalState.update(DIFF_KEY, selected);
    vscode.window.showInformationMessage(`✅ Preferred difficulty set to ${selected}`);
    return selected;
  }

  vscode.window.showWarningMessage("⚠️ No difficulty selected. Defaulting to Random (Easy, Medium, Hard).");
  return "Random (Easy, Medium, Hard)";
}

/**
 * Gets saved difficulty or prompts if not set.
 */
export async function getPreferredDifficulty(context: vscode.ExtensionContext): Promise<string> {
  let diff = context.globalState.get(DIFF_KEY) as string | undefined;
  if (!diff) {diff = await pickAndSaveDifficulty(context);}
  return diff ?? "Random (Easy, Medium, Hard)";
}

/**
 * Command for user to change difficulty.
 */
export async function changeDifficulty(context: vscode.ExtensionContext) {
  await pickAndSaveDifficulty(context);
}
