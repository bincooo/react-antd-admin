import type { Extension } from "@codemirror/state";
import type { LanguageName } from "@uiw/codemirror-extensions-langs";
import type { TreeDataNode, TreeProps } from "antd";

import { CopyOutlined, FileOutlined, FolderOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";

import {
	Button,
	Layout,
	Modal,
	Space,
	Spin,

	theme,
	Tree,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPreviewCodes } from "#src/api/develop/gen";
import { usePreferences } from "#src/hooks/use-preferences";

interface ElementProps {
	id?: string
	open: boolean
	onCloseChange: () => void
}

interface TreeType {
	[key: string]: string | TreeType
}

const langMap: Record<string, LanguageName> = {
	ts: "ts",
	tsx: "tsx",
	vue: "vue",
	json: "json",
	html: "html",
	css: "css",
	less: "less",
	scss: "sass",
	java: "java",
	sql: "sql",
	xml: "xml",
};

function langExtByFilename(filename?: string): Extension | null {
	if (!filename)
		return null;
	const lower = filename.toLowerCase();
	const parts = lower.split(".");
	if (parts.length >= 2 && parts[parts.length - 1] === "vm") {
		const realExt = parts[parts.length - 2];
		const lang = langMap[realExt];
		return loadLanguage(lang);
	}

	const ext = parts.pop()!;
	const lang = langMap[ext];
	return loadLanguage(lang);
}

function convertTreeFile(path: string, value: string, container: TreeType = {}) {
	const parts = path.split("/").filter(Boolean);
	const last = parts.pop() as string;
	let cur = container;
	for (const part of parts) {
		cur[part] ??= {};
		cur = cur[part] as TreeType;
	}

	cur[last] = value;
	return container;
}

function toTreeData(obj: TreeType, defaultKey?: string): [(TreeDataNode & { content?: string })[], string] {
	let content = "";
	const treeData: TreeDataNode[] = Object.entries(obj).map(([title, value]) => {
		if (typeof value === "string") {
			if (defaultKey === title) {
				content = value;
			}
			return {
				key: title,
				title: (
					<Space>
						<FileOutlined />
						{title.replace(".vm", "")}
					</Space>
				),
				isLeaf: true,
				content: value,
			} as TreeDataNode & { content: string };
		}

		const [children, code] = toTreeData(value, defaultKey);
		if (code)
			content = code;
		return {
			key: title,
			title: (
				<Space>
					<FolderOutlined />
					{title}
				</Space>
			),
			selectable: false,
			children,
		};
	});
	return [treeData, content];
}

export default function CodePreview({ id, open, onCloseChange }: ElementProps) {
	const { token } = theme.useToken();
	const [extensions, setExtensions] = useState<Extension[]>([loadLanguage("java") as Extension]);
	const { isDark } = usePreferences();

	const [value, setValue] = useState<string>();
	const handleCopy = useCallback(async () => {
		await navigator.clipboard?.writeText(value ?? "");
		window.$message?.success("已复制");
	}, [value]);

	const { data, isFetching } = useQuery({
		queryKey: [id],
		queryFn: async () => {
			if (!id)
				return;
			const response = await fetchPreviewCodes(id);
			if (response.code !== 200) {
				return;
			}

			let container: TreeType = {};
			const data = response.data;
			for (const key in data) {
				container = convertTreeFile(key, data[key], container);
			}
			return container;
		},
	});

	const { treeData, content } = useMemo(() => {
		const [treeData, content] = toTreeData(data ?? {}, "domain.java.vm");
		return { treeData, content };
	}, [data]);
	useEffect(() => {
		if (content)
			setValue(content);
	}, [content]);

	const [selectedKeys, setSelectedKeys] = useState<React.Key[]>(["domain.java.vm"]);
	const onSelect: TreeProps<TreeDataNode & { content?: string }>["onSelect"] = (_, { node, selected }) => {
		if (!selected)
			return;
		setSelectedKeys([node.key]);
		// 叶子节点
		if (node.isLeaf) {
			const lang = langExtByFilename(node.key as string | undefined);
			setExtensions(lang ? [lang] : []);
		}
		setValue(node.content);
	};

	if (!id) {
		return <span />;
	}

	return (
		isFetching
			? <Spin />
			: (
				<Modal
					width="90%"
					open={open}
					title="生成预览"
					footer={null}
					destroyOnHidden
					onCancel={() => {
						onCloseChange();
					}}
				>
					<Layout style={{ width: "100%", border: `1px solid ${token.colorBorder}` }}>
						<Layout.Sider width="300px" style={{ backgroundColor: token.colorBgContainer, borderRight: `1px solid ${token.colorBorder}` }}>
							<Tree<TreeDataNode & { content?: string }>
								showLine={true}
								defaultExpandedKeys={["domain.java.vm"]}
								selectedKeys={selectedKeys}
								onSelect={onSelect}
								treeData={treeData}
							/>
						</Layout.Sider>
						<Layout>
							<Layout.Content>
								<CodeMirror
									value={value}
									height="75vh"
									readOnly
									theme={isDark ? githubDark : githubLight}
									extensions={extensions}
								>
									{
										!!value
										&& (
											<div style={{ position: "absolute", right: 45, top: 60, zIndex: 10 }}>
												<Button size="small" icon={<CopyOutlined />} onClick={handleCopy} />
											</div>
										)
									}
								</CodeMirror>
							</Layout.Content>
						</Layout>
					</Layout>
				</Modal>
			)
	);
}
