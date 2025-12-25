import * as vscode from 'vscode';

interface QuickPickItem extends vscode.QuickPickItem {
    value: boolean;
}

/**
 * Extension activation function
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Cursor API Key Toggle extension is now active!');

    // Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    statusBarItem.command = 'cursorApiKeyToggle.toggle';
    statusBarItem.tooltip = 'Click to toggle API Key Mode (Ctrl+Alt+K)';
    context.subscriptions.push(statusBarItem);

    // State variable to track API key mode
    let isUsingCustomKey = false;

    /**
     * Update status bar item based on current state
     */
    function updateStatusBar() {
        if (isUsingCustomKey) {
            statusBarItem.text = '$(key) Custom API';
            statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
            statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
        } else {
            statusBarItem.text = '$(key) Cursor Key';
            statusBarItem.backgroundColor = undefined;
            statusBarItem.color = undefined;
        }
        statusBarItem.show();
    }

    /**
     * Try to read the current setting from Cursor configuration
     */
    async function readCurrentSetting(): Promise<boolean> {
        try {
            // Try multiple configuration paths that Cursor might use
            const config = vscode.workspace.getConfiguration();
            
            // Try different possible configuration keys
            const possibleKeys = [
                'ai.usingOpenAIKey',
                'cursor.ai.usingOpenAIKey',
                'aiSettings.usingOpenAIKey',
                'cursor.aiSettings.usingOpenAIKey',
                'openai.apiKey'
            ];

            for (const key of possibleKeys) {
                const value = config.inspect(key);
                if (value && (value.globalValue !== undefined || value.workspaceValue !== undefined)) {
                    const setting = config.get<boolean>(key, false);
                    console.log(`Found setting at ${key}: ${setting}`);
                    return setting;
                }
            }

            // If not found in config, try to execute command to get state
            try {
                await vscode.commands.executeCommand('aiSettings.usingOpenAIKey.toggle');
                // If command succeeded, toggle back and assume it was off
                await vscode.commands.executeCommand('aiSettings.usingOpenAIKey.toggle');
                return false;
            } catch {
                // Command not available, return false (default to Cursor key)
            }

            return false;
        } catch (error) {
            console.error('Error reading setting:', error);
            return false;
        }
    }

    /**
     * Toggle API key mode command
     */
    let toggleCommand = vscode.commands.registerCommand(
        'cursorApiKeyToggle.toggle',
        async () => {
            try {
                // Try to execute Cursor's internal command
                await vscode.commands.executeCommand('aiSettings.usingOpenAIKey.toggle');
                
                // Toggle our internal state
                isUsingCustomKey = !isUsingCustomKey;
                updateStatusBar();

                // Show notification
                const mode = isUsingCustomKey ? 'Custom API Key' : 'Cursor Key';
                const message = `✅ Switched to ${mode} mode`;
                
                vscode.window.showInformationMessage(message, 'OK');
                
                // Log to output channel
                logOutput(message);

            } catch (error) {
                console.error('Error toggling API key:', error);
                
                // If internal command doesn't work, use our local state
                isUsingCustomKey = !isUsingCustomKey;
                updateStatusBar();

                const mode = isUsingCustomKey ? 'Custom API Key' : 'Cursor Key';
                const message = `🔄 ${mode} mode (Manual Toggle)`;
                
                vscode.window.showInformationMessage(message, 'OK');
                logOutput(message);

                // Optionally open settings
                const action = await vscode.window.showWarningMessage(
                    'For automatic integration, configure API key in settings',
                    'Open Settings',
                    'Dismiss'
                );
                if (action === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'ai.usingOpenAIKey');
                }
            }
        }
    );
    context.subscriptions.push(toggleCommand);

    /**
     * Manual toggle via quick pick
     */
    let manualToggleCommand = vscode.commands.registerCommand(
        'cursorApiKeyToggle.manualToggle',
        async () => {
            const items: QuickPickItem[] = [
                {
                    label: '$(key) Use Custom OpenAI API Key',
                    description: 'Use your own API key for AI features',
                    value: true
                },
                {
                    label: '$(key) Use Cursor Key',
                    description: 'Use Cursor\'s built-in API key',
                    value: false
                }
            ];

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select API Key Mode'
            });

            if (selected) {
                isUsingCustomKey = selected.value;
                updateStatusBar();
                
                const mode = isUsingCustomKey ? 'Custom API Key' : 'Cursor Key';
                const message = `✅ Set to ${mode} mode`;
                
                vscode.window.showInformationMessage(message, 'OK');
                logOutput(message);
            }
        }
    );
    context.subscriptions.push(manualToggleCommand);

    /**
     * Create output channel for logging
     */
    const outputChannel = vscode.window.createOutputChannel('Cursor API Key Toggle');
    context.subscriptions.push(outputChannel);

    function logOutput(message: string) {
        const timestamp = new Date().toLocaleTimeString();
        outputChannel.appendLine(`[${timestamp}] ${message}`);
        outputChannel.show(true);
    }

    /**
     * Register command to show output channel
     */
    let showLogCommand = vscode.commands.registerCommand(
        'cursorApiKeyToggle.showLog',
        () => {
            outputChannel.show();
        }
    );
    context.subscriptions.push(showLogCommand);

    // Initialize status bar
    updateStatusBar();
    logOutput('Extension activated');

    // Check current state on activation
    readCurrentSetting().then((usingCustomKey) => {
        isUsingCustomKey = usingCustomKey;
        updateStatusBar();
        logOutput(`Current mode: ${isUsingCustomKey ? 'Custom API Key' : 'Cursor Key'}`);
    }).catch((error) => {
        console.error('Error initializing state:', error);
        updateStatusBar();
    });
}

/**
 * Extension deactivation function
 */
export function deactivate() {
    console.log('Cursor API Key Toggle extension is now deactivated!');
}

