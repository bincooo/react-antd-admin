import {
	DrawerForm,
	ProFormDatePicker,
	ProFormDigit,
	ProFormRadio,
	ProFormText,
} from "@ant-design/pro-components";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Form, Upload } from "antd";

import { observer, useLocalObservable } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import * as api from "#src/api/system/tenant";
import createState from "../mobx/edit";

interface EditProps {
	pkId?: string | number
	dictMap?: {
		[k: string]: {
			label: string
			value: string
		}[]
	}

	open?: boolean
	onClose?: (refresh?: boolean) => void
}

export default observer(
	({ pkId, open = true, onClose, ...props }: EditProps) => {
		const { t } = useTranslation();
		const [form] = Form.useForm<System.Tenant>();
		const context = useLocalObservable(createState({ id: pkId }));

		/** 加载数据 */
		const [tenant] = useQueries({
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

		/** 创建接口 */
		const createMutation = useMutation({
			mutationFn: async (data: System.Tenant) => {
				const { code, message } = await api.create(data);
				if (code !== 200) {
					window.$message?.error(message);
					throw new Error(message);
				}
			},
		});

		/** 更新接口 */
		const updateMutation = useMutation({
			mutationFn: async (data: System.Tenant) => {
				const { code, message } = await api.update(data);
				if (code !== 200) {
					window.$message?.error(message);
					throw new Error(message);
				}
			},
		});

		const onFinish = async (values: System.Tenant) => {
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
				if (tenant.data) {
					form.setFieldsValue(tenant.data);
					context.update(tenant.data);
					return;
				}
				form.resetFields();
			}
		}, [open, tenant.data]);

		return (
			<DrawerForm<System.Tenant>
				{...props}
				open={open}
				title={pkId ? "编辑租户" : "创建租户"}
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
					name="tenantId"
					label="租户编号"
					placeholder="请输入租户编号"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
					rules={[{ required: true }]}
				/>

				<ProFormText
					name="contactPhone"
					label="联系电话"
					placeholder="请输入联系电话"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
					rules={[{ required: true }]}
				/>

				<ProFormText
					name="companyName"
					label="企业名称"
					placeholder="请输入企业名称"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
					rules={[{ required: true }]}
				/>

				<ProFormText
					name="licenseNumber"
					label="统一社会信用代码"
					placeholder="请输入统一社会信用代码"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
				/>

				<ProFormText
					name="address"
					label="地址"
					placeholder="请输入地址"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
				/>

				<ProFormText
					name="intro"
					label="企业简介"
					placeholder="请输入企业简介"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
				/>

				<ProFormText
					name="domain"
					label="域名"
					placeholder="请输入域名"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
				/>

				<ProFormText
					name="remark"
					label="备注"
					placeholder="请输入备注"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
				/>

				{/* <ProFormText
           name="packageId"
           label="租户套餐编号"
           placeholder="请输入租户套餐编号"
           readonly={context.isDisabled(["insert", "edit"])}
           allowClear={false}
           rules={[{ required: true }]}
          /> */}

				<ProFormDatePicker
					name="expireTime"
					label="过期时间"
					placeholder="请输入过期时间"
					readonly={context.isDisabled(["insert", "edit"])}
				/>

				<ProFormDigit
					name="accountCount"
					label="用户数量"
					placeholder="请输入用户数量"
					readonly={context.isDisabled(["insert", "edit"])}
					min={-1}
				/>

				<ProFormRadio.Group
					name="status"
					label="租户状态"
					radioType="button"
					placeholder="请选择租户状态"
					readonly={context.isDisabled(["insert", "edit"])}
					options={[
						{ value: "0", label: "正常" },
						{ value: "1", label: "停用" },
					]}
				/>
			</DrawerForm>
		);
	},
);
