import type {
	ActionType,
	ProColumns,
	ProCoreActionType,
} from "@ant-design/pro-components";

import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Tag } from "antd";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import * as api from "#src/api/system/role";
import { BasicContent } from "#src/components/basic-content";
import { BasicTable } from "#src/components/basic-table";

import { useAccess } from "#src/hooks/use-access";
import { getColumnList } from "./columns";
import Edit from "./components/edit";

export default function Page() {
	const { t } = useTranslation();
	const { hasPerms } = useAccess();

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

	const [isOpen, setIsOpen] = useState(false);
	const [title, setTitle] = useState("");
	const [item, setItem] = useState<Partial<System.Role>>({});
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const onCloseChange = () => {
		setIsOpen(false);
		setItem({});
	};

	const actionRef = useRef<ActionType>(null);
	const refreshTable = () => {
		actionRef.current?.reload();
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
			title: "确认删除角色信息？",
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

	const columns: ProColumns<System.Role>[] = [
		...getColumnList(t, {
			status: (opts) => {
				// TODO - 自定列
				return opts.map(opt => ({
					...opt,
					label: (
						<Tag
							color={opt.value === "0" ? "success" : "error"}
							children={opt.label}
						/>
					),
				}));
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
					<Button
						key="update"
						type="link"
						size="small"
						disabled={!hasPerms("system:role:update")}
						onClick={() => {
							setItem({ ...record });
							setIsOpen(true);
							setTitle("编辑角色");
						}}
					>
						编辑
					</Button>,
					<Button
						key="delete"
						type="link"
						size="small"
						danger={true}
						disabled={!hasPerms("system:role:delete")}
						onClick={() => {
							handleDeleteRow([record.roleId!]);
						}}
					>
						删除
					</Button>,
				];
			},
		},
	];

	return (
		<BasicContent className="h-full">
			<BasicTable<System.Role>
				adaptive
				rowKey="roleId"
				columns={columns}
				actionRef={actionRef}
				rowSelection={{
					selectedRowKeys,
					onChange: (keys) => {
						setSelectedRowKeys(keys);
					},
				}}
				request={async (params) => {
					const response = await api.page(params);
					return {
						...response,
						data: response.data?.list,
						total: response.data?.total,
					};
				}}
				toolBarRender={() => [
					<Button
						key="delete"
						icon={<DeleteOutlined />}
						danger
						disabled={!hasPerms("system:role:delete")}
						onClick={() => {
							handleDeleteRow([...selectedRowKeys.map(String)]);
						}}
					>
						删除
					</Button>,
					<Button
						key="create"
						icon={<PlusCircleOutlined />}
						type="primary"
						disabled={!hasPerms("system:role:create")}
						onClick={() => {
							setIsOpen(true);
							setTitle("创建角色");
						}}
					>
						新增
					</Button>,
				]}
			/>

			<Edit
				key={item?.roleId}
				title={title}
				roleId={item?.roleId}
				open={isOpen}
				onClose={onCloseChange}
			/>
		</BasicContent>
	);
};
