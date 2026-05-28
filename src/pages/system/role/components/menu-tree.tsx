import type { TableColumnsType } from "antd";
import type { Ref } from "react";
import { CaretDownOutlined, CaretRightOutlined } from "@ant-design/icons";
import { Checkbox, Table, Tag } from "antd";
import { useImperativeHandle, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface MenuTreeProps {
	menuData?: {
		menus: Develop.MenuTree[]
		checkedKeys: number[]
	}
}

export interface MenuTreeRef {
	getSelectedMenuKeys: () => number[]
}

function extractMenuList(menus: Develop.MenuTree[]) {
	const dfs = (nodes: Develop.MenuTree[]) => {
		const res: Develop.MenuTree[] = [];
		for (let i = nodes.length - 1; i >= 0; i--) {
			const n = nodes[i];
			if (n.menuType === "F") {
				continue;
			}

			res.push(n);
			if (Array.isArray(n.children) && n.children.length) {
				n.children = dfs(n.children);
			}
		}
		return res;
	};
	return dfs(menus);
}

function extractPermList(menus: Develop.MenuTree[]) {
	const res: Develop.MenuTree[] = [];
	const dfs = (nodes: Develop.MenuTree[]) => {
		for (let i = nodes.length - 1; i >= 0; i--) {
			const n = nodes[i];
			if (n.menuType === "F") {
				res.push(n);
				continue;
			}

			if (Array.isArray(n.children) && n.children.length) {
				dfs(n.children);
			}
		}
	};
	dfs(menus);
	return res;
}

export default function MenuTree({ menuData, ref }: MenuTreeProps & { ref?: Ref<MenuTreeRef> }) {
	const { t } = useTranslation();
	const permList = useMemo(
		() => extractPermList(menuData?.menus ?? []),
		[menuData?.menus],
	);
	const data = useMemo(
		() => extractMenuList(menuData?.menus ?? []),
		[menuData?.menus],
	);

	// 1) 从 props 推导“初始选中”（不落地到 state）
	const derivedSelected = useMemo(() => {
		const checked = menuData?.checkedKeys ?? [];
		const permIdSet = new Set(permList.map(p => p.id));

		return {
			permKeys: checked.filter(k => permIdSet.has(k)),
			menuKeys: checked.filter(k => !permIdSet.has(k)),
		};
	}, [menuData?.checkedKeys, permList]);

	// 2) dirty=false 时用 derived；dirty=true 时用本地 state
	const [dirty, setDirty] = useState(false);
	const [selectedMenuKeys, setSelectedMenuKeys] = useState<number[]>([]);
	const [selectedPermKeys, setSelectedPermKeys] = useState<number[]>([]);

	const effectiveMenuKeys = dirty ? selectedMenuKeys : derivedSelected.menuKeys;
	const effectivePermKeys = dirty ? selectedPermKeys : derivedSelected.permKeys;

	useImperativeHandle(
		ref,
		() => ({
			getSelectedMenuKeys() {
				return [...effectiveMenuKeys, ...effectivePermKeys].map(Number);
			},
		}),
		[effectiveMenuKeys, effectivePermKeys],
	);

	const permsByid = useMemo(() => {
		const map = new Map<number, number[]>();
		permList.forEach((perm: any) => {
			const arr = map.get(perm.parentId) ?? [];
			arr.push(perm.id);
			map.set(perm.parentId, arr);
		});
		return map;
	}, [permList]);

	const columns: TableColumnsType<Develop.MenuTree> = [
		{
			title: "菜单",
			dataIndex: "label",
			key: "label",
			width: "35%",
			render: value => (value.includes(".") ? t(value) : value),
		},
		{
			title: "类别",
			dataIndex: "menuType",
			key: "menuType",
			width: 80,
			render: value => (value === "M" ? "目录" : "菜单"),
		},
		{
			title: "权限符号",
			render: (_, record) => {
				return permList
					.filter((it: any) => it.parentId === record.id)
					.map((it: any) => (
						<Tag key={it.id} variant="outlined" style={{ margin: 5 }}>
							<Checkbox
								checked={effectivePermKeys.includes(it.id)}
								children={it.label.includes(".") ? t(it.label) : it.label}
								onChange={(e) => {
									const checked = e.target.checked;

									// 基于“当前有效值”计算 next（不依赖 effect 同步）
									const permSet = new Set(effectivePermKeys);
									checked ? permSet.add(it.id) : permSet.delete(it.id);

									const menuSet = new Set(effectiveMenuKeys);
									if (checked)
										menuSet.add(record.id as number);

									setDirty(true);
									setSelectedPermKeys([...permSet]);
									setSelectedMenuKeys([...menuSet]);
								}}
							/>
						</Tag>
					));
			},
		},
	];

	return (
		<Table<Develop.MenuTree>
			rowKey="id"
			className="tree-line-table"
			columns={columns}
			rowSelection={{
				selectedRowKeys: effectiveMenuKeys,
				checkStrictly: false,
				onChange: (nextMenuKeys) => {
					const nextMenus = nextMenuKeys.map(Number);
					const prevMenus = effectiveMenuKeys.map(Number);

					const prevMenuSet = new Set(prevMenus);
					const nextMenuSet = new Set(nextMenus);

					const removedMenus = [...prevMenuSet].filter(k => !nextMenuSet.has(k));
					const addedMenus = [...nextMenuSet].filter(k => !prevMenuSet.has(k));

					const permSet = new Set(effectivePermKeys.map(Number));

					// 取消选中：清掉该行(父节点)下所有权限
					removedMenus.forEach((mid) => {
						(permsByid.get(mid) ?? []).forEach(pid => permSet.delete(pid));
					});

					// 选中：勾选该行(父节点)下所有权限（如不需要可删）
					addedMenus.forEach((mid) => {
						(permsByid.get(mid) ?? []).forEach(pid => permSet.add(pid));
					});

					setDirty(true);
					setSelectedMenuKeys(nextMenus);
					setSelectedPermKeys([...permSet]);
				},
			}}
			dataSource={data}
			size="small"
			pagination={false}
			expandable={{
				expandIcon: ({ expanded, onExpand, record }) => {
					const hasChildren
						= Array.isArray((record as any).children) && (record as any).children.length > 0;

					if (!hasChildren)
						return <span style={{ display: "inline-block", width: 16, margin: 12 }} />;

					return (
						<span
							onClick={(e) => {
								onExpand(record, e);
								e.stopPropagation();
							}}
							style={{ display: "inline-flex", width: 16, cursor: "pointer", margin: 12 }}
						>
							{expanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
						</span>
					);
				},
				indentSize: 18,
			}}
		/>
	);
};
