export interface TriggerPayload {
    task?: {
        id: string;
        title: string;
        description?: string;
        status?: string;
        priority?: string;
        assignee_id?: string;
    };
    user?: {
        id: string;
        name: string;
        email: string;
    };
    workspace?: {
        id: string;
        name: string;
        slug: string;
    };
    [key: string]: any;
}

/**
 * Parses a string and replaces {{variable}} tags with values from the payload.
 * Supports dot notation for nested objects (e.g. {{task.title}}).
 */
export function parseVariables(template: string, payload: TriggerPayload): string {
    if (!template) return "";

    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const keys = path.trim().split('.');
        let value: any = payload;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return match; // Return original tag if path not found
            }
        }

        if (value === undefined || value === null) {
            return "";
        }

        return String(value);
    });
}

/**
 * Returns a list of available variables based on the trigger type.
 * Useful for the UI picker.
 */
export function getAvailableVariables(triggerType: string) {
    const common = [
        { id: 'user.name', label: 'User Name', category: 'User' },
        { id: 'user.email', label: 'User Email', category: 'User' },
        { id: 'workspace.name', label: 'Workspace Name', category: 'Workspace' },
    ];

    if (triggerType.startsWith('task.')) {
        return [
            ...common,
            { id: 'task.title', label: 'Task Title', category: 'Task' },
            { id: 'task.description', label: 'Task Description', category: 'Task' },
            { id: 'task.status', label: 'Task Status', category: 'Task' },
            { id: 'task.priority', label: 'Task Priority', category: 'Task' },
            { id: 'task.id', label: 'Task ID', category: 'Task' },
        ];
    }

    return common;
}
