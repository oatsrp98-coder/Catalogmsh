import base64
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import sys
import tempfile
import struct
import zlib
import unittest
from unittest.mock import patch
import urllib.error

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('gemini_review', ROOT / 'scripts/gemini-review.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
FIXTURE_KEY = 'unit-test-placeholder-not-a-credential'
MODELS = [{'name': 'models/gemini-2.5-pro', 'supportedGenerationMethods': ['generateContent']}]

class ReviewTests(unittest.TestCase):
    def test_sources_image_and_no_credentials(self):
        def chunk(name, data):
            return struct.pack('!I', len(data)) + name + data + struct.pack('!I', zlib.crc32(name + data))
        png = (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('!IIBBBBB', 1, 1, 8, 2, 0, 0, 0))
               + chunk(b'IDAT', zlib.compress(b'\x00\x00\x00\x00')) + chunk(b'IEND', b''))
        with tempfile.TemporaryDirectory() as tmp:
            screenshot = Path(tmp) / 'fixture.png'
            screenshot.write_bytes(png)
            with patch.dict(os.environ, {'GEMINI_API_KEY': FIXTURE_KEY}):
                payload = m.build_request([screenshot])
        raw = json.dumps(payload)
        self.assertNotIn(FIXTURE_KEY, raw)
        parts = payload['contents'][0]['parts']
        for name in m.SOURCE_FILES:
            self.assertTrue(any('Current source file: '+name in p.get('text','') for p in parts))
        inline = next(p['inlineData'] for p in parts if 'inlineData' in p)
        self.assertEqual(inline['mimeType'], 'image/png')
        self.assertEqual(base64.b64decode(inline['data']), png)

    def test_https_header_not_query_or_payload(self):
        response = io.BytesIO(b'{"models": []}')
        with patch.object(m.urllib.request, 'urlopen', return_value=response) as mock:
            m.api_call('/models', FIXTURE_KEY)
        request = mock.call_args.args[0]
        self.assertEqual(request.full_url, 'https://generativelanguage.googleapis.com/v1beta/models')
        self.assertEqual(request.get_header('X-goog-api-key'), FIXTURE_KEY)
        self.assertNotIn(FIXTURE_KEY, request.full_url)
        self.assertIsNone(request.data)
        with patch.object(m.urllib.request, 'urlopen', return_value=io.BytesIO(b'{}')) as mock:
            m.api_call('/models/gemini-2.5-pro:generateContent', FIXTURE_KEY, {'contents': []})
        request = mock.call_args.args[0]
        self.assertEqual(request.get_method(), 'POST')
        self.assertNotIn(FIXTURE_KEY.encode(), request.data)

    def test_error_redaction(self):
        error = urllib.error.HTTPError('https://example.invalid', 403, FIXTURE_KEY, {}, io.BytesIO(FIXTURE_KEY.encode()))
        with patch.object(m.urllib.request, 'urlopen', side_effect=error):
            with self.assertRaises(RuntimeError) as raised:
                m.api_call('/models', FIXTURE_KEY)
        self.assertIn('HTTP 403', str(raised.exception))
        self.assertNotIn(FIXTURE_KEY, str(raised.exception))

    def test_malformed_credentials_rejected_without_leak_or_network(self):
        for bad in ['\n', '\r', '\t', ' ', '\x01', '\x7f', 'ก']:
            malformed = FIXTURE_KEY + bad
            with self.subTest(character=repr(bad)):
                stdout, stderr = io.StringIO(), io.StringIO()
                with patch.object(m.urllib.request, 'urlopen') as mock, contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
                    with self.assertRaises(RuntimeError) as raised:
                        m.api_call('/models', malformed)
                mock.assert_not_called()
                self.assertNotIn(FIXTURE_KEY, str(raised.exception) + stdout.getvalue() + stderr.getvalue())

    def test_model_selection_and_membership(self):
        models = [{'name': n} for n in ['models/gemini-2.9-pro','models/gemini-2.10-pro','models/gemini-3.0-pro-preview','models/gemini-3.0-flash']]
        self.assertEqual(m.choose_model(models, None), 'models/gemini-2.10-pro')
        self.assertEqual(m.choose_model(models + [{'name': 'models/gemini-3.5-flash'}], None), 'models/gemini-3.5-flash')
        self.assertEqual(m.choose_model(models, 'gemini-3.0-flash'), 'models/gemini-3.0-flash')
        with self.assertRaises(ValueError): m.choose_model(models, 'gemini-unavailable')
        with self.assertRaises(ValueError): m.choose_model([{'name':'models/gemini-3.0-pro-preview'}], None)

    def test_list_pagination_filters_methods(self):
        responses = [
            {'models':[{'name':'models/embedding','supportedGenerationMethods':['embedContent']}], 'nextPageToken':'a+b'},
            {'models':MODELS},
        ]
        with patch.object(m, 'api_call', side_effect=responses) as mock:
            self.assertEqual(m.get_models(FIXTURE_KEY), MODELS)
        self.assertEqual(mock.call_args_list[1].args[0], '/models?pageToken=a%2Bb')

    def test_missing_key_no_network(self):
        with patch.dict(os.environ, {}, clear=True), patch.object(sys, 'argv', ['gemini-review.py']), patch.object(m, 'api_call') as mock, contextlib.redirect_stderr(io.StringIO()):
            self.assertEqual(m.main(), 2)
        mock.assert_not_called()

    def run_response(self, finish, output):
        response = {'candidates':[{'finishReason':finish, 'content':{'parts':[{'text':'private reasoning','thought':True},{'text':'Design review fixture'}]}}], 'usageMetadata':{'totalTokenCount':12}}
        with patch.dict(os.environ, {'GEMINI_API_KEY':FIXTURE_KEY}, clear=True), patch.object(sys, 'argv', ['gemini-review.py','--output-dir',str(output)]), patch.object(m,'get_models',return_value=MODELS), patch.object(m,'api_call',return_value=response), contextlib.redirect_stdout(io.StringIO()):
            return m.main()

    def test_complete_and_partial_semantics(self):
        with tempfile.TemporaryDirectory() as tmp:
            out=Path(tmp)
            self.assertEqual(self.run_response('STOP',out),0)
            self.assertEqual((out/'review.md').read_text(),'Design review fixture\n')
            self.assertTrue(json.loads((out/'metadata.json').read_text())['complete'])
        with tempfile.TemporaryDirectory() as tmp:
            out=Path(tmp)
            self.assertEqual(self.run_response('MAX_TOKENS',out),3)
            self.assertEqual((out/'review-partial.md').read_text(),'Design review fixture\n')
            self.assertFalse((out/'review.md').exists())
            self.assertFalse(json.loads((out/'metadata.json').read_text())['complete'])

    def test_prepare_only_no_network_or_credentials(self):
        with tempfile.TemporaryDirectory() as tmp:
            with patch.dict(os.environ, {'GEMINI_API_KEY': FIXTURE_KEY}, clear=True), patch.object(sys,'argv',['gemini-review.py','--prepare-only','--output-dir',tmp]), patch.object(m,'api_call') as mock, contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(m.main(),0)
            mock.assert_not_called()
            self.assertNotIn(FIXTURE_KEY,(Path(tmp)/'request.json').read_text())

if __name__=='__main__': unittest.main(verbosity=2)
