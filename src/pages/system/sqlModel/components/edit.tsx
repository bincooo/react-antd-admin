import {
	DrawerForm,
	ProFormSelect,
	ProFormText,
	ProFormTextArea,
} from "@ant-design/pro-components";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Form, Upload } from "antd";

import { observer, useLocalObservable } from "mobx-react-lite";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

import * as api from "#src/api/system/sqlModel";
import { ProCodeMirrorField } from "#src/components/code-mirror";
import createState from "../mobx/edit";

interface EditProps {
	title?: string
	id?: string | number
	dictMap?: {
		[k: string]: {
			label: string
			value: string
		}[]
	}

	open?: boolean
	onClose?: (refresh?: boolean) => void
}

export default observer(({ id, open = true, onClose, ...props }: EditProps) => {
	const { t } = useTranslation();
	const [form] = Form.useForm<System.SqlModel>();
	const context = useLocalObservable(createState({ id }));

	/** 加载数据 */
	const [sqlModelData] = useQueries({
		queries: [
			{
				queryKey: ["form", id],
				queryFn: async () => {
					if (!id) {
						return null;
					}
					const { data } = await api.getById(id);
					return data;
				},
			},
		],
	});

	/** 创建接口 */
	const createMutation = useMutation({
		mutationFn: async (data: System.SqlModel) => {
			const { code, message } = await api.create(data);
			if (code !== 200) {
				window.$message?.error(message);
				throw new Error(message);
			}
		},
	});

	/** 更新接口 */
	const updateMutation = useMutation({
		mutationFn: async (data: System.SqlModel) => {
			const { code, message } = await api.update(data);
			if (code !== 200) {
				window.$message?.error(message);
				throw new Error(message);
			}
		},
	});

	const onFinish = async (values: System.SqlModel) => {
		/* 有 id 则为修改，否则为新增 */
		if (id) {
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
			if (sqlModelData.data) {
				form.setFieldsValue(sqlModelData.data);
				context.update(sqlModelData.data);
				return;
			}
			form.resetFields();
		}
	}, [open, sqlModelData.data]);

	return (
		<DrawerForm<System.SqlModel>
			{...props}
			open={open}
			onValuesChange={changed => context.update(changed)}
			onOpenChange={(visible) => {
				if (visible === false) {
					onClose?.();
				}
			}}
			width="600px"
			resize={true}
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
			<ProFormText
				name="name"
				label="模型名称"
				placeholder="请输入模型名称"
				readonly={context.isDisabled(["insert", "edit"])}
				allowClear={false}
				rules={[
					{ required: true },
				]}
			/>
			<ProFormSelect
				name="javaType"
				label="主键类型"
				placeholder="请选择主键类型"
				readonly={context.isDisabled(["insert", "edit"])}
				allowClear={false}
				rules={[
					{ required: true },
				]}
				options={[
					{ value: "0", label: "数值" },
					{ value: "1", label: "字符" },
				]}
			/>
			<ProCodeMirrorField
				name="sqlText"
				label="sql语句"
				placeholder="请输入sql语句"
				readonly={context.isDisabled(["insert", "edit"])}
				language="javascript"
				rules={[
					{ required: true },
				]}
			/>
			<ProFormTextArea
				name="remark"
				label="描述"
				placeholder="请输入描述"
				readonly={context.isDisabled(["insert", "edit"])}
				allowClear={false}
			/>
		</DrawerForm>
	);
});
