import type React from "react";
import type { FormState, SetField } from "./types";

// Shared look & feel comes from the booking-assignment folder
export {
  Section,
  FormTable,
  TRow,
  GroupRow,
  ReadOnly,
  inputCls,
  textareaCls,
} from "../booking-assignment/ui";

type StringKeys = {
  [K in keyof FormState]: FormState[K] extends string ? K : never;
}[keyof FormState];

/** Spread onto an <input>/<select>/<textarea> to wire it to a string field */
export const bind = (form: FormState, set: SetField, key: StringKeys) => ({
  value: form[key],
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => set(key, e.target.value),
});
