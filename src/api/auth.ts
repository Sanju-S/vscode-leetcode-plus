import * as vscode from "vscode";
import fetch from "node-fetch";

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

export async function setLeetCodeSession(context:vscode.ExtensionContext) {
    const session = await vscode.window.showInputBox({
        prompt: "Enter your LEETCODE_SESSION cookie value",
        ignoreFocusOut: true
    });
    const csrftoken = await vscode.window.showInputBox({
        prompt: "Enter your csrftoken cookie value",
        ignoreFocusOut: true
    });

    if (!session || !csrftoken) {
        vscode.window.showErrorMessage("Session or CSRF Token missing.");
        return;
    }

    // Store securely
    await context.secrets.store("leetcode_session", session);
    await context.secrets.store("leetcode_csrftoken", csrftoken);

    vscode.window.showInformationMessage("✅ LeetCode session saved securely!");

    // Optional: verify login
    try{
        const me = await fetch(LEETCODE_GRAPHQL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `LEETCODE_SESSION=${session}; csrftoken=${csrftoken}`,
                "x-csrftoken": csrftoken,
            },
            body: JSON.stringify({
                query: `query getUser {
                    user {
                        username
                    }
                }`,
            }),
        }).then((r: any) => r.json());

        const username = me?.data?.user?.username;
        if (username) {
            vscode.window.showInformationMessage(`👋 Logged in as ${username}`);
        }
        else {
            vscode.window.showWarningMessage("⚠️ Could not verify session.");
        }
    } catch (err) {
        vscode.window.showErrorMessage("❌ Error verifying session.");
    }
}