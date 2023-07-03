import { useRef, useState } from "react";

export const useStateRef = <T extends unknown>(initialState: T) => {
	const [state, setState] = useState(initialState);
	const ref = useRef(initialState);

	if (ref.current !== state) ref.current = state;

	// Use "as const" below so the returned array is a proper tuple
	return [state, setState, ref] as const;
};