import { defineFakeRoute } from "vite-plugin-fake-server/client";
import { about, home, outside } from "#/src/router/extra-info";
import { resultSuccess } from "./utils";

/**
 * roles：页面级别权限，这里模拟二种 "admin"、"common"
 * admin：管理员角色
 * common：普通角色
 */

const homeRouter = {
	path: "/home",
	component: "/home/index.tsx",
	handle: {
		icon: "HomeOutlined",
		title: "common.menu.home",
		order: home,
	},
};

const aboutRouter = {
	path: "/about",
	component: "/about/index.tsx",
	handle: {
		icon: "CopyrightOutlined",
		title: "common.menu.about",
		order: about,
	},
};

const outsideRouter = {
	path: "/outside",
	handle: {
		icon: "OutsidePageIcon",
		title: "common.menu.outside",
		order: outside,
	},
	children: [
		{
			path: "/outside/embedded",
			handle: {
				icon: "EmbeddedIcon",
				title: "common.menu.embedded",
			},
			children: [
				{
					path: "/outside/embedded/ant-design",
					handle: {
						icon: "AntDesignOutlined",
						title: "common.menu.antd",
						iframeLink: "https://ant.design/",
					},
				},
				{
					path: "/outside/embedded/project-docs",
					handle: {
						icon: "ContainerOutlined",
						title: "common.menu.projectDocs",
						iframeLink: "https://condorheroblog.github.io/react-antd-admin/docs/",
					},
				},
			],
		},
		{
			path: "/outside/external-link",
			handle: {
				icon: "ExternalIcon",
				title: "common.menu.externalLink",
			},
			children: [
				{
					path: "/outside/external-link/react-docs",
					handle: {
						icon: "RiReactjsLine",
						title: "common.menu.reactDocs",
						externalLink: "https://react.dev/",
					},
				},
			],
		},
	],
};

export default defineFakeRoute([
	{
		url: "/get-async-routes",
		timeout: 1000,
		method: "get",
		response: () => {
			return resultSuccess(
				[
					homeRouter,
					aboutRouter,
					outsideRouter,
				],
			);
		},
	},
]);
