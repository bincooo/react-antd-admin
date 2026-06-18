import type { UppyFile } from "@uppy/core";
import { Buffer } from "node:buffer";
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	DeleteOutlined,
	FileExcelOutlined,
	FileOutlined,
	FilePdfOutlined,
	FileWordOutlined,
	FileZipOutlined,
	InboxOutlined,
	UploadOutlined,
} from "@ant-design/icons";
import AwsS3 from "@uppy/aws-s3";
import Uppy from "@uppy/core";
import {
	Button,
	Col,
	Image,
	List,
	message,
	Progress,
	Row,
	Space,
	theme,
	Typography,
	Upload,
} from "antd";

import { createCRC32 } from "hash-wasm";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { createPresigned } from "#src/api/common";

const { Text } = Typography;

type Unit = "k" | "m" | "g" | "t" | "K" | "M" | "G" | "T";
type FileSize = number | `${number}${Unit}` | `${number} ${Unit}`;

interface FileProgress {
	uid: string
	name: string
	size: number
	status: "waiting" | "uploading" | "done" | "error"
	percent: number
	error?: string
	preview?: string // 预览 URL（仅对图片等生成）
}

export interface S3UploaderProps {
	disabled?: boolean
	maxFileSize?: FileSize
	maxNumberOfFiles?: number
}

interface Meta {
	objectKey: string
	path: string
}

// 根据文件类型返回对应图标（用于非图片预览）
function getFileIcon(fileName: string) {
	const ext = fileName.split(".").pop()?.toLowerCase();
	switch (ext) {
		case "pdf":
			return <FilePdfOutlined style={{ fontSize: 28, color: "#ff4d4f" }} />;
		case "doc":
		case "docx":
			return <FileWordOutlined style={{ fontSize: 28, color: "#2b579a" }} />;
		case "xls":
		case "xlsx":
			return <FileExcelOutlined style={{ fontSize: 28, color: "#217346" }} />;
		case "zip":
		case "rar":
		case "7z":
			return <FileZipOutlined style={{ fontSize: 28, color: "#f5a623" }} />;
		default:
			return <FileOutlined style={{ fontSize: 28, color: "#8c8c8c" }} />;
	}
}

function parseFileSize(size: string | number): number {
	if (typeof size === "number")
		return size;
	const s = String(size).trim().toLowerCase();
	const units: Record<string, number> = {
		k: 1024,
		m: 1024 ** 2,
		g: 1024 ** 3,
		t: 1024 ** 4,
	};
	const match = s.match(/^([\d.]+)\s*([a-z]+)$/);
	if (!match)
		throw new Error("非标准单位 K/M/G/T");
	const value = Number.parseFloat(match[1]);
	const unit = match[2] || "m";
	const multiplier = units[unit] || 1;
	return Math.round(value * multiplier);
}

/**
 * 计算 Uppy 文件的 CRC32 校验和，并返回 Base64 编码字符串
 */
async function getChecksumCRC32(file: UppyFile): Promise<string> {
	try {
		// 1. 从 UppyFile 中提取实际的 Blob/File 对象
		const blob = file.data;
		if (!(blob instanceof Blob)) {
			throw new TypeError("文件数据不是 Blob 类型");
		}

		// 2. 初始化 CRC32 计算器
		const crc32 = await createCRC32();
		crc32.init();

		// 3. 分块读取，避免内存溢出
		const chunkSize = 1024 * 1024 * 100; // 100MB
		let offset = 0;
		const totalSize = blob.size;

		while (offset < totalSize) {
			const chunk = blob.slice(offset, Math.min(offset + chunkSize, totalSize));
			const buffer = await chunk.arrayBuffer();
			crc32.update(new Uint8Array(buffer));
			offset += chunkSize;
		}

		// 4. 获取十六进制校验和（固定 8 位，如 "a1b2c3d4"）
		const hexChecksum = crc32.digest();

		// 5. 将十六进制字符串转换为 Base64
		//    CRC32 结果为 4 字节，因此 hex 长度为 8
		const bytes = new Uint8Array(
			hexChecksum.match(/.{1,2}/g)!.map((byte: string) => Number.parseInt(byte, 16)),
		);

		// 使用 Buffer 进行 Base64 编码（Node.js 环境）
		// 或使用 btoa（浏览器环境）
		const base64Checksum = typeof Buffer !== "undefined"
			? Buffer.from(bytes).toString("base64")
			: btoa(String.fromCharCode(...bytes));

		return base64Checksum;
	}
	catch (error) {
		console.error("CRC32 计算失败:", error);
		throw new Error(`无法计算文件 CRC32: ${error instanceof Error ? error.message : String(error)}`);
	}
}

