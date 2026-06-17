import { action, makeObservable, observable, computed } from "mobx";
import equal from 'fast-deep-equal';

/**
 * 编辑页状态管理
 */
class State {

    private readonly _initialize: System.SqlModel;

    @observable
    data: System.SqlModel = {};

    constructor(initialize: System.SqlModel) {
        this._initialize = initialize;
        this.data = {...initialize};
        makeObservable(this);
    }

    update(changed: System.SqlModel) {
        Object.assign(this.data, changed);
    }

    @computed
    get changed() {
        return !equal(this._initialize, this.data);
    }

    @computed
    get isEdit() {
        return !!this.data.id;
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

export default function createState(initialize: System.SqlModel) {
    return () => (new State(initialize));
};
