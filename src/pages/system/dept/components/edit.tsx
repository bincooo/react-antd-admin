import {
	DrawerForm,
	ProFormDigit,
	ProFormRadio,
	ProFormText,
	ProFormTreeSelect,
} from "@ant-design/pro-components";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Form } from "antd";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as api from "#src/api/system/dept";
import ModalSearch from "#src/components/modal-search";
import { handleTree } from "#src/utils/tree";

interface EditProps {
	title?: string
	deptId?: string | number
	deptList: System.Dept[]
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
	deptId,
	deptList,
	open = true,
	onClose,
	...props
}: EditProps) {
	const { t } = useTranslation();
	const [form] = Form.useForm<System.Dept>();
	const isDisabled = (command: string[]) => {
		if (command.includes("insert") && !deptId) {
			return false;
		}
		if (command.includes("edit") && deptId) {
			return false;
		}
		return true;
	};

	const [deptData] = useQueries({
		queries: [
			{
				queryKey: ["form", deptId],
				queryFn: async () => {
					if (!deptId) {
						return null;
					}
					const { data } = await api.getById(deptId);
					return data;
				},
			},
		],
	});

	const createMutation = useMutation({
		mutationFn: async (data: System.Dept) => {
			const { code, message } = await api.create(data);
			if (code !== 200) {
				window.$message?.error(message);
				throw new Error(message);
			}
		},
	});

	const updateMutation = useMutation({
		mutationFn: async (data: System.Dept) => {
			const { code, message } = await api.update(data);
			if (code !== 200) {
				window.$message?.error(message);
				throw new Error(message);
			}
		},
	});

	const onFinish = async (values: System.Role) => {
		/* 有 id 则为修改，否则为新增 */
		if (deptId) {
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
			if (deptData.data) {
				form.setFieldsValue(deptData.data);
				return;
			}
			form.resetFields();
		}
	}, [open, deptData.data]);

	return (
		<DrawerForm<System.Dept>
			{...props}
			open={open}
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
				status: "0",
				parentId: 0,
			}}
		>
			<ProFormTreeSelect
				name="parentId"
				label="上级菜单"
				placeholder="请输入上级菜单"
				allowClear={false}
				rules={[{ required: true }]}
				request={async () => {
					const arr = deptId ? [deptId] : [];
					const data = deptList
						?.filter((i) => {
							if (arr.includes(i.deptId!)) {
								return false;
							}
							if (arr.includes(i.parentId!)) {
								arr.push(i.deptId!);
								return false;
							}
							return true;
						})
						.map(it => ({
							title: it.deptName?.includes(".") ? t(it.deptName) : it.deptName,
							value: it.deptId,
							parentId: it.parentId,
						}));
					return [
						{
							title: "根部门",
							value: "0",
							children: handleTree(data, "value"),
						},
					];
				}}
			/>

			<ProFormText
				name="deptName"
				label="部门名称"
				placeholder="请输入部门名称"
				readonly={isDisabled(["insert", "edit"])}
				allowClear={false}
				required={true}
			/>

			<ProFormText
				name="deptCategory"
				label="部门类别编码"
				placeholder="请输入部门类别编码"
				readonly={isDisabled(["insert", "edit"])}
				allowClear={false}
			/>

			<ProFormDigit
				name="orderNum"
				label="显示顺序"
				placeholder="请输入显示顺序"
				readonly={isDisabled(["insert", "edit"])}
			/>

			<Form.Item label="负责人" name="leader" required={true}>
				<ModalSearch
					searchId="2062586130975002626"
					title="请选择负责人"
					placeholder="请输入负责人"
					readonly={isDisabled(["insert", "edit"])}
				/>
			</Form.Item>

			<ProFormText
				name="phone"
				label="联系电话"
				placeholder="请输入联系电话"
				readonly={isDisabled(["insert", "edit"])}
				allowClear={false}
			/>

			<ProFormText
				name="email"
				label="邮箱"
				placeholder="请输入邮箱"
				readonly={isDisabled(["insert", "edit"])}
				allowClear={false}
			/>

			<ProFormRadio.Group
				name="status"
				label="部门状态"
				radioType="button"
				placeholder="请选择部门状态"
				readonly={isDisabled(["insert", "edit"])}
				options={[
					{ value: "0", label: "正常" },
					{ value: "1", label: "停用" },
				]}
			/>
		</DrawerForm>
	);
}
