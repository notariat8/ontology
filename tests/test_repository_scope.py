# SPDX-License-Identifier: AGPL-3.0-or-later
"""Prevent old application branches from reintroducing the editor into the data repo."""
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
class ScopeTests(unittest.TestCase):
    def test_application_paths_are_owned_by_editor8(self):
        forbidden=['editor','Dockerfile','.dockerignore','package.json','playwright.config.mjs','scripts/case_editor.py','scripts/case_editor_model.py','scripts/cloud_editor.py','scripts/github_store.py','scripts/register_github_app.py','scripts/recover_github_app_secret.py','docs/editor-hosting.md','docs/editor-produktstand.md','docs/editor-roadmap.md']
        self.assertEqual([path for path in forbidden if (ROOT/path).exists()],[],'Move software into ontologie8/editor8')
