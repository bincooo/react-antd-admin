import type { ReactNode } from "react";

export interface SwitchControlProps<T, K extends keyof any> {
	display?: 'block' | 'inline'
	condition?: boolean

	children?: ReactNode
	fallback?: ReactNode

	each?: {
		data: Array<T> | Record<K, T>
		render?: (item: T | unknown, idx: number | string | K) => ReactNode
	}
}

function warp(display?: 'block' | 'inline', children?: ReactNode, props?: any) {
	const Comp = display === 'block' ? 'div' : 'span';
	return <Comp className="SwitchControl" {...props}>{children}</Comp>
}

function SwitchControl<T, K extends keyof any>({ display = 'block', condition = true, children, fallback, each, ...rest }: SwitchControlProps<T, K>) {
	if (!condition) return fallback;
	if (each) {
		let { data, render } = each;
		if (!render) {
			render = () => children;
		}
		if (Array.isArray(data)) {
			return warp(
				display,
				data.map((value: T, idx: number) =>
					render?.(value, idx)),
				rest,
			);
		}

		if (data instanceof Map) {
			return warp(
				display,
				data.entries().map(([key, value]) =>
					render?.(value, key)),
				rest,
			);
		}

		return warp(
			display,
			Object.entries(data).map(([key, value]) =>
				render?.(value, key)),
			rest,
		);
	}

	return warp(display, children, rest);
}

export default SwitchControl;
