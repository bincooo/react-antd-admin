import { CopyOutlined } from "@ant-design/icons";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { sass } from "@codemirror/lang-sass";
import { sql } from "@codemirror/lang-sql";
import { vue } from "@codemirror/lang-vue";
import { xml } from "@codemirror/lang-xml";
import { EditorView } from "@codemirror/view";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { Button, Form, theme } from "antd";
import React, { useEffect, useState } from "react";

import { usePreferences } from "#src/hooks/use-preferences";

export type SupportedLanguage = "js"
  | "javascript"
  | "ts"
  | "tsx"
  | "vue"
  | "json"
  | "html"
  | "css"
  | "less"
  | "scss"
  | "java"
  | "sql"
  | "xml"
  | "tex";

const languageExtensions: Record<SupportedLanguage, any> = {
	js: javascript({ jsx: false }),
	javascript: javascript({ jsx: false }),
	ts: javascript({ typescript: true }),
	tsx: javascript({ typescript: true, jsx: true }),
	vue: vue(),
	json: json(),
	html: html(),
	css: css(),
	less: sass({ indented: false }), // less 语法和 scss 接近，用 sass 模式兼容
	scss: sass({ indented: false }),
	java: java(),
	sql: sql(),
	xml: xml(),
	tex: null,
};

export interface CodeMirrorFieldProps {
	value?: string
	onChange?: (val: string) => void
	readonly?: boolean
	disabled?: boolean
	placeholder?: string
	language?: SupportedLanguage
	height?: string | number
	width?: number | string | "xl" | "lg" | "md" | "sm" | "xs" | undefined
	style?: React.CSSProperties
	onCopy?: (code: string) => void
}

const CodeMirrorField: React.FC<CodeMirrorFieldProps> = ({
	value = "",
	onChange,
	readonly = false,
	disabled = false,
	placeholder = "请输入代码",
	language = "js",
	height = 200,
	width,
	style,
	onCopy,
}) => {
	const [extensions, setExtensions] = useState<any[]>([]);
	const { token } = theme.useToken();

	useEffect(() => {
		const ext = languageExtensions[language];
		const CodeTheme = EditorView.theme({
			"&.cm-focused": { outline: "none" },
			"&": {
				borderRadius: `${token.borderRadius}px`,
			},
			".cm-scroller": {
				borderRadius: `${token.borderRadius}px 0 0 ${token.borderRadius}px`,
			},
			".cm-placeholder": {
				color: token.colorTextPlaceholder,
			},
		});
		setExtensions(ext ? [ext, CodeTheme] : [CodeTheme]);
	}, [token]);
	const [isHovered, setIsHovered] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const { isDark } = usePreferences();

	return (
		<div
			onMouseEnter={() => {
				if (!disabled && !readonly) {
					setIsHovered(true);
				}
			}}
			onMouseLeave={() => setIsHovered(false)}
			style={{
				position: "relative",
				display: "flex",
				flexDirection: "column",
				border: `1px solid ${(isFocused || isHovered) ? token.colorPrimary : token.colorBorder}`,
				boxShadow: isFocused ? `0 0 0 2px ${token.colorPrimaryBg}` : "none",
				transition: "all 0.2s",
				borderRadius: token.borderRadius,
				...style,
			}}
		>
			{onCopy && !!value && (
				<div style={{ position: "absolute", right: 13, top: 13, zIndex: 10 }}>
					<Button size="small" icon={<CopyOutlined />} onClick={() => { onCopy(value); }} />
				</div>
			)}
			<CodeMirror
				value={value}
				onChange={val => onChange?.(val)}
				extensions={extensions}
				placeholder={placeholder}
				height={typeof height === "number" ? `${height}px` : height}
				width={typeof width === "number" ? `${width}px` : width}
				basicSetup={true}
				readOnly={readonly || disabled}
				theme={isDark ? githubDark : githubLight}
				style={{
					borderRadius: `${token.borderRadius}px`,
					cursor: disabled ? "not-allowed" : (readonly ? "default" : "text"),
				}}

				onFocus={() => {
					if (!disabled && !readonly) {
						setIsFocused(true);
					}
				}}
				onBlur={() => setIsFocused(false)}
			/>

			{disabled && (
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: token.colorBgContainerDisabled,
						opacity: 0.6,
						zIndex: 1,
						// 允许遮罩下的滚动
						pointerEvents: "none",
					}}
				/>
			)}
		</div>
	);
};

function ProCodeMirrorField({ width, readonly, placeholder, name, label, required, disabled, language, rules, onChange, fieldProps, ...rest }: {
	name?: string
	label?: string
	fieldProps?: CodeMirrorFieldProps
	placeholder?: string
	disabled?: boolean
	readonly?: boolean
	required?: boolean
	rules?: any[]
	width?: number | string | "xl" | "lg" | "md" | "sm" | "xs" | undefined
	language?: SupportedLanguage
	onChange?: (val: string) => void
}) {
	return (
		<Form.Item label={label} name={name} required={required} rules={rules} {...rest}>
			<CodeMirrorField
				readonly={readonly}
				disabled={disabled}
				width={width}
				placeholder={placeholder}
				language={language}
				onChange={onChange}
				{...fieldProps}
			/>
		</Form.Item>
	);
}

export default CodeMirrorField;
export { ProCodeMirrorField };
