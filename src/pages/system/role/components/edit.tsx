import type { MenuTreeRef } from "./menu-tree";
import {
	DrawerForm,
	ProFormDigit,
	ProFormRadio,
	ProFormSelect,
	ProFormText,
	ProFormTextArea,
} from "@ant-design/pro-components";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Divider, Form } from "antd";
import { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";
import { getRoleMenuTree } from "#src/api/develop/gen";
import * as api from "#src/api/system/role";
import MenuTree from "./menu-tree";

interface EditProps {
	title?: string
	roleId?: string | number
	dictMap?: {
		[k: string]: {
			label: string
			value: string
		}[]
	}

	open?: boolean
	onClose?: (refresh?: boolean) => void
}

export default function Edit({ roleId, open = true, onClose, ...props }: EditProps) {
	const { t } = useTranslation();
	const [form] = Form.useForm<System.Role>();
	const treeRef = useRef<MenuTreeRef>(null);

	const isDisabled = (command: string[]) => {
		if (command.includes("insert") && !roleId) {
			return false;
		}
		if (command.includes("edit") && roleId) {
			return false;
		}
		return true;
	};

	const [roleData, menuList] = useQueries({
		queries: [
			{
				queryKey: ["role", roleId],
				queryFn: async () => {
					if (!roleId) {
						return null;
					}
					const { data } = await api.getById(roleId);
					return data;
				},
			},
			{
				queryKey: ["menu"],
				queryFn: async () => {
					return (await getRoleMenuTree(roleId ?? "-1"))?.data;
				},
			},
		],
	});

	const createMutation = useMutation({
		mutationFn: async (data: System.Role & { menuIds?: number[] }) => {
			const { code, message } = await api.create(data);
			if (code !== 200) {
				window.$message?.error(message);
				throw new Error(message);
			}
		},
	});

	const updateMutation = useMutation({
		mutationFn: async (data: System.Role & { menuIds?: number[] }) => {
			const { code, message } = await api.update(data);
			if (code !== 200) {
				window.$message?.error(message);
				throw new Error(message);
			}
		},
	});

	const onFinish = async (values: System.Role) => {
		const menuIds = treeRef.current?.getSelectedMenuKeys();
		/* 有 id 则为修改，否则为新增 */
		if (roleId) {
			await updateMutation.mutateAsync({ ...form.getFieldsValue(true), menuIds, menuCheckStrictly: false });
			window.$message?.success(t("common.updateSuccess"));
		}
		else {
			await createMutation.mutateAsync({ ...values, menuIds, menuCheckStrictly: false });
			window.$message?.success(t("common.addSuccess"));
		}
		/* 刷新表格 */
		onClose?.(true);
		// 不返回不会关闭弹框
		return true;
	};

	useEffect(() => {
		if (open) {
			if (roleData.data) {
				form.setFieldsValue(roleData.data);
				return;
			}
			form.resetFields();
		}
	}, [open, roleData.data]);

	return (
		<DrawerForm<System.Role>
			{...props}
			open={open}
			onOpenChange={(visible) => {
				if (visible === false) {
					onClose?.();
				}
			}}
			resize={{
				maxWidth: window.innerWidth * 0.8,
				minWidth: 800,
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
				status: "0",
			}}
		>
			<Divider titlePlacement="start" plain>基础设置</Divider>
			<ProFormText
				name="roleName"
				label="角色名称"
				placeholder="请输入角色名称"
				readonly={isDisabled(["insert", "edit"])}
				allowClear={false}
				rules={[
					{ required: true },
				]}
			/>
			<ProFormText
				name="roleKey"
				label="权限字符"
				placeholder="请输入权限字符"
				readonly={isDisabled(["insert"])}
				allowClear={false}
				rules={[
					{ required: true },
				]}
			/>
			<ProFormDigit
				name="roleSort"
				label="显示顺序"
				placeholder="请输入显示顺序"
				readonly={isDisabled(["insert", "edit"])}
				allowClear={false}
				rules={[
					{ required: true },
				]}
			/>
			<ProFormSelect
				allowClear
				name="dataScope"
				label="数据范围"
				placeholder="请选择数据范围"
				readonly={isDisabled(["insert", "edit"])}
				options={[
					{ value: "1", label: "全部数据权限" },
					{ value: "2", label: "自定数据权限" },
					{ value: "3", label: "本部门数据权限" },
					{ value: "4", label: "本部门及以下数据权限" },
					{ value: "5", label: "仅本人数据权限" },
					{ value: "6", label: "部门及以下或本人数据权限" },
				]}
			/>
			<ProFormRadio.Group
				name="status"
				label="角色状态"
				radioType="button"
				placeholder="请选择角色状态"
				readonly={isDisabled(["insert", "edit"])}
				allowClear={false}
				rules={[
					{ required: true },
				]}
				options={[
					{ value: "0", label: "正常" },
					{ value: "1", label: "停用" },
				]}
			/>
			<ProFormTextArea
				name="remark"
				label="备注"
				placeholder="请输入备注"
				readonly={isDisabled(["insert", "edit"])}
				allowClear={false}
			/>
			<Divider titlePlacement="start" plain>权限设置</Divider>
			<MenuTree ref={treeRef} menuData={menuList.data} />
		</DrawerForm>
	);
};
