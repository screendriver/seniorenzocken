import * as v from "valibot";

const nonEmptyStringSchema = v.pipe(v.string(), v.minLength(1));

export const mediaRecordSchema = v.pipe(
	v.object({
		name: nonEmptyStringSchema,
		path: v.pipe(v.array(nonEmptyStringSchema), v.minLength(1)),
	}),
	v.readonly(),
);

export const mediaRecordsSchema = v.pipe(v.array(mediaRecordSchema), v.minLength(1), v.readonly());

export type MediaRecord = v.InferOutput<typeof mediaRecordSchema>;

export type MediaRecords = v.InferOutput<typeof mediaRecordsSchema>;
