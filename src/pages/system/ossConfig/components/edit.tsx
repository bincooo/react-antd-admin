import {
	DrawerForm,
	ProFormRadio,
	ProFormText,
	ProFormTextArea,
} from "@ant-design/pro-components";
import { useMutation, useQueries } from "@tanstack/react-query";
import { Divider, Form, Input, Select } from "antd";

import { observer, useLocalObservable } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import * as api from "#src/api/system/ossConfig";
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
		const [form] = Form.useForm<System.OssConfig>();
		const context = useLocalObservable(createState({ ossConfigId: pkId }));

		/** 加载数据 */
		const [ossConfig] = useQueries({
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
			mutationFn: async (data: System.OssConfig) => {
				const { code, message } = await api.create(data);
				if (code !== 200) {
					window.$message?.error(message);
					throw new Error(message);
				}
			},
		});

		/** 更新接口 */
		const updateMutation = useMutation({
			mutationFn: async (data: System.OssConfig) => {
				const { code, message } = await api.update(data);
				if (code !== 200) {
					window.$message?.error(message);
					throw new Error(message);
				}
			},
		});

		const onFinish = async (values: System.OssConfig) => {
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
				if (ossConfig.data) {
					form.setFieldsValue(ossConfig.data);
					context.update(ossConfig.data);
					return;
				}
				form.resetFields();
			}
		}, [open, ossConfig.data]);

		return (
			<DrawerForm<System.OssConfig>
				{...props}
				open={open}
				title={pkId ? "编辑对象存储配置" : "创建对象存储配置"}
				onValuesChange={changed => context.update(changed)}
				onOpenChange={(visible) => {
					if (visible === false) {
						onClose?.();
					}
				}}
				width="800px"
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
				<Divider plain titlePlacement="left">
					基本信息
				</Divider>

				<ProFormText
					name="configKey"
					label="配置名称"
					placeholder="请输入配置key"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
					rules={[{ required: true }]}
				/>

				<Form.Item label="访问站点" required>
					<Input.Group compact style={{ display: "flex", width: "100%" }}>
						<Form.Item name="isHttps" noStyle>
							<Select
								style={{ width: 100 }}
								options={[
									{ value: "Y", label: "https://" },
									{ value: "N", label: "http://" },
								]}
								defaultValue="N"
							/>
						</Form.Item>

						<Form.Item name="endpoint" noStyle rules={[{ required: true }]}>
							<Input style={{ flex: 1 }} placeholder="请输入访问站点" />
						</Form.Item>
					</Input.Group>
				</Form.Item>
				<ProFormText
					name="domain"
					label="自定义域名"
					placeholder="请输入自定义域名"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
				/>

				<Divider plain titlePlacement="left">
					认证信息
				</Divider>

				<ProFormText
					name="accessKey"
					label="accessKey"
					placeholder="请输入accessKey"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
				/>

				<ProFormText
					name="secretKey"
					label="secretKey"
					placeholder="请输入秘钥 secretKey"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
				/>

				<Divider plain titlePlacement="left">
					其它信息
				</Divider>

				<ProFormText
					name="bucketName"
					label="桶名称"
					placeholder="请输入桶名称"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
					rules={[{ required: true }]}
				/>

				<ProFormText
					name="prefix"
					label="前缀"
					placeholder="请输入前缀"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
				/>

				<ProFormRadio.Group
					name="accessPolicy"
					label="桶权限类型"
					radioType="button"
					placeholder="请选择桶权限类型"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
					rules={[{ required: true }]}
					options={[
						{ value: "0", label: "private" },
						{ value: "1", label: "public" },
						{ value: "2", label: "custom" },
					]}
				/>

				<ProFormText
					name="region"
					label="域"
					placeholder="请输入域"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
				/>

				<ProFormTextArea
					name="remark"
					label="备注"
					placeholder="请输入备注"
					readonly={context.isDisabled(["insert", "edit"])}
					allowClear={false}
				/>
			</DrawerForm>
		);
	},
);
