if (!process.env.SLACK_WEBHOOK_URL) {
  throw new Error('SLACK_WEBHOOK_URL is not defined');
}

export async function sendSlackAlert(message: string): Promise<void> {
  try {
    const data = JSON.parse(message);
    const blocks = formatSlackMessage(data);

    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blocks,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send Slack alert: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send Slack alert:', error);
    throw error;
  }
}

function formatSlackMessage(data: {
  title: string;
  timestamp: string;
  type: string;
  condition: {
    metric: string;
    operator: string;
    threshold: number;
    window: number;
  };
  data: Record<string, unknown>;
}): Array<{
  type: string;
  text?: { type: string; text: string };
  elements?: Array<{ type: string; text: string }>;
  fields?: Array<{ type: string; text: string }>;
}> {
  const severity = getSeverityColor(data.type);
  const timestamp = new Date(data.timestamp).toLocaleString();

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `🚨 ${data.title}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Type:*\n${data.type}`,
        },
        {
          type: 'mrkdwn',
          text: `*Time:*\n${timestamp}`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Condition:*\n${formatCondition(data.condition)}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Details:*',
      },
    },
    {
      type: 'section',
      fields: Object.entries(data.data).map(([key, value]) => ({
        type: 'mrkdwn',
        text: `*${formatKey(key)}:*\n${formatValue(value)}`,
      })),
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `This is an automated alert from the monitoring system. Severity: ${severity}`,
        },
      ],
    },
    {
      type: 'divider',
    },
  ];
}

function getSeverityColor(type: string): string {
  switch (type) {
    case 'error_rate':
      return '🔴 Critical';
    case 'response_time':
      return '🟡 Warning';
    case 'security':
      return '🔴 Critical';
    case 'system':
      return '🟡 Warning';
    default:
      return '⚪ Info';
  }
}

function formatCondition(condition: {
  metric: string;
  operator: string;
  threshold: number;
  window: number;
}): string {
  const operators = {
    gt: '>',
    lt: '<',
    eq: '=',
    gte: '≥',
    lte: '≤',
  };

  const windowText = condition.window > 0
    ? ` over ${formatDuration(condition.window)}`
    : '';

  return `${formatKey(condition.metric)} ${operators[condition.operator as keyof typeof operators]} ${condition.threshold}${windowText}`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} minutes`;
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)} hours`;
  }
  return `${Math.floor(seconds / 86400)} days`;
}

function formatKey(key: string): string {
  return key
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  if (value instanceof Date) {
    return value.toLocaleString();
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
} 