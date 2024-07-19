import { isNonEmptyString } from "@sindresorhus/is";
import type { FastifyRequest, RouteOptions } from "fastify";

const allMediaRecords = [
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["zuc3MKt9RUmC_ICY3Cq9DqJ.m4a"],
		gamePoints: -1,
		id: "rj0fdqjexyy4tw7",
		name: "to",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["gwonnen_SnylL0Rxf2.m4a"],
		gamePoints: -1,
		id: "y17ufwmpyiyh675",
		name: "gwonnen",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["stretched_sDZwnudmg3.m4a"],
		gamePoints: -1,
		id: "r1asxl36i3yw9ry",
		name: "stretched",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["18Y17t5T7DPr_HWEKYKm3Qx.m4a"],
		gamePoints: 18,
		id: "vtlxj23duzwojh6",
		name: "eighteen",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["17MpSQiQ01jB_xePoKqFSbg.m4a"],
		gamePoints: 17,
		id: "mtj2jariil3n0nq",
		name: "seventeen",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["16ZvPvbx69K4_qPJBxSniCv.m4a"],
		gamePoints: 16,
		id: "62au988qkjg168b",
		name: "sixteen",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["15ATOwFlWOCZ_32UvTyjRLs.m4a"],
		gamePoints: 15,
		id: "zslylturuplr3ia",
		name: "fifteen",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["14Uko99cg4gp_1b6RZJZYYT.m4a"],
		gamePoints: 14,
		id: "gtnnw26gs9n88g2",
		name: "fourteen",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["13zZD3vrVWeH_L8I3fnFlgH.m4a"],
		gamePoints: 13,
		id: "a0gtnnczoku87x6",
		name: "thirteen",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["124ILRqZ8EYG_8gwCGHbjb9.m4a"],
		gamePoints: 12,
		id: "xqiaci55hs8tul5",
		name: "twelve",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["11qLpyESy4vY_zRhXloSrL6.m4a"],
		gamePoints: 11,
		id: "97bt2dnu6o9ag40",
		name: "eleven",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["10suWFwzQK3N_LRLJOyiY9j.m4a"],
		gamePoints: 10,
		id: "vnamvrdky5efhz8",
		name: "ten",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["9L9SBqbqQ5a_yjyvRd16ks.m4a"],
		gamePoints: 9,
		id: "fzw38xp9a9y4zf9",
		name: "nine",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["8porGiCglXG_vUvUN19UUl.m4a"],
		gamePoints: 8,
		id: "780rouudhx2jzpi",
		name: "eight",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["7WWKotqozgO_wx4mQACGSK.m4a"],
		gamePoints: 7,
		id: "n63onb4vwzjqb24",
		name: "seven",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["6EeIF7XHEnc_2mDBOcnzwU.m4a"],
		gamePoints: 6,
		id: "ifsl7bmgrk3btuh",
		name: "six",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["5Fwx1qgc5yX_quuObrzKnh.m4a"],
		gamePoints: 5,
		id: "cyj58axp7dntlza",
		name: "five",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["4xjemlZXNes_jn6ly2yiOJ.m4a"],
		gamePoints: 4,
		id: "tqdf3f86xtkguv0",
		name: "four",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["3KG4lQR3stj_WOtnZP5Pyv.m4a"],
		gamePoints: 3,
		id: "qb27c2tlhed6y3o",
		name: "three",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: ["2Ar1kLJoaLx_QklkYtMMvd.m4a"],
		gamePoints: 2,
		id: "6hkikpd3cltsdoo",
		name: "two",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: [
			"0_1_kw23ZWnc3U.m4a",
			"0_2_hijsGhUslx.m4a",
			"0_3_klC3XDtj7l.m4a",
			"0_4_0mBMLfZ9FY.m4a",
			"0_5_gOunVRUbeL.m4a",
			"0_6_RQLrSFa7Qw.m4a",
		],
		gamePoints: 0,
		id: "ysw2ngy3hszp5r9",
		name: "zero",
	},
	{
		collectionId: "oel63lj2fz91cn3",
		fileName: [
			"attention_1_U2p9TUgNzg.m4a",
			"attention_2_EJRDPlNdZx.m4a",
			"attention_3_nXFWaRA1Jm.m4a",
			"attention_4_AXPTI375Py.m4a",
		],
		gamePoints: -1,
		id: "e8enn4h6f26wcwy",
		name: "attention",
	},
];

type MediaRecordsRequest = FastifyRequest<{
	Querystring: { filter?: string };
}>;