export interface S3UploaderRef {
	getSuccessFiles: () => { name: string, size: number, key?: string }[]
}

const S3Uploader = forwardRef<S3UploaderRef, S3UploaderProps>(({ disabled, maxFileSize = 100 * 1024 * 1024, maxNumberOfFiles = 10, ...rest }, ref) => {
	const { token } = theme.useToken();
	const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
	const [uploading, setUploading] = useState(false);
	const [successFiles, setSuccessFiles] = useState<
		{ name: string, size: number, objectKey: string, path: string }[]
	>([]);

	const [uppy] = useState(() => {
		const u = new Uppy<Meta, Record<string, never>>({
			autoProceed: false,
			restrictions: {
				maxFileSize: parseFileSize(maxFileSize),
				maxNumberOfFiles,
			},
		});

		u.use(AwsS3, {
			shouldUseMultipart: false,
			async getUploadParameters(file) {
				const src32 = await getChecksumCRC32(file);
				const response = await createPresigned(src32, file.name, file.extension);
				if (response.code !== 200) {
					message.error(response.message);
					throw new Error(response.message);
				}
				const { data } = response;
				const url = new URL(data.url);
				const split = url.pathname.split("/");
				file.meta.name = url.pathname;
				file.meta.objectKey = split[split.length - 1];
				file.meta.path = url.origin + url.pathname;

				return data;
			},
		});

		// 监听单个文件上传进度
		u.on("upload-progress", (file, uploadProgress) => {
			if (file && uploadProgress.bytesUploaded && uploadProgress.bytesTotal) {
				const percent = Math.round(
					(uploadProgress.bytesUploaded / uploadProgress.bytesTotal) * 100,
				);
				setFileProgress(prev =>
					prev.map(f =>
						f.uid === file.id ? { ...f, status: "uploading", percent } : f,
					),
				);
			}
		});

		// 监听上传成功
		u.on("upload-success", (file) => {
			if (file) {
				message.success(`${file.name} 上传成功`);
				// 添加到状态
				const successFile = { name: file.name, size: file.size, objectKey: file.meta.objectKey, path: file.meta.path };
				setSuccessFiles(prev => [...prev, successFile]);
				setFileProgress(prev =>
					prev.map(f =>
						f.uid === file.id ? { ...f, status: "done", percent: 100 } : f,
					),
				);
			}
		});

		// 监听上传错误
		u.on("upload-error", (file, error) => {
			if (file) {
				message.error(`${file.name} 上传失败`);
				setFileProgress(prev =>
					prev.map(f =>
						f.uid === file.id
							? { ...f, status: "error", error: error.message }
							: f,
					),
				);
			}
		});

		// 监听上传完成
		u.on("complete", (result) => {
			setUploading(false);
			const successful = result?.successful?.length || 0;
			if (successful > 0) {
				message.success(`上传完成，成功 ${successful} 个文件`);
			}
		});

		return u;
	});

	// 组件卸载时释放所有预览 URL
	useEffect(() => {
		return () => {
			fileProgress.forEach((f) => {
				if (f.preview)
					URL.revokeObjectURL(f.preview);
			});
		};
	}, []);

	// 暴露 getSuccessFiles 方法
	useImperativeHandle(ref, () => ({
		getSuccessFiles: () => {
			return successFiles;
		},
	}));

	const beforeUpload = (file: File) => {
		const uppyFile = {
			name: file.name,
			type: file.type,
			data: file,
		};

		try {
			const addedFile = uppy.addFile(uppyFile);

			// 生成预览（仅对图片类型生成 object URL）
			let preview: string | undefined;
			if (file.type.startsWith("image/")) {
				preview = URL.createObjectURL(file);
			}

			setFileProgress(prev => [
				...prev,
				{
					uid: addedFile,
					name: file.name,
					size: file.size,
					status: "waiting",
					percent: 0,
					preview,
				},
			]);
		}
		catch (err: any) {
			message.error(err.message);
		}

		return false;
	};

	const handleRemove = (uid: string) => {
		const uppyFiles = uppy.getFiles();
		const uppyFile = uppyFiles.find(f => f.id === uid);

		if (uppyFile) {
			uppy.removeFile(uppyFile.id);
		}

		// 释放预览 URL
		setFileProgress((prev) => {
			const removed = prev.find(f => f.uid === uid);
			if (removed?.preview) {
				URL.revokeObjectURL(removed.preview);
			}
			return prev.filter(f => f.uid !== uid);
		});
	};

	const handleUpload = async () => {
		const uppyFiles = uppy.getFiles();
		if (uppyFiles.length === 0) {
			message.warning("请先选择文件");
			return;
		}

		// 检查是否所有文件都已上传完成（基于本地状态）
		const allDone = fileProgress.every(f => f.status === "done");
		if (allDone) {
			message.info("所有文件已上传完成");
			return;
		}

		// 检查是否有失败的文件（基于本地状态）
		const hasError = fileProgress.some(f => f.status === "error");
		if (hasError) {
			// 重置 Uppy 内部所有失败文件的状态
			uppy.retryAll();
		}

		setUploading(true);

		// 重置所有未完成文件的状态为 uploading（清除错误，进度归零）
		setFileProgress(prev =>
			prev.map((f) => {
				if (f.status === "done")
					return f;
				return { ...f, status: "uploading" as const, percent: 0, error: undefined };
			}),
		);

		try {
			await uppy.upload();
		}
		catch (err) {
			// eslint-disable-next-line no-console
			console.log("[ERR]: 上传失败", err);
			setUploading(false);
		}
	};

	const handleClear = () => {
		uppy.cancelAll();
		// 释放所有预览 URL
		fileProgress.forEach((f) => {
			if (f.preview)
				URL.revokeObjectURL(f.preview);
		});
		setFileProgress([]);
	};

	const formatFileSize = (bytes: number) => {
		if (bytes === 0)
			return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
	};

	const getStatusIcon = (status: FileProgress["status"]) => {
		switch (status) {
			case "done":
				return <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 20 }} />;
			case "error":
				return <CloseCircleOutlined style={{ color: token.colorError, fontSize: 20 }} />;
		}
	};

	return (
		<div
			{...rest}
			style={{
				background: token.colorBgContainer,
				borderRadius: token.borderRadius,
				border: `1px solid ${token.colorBorder}`,
				padding: token.padding,
				margin: "0 auto",
			}}
		>
			{/* 头部 */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: token.marginSM,
					marginBottom: token.margin,
					paddingBottom: token.padding,
					borderBottom: `1px solid ${token.colorBorderSecondary}`,
				}}
			>
				<div
					style={{
						width: 40,
						height: 40,
						color: token.colorPrimary,
						background: token.colorPrimaryBg,
						borderRadius: token.borderRadiusSM,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<InboxOutlined style={{ fontSize: 24 }} />
				</div>
				<div>
					<div style={{ fontSize: token.fontSize, fontWeight: 500, color: token.colorText }}>
						文件上传
					</div>
					<div style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
						支持最大
						{" "}
						{typeof maxFileSize === "string" ? maxFileSize : formatFileSize(maxFileSize)}
						，最多
						{maxNumberOfFiles}
						{" "}
						个文件
					</div>
				</div>
			</div>

			{/* 上传区域 */}
			<Upload.Dragger
				multiple
				disabled={disabled}
				beforeUpload={beforeUpload}
				showUploadList={false}
				style={{ marginBottom: token.margin }}
			>
				<p className="ant-upload-drag-icon">
					<InboxOutlined />
				</p>
				<p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
				<p className="ant-upload-hint">支持单个或批量上传，支持所有格式文件</p>
			</Upload.Dragger>

			{/* 文件列表 */}
			{fileProgress.length > 0 && (
				<List
					style={{ marginBottom: token.margin }}
					dataSource={fileProgress}
					renderItem={item => (
						<List.Item
							key={item.uid}
							style={{
								padding: token.paddingSM,
								background: token.colorBgLayout,
								borderRadius: token.borderRadiusSM,
								marginBottom: token.marginXS,
								borderBlockEnd: "none",
							}}
						>
							<div style={{ display: "flex", alignItems: "center", gap: token.marginSM, width: "100%" }}>
								{/* 预览区域 */}
								<div
									style={{
										width: 56,
										height: 56,
										flexShrink: 0,
										borderRadius: 6,
										overflow: "hidden",
										background: token.colorBgContainer,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										border: `1px solid ${token.colorBorderSecondary}`,
									}}
								>
									{item.preview
										? (
											<Image
												src={item.preview}
												alt={item.name}
												width={56}
												height={56}
												style={{ objectFit: "cover" }}
												preview={{
													mask: "预览",
													maskClassName: "image-preview-mask",
												}}
											/>
										)
										: (
											getFileIcon(item.name)
										)}
								</div>

								{/* 文件信息 */}
								<div style={{ flex: 1, minWidth: 0 }}>
									<div style={{ display: "flex", alignItems: "center", gap: token.marginSM, marginBottom: 4 }}>
										{getStatusIcon(item.status)}
										<Text strong ellipsis style={{ flex: 1 }}>
											{item.name}
										</Text>
										{!uploading && !disabled && (
											<Button
												type="text"
												danger
												size="small"
												icon={<DeleteOutlined />}
												onClick={() => handleRemove(item.uid)}
											/>
										)}
									</div>
									<div>
										<Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
											{formatFileSize(item.size)}
										</Text>
										{item.status === "error" && item.error && (
											<Text type="danger" style={{ fontSize: token.fontSizeSM, marginLeft: 8 }}>
												{item.error}
											</Text>
										)}
									</div>
									{item.status === "uploading" && (
										<Progress
											percent={item.percent}
											status="active"
											strokeColor={token.colorPrimary}
											size="small"
										/>
									)}
									{item.status === "done" && <Progress percent={100} status="success" size="small" />}
									{item.status === "error" && <Progress percent={item.percent} status="exception" size="small" />}
								</div>
							</div>
						</List.Item>
					)}
				/>
			)}

			{/* 操作按钮 */}
			{!disabled && (
				<Row gutter={16}>
					<Col>
						<Space>
							<Button
								type="primary"
								icon={<UploadOutlined />}
								onClick={handleUpload}
								disabled={fileProgress.length === 0}
								loading={uploading}
							>
								{uploading ? "上传中" : "开始上传"}
							</Button>
							<Button
								icon={<DeleteOutlined />}
								onClick={handleClear}
								disabled={fileProgress.length === 0 || uploading}
							>
								清空列表
							</Button>
						</Space>
					</Col>
					<Col style={{ alignContent: "end", height: 32 }}>
						<Text type="secondary">
							已选择
							{fileProgress.length}
							{" "}
							个文件
						</Text>
					</Col>
				</Row>
			)}
		</div>
	);
});

export default S3Uploader;
