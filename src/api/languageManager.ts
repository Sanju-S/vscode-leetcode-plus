import * as vscode from "vscode";

const LANG_KEY = "preferredLanguage";

/**
 * Prompts the user to pick a language and saves it globally.
 */
export async function pickAndSaveLanguage(context: vscode.ExtensionContext): Promise<string | undefined> {
  const langs = ["python3", "cpp", "java", "javascript", "typescript", "csharp", "golang", "rust"];

  const selected = await vscode.window.showQuickPick(langs, {
    placeHolder: "Select your preferred programming language",
  });

  if (selected) {
    await context.globalState.update(LANG_KEY, selected);
    vscode.window.showInformationMessage(`✅ Preferred language set to ${selected}`);
    return selected;
  }

  vscode.window.showWarningMessage("⚠️ No language selected. Defaulting to Python3.");
  return "python3";
}

/**
 * Retrieves the stored language, or asks user if not set.
 */
export async function getPreferredLanguage(context: vscode.ExtensionContext): Promise<string> {
  let lang = context.globalState.get(LANG_KEY) as string | undefined;

  if (!lang) {
    lang = await pickAndSaveLanguage(context);
  }

  return lang ?? "python3";
}

/**
 * Command to manually update the stored language.
 */
export async function changeLanguage(context: vscode.ExtensionContext) {
  await pickAndSaveLanguage(context);
}
