import React from "react";
import { createRoot } from "react-dom/client";

import i18n from "./language/i18n";
import { applyLanguageToDocument, getInitialLanguage } from "./language/runtime";
import App from "./App";

const initialLanguage = getInitialLanguage();
applyLanguageToDocument(initialLanguage);
void i18n.changeLanguage(initialLanguage);

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);