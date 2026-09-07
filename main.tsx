import React from "react";
import {createRoot} from "react-dom/client";
import Editor from "./components/study/editor";
import "./app/globals.css";
createRoot(document.getElementById("root")!).render(<Editor/>);
