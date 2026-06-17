/**
 * 代码生成器 - 代码预览弹窗
 * 左侧文件树 + 右侧 Monaco Editor 代码高亮
 */

import type { TreeDataNode, TreeProps } from "antd";
import type { SupportedLanguage } from "#src/components/code-mirror";
import { FileOutlined, FolderOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
	Layout,
	Modal,
	Space,
	Spin,

	theme,
	Tree,
} from "antd";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPreviewCodes } from "#src/api/develop/gen";
import CodeMirrorField from "#src/components/code-mirror";

interface ElementProps {
	/** 表 ID */
	id?: string
	/** 是否显示 */
	open: boolean
	/** 关闭回调 */
	onCloseChange: () => void
}

/** 文件树中间结构 */
interface TreeType {
	[key: string]: string | TreeType
}

/** 文件扩展名 → Monaco 语言映射 */
const langMap: Record<string, SupportedLanguage> = {
	ts: "ts",
	tsx: "tsx",
	vue: "vue",
	json: "json",
	html: "html",
	css: "css",
	less: "less",
	scss: "scss",
	java: "java",
	sql: "sql",
	xml: "xml",
};

/**
 * 根据文件名推断代码语言
 */
function langExtByFilename(filename?: string) {
	if (!filename)
		return;
	const lower = filename.toLowerCase();
	const parts = lower.split(".");
	// Velocity 模板文件，取倒数第二个扩展名
	if (parts.length >= 2 && parts[parts.length - 1] === "vm") {
		return langMap[parts[parts.length - 2]];
	}
	return langMap[parts.pop()!];
}

/**
 * 将路径字符串转换为嵌套树结构
 * 如 "src/main/java/com/example/Demo.java.vm" → 嵌套对象
 */
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

/**
 * 将嵌套树结构转换为 Ant Design Tree 数据格式
 */
function toTreeData(obj: TreeType, defaultKey?: string): [(TreeDataNode & { content?: string })[], string] {
	let content = "";
	const treeData: TreeDataNode[] = Object.entries(obj).map(([title, value]) => {
		// 叶子节点（文件）
		if (typeof value === "string") {
			if (defaultKey === title)
				content = value;
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

		// 目录节点
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

/**
 * 代码预览弹窗
 * @description 左侧显示生成的代码文件树，右侧显示代码内容，支持语法高亮
 */
export default function CodePreview({ id, open, onCloseChange }: ElementProps) {
	const { token } = theme.useToken();
	const [language, setLanguage] = useState<SupportedLanguage>("java");
	const [value, setValue] = useState<string>();
	const [selectedKeys, setSelectedKeys] = useState<React.Key[]>(["domain.java.vm"]);

	/**
	 * 复制代码到剪贴板
	 */
	const handleCopy = async (code: string) => {
		await navigator.clipboard?.writeText(code ?? "");
		window.$message?.success("已复制");
	};

	// 查询代码预览数据
	const { data, isFetching } = useQuery({
		queryKey: [id],
		queryFn: async () => {
			if (!id)
				return;
			const response = await fetchPreviewCodes(id);
			if (response.code !== 200)
				return;

			let container: TreeType = {};
			for (const key in response.data) {
				container = convertTreeFile(key, response.data[key], container);
			}
			return container;
		},
	});

	// 构建树形数据
	const { treeData, content } = useMemo(() => {
		const [t, c] = toTreeData(data ?? {}, "domain.java.vm");
		return { treeData: t, content: c };
	}, [data]);

	useEffect(() => {
		if (content) setValue(content);
	}, [content]);

	/**
	 * 树节点选中处理
	 */
	const onSelect: TreeProps<TreeDataNode & { content?: string }>["onSelect"] = (_, { node, selected }) => {
		if (!selected)
			return;
		setSelectedKeys([node.key]);
		if (node.isLeaf) {
			const lang = langExtByFilename(node.key as string | undefined);
			setLanguage(lang!);
		}
		setValue(node.content);
	};

	if (!id)
		return <span />;

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
					onCancel={() => onCloseChange()}
				>
					<Layout style={{ width: "100%", border: `1px solid ${token.colorBorder}` }}>
						{/* 左侧文件树 */}
						<Layout.Sider width="300px" style={{ backgroundColor: token.colorBgContainer, borderRight: `1px solid ${token.colorBorder}` }}>
							<Tree<TreeDataNode & { content?: string }>
								showLine={true}
								defaultExpandedKeys={["domain.java.vm"]}
								selectedKeys={selectedKeys}
								onSelect={onSelect}
								treeData={treeData}
							/>
						</Layout.Sider>
						{/* 右侧代码编辑器 */}
						<Layout>
							<Layout.Content>
								<CodeMirrorField
									value={value}
									height="75vh"
									language={language ?? "tex"}
									readonly
									onCopy={handleCopy}
									style={{ border: 0 }}
								/>
							</Layout.Content>
						</Layout>
					</Layout>
				</Modal>
			)
	);
}
