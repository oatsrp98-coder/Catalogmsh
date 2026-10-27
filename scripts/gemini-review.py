#!/usr/bin/env python3
"""Development-only Gemini design review; API keys never enter browser assets."""
import argparse
import base64
import json
import os
from pathlib import Path
import re
import sys
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
API = 'https://generativelanguage.googleapis.com/v1beta'
SOURCE_FILES = ['index.html', 'style.css', 'studio.css', 'main.js', 'package.json']


def build_request(screenshots):
    parts = [{'text': (ROOT / 'docs/gemini-ux-brief.md').read_text()}]
    for name in SOURCE_FILES:
        parts.append({'text': f'Current source file: {name}\n```\n{(ROOT / name).read_text()}\n```'})
    for path in screenshots:
        data = path.read_bytes()
        if data.startswith(b'\x89PNG\r\n\x1a\n'):
            mime = 'image/png'
        elif data.startswith(b'\xff\xd8\xff'):
            mime = 'image/jpeg'
        else:
            raise ValueError(f'Expected a PNG or JPEG screenshot: {path.name}')
        if len(data) > 8 * 1024 * 1024:
            raise ValueError(f'Screenshot exceeds 8 MB: {path.name}')
        parts.append({'text': f'Current UI screenshot: {path.name}'})
        parts.append({'inlineData': {'mimeType': mime, 'data': base64.b64encode(data).decode()}})
    return {'contents': [{'role': 'user', 'parts': parts}],
            'generationConfig': {'maxOutputTokens': 16384}}


def api_call(path, key, body=None):
    if not key or not key.isascii() or any(ord(c) < 33 or ord(c) > 126 for c in key):
        raise RuntimeError('The API credential contains invalid characters. Re-enter it securely in environment settings.')
    request = urllib.request.Request(
        API + path, data=json.dumps(body).encode() if body is not None else None,
        headers={'x-goog-api-key': key, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(request, timeout=180) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        messages = {400: 'The model or request was rejected.',
                    401: 'The API credential was not accepted.',
                    403: 'Google API access or the environment network policy denied the request.',
                    404: 'The selected model is unavailable.',
                    429: 'Gemini quota or rate limit reached; review Google AI settings.'}
        # Do not print raw server bodies, headers, or key-bearing request objects.
        raise RuntimeError(f'Gemini HTTP {error.code}: {messages.get(error.code, "The service could not complete this request.")}') from None
    except (urllib.error.URLError, TimeoutError):
        raise RuntimeError('Cannot reach Gemini. Check environment network access and try again after it changes.') from None


def get_models(key):
    models, token = [], None
    while True:
        from urllib.parse import urlencode
        path = '/models' + ('?' + urlencode({'pageToken': token}) if token else '')
        response = api_call(path, key)
        models.extend(response.get('models', []))
        token = response.get('nextPageToken')
        if not token:
            return [m for m in models if 'generateContent' in m.get('supportedGenerationMethods', [])]


def choose_model(models, requested):
    names = [m['name'] for m in models]
    if requested:
        selected = requested if requested.startswith('models/') else 'models/' + requested
        if selected not in names:
            raise ValueError('Requested model is not available for generateContent; use --list-models.')
        return selected
    # Prefer the model successfully validated for this project's design reviews.
    if 'models/gemini-3.5-flash' in names:
        return 'models/gemini-3.5-flash'
    # Otherwise use an available stable general-purpose Pro model.
    stable = [n for n in names if re.fullmatch(r'models/gemini-\d+(?:\.\d+)*-pro', n)]
    if not stable:
        raise ValueError('No stable Gemini Pro model was listed. Use --list-models and choose --model explicitly.')
    return max(stable, key=lambda n: tuple(int(x) for x in re.findall(r'\d+', n)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--screenshot', action='append', type=Path, default=[])
    parser.add_argument('--output-dir', type=Path, default=Path('/workspace/catalog-gemini-review'))
    parser.add_argument('--model', default=os.environ.get('GEMINI_MODEL'))
    parser.add_argument('--prepare-only', action='store_true', help='Create review request without network/API calls.')
    parser.add_argument('--list-models', action='store_true')
    args = parser.parse_args()
    if args.prepare_only and args.list_models:
        parser.error('--prepare-only cannot be used with --list-models')
    if args.prepare_only:
        payload = build_request(args.screenshot)
        args.output_dir.mkdir(parents=True, exist_ok=True)
        (args.output_dir / 'request.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2))
        print(f'Prepared request: {args.output_dir / "request.json"} (no API call made)')
        return 0
    key = os.environ.get('GEMINI_API_KEY')
    if not key:
        print('GEMINI_API_KEY is missing. Add it securely in environment settings; do not put it in source code or chat.', file=sys.stderr)
        return 2
    models = get_models(key)
    if args.list_models:
        print('\n'.join(m['name'] for m in models))
        return 0
    selected = choose_model(models, args.model)
    print(f'Requesting UX/UI review from {selected}', flush=True)
    response = api_call('/' + selected + ':generateContent', key, build_request(args.screenshot))
    candidates = response.get('candidates', [])
    candidate = candidates[0] if candidates else {}
    text = '\n\n'.join(p['text'] for p in candidate.get('content', {}).get('parts', []) if 'text' in p and not p.get('thought'))
    if not text.strip():
        raise RuntimeError('Gemini returned no design review text; no successful review was saved.')
    args.output_dir.mkdir(parents=True, exist_ok=True)
    complete = candidate.get('finishReason') == 'STOP'
    filename = 'review.md' if complete else 'review-partial.md'
    (args.output_dir / filename).write_text(text + '\n')
    (args.output_dir / 'metadata.json').write_text(json.dumps({
        'model': selected, 'finishReason': candidate.get('finishReason'),
        'usage': response.get('usageMetadata', {}), 'complete': complete}, indent=2))
    print(f'{"Saved review" if complete else "Incomplete response saved"}: {args.output_dir / filename}')
    print('Review recommendations before implementing; this command does not edit or deploy the app.')
    return 0 if complete else 3


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, ValueError, RuntimeError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
