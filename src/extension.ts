import * as vscode from 'vscode';

interface QuickPickItem extends vscode.QuickPickItem {
    value: boolean;
}

const STATE_KEY = 'cursorApiKeyToggle.isUsingCustomKey';

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

    /**
     * Get current state from global storage (synchronized across windows)
     */
    function getState(): boolean {
        return context.globalState.get<boolean>(STATE_KEY, false);
    }

    /**
     * Save state to global storage (synchronized across windows)
     */
    async function setState(value: boolean): Promise<void> {
        await context.globalState.update(STATE_KEY, value);
    }

    /**
     * Update status bar item based on current state
     */
    function updateStatusBar() {
        const isUsingCustomKey = getState();
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

            return false;
        } catch (error) {
            console.error('Error reading setting:', error);
            return false;
        }
    }

    /**
     * Sync state with actual Cursor setting
     */
    async function syncWithActualSetting(): Promise<void> {
        try {
            const actualValue = await readCurrentSetting();
            const currentState = getState();
            
            // Only update if different to avoid unnecessary writes
            if (actualValue !== currentState) {
                await setState(actualValue);
                updateStatusBar();
            }
        } catch (error) {
            console.error('Error syncing state:', error);
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
                
                // Wait a bit for configuration to update, then sync state
                await new Promise(resolve => setTimeout(resolve, 100));
                await syncWithActualSetting();

            } catch (error) {
                console.error('Error toggling API key:', error);
                
                // If internal command doesn't work, toggle our state manually
                const currentState = getState();
                await setState(!currentState);
                updateStatusBar();
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
                await setState(selected.value);
                updateStatusBar();
            }
        }
    );
    context.subscriptions.push(manualToggleCommand);

    /**
     * Create output channel for logging (optional, user can open manually)
     */
    const outputChannel = vscode.window.createOutputChannel('Cursor API Key Toggle');
    context.subscriptions.push(outputChannel);

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

    // Listen for configuration changes to sync state automatically
    const configWatcher = vscode.workspace.onDidChangeConfiguration(async (e) => {
        // Check if any relevant configuration changed
        const relevantKeys = [
            'ai.usingOpenAIKey',
            'cursor.ai.usingOpenAIKey',
            'aiSettings.usingOpenAIKey',
            'cursor.aiSettings.usingOpenAIKey'
        ];
        
        if (relevantKeys.some(key => e.affectsConfiguration(key))) {
            await syncWithActualSetting();
        }
    });
    context.subscriptions.push(configWatcher);

    // Initialize status bar
    updateStatusBar();

    // Sync state on activation
    syncWithActualSetting().catch((error) => {
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

