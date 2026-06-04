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

interface EditProps {
	title?: string
	menuId?: string | number
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

const iconSelector = [
	{
		title: "方向性图标",
		children: [
			"StepBackwardOutlined",
			"StepForwardOutlined",
			"FastBackwardOutlined",
			"FastForwardOutlined",
			"ShrinkOutlined",
			"ArrowsAltOutlined",
			"DownOutlined",
			"UpOutlined",
			"LeftOutlined",
			"RightOutlined",
			"CaretUpOutlined",
			"CaretDownOutlined",
			"CaretLeftOutlined",
			"CaretRightOutlined",
			"UpCircleOutlined",
			"DownCircleOutlined",
			"LeftCircleOutlined",
			"RightCircleOutlined",
			"DoubleRightOutlined",
			"DoubleLeftOutlined",
			"VerticalLeftOutlined",
			"VerticalRightOutlined",
			"VerticalAlignTopOutlined",
			"VerticalAlignMiddleOutlined",
			"VerticalAlignBottomOutlined",
			"ForwardOutlined",
			"BackwardOutlined",
			"RollbackOutlined",
			"EnterOutlined",
			"RetweetOutlined",
			"SwapOutlined",
			"SwapLeftOutlined",
			"SwapRightOutlined",
			"ArrowUpOutlined",
			"ArrowDownOutlined",
			"ArrowLeftOutlined",
			"ArrowRightOutlined",
			"PlayCircleOutlined",
			"UpSquareOutlined",
			"DownSquareOutlined",
			"LeftSquareOutlined",
			"RightSquareOutlined",
			"LoginOutlined",
			"LogoutOutlined",
			"MenuFoldOutlined",
			"MenuUnfoldOutlined",
			"BorderBottomOutlined",
			"BorderHorizontalOutlined",
			"BorderInnerOutlined",
			"BorderOuterOutlined",
			"BorderLeftOutlined",
			"BorderRightOutlined",
			"BorderTopOutlined",
			"BorderVerticleOutlined",
			"PicCenterOutlined",
			"PicLeftOutlined",
			"PicRightOutlined",
			"RadiusBottomleftOutlined",
			"RadiusBottomrightOutlined",
			"RadiusUpleftOutlined",
			"RadiusUprightOutlined",
			"FullscreenOutlined",
			"FullscreenExitOutlined",
		],
	},
	{
		title: "提示建议性图标",
		children: [
			"QuestionOutlined",
			"QuestionCircleOutlined",
			"PlusOutlined",
			"PlusCircleOutlined",
			"PauseOutlined",
			"PauseCircleOutlined",
			"MinusOutlined",
			"MinusCircleOutlined",
			"PlusSquareOutlined",
			"MinusSquareOutlined",
			"InfoOutlined",
			"InfoCircleOutlined",
			"ExclamationOutlined",
			"ExclamationCircleOutlined",
			"CloseOutlined",
			"CloseCircleOutlined",
			"CloseSquareOutlined",
			"CheckOutlined",
			"CheckCircleOutlined",
			"CheckSquareOutlined",
			"ClockCircleOutlined",
			"WarningOutlined",
			"IssuesCloseOutlined",
			"StopOutlined",
		],
	},
	{
		title: "编辑类图标",
		children: [
			"EditOutlined",
			"FormOutlined",
			"CopyOutlined",
			"ScissorOutlined",
			"DeleteOutlined",
			"SnippetsOutlined",
			"DiffOutlined",
			"HighlightOutlined",
			"AlignCenterOutlined",
			"AlignLeftOutlined",
			"AlignRightOutlined",
			"BgColorsOutlined",
			"BoldOutlined",
			"ItalicOutlined",
			"UnderlineOutlined",
			"StrikethroughOutlined",
			"RedoOutlined",
			"UndoOutlined",
			"ZoomInOutlined",
			"ZoomOutOutlined",
			"FontColorsOutlined",
			"FontSizeOutlined",
			"LineHeightOutlined",
			"DashOutlined",
			"SmallDashOutlined",
			"SortAscendingOutlined",
			"SortDescendingOutlined",
			"DragOutlined",
			"OrderedListOutlined",
			"UnorderedListOutlined",
			"RadiusSettingOutlined",
			"ColumnWidthOutlined",
			"ColumnHeightOutlined",
		],
	},
	{
		title: "数据类图标",
		children: [
			"AreaChartOutlined",
			"PieChartOutlined",
			"BarChartOutlined",
			"DotChartOutlined",
			"LineChartOutlined",
			"RadarChartOutlined",
			"HeatMapOutlined",
			"FallOutlined",
			"RiseOutlined",
			"StockOutlined",
			"BoxPlotOutlined",
			"FundOutlined",
			"SlidersOutlined",
		],
	},
	{
		title: "品牌和标识",
		children: [
			"AndroidOutlined",
			"AppleOutlined",
			"WindowsOutlined",
			"IeOutlined",
			"ChromeOutlined",
			"GithubOutlined",
			"AliwangwangOutlined",
			"DingdingOutlined",
			"WeiboSquareOutlined",
			"WeiboCircleOutlined",
			"TaobaoCircleOutlined",
			"Html5Outlined",
			"WeiboOutlined",
			"TwitterOutlined",
			"WechatOutlined",
			"WhatsAppOutlined",
			"YoutubeOutlined",
			"AlipayCircleOutlined",
			"TaobaoOutlined",
			"DingtalkOutlined",
			"SkypeOutlined",
			"QqOutlined",
			"MediumWorkmarkOutlined",
			"GitlabOutlined",
			"MediumOutlined",
			"LinkedinOutlined",
			"GooglePlusOutlined",
			"DropboxOutlined",
			"FacebookOutlined",
			"CodepenOutlined",
			"CodeSandboxOutlined",
			"AmazonOutlined",
			"GoogleOutlined",
			"CodepenCircleOutlined",
			"AlipayOutlined",
			"AntDesignOutlined",
			"AntCloudOutlined",
			"AliyunOutlined",
			"ZhihuOutlined",
			"SlackOutlined",
			"SlackSquareOutlined",
			"BehanceOutlined",
			"BehanceSquareOutlined",
			"DribbbleOutlined",
			"DribbbleSquareOutlined",
			"InstagramOutlined",
			"YuqueOutlined",
			"AlibabaOutlined",
			"YahooOutlined",
			"RedditOutlined",
			"SketchOutlined",
			"WechatWorkOutlined",
			"OpenAIOutlined",
			"DiscordOutlined",
			"XOutlined",
			"BilibiliOutlined",
			"PinterestOutlined",
			"TikTokOutlined",
			"SpotifyOutlined",
			"TwitchOutlined",
			"LinuxOutlined",
			"JavaOutlined",
			"JavaScriptOutlined",
			"PythonOutlined",
			"RubyOutlined",
			"DotNetOutlined",
			"KubernetesOutlined",
			"DockerOutlined",
			"BaiduOutlined",
			"HarmonyOSOutlined",
		],
	},
	{
		title: "网站通用图标",
		children: [
			"AccountBookOutlined",
			"AimOutlined",
			"AlertOutlined",
			"ApartmentOutlined",
			"ApiOutlined",
			"AppstoreAddOutlined",
			"AppstoreOutlined",
			"AudioOutlined",
			"AudioMutedOutlined",
			"AuditOutlined",
			"BankOutlined",
			"BarcodeOutlined",
			"BarsOutlined",
			"BellOutlined",
			"BlockOutlined",
			"BookOutlined",
			"BorderOutlined",
			"BorderlessTableOutlined",
			"BranchesOutlined",
			"BugOutlined",
			"BuildOutlined",
			"BulbOutlined",
			"CalculatorOutlined",
			"CalendarOutlined",
			"CameraOutlined",
			"CarOutlined",
			"CarryOutOutlined",
			"CiCircleOutlined",
			"CiOutlined",
			"ClearOutlined",
			"CloudDownloadOutlined",
			"CloudOutlined",
			"CloudServerOutlined",
			"CloudSyncOutlined",
			"CloudUploadOutlined",
			"ClusterOutlined",
			"CodeOutlined",
			"CoffeeOutlined",
			"CommentOutlined",
			"CompassOutlined",
			"CompressOutlined",
			"ConsoleSqlOutlined",
			"ContactsOutlined",
			"ContainerOutlined",
			"ControlOutlined",
			"CopyrightOutlined",
			"CreditCardOutlined",
			"CrownOutlined",
			"CustomerServiceOutlined",
			"DashboardOutlined",
			"DatabaseOutlined",
			"DeleteColumnOutlined",
			"DeleteRowOutlined",
			"DeliveredProcedureOutlined",
			"DeploymentUnitOutlined",
			"DesktopOutlined",
			"DisconnectOutlined",
			"DislikeOutlined",
			"DollarOutlined",
			"DownloadOutlined",
			"EllipsisOutlined",
			"EnvironmentOutlined",
			"EuroCircleOutlined",
			"EuroOutlined",
			"ExceptionOutlined",
			"ExpandAltOutlined",
			"ExpandOutlined",
			"ExperimentOutlined",
			"ExportOutlined",
			"EyeOutlined",
			"EyeInvisibleOutlined",
			"FieldBinaryOutlined",
			"FieldNumberOutlined",
			"FieldStringOutlined",
			"FieldTimeOutlined",
			"FileAddOutlined",
			"FileDoneOutlined",
			"FileExcelOutlined",
			"FileExclamationOutlined",
			"FileOutlined",
			"FileGifOutlined",
			"FileImageOutlined",
			"FileJpgOutlined",
			"FileMarkdownOutlined",
			"FilePdfOutlined",
			"FilePptOutlined",
			"FileProtectOutlined",
			"FileSearchOutlined",
			"FileSyncOutlined",
			"FileTextOutlined",
			"FileUnknownOutlined",
			"FileWordOutlined",
			"FileZipOutlined",
			"FilterOutlined",
			"FireOutlined",
			"FlagOutlined",
			"FolderAddOutlined",
			"FolderOutlined",
			"FolderOpenOutlined",
			"FolderViewOutlined",
			"ForkOutlined",
			"FormatPainterOutlined",
			"FrownOutlined",
			"FunctionOutlined",
			"FundProjectionScreenOutlined",
			"FundViewOutlined",
			"FunnelPlotOutlined",
			"GatewayOutlined",
			"GifOutlined",
			"GiftOutlined",
			"GlobalOutlined",
			"GoldOutlined",
			"GroupOutlined",
			"HddOutlined",
			"HeartOutlined",
			"HistoryOutlined",
			"HolderOutlined",
			"HomeOutlined",
			"HourglassOutlined",
			"IdcardOutlined",
			"ImportOutlined",
			"InboxOutlined",
			"InsertRowAboveOutlined",
			"InsertRowBelowOutlined",
			"InsertRowLeftOutlined",
			"InsertRowRightOutlined",
			"InsuranceOutlined",
			"InteractionOutlined",
			"KeyOutlined",
			"LaptopOutlined",
			"LayoutOutlined",
			"LikeOutlined",
			"LineOutlined",
			"LinkOutlined",
			"Loading3QuartersOutlined",
			"LoadingOutlined",
			"LockOutlined",
			"MacCommandOutlined",
			"MailOutlined",
			"ManOutlined",
			"MedicineBoxOutlined",
			"MehOutlined",
			"MenuOutlined",
			"MergeCellsOutlined",
			"MergeOutlined",
			"MessageOutlined",
			"MobileOutlined",
			"MoneyCollectOutlined",
			"MonitorOutlined",
			"MoonOutlined",
			"MoreOutlined",
			"MutedOutlined",
			"NodeCollapseOutlined",
			"NodeExpandOutlined",
			"NodeIndexOutlined",
			"NotificationOutlined",
			"NumberOutlined",
			"OneToOneOutlined",
			"PaperClipOutlined",
			"PartitionOutlined",
			"PayCircleOutlined",
			"PercentageOutlined",
			"PhoneOutlined",
			"PictureOutlined",
			"PlaySquareOutlined",
			"PoundCircleOutlined",
			"PoundOutlined",
			"PoweroffOutlined",
			"PrinterOutlined",
			"ProductOutlined",
			"ProfileOutlined",
			"ProjectOutlined",
			"PropertySafetyOutlined",
			"PullRequestOutlined",
			"PushpinOutlined",
			"QrcodeOutlined",
			"ReadOutlined",
			"ReconciliationOutlined",
			"RedEnvelopeOutlined",
			"ReloadOutlined",
			"RestOutlined",
			"RobotOutlined",
			"RocketOutlined",
			"RotateLeftOutlined",
			"RotateRightOutlined",
			"SafetyCertificateOutlined",
			"SafetyOutlined",
			"SaveOutlined",
			"ScanOutlined",
			"ScheduleOutlined",
			"SearchOutlined",
			"SecurityScanOutlined",
			"SelectOutlined",
			"SendOutlined",
			"SettingOutlined",
			"ShakeOutlined",
			"ShareAltOutlined",
			"ShopOutlined",
			"ShoppingCartOutlined",
			"ShoppingOutlined",
			"SignatureOutlined",
			"SisternodeOutlined",
			"SkinOutlined",
			"SmileOutlined",
			"SolutionOutlined",
			"SoundOutlined",
			"SplitCellsOutlined",
			"StarOutlined",
			"SubnodeOutlined",
			"SunOutlined",
			"SwitcherOutlined",
			"SyncOutlined",
			"TableOutlined",
			"TabletOutlined",
			"TagOutlined",
			"TagsOutlined",
			"TeamOutlined",
			"ThunderboltOutlined",
			"ToTopOutlined",
			"ToolOutlined",
			"TrademarkCircleOutlined",
			"TrademarkOutlined",
			"TransactionOutlined",
			"TranslationOutlined",
			"TrophyOutlined",
			"TruckOutlined",
			"UngroupOutlined",
			"UnlockOutlined",
			"UploadOutlined",
			"UsbOutlined",
			"UserAddOutlined",
			"UserDeleteOutlined",
			"UserOutlined",
			"UserSwitchOutlined",
			"UsergroupAddOutlined",
			"UsergroupDeleteOutlined",
			"VerifiedOutlined",
			"VideoCameraAddOutlined",
			"VideoCameraOutlined",
			"WalletOutlined",
			"WifiOutlined",
			"WomanOutlined",
		],
	},
];

export default function Edit({
	menuId,
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
		if (command.includes("insert") && !menuId) {
			return false;
		}
		if (command.includes("edit") && menuId) {
			return false;
		}
		return true;
	};

	const [menuData] = useQueries({
		queries: [
			{
				queryKey: ["form", menuId],
				queryFn: async () => {
					if (!menuId) {
						return null;
					}
					const { data } = await api.getById(menuId);
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
		if (menuId) {
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
			if (menuData.data) {
				form.setFieldsValue(menuData.data);
				return;
			}
			form.resetFields();
		}
	}, [open, menuData.data]);

	return (
		<DrawerForm<System.Menu>
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
					const arr = menuId ? [menuId] : [];
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
				disabled={!!menuId}
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
					allowClear={false}
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
