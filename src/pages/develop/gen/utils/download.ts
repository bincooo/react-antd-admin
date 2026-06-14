export function downloadByData(
	data: BlobPart,
	filename: string,
	mime?: string,
	bom?: BlobPart,
) {
	const blobData = bom === undefined ? [data] : [bom, data];
	const blob = new Blob(blobData, { type: mime || "application/octet-stream" });

	const blobURL = window.URL.createObjectURL(blob);
	const tempLink = document.createElement("a");
	tempLink.style.display = "none";
	tempLink.href = blobURL;
	tempLink.setAttribute("download", filename);
	if (tempLink.download === undefined) {
		tempLink.setAttribute("target", "_blank");
	}
	document.body.append(tempLink);
	tempLink.click();
	tempLink.remove();
	window.URL.revokeObjectURL(blobURL);
}
