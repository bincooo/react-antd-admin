import { create } from "mutative";
import { useCallback, useState } from "react";

export function useMutative<T>(initial: T) {
	const [state, setState] = useState(initial);
	const update = useCallback((recipe: (draft: T) => void) => {
		setState(prev => create(prev, recipe));
	}, []);

	return [state, update] as const;
}
