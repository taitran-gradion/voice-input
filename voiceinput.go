// SPDX-License-Identifier: BUSL-1.1
// SPDX-FileCopyrightText: 2026 Gradion

// Package voiceinput lets a member dictate into any text field in the app.
// Focusing a field shows a microphone at its edge; pressing it, or Alt+V,
// types what the member says at the cursor, in the app's language.
//
// It is a frontend unit: the browser's own speech recognition does the
// listening, and frontend/ finds the focused field wherever it is drawn, so no
// core screen changes and nothing is stored.
package voiceinput

import "github.com/margince/margince/backend/pkg/extension"

// New returns the unit's declaration: everything it gives core, in one place.
func New() extension.Extension {
	return extension.Extension{
		Name:        "voice-input",
		Version:     "0.1.0",
		Description: "Dictate into any text field: a microphone on the focused field, or Alt+V.",
	}
}
