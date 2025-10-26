import * as vscode from "vscode";

export function showProblemWebView(title: string, difficulty: string, content: string) {
    const panel = vscode.window.createWebviewPanel(
        "leetcodeProblem",
        `${title} (${difficulty})`,
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    );

    const css = `
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 20px;
                color: var(--vscode-editor-foreground);
                background-color: var(--vscode-editor-background);
            }
            h1, h2, h3 { color: var(--vscode-editor-foreground); }
            pre {
                background: rgba(128,128,128,0.1);
                padding: 10px;
                border-radius: 6px;
                overflow-x: auto;
            }
            code {
                color: #ffb86c;
                font-family: monospace;
            }
            img {
                max-width: 100%;
            }
        </style>
    `;

    panel.webview.html = `
     <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        ${css}
      </head>
      <body>
        <h2>${title} <span style="color:gray;font-size:0.8em;">(${difficulty})</span></h2>
        <hr/>
        ${content}
      </body>
    </html>
    `;
}