type FileRequest = FastifyRequest<{
	Params: { path: string };
}>;

export function createPocketbaseRoutes(): readonly RouteOptions[] {
	const mediaRecords: RouteOptions = {
		method: ["GET"],
		url: "/api/collections/media/records",
		// @ts-expect-error request.query is still of type unknown
		async handler(request: MediaRecordsRequest, reply) {
			let items = allMediaRecords;

			if (isNonEmptyString(request.query.filter)) {
				const [name, field] = request.query.filter.split("=");

				if (name === "name" && field === '"attention"') {
					items = items.filter((item) => {
						return item.name === "attention";
					});
				}
			}

			return reply.send({
				items,
				page: 1,
				perPage: 500,
				totalItems: -1,
				totalPages: -1,
			});
		},
	};

	const file: RouteOptions = {
		method: ["GET"],
		url: "/api/files/:collectionId/:recordId/:path",
		// @ts-expect-error request.params is still of type unknown
		async handler(request: FileRequest, reply) {
			const twoSecondsOfSilence = Buffer.from(
				`AAAAHGZ0eXBNNEEgAAACAE00QSBpc29taXNvMgAABAFtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAAAIuAABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAACcXRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAAEAAAAAAAAIuAAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAACLgAAAQAAAEAAAAAAeltZGlhAAAAIG1kaGQAAAAAAAAAAAAAAAAAAB9AAABFwFXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAAAAAAAAAFNvdW5kSGFuZGxlcgAAAAGUbWluZgAAABBzbWhkAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAFYc3RibAAAAGpzdHNkAAAAAAAAAAEAAABabXA0YQAAAAAAAAABAAAAAAAAAAAAAgAQAAAAAB9AAAAAAAA2ZXNkcwAAAAADgICAJQABAASAgIAXQBUAAAAAALuAAAAVegWAgIAFFYhW5QAGgICAAQIAAAAgc3R0cwAAAAAAAAACAAAAEgAABAAAAAABAAABwAAAABxzdHNjAAAAAAAAAAEAAAABAAAAEwAAAAEAAABgc3RzegAAAAAAAAAAAAAAEwAAABgAAAA6AAAAWQAAAFkAAABXAAAATgAAAFIAAABYAAAAWwAAAGAAAABSAAAAZQAAAGMAAABfAAAAZwAAAJwAAACdAAAAKQAAAAYAAAAUc3RjbwAAAAAAAAABAAAELQAAABpzZ3BkAQAAAHJvbGwAAAACAAAAAf//AAAAHHNiZ3AAAAAAcm9sbAAAAAEAAAATAAAAAQAAARx1ZHRhAAABFG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAA52lsc3QAAAAsqW5hbQAAACRkYXRhAAAAAQAAAAAyIFNlY29uZHMgb2YgU2lsZW5jZQAAACmpQVJUAAAAIWRhdGEAAAABAAAAAEFuYXIgU29mdHdhcmUgTExDAAAAKWFBUlQAAAAhZGF0YQAAAAEAAAAAQW5hciBTb2Z0d2FyZSBMTEMAAAAjqWFsYgAAABtkYXRhAAAAAQAAAABCbGFuayBBdWRpbwAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY1OC43Ni4xMDAAAAAZY3BpbAAAABFkYXRhAAAAFQAAAAAAAAAACGZyZWUAAAZebWRhdN4EAExhdmM1OC4xMzQuMTAwAAHIZgfOOADkMwOIECIMwgHluoAcwIAI7Xd8QAQW+ItkT4jPN3MFuk4vt+3aXsYd5dw3d2+H7X94j+z/6PQiADgA5DMDBmARhQZhAP7HmI3QAgAisbzp/b/i45OQZ+HxO7Pxq63PnjCfKT8Z97nrLgV0aHdLOR1j+5tOC2BPrw+/pv6MFmODL+Yc4Lnn8p0+vP61s/3592wABwDkMwMoEAoMBCFBmEA+KXSsDgjwE/ht2NQTyxewqnYexr0gXpYds73pnsBWee3Ku73ZqKphMXMrAb8AbaH1Phf9U/9QXz/O5jf6qCc7p6FKzqH3v9L8GAAOAOQzAwZQGhDCAfXj2evit0DdfXQw6IDJ3eq3PXHafFtR1gJHd3d95KpKrIfx6+MH1OiCeYWJS7dnlikPtr93x7yuKbEr3E6TSiP8+L1p/h/mv63qgAOAAOQzAyZQEhDCAfHo9r3uoM2n1WYAABEnGf8qWC+B3d/QPzpgd7LHL5BQXj2wZXzo1caaYR7EmvbP71xfHZOc7vxk16/qybqel+4OOIAOAOQzAuZwGgmCYQD+x7evZVZQCgKgJdj0/cQAUjL0OX72+6d059jQ6I7uetBKH7qk3Dco5N8rOSBW3YdKkCGqoNLaYR1IElAtlwyQDf/D8TiADgDkMwMkISAJhmEA+Hr49/it1oDo76Ox1zS69+yAeSM5er+ekAvtr/uXiJKtBDEJQcGQGimE5MaFe4OgGhgKryvvEQxKgXgGC2YjmUEA4WKmB9z/cnZ2ABwA5DMDJmAKDYJhAP7HxS620EQCIB599LfO9CxFNNLZwPA8XLg2ROFTu+AciO8VafXF8WnKJJNM++vnwUnk98poQ/z7lPAO9QWti0QYPJIs70iucukY9Mr2IAOAAOQzAyIUIAkEwjCAf29i5vdaBcawzwRVABeadJ/sbtbtFqZCXHY1pwgJptj3tZZ34u3NM6d6AgIE5d57gHBuImIKsAh0zA5AOTawY1raRAcqEVNRxUSPOc1/k+mdcADgAOQzA0ZQEgzCAe99/FTmoPpco9Jw/fW1TRBAGv9HbztOkJ45afVm+qsTvCrvoT5xAa90ygr5FgwE/b5633Gq3p1nlWpdehAgM+PFOa/2XxQAOADkMwMoMAoMAsMwgHxKWrmuB7wBRH+Gn1CVdwQQCvTD36PbaRIvyhTumGslA1Yq8XBFvp1qNbygyixG1kQwpfexraDXmCxQ6IBKLOIkh8XN1ZU5KVlF6riW6ZyMmJVAvPcOiADgAOQzAwY0GAkIYQD+3t6+CVurAK5us6DLj+ETBMIM2bsosJaB5256npzyoGS0nSO7vbfnSgkZlctzE0d5p8qf0FNtdl1n7ISb5bovUQXxcKv9Kk879Bjxyz7f+5+rfN9ZEAHAAOQzAyQQCgzGgmCYQD4mX7viswBo+EP6qaOwGoltVmXtNPf7RS3xJlGgYTAAB6KbQ7WOnRPnKw4BX3OjOTF5mqvFhcnHvd+AGmfiIkxogucFENMpIhvZvpob6jyYgA4A5DMDBlQQBQhhAPj0+MuMyqG54Pw2kxqgB83PHtN8p+/MhMynqcfolUBQMiyyGUkojNxzvmzmBqgRDwYkSl6sEP4/De3pCrn/2QU+PaBbr/N1/lAPmhznL/wuGM6W1j+z/vHmoAA4AOQygoJGMo4CwnCAAeM+AfxiHkP44QAAyWaBAEIgp9lOVQGa2kHgJzTMLiZ9+pJ57oC67ux5S/aLexxPPBszifstnKzdmxvACNHp+74ufVqqIgKznIAFdNgDXXw1vv079XwAZKe2gN6EDtHMCkEksuCW/VAOcjxRMMJpouwL26VI7FhbGAUhLphzTq7mxuiXUDS6/6fjcDVsAAAOAOQygsYmOYWI4QAPGfAS6B/MBniPOWzLPIrs0t1no9kW7OzVjNHYgRpvHqHOU20Hqk9Mqy3zNT2nRsrHqSPY4hns5nzwjhTLntoprCKkox7nLUcakAACN93ogOlAAALEQrhJL0e66Ikeltk0vGjDxnavnPB6ZWewXksgRfGFB5Bp6584bEahRRN2qAbge01ulqB7AbOXwtqm0AAAOADkMwPjQQhAPOeQ9oKKaZCkvxUUlZyBbQUF0KCgtn818ahV/LF/EAHAAOQzA+cc`,
				"base64",
			);

			reply.headers({
				"content-disposition": `inline; filename=${request.params.path}`,
				"content-security-policy": "default-src 'none'; media-src 'self'; style-src 'unsafe-inline'; sandbox",
				"content-type": "audio/x-m4a",
			});
			return reply.send(twoSecondsOfSilence);
		},
	};

	return [mediaRecords, file];
}
