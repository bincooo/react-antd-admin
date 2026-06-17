import type {
	ActionType,
	ProColumns,
	ProCoreActionType,
} from "@ant-design/pro-components";
import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Tag } from "antd";
import { createElement, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import * as api from "#src/api/system/menu";
import { BasicContent } from "#src/components/basic-content";
import { BasicTable } from "#src/components/basic-table";
import PermissionButton from "#src/components/permission-button";
import { menuIcons } from "#src/icons/menu-icons";

import { handleTree } from "#src/utils/tree";
import { getColumnList } from "./columns";
import Edit from "./components/edit";

export default function Page() {
	const { t } = useTranslation();

	const deleteMutation = useMutation({
		mutationFn: async (ids: (string | number)[]) => {
			const { code, message } = await api.deleteByIds(ids);
			if (code !== 200) {
				window.$message?.error(message);
				throw new Error(message);
			}
			return true;
		},
	});

	const [editVisible, setEditVisible] = useState(false);
	const [editId, setEditId] = useState<string | number>();
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const [menuList, setMenuList] = useState<System.Menu[]>([]);

	const actionRef = useRef<ActionType>(null);
	const refreshTable = () => {
		actionRef.current?.reload();
	};

	const onCloseChange = (refresh?: boolean) => {
		setEditVisible(false);
		setEditId(undefined);
		if (refresh) {
			refreshTable();
		}
	};

	const handleDeleteRow = async (
		ids: Array<string | number>,
		action?: ProCoreActionType<object>,
	) => {
		if (!ids || ids.length === 0) {
			window.$message?.error("请选择要删除的行");
			return;
		}

		window.$modal?.confirm({
			title: "确认删除菜单权限？",
			content: "此操作不可恢复",
			onOk: async () => {
				const ok = await deleteMutation.mutateAsync(ids);
				if (!ok)
					return;

				if (action?.reload) {
					await action.reload();
				}
				else {
					refreshTable();
					setSelectedRowKeys([]);
				}
			},
		});
	};

	const columns: ProColumns<System.Menu>[] = [
		...getColumnList(t, {
			menuName: (column) => {
				// TODO - 自定列
				return {
					...column,
					render(text) {
						if (typeof text === "string" && text.includes(".")) {
							return t(text);
						}
						return text;
					},
				};
			},
			status: (column) => {
				return {
					...column,
					render(text) {
						return (
							<Tag color={text === "1" ? "error" : "success"} children={text} />
						);
					},
				};
			},
			icon: (column) => {
				return {
					...column,
					render(text) {
						return typeof (text) === "string" && menuIcons[text]
							? createElement(menuIcons[text], {
								style: {
									fontSize: 18,
								},
							})
							: text;
					},
				};
			},
		}),
		{
			title: "工具栏",
			valueType: "option",
			key: "option",
			minWidth: 120,
			fixed: "right",
			disable: true,
			render: (node, record) => {
				return [
					<PermissionButton
						key="update"
						type="link"
						size="small"
						perm="system:menu:update"
						onClick={() => {
							setEditId(record.menuId);
							setEditVisible(true);
						}}
					>
						编辑
					</PermissionButton>,
					<PermissionButton
						key="delete"
						type="link"
						size="small"
						danger={true}
						perm="system:menu:delete"
						onClick={() => {
							handleDeleteRow([record.menuId!]);
						}}
					>
						删除
					</PermissionButton>,
				];
			},
		},
	];

	return (
		<BasicContent className="h-full">
			<BasicTable<System.Menu>
				adaptive
				rowKey="menuId"
				columns={columns}
				actionRef={actionRef}
				pagination={false}
				rowSelection={{
					selectedRowKeys,
					checkStrictly: false,
					preserveSelectedRowKeys: true,
					onChange: (keys) => {
						setSelectedRowKeys(keys);
					},
				}}
				request={async (params) => {
					const { code, data, message } = await api.page({ ...params, pageNum: params.current });
					if (code === 200) {
						setMenuList(data.filter(it => it.menuType !== "F"));
					}
					return {
						code,
						message,
						data: handleTree(data, "menuId"),
					};
				}}
				toolBarRender={() => [
					<PermissionButton
						key="delete"
						icon={<DeleteOutlined />}
						danger
						perm="system:menu:delete"
						onClick={() => {
							handleDeleteRow([...selectedRowKeys.map(String)]);
						}}
					>
						删除
					</PermissionButton>,
					<PermissionButton
						key="create"
						icon={<PlusCircleOutlined />}
						type="primary"
						perm="system:menu:create"
						onClick={() => {
							setEditVisible(true);
						}}
					>
						新增
					</PermissionButton>,
				]}
			/>

			<Edit
				key={editId}
				pkId={editId}
				menuList={menuList}
				open={editVisible}
				onClose={onCloseChange}
			/>
		</BasicContent>
	);
}
