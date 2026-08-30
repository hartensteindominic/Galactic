import { createHash, createHmac } from 'node:crypto';

const command = process.argv[2] || '';
const args = process.argv.slice(3);
const baseUrlRaw = (process.env.GALACTIC_SANDBOX_BASE_URL || '').trim();
const operatorId = (process.env.BANKING_SANDBOX_OPERATOR_ID || '').trim();
const operatorSecret = process.env.BANKING_SANDBOX_OPERATOR_SECRET || '';
const enabled = process.env.GALACTIC_SANDBOX_OPERATOR_CLIENT_ENABLED === 'true';

const COMMANDS = new Map([
  ['certify', { path: '/api/banking/provider-sandbox/certification', buildBody: () => ({}) }],
  ['recover', { path: '/api/banking/provider-sandbox/recovery', buildBody: () => ({}) }],
  ['operations', { path: '/api/banking/provider-sandbox/operations', buildBody: () => ({}) }],
  ['reconciliations', { path: '/api/banking/provider-sandbox/reconciliations', buildBody: () => ({}) }],
  ['reconcile-all-accounts', { path: '/api/banking/provider-sandbox/reconcile-all-accounts', buildBody: () => ({}) }],
  ['reconcile-account', {
    path: '/api/banking/provider-sandbox/reconcile-account',
    buildBody: ([accountResourceId]) => ({ accountResourceId: accountResourceId || '' })
  }],
  ['requeue-event', {
    path: '/api/banking/provider-sandbox/events/requeue',
    buildBody: ([eventId, ...reasonParts]) => ({ eventId: eventId || '', reason: reasonParts.join(' ').trim() })
  }],
  ['resolve-reconciliation', {
    path: '/api/banking/provider-sandbox/reconciliations/resolve',
    buildBody: ([id, ...noteParts]) => ({ id: id || '', resolutionNote: noteParts.join(' ').trim() })
  }]
]);

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function usage() {
  console.log(`Galactic Trust provider-sandbox operator CLI\n\nCommands:\n  certify\n  recover\n  operations\n  reconciliations\n  reconcile-all-accounts\n  reconcile-account <galactic-account-resource-id>\n  requeue-event <provider-event-id> <reason...>\n  resolve-reconciliation <reconciliation-id> <note...>\n\nRequired environment:\n  GALACTIC_SANDBOX_OPERATOR_CLIENT_ENABLED=true\n  GALACTIC_SANDBOX_BASE_URL=https://...\n  BANKING_SANDBOX_OPERATOR_ID=<allowlisted-id>\n  BANKING_SANDBOX_OPERATOR_SECRET=<server-matching-secret>\n\nThe secret is used only to sign the request and is never printed.`);
}

if (!COMMANDS.has(command)) {
  usage();
  if (command) fail(`Unknown provider-sandbox command: ${command}`);
} else if (!enabled) {
  fail('Refusing provider-sandbox operator request: GALACTIC_SANDBOX_OPERATOR_CLIENT_ENABLED must be true.');
} else if (!/^[A-Za-z0-9._:@-]{1,120}$/.test(operatorId)) {
  fail('Refusing provider-sandbox operator request: BANKING_SANDBOX_OPERATOR_ID is missing or invalid.');
} else if (operatorSecret.length < 32) {
  fail('Refusing provider-sandbox operator request: BANKING_SANDBOX_OPERATOR_SECRET must contain at least 32 characters.');
} else {
  let baseUrl;
  try {
    baseUrl = new URL(baseUrlRaw);
  } catch {
    fail('Refusing provider-sandbox operator request: GALACTIC_SANDBOX_BASE_URL is invalid.');
  }

  if (baseUrl) {
    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(baseUrl.hostname);
    if (baseUrl.protocol !== 'https:' && !(isLocal && baseUrl.protocol === 'http:')) {
      fail('Refusing provider-sandbox operator request: remote sandbox URL must use HTTPS.');
    } else if (baseUrl.username || baseUrl.password || baseUrl.search || baseUrl.hash) {
      fail('Refusing provider-sandbox operator request: sandbox base URL must not contain credentials, query parameters, or fragments.');
    } else {
      const definition = COMMANDS.get(command);
      const bodyObject = definition.buildBody(args);
      const rawBody = JSON.stringify(bodyObject);
      const timestamp = String(Date.now());
      const bodyHash = createHash('sha256').update(rawBody).digest('hex');
      const signaturePayload = `${operatorId}.${timestamp}.POST.${definition.path}.${bodyHash}`;
      const signature = createHmac('sha256', operatorSecret).update(signaturePayload).digest('hex');
      const target = new URL(definition.path, baseUrl).toString();

      try {
        const response = await fetch(target, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-galactic-sandbox-operator': operatorId,
            'x-galactic-sandbox-operator-timestamp': timestamp,
            'x-galactic-sandbox-operator-signature': signature
          },
          body: rawBody,
          redirect: 'error'
        });

        const responseText = await response.text();
        let responseBody;
        try {
          responseBody = JSON.parse(responseText);
        } catch {
          responseBody = { ok: false, error: { code: 'NON_JSON_RESPONSE', message: 'Sandbox operator endpoint did not return JSON.' } };
        }

        console.log(JSON.stringify({
          command,
          status: response.status,
          ok: response.ok,
          response: responseBody
        }, null, 2));

        if (!response.ok) process.exitCode = 1;
      } catch (error) {
        fail(`Provider-sandbox operator request failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      }
    }
  }
}
