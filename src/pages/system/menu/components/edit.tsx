import { SearchOutlined } from "@ant-design/icons";
import {
	DrawerForm,
	ProFormDigit,
	ProFormRadio,
	ProFormSelect,
	ProFormText,
	ProFormTextArea,
	ProFormTreeSelect,
} from "@ant-design/pro-components";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Form, Modal, Tabs } from "antd";
import { createElement, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import * as api from "#src/api/system/menu";
import { menuIcons } from "#src/icons/menu-icons";

import { handleTree } from "#src/utils/tree";
import iconSelector from "./icons.json"

interface EditProps {
	pkId?: string | number
	menuList: System.Menu[]
	dictMap?: {
		[k: string]: {
			label: string
			value: string
		}[]
	}

	open?: boolean
	onClose?: (refresh?: boolean) => void
}

export default function Edit({
	pkId,
	menuList,
	open = true,
	onClose,
	...props
}: EditProps) {
	const { t } = useTranslation();
	const [form] = Form.useForm<System.Menu>();
	const [iconModalVisable, setIconModalVisable] = useState<boolean>(false);
	const [iconSelected, setIconSelected] = useState<string>();
	const icon = Form.useWatch("icon", form);
	const menuName = Form.useWatch("menuName", form);
	const menuType = Form.useWatch("menuType", form);

	const isDisabled = (command: string[]) => {
		if (command.includes("insert") && !pkId) {
			return false;
		}
		if (command.includes("edit") && pkId) {
			return false;
		}
		return true;
	};

	const [menu] = useQueries({
		queries: [
			{
				queryKey: ["form", pkId],
				queryFn: async () => {
					if (!pkId) {
						return null;
					}
					const { data } = await api.getById(pkId);
					return data;
				},
			},
		],
	});

	const createMutation = useMutation({
		mutationFn: async (data: System.Menu) => {
			const { code, message } = await api.create(data);
			if (code !== 200) {
				window.$message?.error(message);
				throw new Error(message);
			}
		},
	});

	const updateMutation = useMutation({
		mutationFn: async (data: System.Menu) => {
			const { code, message } = await api.update(data);
			if (code !== 200) {
				window.$message?.error(message);
				throw new Error(message);
			}
		},
	});

	const onFinish = async (values: System.Role) => {
		/* 有 id 则为修改，否则为新增 */
		if (pkId) {
			await updateMutation.mutateAsync({ ...form.getFieldsValue(true) });
			window.$message?.success(t("common.updateSuccess"));
		}
		else {
			await createMutation.mutateAsync(values);
			window.$message?.success(t("common.addSuccess"));
		}
		/* 刷新表格 */
		onClose?.(true);
		// 不返回不会关闭弹框
		return true;
	};

	useEffect(() => {
		if (open) {
			if (menu.data) {
				form.setFieldsValue(menu.data);
				return;
			}
			form.resetFields();
		}
	}, [open, menu.data]);

	return (
		<DrawerForm<System.Menu>
			{...props}
			open={open}
			title={pkId ? "编辑菜单权限" : "创建菜单权限"}
			onOpenChange={(visible) => {
				if (visible === false) {
					onClose?.();
				}
			}}
			resize={{
				maxWidth: window.innerWidth * 0.8,
				minWidth: 600,
			}}
			labelCol={{ span: 8 }}
			wrapperCol={{ span: 24 }}
			layout="horizontal"
			form={form}
			autoFocusFirstInput
			drawerProps={{
				destroyOnHidden: true,
			}}
			onFinish={onFinish}
			initialValues={{
				isFrame: "0",
				keepAlive: "1",
				visible: "1",
				status: "0",
			}}
		>
			<ProFormTreeSelect
				name="parentId"
				label="上级菜单"
				placeholder="请输入上级菜单"
				allowClear={false}
				rules={[{ required: true }]}
				disabled={menuType === "F"}
				request={async () => {
					const arr = pkId ? [pkId] : [];
					const data = menuList.filter((i) => {
						if (arr.includes(i.menuId!)) {
							return false;
						}
						if (arr.includes(i.parentId!)) {
							arr.push(i.menuId!);
							return false;
						}
						return true;
					}).map(it => ({
						title: it.menuName?.includes(".") ? t(it.menuName) : it.menuName,
						value: it.menuId,
						parentId: it.parentId,
					}));
					return [{
						title: "根菜单",
						value: "0",
						children: handleTree(data, "value"),
					}];
				}}
			/>
			<ProFormText
				name="menuName"
				label="菜单名称"
				placeholder="请输入菜单名称"
				readonly={isDisabled(["insert", "edit"])}
				allowClear={false}
				rules={[{ required: true }]}
				fieldProps={{
					suffix: <div style={{ color: "gray" }} children={menuName?.includes(".") ? t(menuName) : ""} />,
				}}
			/>

			<ProFormSelect
				allowClear
				name="menuType"
				label="菜单类型"
				placeholder="请选择菜单类型"
				readonly={isDisabled(["insert", "edit"])}
				disabled={!!pkId}
				options={[
					{ value: "M", label: "目录" },
					{ value: "C", label: "菜单" },
					{ value: "F", label: "按钮" },
				]}
				rules={[{ required: true }]}
			/>

			{menuType !== "F" && (
				<ProFormText
					name="path"
					label="路由地址"
					placeholder="请输入路由地址"
					readonly={isDisabled(["insert", "edit"])}
					allowClear={false}
				/>
			)}

			{menuType === "C" && (
				<ProFormText
					name="component"
					label="组件路径"
					placeholder="请输入组件路径"
					readonly={isDisabled(["insert", "edit"])}
					allowClear={false}
				/>
			)}

			{menuType === "C" && (
				<ProFormText
					name="queryParam"
					label="路由参数"
					placeholder="请输入路由参数"
					readonly={isDisabled(["insert", "edit"])}
					allowClear={false}
				/>
			)}

			<ProFormDigit
				name="orderNum"
				label="显示顺序"
				placeholder="请输入显示顺序"
				readonly={isDisabled(["insert", "edit"])}
				allowClear={false}
			/>

			{menuType !== "F" && (
				<ProFormRadio.Group
					name="isFrame"
					label="是否为外链"
					radioType="button"
					placeholder="请选择是否为外链"
					readonly={isDisabled(["insert", "edit"])}
					options={[
						{ value: "1", label: "是" },
						{ value: "0", label: "否" },
					]}
				/>
			)}

			{menuType !== "F" && (
				<ProFormRadio.Group
					name="keepAlive"
					label="是否缓存"
					radioType="button"
					placeholder="请选择是否缓存"
					readonly={isDisabled(["insert", "edit"])}
					options={[
						{ value: "1", label: "缓存" },
						{ value: "0", label: "不缓存" },
					]}
				/>
			)}

			<ProFormRadio.Group
				name="visible"
				label="显示状态"
				radioType="button"
				placeholder="请选择显示状态"
				readonly={isDisabled(["insert", "edit"])}
				options={[
					{ value: "0", label: "显示" },
					{ value: "1", label: "隐藏" },
				]}
			/>

			<ProFormRadio.Group
				name="status"
				label="菜单状态"
				radioType="button"
				placeholder="请选择菜单状态"
				readonly={isDisabled(["insert", "edit"])}
				options={[
					{ value: "0", label: "正常" },
					{ value: "1", label: "停用" },
				]}
			/>

			{["C", "F"].includes(menuType!) && (
				<ProFormText
					name="perms"
					label="权限标识"
					placeholder="请输入权限标识"
					readonly={isDisabled(["insert", "edit"])}
					allowClear={false}
					rules={[{ required: menuType === "F" }]}
				/>
			)}

			{menuType !== "F" && (
				<ProFormText
					name="icon"
					label="菜单图标"
					placeholder="请输入菜单图标"
					readonly={isDisabled(["insert", "edit"])}
					allowClear={true}
					fieldProps={isDisabled(["insert", "edit"])
						? {
							prefix: icon && menuIcons[icon]
								? createElement(menuIcons[icon], {
									style: {
										fontSize: 16,
										border: "1px solid #b1b1b1",
										padding: 2,
										marginRight: 4,
									},
								})
								: <span children="??" />,
						}
						: {
							prefix: icon && menuIcons[icon]
								? createElement(menuIcons[icon], {
									style: {
										fontSize: 16,
										border: "1px solid #b1b1b1",
										padding: 2,
										marginRight: 4,
									},
								})
								: <span children="??" />,
							suffix: (
								<SearchOutlined
									style={{ cursor: "pointer" }}
									onClick={() => {
										setIconSelected(icon);
										setIconModalVisable(true);
									}}
								/>
							),
							readOnly: true,
						}}
				/>
			)}

			<ProFormTextArea
				name="remark"
				label="备注"
				placeholder="请输入备注"
				readonly={isDisabled(["insert", "edit"])}
				allowClear={false}
			/>

			{/* 图标选择窗口 */}
			<Modal
				title="图标选择"
				open={iconModalVisable}
				onOk={() => {
					form.setFieldValue("icon", iconSelected);
					setIconModalVisable(false);
				}}

				onCancel={() => setIconModalVisable(false)}
				width="90%"
				style={{
					maxWidth: "1200px",
				}}
				styles={{
					body: {
						minHeight: 600,
						overflowY: "auto",
					},
				}}
			>
				<Tabs
					defaultActiveKey="0"
					style={{ height: 220 }}
					items={iconSelector.map((item, index) => {
						return {
							label: item.title,
							key: `${index}`,
							children: item.children.map((it) => {
								const Icon = menuIcons[it];
								return (
									<Icon
										key={it}
										style={{
											margin: 5,
											padding: 10,
											border: "1px solid gray",
											borderRadius: 3,
											fontSize: 35,
											backgroundColor: `${iconSelected === it ? "#3877fd" : ""}`,
											color: `${iconSelected === it ? "white" : "#555555"}`,
											cursor: "pointer",
										}}
										onClick={() => {
											setIconSelected(it);
										}}
									/>
								);
							}),
						};
					})}
				/>
			</Modal>
		</DrawerForm>
	);
}
