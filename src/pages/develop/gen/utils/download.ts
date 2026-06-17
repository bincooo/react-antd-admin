/**
 * 文件下载工具函数
 * 用于通过 Blob 数据触发浏览器下载
 */

/**
 * 通过 Blob 数据下载文件
 * @description 创建一个临时的 <a> 标签触发下载，用于生成 ZIP 等文件流
 * @param data - 文件数据（BlobPart）
 * @param filename - 下载后的文件名
 * @param mime - MIME 类型，默认为 application/octet-stream
 * @param bom - BOM 头数据，可选
 */
export function downloadByData(
	data: BlobPart,
	filename: string,
	mime?: string,
	bom?: BlobPart,
) {
	// 组装 Blob 数据
	const blobData = bom === undefined ? [data] : [bom, data];
	const blob = new Blob(blobData, { type: mime || "application/octet-stream" });

	// 创建临时链接并触发下载
	const blobURL = window.URL.createObjectURL(blob);
	const tempLink = document.createElement("a");
	tempLink.style.display = "none";
	tempLink.href = blobURL;
	tempLink.setAttribute("download", filename);

	// 兼容不支持 download 属性的浏览器
	if (tempLink.download === undefined) {
		tempLink.setAttribute("target", "_blank");
	}

	document.body.append(tempLink);
	tempLink.click();
	tempLink.remove();

	// 释放内存
	window.URL.revokeObjectURL(blobURL);
}
