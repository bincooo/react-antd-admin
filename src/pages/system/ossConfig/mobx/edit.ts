import equal from "fast-deep-equal";
import { action, computed, makeObservable, observable } from "mobx";

/**
 * 编辑页状态管理
 */
class State {
	private readonly _initialize: System.OssConfig;

	@observable
	data: System.OssConfig = {};

	constructor(initialize: System.OssConfig) {
		this._initialize = initialize;
		this.data = { ...initialize };
		makeObservable(this);
	}

	update(changed: System.OssConfig) {
		Object.assign(this.data, changed);
	}

	@computed
	get changed() {
		return !equal(this._initialize, this.data);
	}

	@computed
	get isEdit() {
		return !!this.data.ossConfigId;
	}

	isDisabled(command: string[]) {
		if (command.includes("insert") && !this.isEdit) {
			return false;
		}
		if (command.includes("edit") && this.isEdit) {
			return false;
		}
		return true;
	}
}

export default function createState(initialize: System.OssConfig) {
	return () => (new State(initialize));
};
