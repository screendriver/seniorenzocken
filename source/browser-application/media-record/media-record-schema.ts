import * as v from "valibot";

const nonEmptyStringSchema = v.pipe(v.string(), v.minLength(1));

export const mediaRecordSchema = v.pipe(
	v.object({
		collectionId: nonEmptyStringSchema,
		fileName: v.pipe(v.array(nonEmptyStringSchema), v.minLength(1)),
		id: nonEmptyStringSchema,
		name: nonEmptyStringSchema,
		gamePoints: v.number(),
	}),
	v.readonly(),
);

export const allMediaRecordsSchema = v.pipe(v.array(mediaRecordSchema), v.readonly());

export type MediaRecord = v.InferOutput<typeof mediaRecordSchema>;

export type AllMediaRecords = v.InferOutput<typeof allMediaRecordsSchema>;
