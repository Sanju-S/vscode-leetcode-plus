import * as vscode from "vscode";

export function showProblemWebView(
  title: string,
  difficulty: string,
  content: string,
  lang: string,
  difficultyFilter: string
) {
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
        margin: 0;
        padding: 0;
        color: var(--vscode-editor-foreground);
        background-color: var(--vscode-editor-background);
      }
      .header {
        background: var(--vscode-editorHoverWidget-background);
        padding: 12px 20px;
        border-bottom: 1px solid var(--vscode-editorIndentGuide-background);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .filters {
        display: flex;
        gap: 15px;
        font-size: 13px;
        color: var(--vscode-descriptionForeground);
      }
      .tag {
        padding: 3px 8px;
        border-radius: 6px;
        font-weight: 500;
      }
      .tag.easy {
        background-color: rgba(46, 204, 113, 0.15);
        color: #2ecc71;
      }
      .tag.medium {
        background-color: rgba(241, 196, 15, 0.15);
        color: #f1c40f;
      }
      .tag.hard {
        background-color: rgba(231, 76, 60, 0.15);
        color: #e74c3c;
      }
      .tag.lang {
        background-color: rgba(52, 152, 219, 0.15);
        color: #3498db;
      }
      .tag.diffFilter {
        background-color: rgba(155, 89, 182, 0.15);
        color: #9b59b6;
      }
      .content {
        padding: 25px;
        line-height: 1.6;
      }
      pre {
        background: rgba(128,128,128,0.1);
        padding: 10px;
        border-radius: 6px;
        overflow-x: auto;
      }
      img { max-width: 100%; }
    </style>
  `;

  const difficultyClass = difficulty.toLowerCase();
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        ${css}
      </head>
      <body>
        <div class="header">
          <div class="filters">
            <span class="tag ${difficultyClass}">${difficulty}</span>
            <span class="tag lang">${lang}</span>
            <span class="tag diffFilter">${difficultyFilter}</span>
          </div>
          <div style="font-weight:bold;">${title}</div>
        </div>
        <div class="content">
          ${content}
        </div>
      </body>
    </html>
  `;

  panel.webview.html = html;
}
